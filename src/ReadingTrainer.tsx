import { useState } from "react";

type Exercise = {
  prompt: string;
  target: string;
  options: string[];
  answer: string;
  explanation: string;
};

const exercises: Exercise[] = [
  { prompt: "Как читается?", target: "بَ", options: ["ба", "би", "бу"], answer: "ба", explanation: "Фатха даёт короткий звук «а»." },
  { prompt: "Как читается?", target: "بِ", options: ["ба", "би", "бу"], answer: "би", explanation: "Кясра под буквой даёт короткий звук «и»." },
  { prompt: "Как читается?", target: "بُ", options: ["ба", "би", "бу"], answer: "бу", explanation: "Дамма над буквой даёт короткий звук «у»." },
  { prompt: "Выбери звучание.", target: "تَ", options: ["та", "ти", "ту"], answer: "та", explanation: "تَ — та с фатхой." },
  { prompt: "Выбери звучание.", target: "تِ", options: ["та", "ти", "ту"], answer: "ти", explanation: "تِ — та с кясрой." },
  { prompt: "Выбери звучание.", target: "تُ", options: ["та", "ти", "ту"], answer: "ту", explanation: "تُ — та с даммой." },
  { prompt: "Как читается?", target: "مَ", options: ["ма", "ми", "му"], answer: "ма", explanation: "مَ — мим с фатхой." },
  { prompt: "Как читается?", target: "مِ", options: ["ма", "ми", "му"], answer: "ми", explanation: "مِ — мим с кясрой." },
  { prompt: "Как читается?", target: "مُ", options: ["ма", "ми", "му"], answer: "му", explanation: "مُ — мим с даммой." },
  { prompt: "Прочитай справа налево.", target: "بَتَ", options: ["бата", "бити", "мута"], answer: "бата", explanation: "Сначала بَ — «ба», затем تَ — «та»." },
  { prompt: "Прочитай справа налево.", target: "بِتُ", options: ["бата", "биту", "мута"], answer: "биту", explanation: "Сначала بِ — «би», затем تُ — «ту»." },
  { prompt: "Прочитай справа налево.", target: "مُتَ", options: ["мата", "мута", "мити"], answer: "мута", explanation: "Сначала مُ — «му», затем تَ — «та»." },
];

export default function ReadingTrainer() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const exercise = exercises[index];
  const isCorrect = selected === exercise.answer;

  const choose = (answer: string) => {
    if (selected !== null || finished) return;
    setSelected(answer);
    if (answer === exercise.answer) setCorrect((value) => value + 1);
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
          <h2 id="reading-title">Потренируй чтение</h2>
          <p>Посмотри на сочетание и выбери правильное звучание.</p>
        </div>
        <span className="reading-level">Уровень 1</span>
      </div>

      <div className="reading-card">
        {!finished ? (
          <>
            <div className="reading-meta">
              <span>Вопрос {index + 1} из {exercises.length}</span>
              <span>{correct} верно</span>
            </div>
            <div className="reading-progress" aria-label={`Выполнено ${index} из ${exercises.length} заданий`}>
              <span style={{ width: `${(index / exercises.length) * 100}%` }} />
            </div>
            <p className="reading-prompt">{exercise.prompt}</p>
            <div className="reading-glyph" lang="ar" dir="rtl">{exercise.target}</div>
            <div className="reading-options" role="group" aria-label="Варианты ответа">
              {exercise.options.map((option) => {
                const state = selected === null ? "" : option === exercise.answer ? "reading-option-correct" : option === selected ? "reading-option-wrong" : "reading-option-muted";
                return (
                  <button key={option} className={`reading-option ${state}`} type="button" onClick={() => choose(option)} disabled={selected !== null}>
                    {option}
                  </button>
                );
              })}
            </div>
            {selected !== null && (
              <div className={`reading-feedback ${isCorrect ? "is-correct" : "is-wrong"}`} aria-live="polite">
                <strong>{isCorrect ? "Верно!" : `Правильный ответ: ${exercise.answer}`}</strong>
                <span>{exercise.explanation}</span>
              </div>
            )}
            {selected !== null && (
              <button type="button" className="primary-button reading-next" onClick={next}>
                {index === exercises.length - 1 ? "Завершить" : "Дальше →"}
              </button>
            )}
          </>
        ) : (
          <div className="reading-result">
            <span className="section-label">ТРЕНИРОВКА ЗАВЕРШЕНА</span>
            <div className="reading-result-score">{correct} / {exercises.length}</div>
            <h3>{correct === exercises.length ? "Ма ша Аллах! Отлично!" : "Хорошая работа!"}</h3>
            <p>Повтори упражнения, если хочешь закрепить звучание.</p>
            <button type="button" className="primary-button reading-next" onClick={restart}>Повторить</button>
          </div>
        )}
      </div>
    </section>
  );
}
