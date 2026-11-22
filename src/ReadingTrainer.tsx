import { useState, type FormEvent } from "react";

type Exercise = {
  prompt: string;
  target: string;
  answer: string;
  explanation: string;
};

const exercises: Exercise[] = [
  { prompt: "Прочитай знак с фатхой и введи короткий звук.", target: "بَ", answer: "ба", explanation: "Фатха (َ) стоит сверху и даёт краткий звук «а»: بَ — «ба»." },
  { prompt: "Прочитай знак с кясрой и введи короткий звук.", target: "بِ", answer: "би", explanation: "Кясра (ِ) стоит под буквой и даёт краткий звук «и»: بِ — «би»." },
  { prompt: "Прочитай знак с даммой и введи короткий звук.", target: "بُ", answer: "бу", explanation: "Дамма (ُ) стоит сверху и даёт краткий звук «у»: بُ — «бу»." },
  { prompt: "Теперь прочитай ту же букву с другой огласовкой.", target: "تَ", answer: "та", explanation: "Тَ — буква ت с фатхой. Огласовка меняет гласный звук." },
  { prompt: "Сравни с предыдущим заданием: какой звук здесь?", target: "تِ", answer: "ти", explanation: "Кясра под ت даёт краткий звук «и»: تِ — «ти»." },
  { prompt: "Прочитай букву с даммой.", target: "تُ", answer: "ту", explanation: "Дамма над ت даёт краткий звук «у»: تُ — «ту»." },
  { prompt: "Прочитай сочетание с фатхой.", target: "مَ", answer: "ма", explanation: "Мим م с фатхой читается «ма»." },
  { prompt: "Прочитай сочетание с кясрой.", target: "مِ", answer: "ми", explanation: "Мим م с кясрой читается «ми»." },
  { prompt: "Прочитай сочетание с даммой.", target: "مُ", answer: "му", explanation: "Мим م с даммой читается «му»." },
  { prompt: "Прочитай цепочку справа налево и введи оба слога.", target: "بَتَ", answer: "бата", explanation: "Сначала справа بَ — «ба», затем слева تَ — «та». «Бата» здесь — учебная цепочка слогов, не слово." },
  { prompt: "Прочитай цепочку справа налево. Не торопись.", target: "بِتُ", answer: "биту", explanation: "Справа بِ — «би», затем слева تُ — «ту». Это учебная цепочка слогов, не слово." },
  { prompt: "Прочитай смешанную цепочку и введи её звучание.", target: "مُتَ", answer: "мута", explanation: "Справа مُ — «му», затем слева تَ — «та». Это учебная цепочка слогов, не слово." },
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

  const submit = (event: FormEvent<HTMLFormElement>) => {
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
          <p>Начни с отдельных огласовок, сравни их на знакомых буквах, затем прочитай короткие цепочки слогов без подсказок.</p>
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
                placeholder="Например: бити"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                disabled={submitted !== null}
              />
              {submitted === null && (
                <button className="primary-button reading-next" type="submit" data-touch-hint="Проверь ответ и узнай, правильно ли прочитал сочетание" disabled={!draft.trim()}>
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
              <button type="button" className="primary-button reading-next" data-touch-hint="Перейди к следующему упражнению по чтению" onClick={next}>
                {index === exercises.length - 1 ? "Завершить тренировку" : "Дальше →"}
              </button>
            )}
          </>
        ) : (
          <div className="reading-result">
            <span className="section-label">ТРЕНИРОВКА ЗАВЕРШЕНА</span>
            <div className="reading-result-score">{correct} / {exercises.length}</div>
            <h3>{correct === exercises.length ? "Ма ша Аллах! Отлично!" : "Хорошая работа!"}</h3>
            <p>Если ошибся, вернись к соответствующей огласовке: фатха — «а», кясра — «и», дамма — «у». Затем перечитай цепочки слогов.</p>
            <button type="button" className="primary-button reading-next" data-touch-hint="Начни тренировку чтения с первого упражнения" onClick={restart}>Повторить тренировку</button>
          </div>
        )}
      </div>
    </section>
  );
}
