interface Env {
  DB: D1Database;
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_WEBHOOK_SECRET: string;
  APP_URL: string;
}

type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
};

type TelegramMessage = {
  message_id: number;
  chat: { id: number; type: string };
  from?: TelegramUser;
  text?: string;
};

type TelegramCallbackQuery = {
  id: string;
  from: TelegramUser;
  data?: string;
  message?: TelegramMessage;
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: TelegramCallbackQuery;
};

type TelegramApiResult<T> = { ok: boolean; result?: T; description?: string };

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...headers },
  });

async function telegram<T>(env: Env, method: string, payload: unknown): Promise<T> {
  const response = await fetch(
    `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = (await response.json()) as TelegramApiResult<T>;
  if (!response.ok || !result.ok || result.result === undefined) {
    throw new Error(result.description ?? `Telegram API request failed: ${method}`);
  }
  return result.result;
}

async function sendMessage(
  env: Env,
  chatId: number,
  text: string,
  replyMarkup?: Record<string, unknown>,
) {
  return telegram(env, "sendMessage", {
    chat_id: chatId,
    text,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    disable_web_page_preview: true,
  });
}

function mainKeyboard(env: Env) {
  const rows: Record<string, unknown>[][] = [];
  if (env.APP_URL && !env.APP_URL.includes("YOUR-MINI-APP-DOMAIN")) {
    rows.push([{ text: "📚 Открыть ALIFLY", web_app: { url: env.APP_URL } }]);
  }
  rows.push([
    { text: "📈 Мой прогресс", callback_data: "progress" },
    { text: "ℹ️ Помощь", callback_data: "help" },
  ]);
  return { inline_keyboard: rows };
}

async function handleMessage(env: Env, message: TelegramMessage) {
  if (!message.from || !message.text || message.chat.type !== "private") return;
  const text = message.text.trim();
  const chatId = message.chat.id;

  await env.DB.prepare(
    `INSERT INTO telegram_users (telegram_id, username, first_name, last_name, language_code)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET
       username = excluded.username,
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       language_code = excluded.language_code,
       updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(
      String(message.from.id),
      message.from.username ?? null,
      message.from.first_name || "Ученик",
      message.from.last_name ?? null,
      message.from.language_code ?? null,
    )
    .run();

  if (/^\/(start|start@\w+)/i.test(text)) {
    await sendMessage(
      env,
      chatId,
      "Ассаляму алейкум! Добро пожаловать в ALIFLY.\n\nЗдесь ты сможешь изучать арабский язык с нуля: от букв и чтения до слов, грамматики и понимания текстов.\n\nТвой прогресс будет сохраняться. Начни обучение в приложении 👇",
      mainKeyboard(env),
    );
    return;
  }

  if (/^\/(help|help@\w+)/i.test(text)) {
    await sendMessage(
      env,
      chatId,
      "ALIFLY — обучение арабскому языку.\n\n/start — открыть главное меню\n/progress — посмотреть прогресс\n\nУроки и интерактивные упражнения открываются в Mini App.",
      mainKeyboard(env),
    );
    return;
  }

  if (/^\/(progress|progress@\w+)/i.test(text)) {
    const row = await env.DB.prepare(
      "SELECT xp, current_stage, current_lesson, streak FROM telegram_users WHERE telegram_id = ?",
    )
      .bind(String(message.from.id))
      .first<{ xp: number; current_stage: number; current_lesson: number; streak: number }>();
    await sendMessage(
      env,
      chatId,
      row
        ? `Твой прогресс ALIFLY\n\n⭐ Опыт: ${row.xp} XP\n📘 Этап: ${row.current_stage}\nУрок: ${row.current_lesson}\n🔥 Серия дней: ${row.streak}`
        : "Пока нет учебного прогресса. Открой ALIFLY и пройди первый урок!",
      mainKeyboard(env),
    );
    return;
  }

  await sendMessage(
    env,
    chatId,
    "Я помогу тебе учиться в ALIFLY. Используй меню ниже или команду /start.",
    mainKeyboard(env),
  );
}

async function handleCallback(env: Env, callback: TelegramCallbackQuery) {
  await telegram(env, "answerCallbackQuery", { callback_query_id: callback.id });
  const chatId = callback.message?.chat.id;
  if (!chatId) return;

  if (callback.data === "help") {
    await sendMessage(
      env,
      chatId,
      "ALIFLY помогает изучать арабский язык с нуля. Нажми «Открыть ALIFLY», чтобы перейти к урокам.",
      mainKeyboard(env),
    );
  } else if (callback.data === "progress") {
    const row = await env.DB.prepare(
      "SELECT xp, current_stage, current_lesson, streak FROM telegram_users WHERE telegram_id = ?",
    )
      .bind(String(callback.from.id))
      .first<{ xp: number; current_stage: number; current_lesson: number; streak: number }>();
    await sendMessage(
      env,
      chatId,
      row
        ? `Твой прогресс ALIFLY\n\n⭐ Опыт: ${row.xp} XP\n📘 Этап: ${row.current_stage}\nУрок: ${row.current_lesson}\n🔥 Серия дней: ${row.streak}`
        : "Прогресс появится после первого занятия.",
      mainKeyboard(env),
    );
  }
}

function bytesToHex(bytes: ArrayBuffer): string {
  return Array.from(new Uint8Array(bytes), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hmac(key: CryptoKey, value: string): Promise<ArrayBuffer> {
  return crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
}

async function verifyTelegramInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  const authDate = Number(params.get("auth_date"));
  const userRaw = params.get("user");
  if (!receivedHash || !userRaw || !Number.isFinite(authDate)) return null;

  const now = Math.floor(Date.now() / 1000);
  if (authDate > now + 60 || now - authDate > 86_400) return null;

  const entries = [...params.entries()]
    .filter(([key]) => key !== "hash")
    .sort(([a], [b]) => a.localeCompare(b));
  const dataCheckString = entries.map(([key, value]) => `${key}=${value}`).join("\n");

  const webAppKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode("WebAppData"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const secret = await hmac(webAppKey, botToken);
  const validationKey = await crypto.subtle.importKey(
    "raw",
    secret,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const calculatedHash = bytesToHex(await hmac(validationKey, dataCheckString));
  if (calculatedHash.length !== receivedHash.length) return null;

  const a = new TextEncoder().encode(calculatedHash);
  const b = new TextEncoder().encode(receivedHash.toLowerCase());
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) mismatch |= a[i] ^ b[i];
  if (mismatch !== 0) return null;

  try {
    return JSON.parse(userRaw) as TelegramUser;
  } catch {
    return null;
  }
}

async function handleMiniAppSession(request: Request, env: Env) {
  const origin = request.headers.get("Origin");
  const allowedOrigin = new URL(env.APP_URL).origin;
  const corsHeaders = {
    "access-control-allow-origin": allowedOrigin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "Content-Type",
    "vary": "Origin",
  };
  if (origin && origin !== allowedOrigin) return json({ error: "Origin not allowed" }, 403, corsHeaders);
  let body: { initData?: string };
  try {
    body = (await request.json()) as { initData?: string };
  } catch {
    return json({ error: "Invalid JSON" }, 400, corsHeaders);
  }
  if (!body.initData || body.initData.length > 10_000) {
    return json({ error: "Missing Telegram initData" }, 400, corsHeaders);
  }

  const user = await verifyTelegramInitData(body.initData, env.TELEGRAM_BOT_TOKEN);
  if (!user || !Number.isSafeInteger(user.id)) {
    return json({ error: "Invalid or expired Telegram session" }, 401, corsHeaders);
  }

  await env.DB.prepare(
    `INSERT INTO telegram_users (telegram_id, username, first_name, last_name, language_code)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(telegram_id) DO UPDATE SET
       username = excluded.username,
       first_name = excluded.first_name,
       last_name = excluded.last_name,
       language_code = excluded.language_code,
       updated_at = CURRENT_TIMESTAMP`,
  )
    .bind(
      String(user.id),
      user.username ?? null,
      user.first_name || "Ученик",
      user.last_name ?? null,
      user.language_code ?? null,
    )
    .run();

  const progress = await env.DB.prepare(
    "SELECT xp, current_stage, current_lesson, completed_lessons, streak FROM telegram_users WHERE telegram_id = ?",
  )
    .bind(String(user.id))
    .first();

  return json(
    { user: { id: user.id, firstName: user.first_name, username: user.username ?? null }, progress },
    200,
    corsHeaders,
  );
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/health") {
      return json({ ok: true, service: "alifly-telegram" });
    }

    if (request.method === "POST" && url.pathname === "/telegram/webhook") {
      if (
        request.headers.get("X-Telegram-Bot-Api-Secret-Token") !==
        env.TELEGRAM_WEBHOOK_SECRET
      ) {
        return new Response("Unauthorized", { status: 401 });
      }

      let update: TelegramUpdate;
      try {
        update = (await request.json()) as TelegramUpdate;
      } catch {
        return new Response("Bad Request", { status: 400 });
      }

      const inserted = await env.DB.prepare(
        "INSERT OR IGNORE INTO processed_updates (update_id) VALUES (?)",
      )
        .bind(String(update.update_id))
        .run();
      if (inserted.meta.changes === 0) return new Response("OK");

      try {
        if (update.message) await handleMessage(env, update.message);
        if (update.callback_query) await handleCallback(env, update.callback_query);
      } catch (error) {
        console.error("ALIFLY Telegram update failed", error);
        // Telegram may retry failed updates. The idempotency record is removed
        // so a retry can process the update again.
        await env.DB.prepare("DELETE FROM processed_updates WHERE update_id = ?")
          .bind(String(update.update_id))
          .run();
        return new Response("Temporary failure", { status: 500 });
      }
      return new Response("OK");
    }

    if (url.pathname === "/api/telegram/session" && request.method === "OPTIONS") {
      try {
        const allowedOrigin = new URL(env.APP_URL).origin;
        const origin = request.headers.get("Origin");
        if (origin && origin !== allowedOrigin) return new Response(null, { status: 403 });
        return new Response(null, { status: 204, headers: {
          "access-control-allow-origin": allowedOrigin,
          "access-control-allow-methods": "POST, OPTIONS",
          "access-control-allow-headers": "Content-Type",
          "vary": "Origin",
        }});
      } catch {
        return new Response(null, { status: 500 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/telegram/session") {
      try {
        return await handleMiniAppSession(request, env);
      } catch (error) {
        console.error("ALIFLY Mini App session failed", error);
        return json({ error: "Unable to create session" }, 500);
      }
    }

    return json({ error: "Not found" }, 404);
  },
};
