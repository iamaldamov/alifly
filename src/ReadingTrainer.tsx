import { useState } from "react";

type Exercise = {
  prompt: string;
  target: string;
  options: string[];
  answer: string;
  explanation: string;
};

const exercises: Exercise[] = [
  {
    prompt: "Как читается буква بَ с фатхой?",
    target: "بَ",
    options: ["ба", "би", "бу"],
    answer: "ба",
    explanation: "Фатха (َ) стоит сверху и даёт короткий звук «а»: بَ — ба.",
  },
  {
    prompt: "Как читается буква بِ с кясрой?",
    target: "بِ",
    options: ["ба", "би", "бу"],
    answer: "би",
    explanation: "Кясра (ِ) стоит снизу и даёт короткий звук «и»: بِ — би.",
  },
  {
    prompt: "Как читается буква بُ с даммой?",
    target: "بُ",
    options: ["ба", "би", "бу"],
    answer: "бу",
    explanation: "Дамма (ُ) стоит сверху и даёт короткий звук «у»: بُ — бу.",
  },
  {
    prompt: "Выбери сочетание, которое читается «та»",
    target: "تَ",
    options: ["تِ", "تَ", "تُ"],
    answer: "تَ",
    explanation: "تَ — буква ت с фатхой. Читаем коротко: «та».",
  },
  {
    prompt: "Как прочитать сочетание из двух слогов?",
    target: "بَتَ",
    options: ["бата", "бити", "туба"],
    answer: "бата",
    explanation: "Читаем справа налево: بَ — «ба», затем تَ — «та». Вместе: «бата». Это учебное сочетание звуков, не слово.",
  },
  {
    prompt: "Как прочитать сочетание из двух слогов?",
    target: "مَنَ",
    options: ["мана", "мину", "нама"],
    answer: "мана",
    explanation: "Читаем справа налево: مَ — «ма», затем نَ — «на». Вместе: «мана». Это упражнение на чтение слогов, не слово.",
  },
];

export default function ReadingTrainer() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = exercises[index];

  const choose = (option: string) => {
    if (selected !== null || finished) return;
    setSelected(option);
    if (option === exercise.answer) setCorrect((value) => value + 1);
  };

  const next = () => {
    if (index === exercises.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setSelected(null);
  };

  const restart = () => {
    setIndex(0);
    setSelected(null);
    setCorrect(0);
    setFinished(false);
  };

  return (
    <section className="reading-section" id="reading-practice" aria-labelledby="reading-title">
      <div className="reading-heading">
        <div>
          <span className="section-label">ПРАКТИКА ЧТЕНИЯ</span>
          <h2 id="reading-title">Соединяй буквы и звуки</h2>
          <p>Начни с трёх коротких огласовок, а затем попробуй прочитать простые сочетания слогов.</p>
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
            <div className="reading-options">
              {exercise.options.map((option) => {
                const isAnswer = option === exercise.answer;
                const isSelected = option === selected;
                const state = selected === null ? "" : isAnswer ? "reading-option-correct" : isSelected ? "reading-option-wrong" : "reading-option-muted";
                return (
                  <button
                    type="button"
                    key={option}
                    className={`reading-option ${state}`}
                    onClick={() => choose(option)}
                    disabled={selected !== null}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className={`reading-feedback ${selected === exercise.answer ? "is-correct" : "is-wrong"}`} aria-live="polite">
                <strong>{selected === exercise.answer ? "Правильно!" : `Верный ответ: ${exercise.answer}`}</strong>
                <span>{exercise.explanation}</span>
              </div>
            )}
            {selected !== null && (
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
            <p>Повтори фатху, кясру и дамму, а затем попробуй ещё раз. Транскрипция здесь — только начальная подсказка к звучанию.</p>
            <button type="button" className="primary-button reading-next" onClick={restart}>Повторить тренировку</button>
          </div>
        )}
      </div>
    </section>
  );
}
