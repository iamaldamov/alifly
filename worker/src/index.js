export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowedOrigin = env.ALLOWED_ORIGIN || "";
    if (!allowedOrigin || origin !== allowedOrigin) {
      return new Response("Origin not allowed", { status: 403 });
    }

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders });
    }
    if (request.method !== "POST") {
      return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
    }
    if (!env.OPENAI_API_KEY) {
      return Response.json({ error: "AI service is not configured yet." }, { status: 503, headers: corsHeaders });
    }

    try {
      const body = await request.json();
      const rawMessages = Array.isArray(body?.messages) ? body.messages : [];
      const messages = rawMessages
        .filter((item) => item && ["user", "assistant"].includes(item.role) && typeof item.content === "string")
        .slice(-10)
        .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 1200) }))
        .filter((item) => item.content.length > 0);

      if (!messages.length || !messages.some((item) => item.role === "user")) {
        return Response.json({ error: "Напиши вопрос об арабском языке." }, { status: 400, headers: corsHeaders });
      }

      const apiResponse = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: env.OPENAI_MODEL || "gpt-6-astra",
          store: false,
          max_output_tokens: 500,
          instructions: "Ты — доброжелательный ИИ-репетитор ALIFLY по современному литературному арабскому языку (фусха) для русскоязычного новичка. Отвечай по-русски, кратко и простыми словами. Объясняй арабские буквы, огласовки, чтение, базовую лексику и грамматику. Приводи арабский пример с огласовками только если уверен в его корректности; добавляй перевод. Не выдумывай правила, не выдавай диалект за фусха. Если вопрос не относится к изучению арабского, вежливо верни разговор к урокам. Если не уверен, прямо скажи об этом и посоветуй свериться с преподавателем. Не давай религиозных фетв.",
          input: messages.map((item) => ({
            role: item.role,
            content: [{ type: "input_text", text: item.content }],
          })),
        }),
      });

      const result = await apiResponse.json();
      if (!apiResponse.ok) {
        return Response.json({ error: "Сервис ИИ временно не ответил. Попробуй позже." }, { status: 502, headers: corsHeaders });
      }
      const answer = (result.output || [])
        .flatMap((item) => item.content || [])
        .filter((item) => item.type === "output_text")
        .map((item) => item.text)
        .join("\n")
        .trim();

      if (!answer) {
        return Response.json({ error: "Не удалось сформировать ответ. Попробуй ещё раз." }, { status: 502, headers: corsHeaders });
      }
      return Response.json({ answer }, { headers: corsHeaders });
    } catch {
      return Response.json({ error: "Не удалось обработать запрос. Проверь соединение и попробуй снова." }, { status: 400, headers: corsHeaders });
    }
  },
};
