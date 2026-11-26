import html
import json
import os
import sys
import urllib.parse
import urllib.request

import google.auth
from google.auth.transport.requests import AuthorizedSession

PROJECT_ID = os.environ["FIREBASE_PROJECT_ID"]
BOT_TOKEN = os.environ["TELEGRAM_BOT_TOKEN"]
CHAT_ID = os.environ["TELEGRAM_CHAT_ID"]
SCOPES = ["https://www.googleapis.com/auth/datastore"]

CATEGORY_NAMES = {
    "incorrect_translation": "Неверный перевод",
    "arabic_text": "Ошибка в арабском тексте",
    "pronunciation": "Проблема с произношением",
    "incorrect_answer": "Неверный ответ",
    "technical_issue": "Техническая проблема",
    "other": "Другое",
}


def value(fields, key, default=""):
    item = fields.get(key, {})
    for kind in ("stringValue", "integerValue", "booleanValue", "timestampValue"):
        if kind in item:
            return str(item[kind])
    return default


def telegram_send(text):
    url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage"
    body = urllib.parse.urlencode({
        "chat_id": CHAT_ID,
        "text": text,
        "disable_web_page_preview": "true",
    }).encode()
    request = urllib.request.Request(url, data=body, method="POST")
    with urllib.request.urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode())
    if not payload.get("ok"):
        raise RuntimeError("Telegram API rejected the message")


def main():
    credentials, _ = google.auth.default(scopes=SCOPES)
    session = AuthorizedSession(credentials)
    base = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents"
    query_url = base + ":runQuery"
    query = {
        "structuredQuery": {
            "from": [{"collectionId": "lessonReports"}],
            "where": {
                "fieldFilter": {
                    "field": {"fieldPath": "status"},
                    "op": "EQUAL",
                    "value": {"stringValue": "new"},
                }
            },
            "limit": 50,
        }
    }
    response = session.post(query_url, json=query, timeout=30)
    response.raise_for_status()
    rows = response.json()

    sent = 0
    for row in rows:
        document = row.get("document")
        if not document:
            continue
        fields = document.get("fields", {})
        name = document["name"]
        category = value(fields, "category", "other")
        lesson = value(fields, "lessonTitle", "Урок не указан")
        lesson_id = value(fields, "lessonId", "?")
        question = value(fields, "questionIndex", "?")
        description = value(fields, "description", "").strip()
        prompt = value(fields, "prompt", "").strip()
        stimulus = value(fields, "stimulus", "").strip()
        created = value(fields, "createdAt", "не указано")

        parts = [
            "Новое обращение ALIFLY",
            f"Тип: {CATEGORY_NAMES.get(category, category)}",
            f"Урок: {lesson} (ID {lesson_id})",
            f"Вопрос: {question}",
        ]
        if description:
            parts.append(f"Комментарий: {description}")
        if prompt:
            parts.append(f"Задание: {prompt}")
        if stimulus:
            parts.append(f"Материал: {stimulus}")
        parts.append(f"Дата: {created}")
        telegram_send("\n".join(parts))

        # Mark only after Telegram confirms delivery; this prevents routine duplicates.
        patch_url = (
            "https://firestore.googleapis.com/v1/"
            + name
            + "?updateMask.fieldPaths=status"
        )
        patch = session.patch(
            patch_url,
            json={"fields": {"status": {"stringValue": "notified"}}},
            timeout=30,
        )
        patch.raise_for_status()
        sent += 1

    print(f"Telegram notifications delivered: {sent}")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Feedback notification failed: {type(error).__name__}: {error}", file=sys.stderr)
        raise
