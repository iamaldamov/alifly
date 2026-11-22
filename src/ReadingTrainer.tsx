import { useState } from "react";

type ChoiceExercise = {
  type: "choice";
  prompt: string;
  target: string;
  options: string[];
  answer: string;
  explanation: string;
};

type MatchExercise = {
  type: "match";
  prompt: string;
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
  explanation: string;
};

type BuildExercise = {
  type: "build";
  prompt: string;
  target: string;
  bank: string[];
  answer: string[];
  explanation: string;
};

type Exercise = ChoiceExercise | MatchExercise | BuildExercise;

const exercises: Exercise[] = [
  {
    type: "choice",
    prompt: "Выбери правильное чтение",
    target: "بَ",
    options: ["ба", "би", "бу"],
    answer: "ба",
    explanation: "Фатха над ب даёт короткий звук «а».",
  },
  {
    type: "match",
    prompt: "Соедини букву с её названием",
    left: [{ id: "ba", label: "ب" }, { id: "ta", label: "ت" }, { id: "mim", label: "م" }],
    right: [{ id: "mim", label: "мим" }, { id: "ba", label: "ба" }, { id: "ta", label: "та" }],
    explanation: "ب — ба, ت — та, م — мим.",
  },
  {
    type: "choice",
    prompt: "Какой звук даёт эта огласовка?",
    target: "تِ",
    options: ["та", "ти", "ту"],
    answer: "ти",
    explanation: "Кясра под ت даёт короткий звук «и».",
  },
  {
    type: "build",
    prompt: "Собери чтение из частей справа налево",
    target: "بَتَ",
    bank: ["та", "му", "ба", "би"],
    answer: ["ба", "та"],
    explanation: "بَ читается «ба», затем تَ — «та». Это учебное сочетание слогов.",
  },
  {
    type: "match",
    prompt: "Сопоставь огласовку и её звук",
    left: [{ id: "fatha", label: "Фатха َ" }, { id: "kasra", label: "Кясра ِ" }, { id: "damma", label: "Дамма ُ" }],
    right: [{ id: "damma", label: "у" }, { id: "fatha", label: "а" }, { id: "kasra", label: "и" }],
    explanation: "Фатха — «а», кясра — «и», дамма — «у».",
  },
  {
    type: "choice",
    prompt: "Найди букву «нун»",
    target: "ن",
    options: ["ب", "ن", "ت"],
    answer: "ن",
    explanation: "ن — нун. У неё одна точка сверху.",
  },
  {
    type: "build",
    prompt: "Собери правильное чтение",
    target: "مُتَ",
    bank: ["та", "ми", "му", "ти"],
    answer: ["му", "та"],
    explanation: "مُ читается «му», затем تَ — «та». Это учебное сочетание слогов.",
  },
  {
    type: "choice",
    prompt: "Выбери чтение буквы с даммой",
    target: "بُ",
    options: ["ба", "би", "бу"],
    answer: "бу",
    explanation: "Дамма над ب даёт короткий звук «у».",
  },
  {
    type: "match",
    prompt: "Найди пары: арабская буква и чтение",
    left: [{ id: "nun", label: "نَ" }, { id: "ba", label: "بَ" }, { id: "ta", label: "تَ" }],
    right: [{ id: "ta", label: "та" }, { id: "nun", label: "на" }, { id: "ba", label: "ба" }],
    explanation: "نَ — на, بَ — ба, تَ — та.",
  },
  {
    type: "build",
    prompt: "Собери чтение по порядку",
    target: "بِتُ",
    bank: ["бу", "би", "ту", "та"],
    answer: ["би", "ту"],
    explanation: "بِ читается «би», затем تُ — «ту». Это учебное сочетание слогов.",
  },
];

