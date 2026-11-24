import { useState } from "react";

export type LearningLevel = 1 | 2 | 3 | 4;

export function isLearningLevel(value: unknown): value is LearningLevel {
  return value === 1 || value === 2 || value === 3 || value === 4;
}

type LevelOption = {
  level: LearningLevel;
  title: string;
  summary: string;
  route: string;
};

type DiagnosticQuestion = {
  prompt: string;
  stimulus?: string;
  stimulusLang?: "ar" | "ru";
  stimulusDir?: "rtl" | "ltr";
  options: string[];
  correct: string;
  levelOnMiss: LearningLevel;
  correctFeedback: string;
  wrongFeedback: string;
};

type Props = {
  currentLevel: LearningLevel | null;
  onSelectLevel: (level: LearningLevel) => void;
  onClose?: () => void;
};

const levelOptions: LevelOption[] = [
  {
    level: 1,
    title: "Начинаю с нуля",
    summary: "Буквы, точки, названия и первые основы чтения.",
    route: "Старт: арабский алфавит",
  },
  {
    level: 2,
    title: "Знаю буквы",
    summary: "Огласовки и чтение коротких слогов.",
    route: "Старт: фатха, кясра и дамма",
  },
  {
    level: 3,
    title: "Читаю простые слова",
    summary: "Короткие слова с огласовками и чтение без подсказок.",
    route: "Старт: первые слова",
  },
  {
    level: 4,
    title: "Уже умею читать",
    summary: "Сразу к простым диалогам и дальнейшей практике.",
    route: "Старт: диалоги на MSA",
  },
];

const diagnosticQuestions: DiagnosticQuestion[] = [
  {
    prompt: "Выбери букву, которая называется «ба».",
    options: ["ت", "ب", "ث"],
    correct: "ب",
    levelOnMiss: 1,
    correctFeedback: "Ты узнаёшь букву. Проверим, как ты читаешь огласовки.",
    wrongFeedback: "Начнём с букв и их отличительных точек.",
  },
  {
    prompt: "Как читается сочетание بَ?",
    stimulus: "بَ",
    options: ["би", "бу", "ба"],
    correct: "ба",
    levelOnMiss: 2,
    correctFeedback: "Хорошо. Теперь проверим чтение целого слова.",
    wrongFeedback: "Тебе подойдёт блок огласовок и чтения слогов.",
  },
  {
    prompt: "Как читается слово كِتَاب?",
    stimulus: "كِتَاب",
    options: ["катаб", "китаб", "кутуб"],
    correct: "китаб",
    levelOnMiss: 2,
    correctFeedback: "Ты читаешь простое слово. Осталась короткая проверка понимания фразы.",
    wrongFeedback: "Закрепим огласовки, долгие гласные и чтение слов.",
  },
  {
    prompt: "Что означает фраза مَا اسْمُكَ؟",
    stimulus: "مَا اسْمُكَ؟",
    options: ["Откуда ты?", "Как дела?", "Как тебя зовут?"],
    correct: "Как тебя зовут?",
    levelOnMiss: 3,
    correctFeedback: "Ты уверенно справился с вводной проверкой.",
    wrongFeedback: "Начни с простых слов, а затем переходи к диалогам.",
  },
];

