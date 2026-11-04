const corsHeaders = (origin) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Vary": "Origin",
  "Content-Type": "application/json; charset=utf-8",
});

const json = (data, status, headers) =>
  new Response(JSON.stringify(data), { status, headers });

const SYSTEM_INSTRUCTION = [
  "Ты — доброжелательный ИИ-репетитор ALIFLY по современному литературному арабскому языку (фусха) для русскоязычного новичка.",
  "Отвечай по-русски, кратко, ясно и простыми словами. Объясняй арабские буквы, огласовки, чтение, базовую лексику и грамматику.",
  "Приводи арабский пример с огласовками только если уверен в его корректности; добавляй перевод. Не выдумывай правила, слова, огласовки или произношение. Не выдавай диалект за фусха.",
  "Если не уверен, прямо скажи об этом и предложи свериться с преподавателем или проверенным учебником.",
  "Если вопрос не относится к изучению арабского языка, вежливо верни разговор к урокам ALIFLY. Не давай религиозных фетв.",
].join(" ");

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "";
    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response("Origin not allowed", { status: 403 });
    }

    const headers = corsHeaders(allowedOrigin);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers });
    }
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405, headers);
    }
    if (!env.GEMINI_API_KEY) {
      return json({ error: "ИИ-помощник ещё не настроен на сервере." }, 503, headers);
    }

    // Approximate Cloudflare edge rate limit: 10 requests per minute per IP.
    // Origin checks are for browser CORS, not authentication.
    if (env.AI_RATE_LIMITER) {
      const ip = request.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.AI_RATE_LIMITER.limit({ key: ip });
      if (!success) {
        return json({ error: "Слишком много вопросов за короткое время. Подожди минуту и попробуй снова." }, 429, headers);
      }
    }

    try {
      const rawBody = await request.text();
      if (new TextEncoder().encode(rawBody).byteLength > 16_384) {
        return json({ error: "Сообщение слишком большое. Сократи историю и попробуй снова." }, 413, headers);
      }

      let body;
      try {
        body = JSON.parse(rawBody);
      } catch {
        return json({ error: "Некорректный формат запроса." }, 400, headers);
      }

      const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
      let messages = rawMessages
        .filter((item) =>
          item &&
          ["user", "assistant"].includes(item.role) &&
          typeof item.content === "string"
        )
        .slice(-10)
        .map((item) => ({
          role: item.role === "assistant" ? "model" : "user",
          parts: [{ text: item.content.trim().slice(0, 1000) }],
        }))
        .filter((item) => item.parts[0].text.length > 0);

      // The app's initial greeting is an assistant message, but Gemini
      // conversation history must begin with a user turn.
      while (messages[0]?.role === "model") messages.shift();

      if (!messages.length || !messages.some((item) => item.role === "user")) {
        return json({ error: "Напиши вопрос об арабском языке." }, 400, headers);
      }

      const model = env.GEMINI_MODEL || "gemini-2.5-flash";
      const apiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": env.GEMINI_API_KEY,
          },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
            contents: messages,
            generationConfig: {
              temperature: 0.35,
              maxOutputTokens: 450,
            },
          }),
        }
      );

      if (!apiResponse.ok) {
        // Do not return provider response bodies or credentials to the browser.
        return json({ error: "Gemini временно не ответил. Попробуй позже." }, 502, headers);
      }

      const result = await apiResponse.json();
      const answer = (result.candidates?.[0]?.content?.parts || [])
        .map((part) => typeof part.text === "string" ? part.text : "")
        .join("\n")
        .trim();

      if (!answer) {
        return json({ error: "Не удалось сформировать ответ. Попробуй ещё раз." }, 502, headers);
      }

      return json({ answer }, 200, headers);
    } catch {
      return json({ error: "Не удалось обработать запрос. Проверь соединение и попробуй снова." }, 500, headers);
    }
  },
};