export default function ReadingTrainer() {
  const [index, setIndex] = useState(0);
  const [choice, setChoice] = useState<string | null>(null);
  const [matched, setMatched] = useState<string[]>([]);
  const [activeLeft, setActiveLeft] = useState<string | null>(null);
  const [matchError, setMatchError] = useState(false);
  const [built, setBuilt] = useState<number[]>([]);
  const [buildChecked, setBuildChecked] = useState(false);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const exercise = exercises[index];
  const complete = exercise.type === "choice"
    ? choice !== null
    : exercise.type === "match"
      ? matched.length === exercise.left.length
      : buildChecked && exercise.answer.every((token, position) => exercise.bank[built[position]] === token) && built.length === exercise.answer.length;

  const advance = () => {
    if (index === exercises.length - 1) {
      setFinished(true);
      return;
    }
    setIndex((value) => value + 1);
    setChoice(null);
    setMatched([]);
    setActiveLeft(null);
    setMatchError(false);
    setBuilt([]);
    setBuildChecked(false);
  };

  const choose = (option: string) => {
    if (choice !== null) return;
    setChoice(option);
    if (exercise.type === "choice" && option === exercise.answer) setCorrect((value) => value + 1);
  };

  const chooseLeft = (id: string) => {
    if (matched.includes(id)) return;
    setActiveLeft(id);
    setMatchError(false);
  };

  const chooseRight = (id: string) => {
    if (!activeLeft || matched.includes(id)) return;
    if (activeLeft === id) {
      const next = [...matched, id];
      setMatched(next);
      setActiveLeft(null);
      setMatchError(false);
      if (exercise.type === "match" && next.length === exercise.left.length) {
        setCorrect((value) => value + 1);
      }
    } else {
      setMatchError(true);
      setActiveLeft(null);
    }
  };

  const addToken = (bankIndex: number) => {
    if (built.includes(bankIndex) || buildChecked) return;
    setBuilt((value) => [...value, bankIndex]);
  };

  const removeToken = (bankIndex: number) => {
    if (buildChecked) return;
    setBuilt((value) => value.filter((item) => item !== bankIndex));
  };

  const checkBuild = () => {
    if (exercise.type !== "build" || buildChecked || built.length !== exercise.answer.length) return;
    setBuildChecked(true);
    if (exercise.answer.every((token, position) => exercise.bank[built[position]] === token)) {
      setCorrect((value) => value + 1);
    }
  };

  const restart = () => {
    setIndex(0);
    setChoice(null);
    setMatched([]);
    setActiveLeft(null);
    setMatchError(false);
    setBuilt([]);
    setBuildChecked(false);
    setCorrect(0);
    setFinished(false);
  };

  const buildIsCorrect = exercise.type === "build" && buildChecked &&
    exercise.answer.every((token, position) => exercise.bank[built[position]] === token) &&
    built.length === exercise.answer.length;

  return (
    <section className="reading-section" id="reading-practice" aria-labelledby="reading-title">
      <div className="reading-heading">
        <div>
          <span className="section-label">ПРАКТИКА</span>
          <h2 id="reading-title">Учись через действие</h2>
          <p>Выбирай, соединяй пары и собирай чтение из карточек.</p>
        </div>
        <span className="reading-level">Уровень 1</span>
      </div>

      <div className="reading-card practice-card">
        {!finished ? (
          <>
            <div className="reading-meta">
              <span>Задание {index + 1} из {exercises.length}</span>
              <span>{correct} верно</span>
            </div>
            <div className="reading-progress" aria-label={`Выполнено ${index} из ${exercises.length} заданий`}>
              <span style={{ width: `${(index / exercises.length) * 100}%` }} />
            </div>

            <div className="practice-task-head">
              <span className="practice-task-kind">
                {exercise.type === "choice" ? "ВЫБЕРИ ОТВЕТ" : exercise.type === "match" ? "СОПОСТАВЬ ПАРЫ" : "СОБЕРИ ЧТЕНИЕ"}
              </span>
              <h3>{exercise.prompt}</h3>
            </div>

            {exercise.type === "choice" && (
              <>
                <div className="practice-arabic-target" lang="ar" dir="rtl">{exercise.target}</div>
                <div className="practice-choice-grid">
                  {exercise.options.map((option) => {
                    const state = choice === null ? "" : option === exercise.answer ? "is-correct" : option === choice ? "is-wrong" : "is-muted";
                    return (
                      <button key={option} type="button" className={`practice-choice ${state}`} onClick={() => choose(option)} disabled={choice !== null}>
                        {option}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {exercise.type === "match" && (
              <div className="practice-match">
                <div className="practice-match-column">
                  <span className="practice-column-label">БУКВЫ</span>
                  {exercise.left.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`practice-match-tile ${activeLeft === item.id ? "is-selected" : ""} ${matched.includes(item.id) ? "is-matched" : ""}`}
                      onClick={() => chooseLeft(item.id)}
                      disabled={matched.includes(item.id)}
                      lang={/^[\u0600-\u06FF]/.test(item.label) ? "ar" : "ru"}
                      dir={/^[\u0600-\u06FF]/.test(item.label) ? "rtl" : "auto"}
                    >{item.label}</button>
                  ))}
                </div>
                <div className="practice-match-column">
                  <span className="practice-column-label">ЧТЕНИЕ</span>
                  {exercise.right.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`practice-match-tile ${matched.includes(item.id) ? "is-matched" : ""}`}
                      onClick={() => chooseRight(item.id)}
                      disabled={matched.includes(item.id) || activeLeft === null}
                    >{item.label}</button>
                  ))}
                </div>
                {matchError && <p className="practice-inline-hint" role="status">Не эта пара. Попробуй ещё раз.</p>}
                {matched.length > 0 && matched.length < exercise.left.length && <p className="practice-inline-hint">{matched.length} из {exercise.left.length} пар найдено</p>}
              </div>
            )}

            {exercise.type === "build" && (
              <>
                <div className="practice-arabic-target" lang="ar" dir="rtl">{exercise.target}</div>
                <p className="practice-small-label">ТВОЙ ОТВЕТ</p>
                <div className="practice-build-answer" aria-label="Собранный ответ">
                  {built.length === 0 && <span className="practice-build-placeholder">Нажимай на карточки ниже</span>}
                  {built.map((bankIndex) => (
                    <button key={bankIndex} type="button" className="practice-token is-in-answer" onClick={() => removeToken(bankIndex)} disabled={buildChecked}>
                      {exercise.bank[bankIndex]}
                    </button>
                  ))}
                </div>
                <p className="practice-small-label">ВЫБЕРИ ЧАСТИ В ПРАВИЛЬНОМ ПОРЯДКЕ</p>
                <div className="practice-word-bank">
                  {exercise.bank.map((token, bankIndex) => (
                    <button key={bankIndex} type="button" className="practice-token" onClick={() => addToken(bankIndex)} disabled={built.includes(bankIndex) || buildChecked}>
                      {token}
                    </button>
                  ))}
                </div>
                {!buildChecked && (
                  <button type="button" className="primary-button practice-check-button" onClick={checkBuild} disabled={built.length !== exercise.answer.length}>
                    Проверить
                  </button>
                )}
              </>
            )}

            {(exercise.type === "match" && complete) || (exercise.type === "build" && buildChecked) ? (
              <div className={`practice-feedback ${exercise.type === "build" && !buildIsCorrect ? "is-wrong" : "is-correct"}`} aria-live="polite">
                <strong>
                  {exercise.type === "match" ? "Все пары найдены!" : (buildIsCorrect ? "Отлично, получилось!" : "Почти! Правильный вариант показан ниже.")}
                </strong>
                <span>{exercise.explanation}</span>
                {exercise.type === "build" && !buildIsCorrect && (
                  <span className="practice-correct-answer">Правильно: {exercise.answer.join(" · ")}</span>
                )}
              </div>
            ) : null}

            {exercise.type === "choice" && choice !== null && (
              <div className={`practice-feedback ${choice === exercise.answer ? "is-correct" : "is-wrong"}`} aria-live="polite">
                <strong>{choice === exercise.answer ? "Верно!" : `Правильный ответ: ${exercise.answer}`}</strong>
                <span>{exercise.explanation}</span>
              </div>
            )}

            {(complete || (exercise.type === "choice" && choice !== null)) && (
              <button type="button" className="primary-button reading-next practice-next" onClick={advance}>
                {index === exercises.length - 1 ? "Завершить тренировку" : "Дальше →"}
              </button>
            )}
          </>
        ) : (
          <div className="reading-result">
            <span className="section-label">ТРЕНИРОВКА ЗАВЕРШЕНА</span>
            <div className="reading-result-score">{correct} / {exercises.length}</div>
            <h3>{correct === exercises.length ? "Ма ша Аллах! Отлично!" : "Хорошая работа!"}</h3>
            <p>Ты потренировал распознавание букв, огласовок и чтение слогов. Повтори раунд, чтобы закрепить результат.</p>
            <button type="button" className="primary-button reading-next" onClick={restart}>Повторить</button>
          </div>
        )}
      </div>
    </section>
  );
}
