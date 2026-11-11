import { useState } from "react";

type Exercise = {
  prompt: string;
  target: string;
  answer: string;
  explanation: string;
};

const exercises: Exercise[] = [
  {
    prompt: "Прочитай сочетание и введи его звучание.",
    target: "بَ",
    answer: "ба",
    explanation: "Фатха (َ) стоит сверху и даёт короткий звук «а»: بَ — ба.",
  },
  {
    prompt: "Прочитай сочетание и введи его звучание.",
    target: "بِ",
    answer: "би",
    explanation: "Кясра (ِ) стоит снизу и даёт короткий звук «и»: بِ — би.",
  },
  {
    prompt: "Прочитай сочетание и введи его звучание.",
    target: "بُ",
    answer: "бу",
    explanation: "Дамма (ُ) стоит сверху и даёт короткий звук «у»: بُ — бу.",
  },
  {
    prompt: "Прочитай сочетание и введи его звучание.",
    target: "تَ",
    answer: "та",
    explanation: "تَ — буква ت с фатхой. Читаем коротко: «та».",
  },
  {
    prompt: "Прочитай сочетание из двух слогов.",
    target: "بَتَ",
    answer: "бата",
    explanation: "Читаем справа налево: بَ — «ба», затем تَ — «та». Вместе: «бата». Это учебное сочетание звуков, не слово.",
  },
  {
    prompt: "Прочитай сочетание из двух слогов.",
    target: "مَنَ",
    answer: "мана",
    explanation: "Читаем справа налево: مَ — «ма», затем نَ — «на». Вместе: «мана». Это упражнение на чтение слогов, не слово.",
  },
];

function normalizeAnswer(value: string): string {
  return value.trim().toLocaleLowerCase("ru-RU").replace(/ё/g, "е").replace(/[\s-]/g, "");
}

export default function ReadingTrainer() {
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = exercises[index];
  const isCorrect = submitted !== null && normalizeAnswer(submitted) === normalizeAnswer(exercise.answer);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitted !== null || finished || !draft.trim()) return;
    setSubmitted(draft.trim());
    if (normalizeAnswer(draft) === normalizeAnswer(exercise.answer)) {
      setCorrect((value) => value + 1);
    }
  };

  const next = () => {
    if (index === exercises.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setDraft("");
    setSubmitted(null);
  };

  const restart = () => {
    setIndex(0);
    setDraft("");
    setSubmitted(null);
    setCorrect(0);
    setFinished(false);
  };

  return (
    <section className="reading-section" id="reading-practice" aria-labelledby="reading-title">
      <div className="reading-heading">
        <div>
          <span className="section-label">ПРАКТИКА ЧТЕНИЯ</span>
          <h2 id="reading-title">Читай без подсказок</h2>
          <p>Сначала смотри на арабское сочетание, затем самостоятельно введи его звучание.</p>
        </div>
        <span className="reading-level">Уровень 1</span>
      </div>

      <div className="reading-card">
        {!finished ? (
          <>
            <div className="reading-meta">
              <span>Задание {index + 1} из {exercises.length}</span>
              <span>{correct} верно</span>
            </div>
            <div className="reading-progress" aria-label={`Выполнено ${index} из ${exercises.length} заданий`}>
              <span style={{ width: `${(index / exercises.length) * 100}%` }} />
            </div>
            <p className="reading-prompt">{exercise.prompt}</p>
            <div className="reading-glyph" lang="ar" dir="rtl">{exercise.target}</div>
            <form className="reading-answer-form" onSubmit={submit}>
              <label className="recall-label" htmlFor="reading-answer">Введи звучание по памяти</label>
              <input
                id="reading-answer"
                className="reading-answer-input"
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Например: ба"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={submitted !== null}
              />
              {submitted === null && (
                <button className="primary-button reading-next" type="submit" disabled={!draft.trim()}>
                  Проверить
                </button>
              )}
            </form>
            {submitted !== null && (
              <div className={`reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                <strong>{isCorrect ? "Верно!" : `Правильный ответ: ${exercise.answer}`}</strong>
                <span>{exercise.explanation}</span>
              </div>
            )}
            {submitted !== null && (
              <button type="button" className="primary-button reading-next" onClick={next}>
                {index === exercises.length - 1 ? "Завершить тренировку" : "Дальше →"}
              </button>
            )}
          </>
        ) : (
          <div className="reading-result">
            <span className="section-label">ТРЕНИРОВКА ЗАВЕРШЕНА</span>
            <div className="reading-result-score">{correct} / {exercises.length}</div>
            <h3>{correct === exercises.length ? "Ма ша Аллах! Отлично!" : "Хорошая работа!"}</h3>
            <p>Повтори фатху, кясру и дамму, а затем попробуй снова без вариантов ответа.</p>
            <button type="button" className="primary-button reading-next" onClick={restart}>Повторить тренировку</button>
          </div>
        )}
      </div>
    </section>
  );
}