export default function LevelPlacement({ currentLevel, onSelectLevel, onClose }: Props) {
  const [mode, setMode] = useState<"choose" | "diagnostic" | "result">("choose");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState<{ correct: boolean; recommendation: LearningLevel | null; message: string } | null>(null);
  const [recommendedLevel, setRecommendedLevel] = useState<LearningLevel | null>(null);

  const currentQuestion = diagnosticQuestions[questionIndex];
  const recommendedOption = levelOptions.find((item) => item.level === recommendedLevel);

  const answerQuestion = (answer: string) => {
    if (!currentQuestion || feedback) return;
    const correct = answer === currentQuestion.correct;
    const recommendation = correct
      ? questionIndex === diagnosticQuestions.length - 1 ? 4 : null
      : currentQuestion.levelOnMiss;

    setFeedback({
      correct,
      recommendation,
      message: correct ? currentQuestion.correctFeedback : currentQuestion.wrongFeedback,
    });

    if (recommendation !== null) setRecommendedLevel(recommendation);
  };

  const continueDiagnostic = () => {
    if (!feedback) return;
    if (feedback.recommendation !== null) {
      setMode("result");
      return;
    }
    setQuestionIndex((index) => index + 1);
    setFeedback(null);
  };

  const restartDiagnostic = () => {
    setQuestionIndex(0);
    setFeedback(null);
    setRecommendedLevel(null);
    setMode("diagnostic");
  };

  return (
    <section className="level-placement" aria-labelledby="level-placement-title">
      <div className="level-placement-header">
        <div>
          <span className="section-label">ТВОЙ МАРШРУТ ALIFLY</span>
          <h2 id="level-placement-title">
            {mode === "result" ? "Подходящий старт найден" : mode === "diagnostic" ? "Короткая диагностика" : "С какого уровня начнём?"}
          </h2>
          <p>
            {mode === "choose"
              ? "Если ты уже знаешь часть материала, не нужно проходить всё сначала. Выбери точку старта."
              : mode === "diagnostic"
                ? "Ответь на несколько вопросов. Если станет сложно, тест остановится и предложит подходящий старт."
                : "Это стартовая рекомендация по твоим ответам. Уровень можно изменить позже в профиле."}
          </p>
        </div>
        {onClose && (
          <button className="level-placement-close" type="button" onClick={onClose} aria-label="Закрыть выбор уровня">
            ×
          </button>
        )}
      </div>

      {mode === "choose" && (
        <>
          <div className="level-options">
            {levelOptions.map((option) => (
              <button
                className={"level-option" + (currentLevel === option.level ? " is-current" : "")}
                key={option.level}
                type="button"
                onClick={() => onSelectLevel(option.level)}
                aria-pressed={currentLevel === option.level}
              >
                <span className="level-option-number">0{option.level}</span>
                <strong>{option.title}</strong>
                <span className="level-option-summary">{option.summary}</span>
                <span className="level-option-route">{option.route} →</span>
                {currentLevel === option.level && <span className="level-current-label">Текущий уровень</span>}
              </button>
            ))}
          </div>
          <div className="level-placement-footer">
            <p>Предыдущие темы останутся доступны. Выбор уровня не удаляет твой прогресс.</p>
            <button className="level-diagnostic-button" type="button" onClick={restartDiagnostic}>
              Не знаю свой уровень — проверить
            </button>
          </div>
          <p className="level-placement-note">
            Для уровня 4 сейчас доступен старт с коротких диалогов на современном литературном арабском. Расширенная грамматика и словарь будут добавляться отдельными уроками.
          </p>
        </>
      )}

      {mode === "diagnostic" && currentQuestion && (
        <div className="level-diagnostic">
          <div className="level-diagnostic-topline">
            <span>ВОПРОС {questionIndex + 1} ИЗ {diagnosticQuestions.length}</span>
            <span>{Math.round(((questionIndex + 1) / diagnosticQuestions.length) * 100)}%</span>
          </div>
          <div className="level-diagnostic-progress" aria-hidden="true">
            <span style={{ width: ((questionIndex + 1) / diagnosticQuestions.length) * 100 + "%" }} />
          </div>
          <h3>{currentQuestion.prompt}</h3>
          {currentQuestion.stimulus && (
            <div className="level-diagnostic-stimulus" lang={currentQuestion.stimulusLang ?? "ar"} dir={currentQuestion.stimulusDir ?? "rtl"}>
              {currentQuestion.stimulus}
            </div>
          )}
          <div className="level-diagnostic-options">
            {currentQuestion.options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => answerQuestion(option)}
                disabled={feedback !== null}
                className={
                  feedback === null
                    ? "level-diagnostic-option"
                    : option === currentQuestion.correct
                      ? "level-diagnostic-option is-correct"
                      : "level-diagnostic-option"
                }
                lang={/[\u0600-\u06FF]/.test(option) ? "ar" : undefined}
                dir={/[\u0600-\u06FF]/.test(option) ? "rtl" : undefined}
              >
                {option}
              </button>
            ))}
          </div>
          {feedback && (
            <div className={"level-diagnostic-feedback" + (feedback.correct ? " is-correct" : " is-wrong")} role="status" aria-live="polite">
              <strong>{feedback.correct ? "Верно" : "Пока не получилось"}</strong>
              <span>{feedback.message}</span>
              <button type="button" onClick={continueDiagnostic}>Продолжить →</button>
            </div>
          )}
        </div>
      )}

      {mode === "result" && recommendedOption && recommendedLevel !== null && (
        <div className="level-diagnostic-result">
          <span className="level-result-number">0{recommendedLevel}</span>
          <div>
            <strong>{recommendedOption.title}</strong>
            <p>{recommendedOption.summary}</p>
            <small>{recommendedOption.route}</small>
          </div>
          <button className="primary-button" type="button" onClick={() => onSelectLevel(recommendedLevel)}>
            Начать обучение →
          </button>
          <button className="level-diagnostic-retry" type="button" onClick={restartDiagnostic}>
            Пройти диагностику заново
          </button>
        </div>
      )}
    </section>
  );
}
