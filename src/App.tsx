import { useState } from "react";

type Stage = {
  id: number;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  status: "available" | "locked";
};

const stages: Stage[] = [
  { id: 1, title: "Арабский алфавит", description: "Знакомство с 28 буквами и их звучанием", icon: "ا", lessons: 8, status: "available" },
  { id: 2, title: "Огласовки", description: "Учимся правильно читать арабские буквы", icon: "َ", lessons: 8, status: "locked" },
  { id: 3, title: "Первые слова", description: "Изучаем простые слова и выражения", icon: "ك", lessons: 10, status: "locked" },
  { id: 4, title: "Основы грамматики", description: "Строим простые предложения", icon: "ن", lessons: 10, status: "locked" },
  { id: 5, title: "Разговорный арабский", description: "Знакомство и повседневные диалоги", icon: "ح", lessons: 10, status: "locked" },
  { id: 6, title: "Чтение и понимание", description: "Читаем небольшие тексты", icon: "ق", lessons: 10, status: "locked" },
];

const questions = [
  {
    prompt: "Найди букву «алиф»",
    options: ["ب", "ا", "ت"],
    correct: "ا",
    explanation: "Верно! Это алиф — первая буква арабского алфавита.",
  },
  {
    prompt: "Найди букву «ба»",
    options: ["ت", "ث", "ب"],
    correct: "ب",
    explanation: "Верно! У буквы ба одна точка под основной формой.",
  },
  {
    prompt: "Найди букву «та»",
    options: ["ن", "ب", "ت"],
    correct: "ت",
    explanation: "Верно! У буквы та две точки над основной формой.",
  },
];

export default function App() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [lessonStarted, setLessonStarted] = useState(false);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);\n  const [lessonCompleted, setLessonCompleted] = useState(false);

  const closeStage = () => {
    setSelectedStage(null);
    setLessonStarted(false);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
  };

  const startLesson = () => {
    setLessonStarted(true);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
  };

  const answerQuestion = (answer: string) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(answer);
    if (answer === questions[questionIndex].correct) {
      setCorrectAnswers((count) => count + 1);
    }
  };

  const nextQuestion = () => {
    if (questionIndex === questions.length - 1) {
      setLessonCompleted(true);
      setLessonFinished(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  const currentQuestion = questions[questionIndex];

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="#" aria-label="ALIFLY — главная">
          <span className="logo-mark">ا</span>
          <span>ALIFLY</span>
        </a>
        <div className="topbar-right">
          <span className="language">RU · Русский</span>
          <span className="streak" aria-label="Серия занятий">🔥 0</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">ТВОЙ ПУТЬ К ЗНАНИЯМ</span>
          <h1>Арабский язык <span>с нуля</span></h1>
          <p>Начни изучать современный литературный арабский постепенно. Маленькие уроки — большие достижения.</p>
          <button
            className="primary-button"
            onClick={() => document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" })}
          >
            Начать обучение <span>→</span>
          </button>
          <div className="hero-note"><span>✦</span> Первые 5 уроков бесплатно</div>
        </div>
        <div className="hero-art" aria-label="Арабская буква Алиф">
          <div className="art-circle"><span>ا</span></div>
          <div className="art-star star-one">✦</div>
          <div className="art-star star-two">✧</div>
          <div className="art-dot" />
        </div>
      </section>

      <section className="progress-section">
        <div>
          <span className="section-label">ТВОЙ ПРОГРЕСС</span>
          <h2>Каждый шаг важен</h2>
        </div>
        <div className="progress-card">
          <div className="progress-info"><span>{lessonCompleted ? "Первый урок пройден" : "Начало пути"}</span><strong>{lessonCompleted ? "12%" : "0%"}</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: lessonCompleted ? "12.5%" : "0%" }} /></div>
          <p>{lessonCompleted ? "Отличное начало! Продолжай изучение алфавита." : "Пройди первый урок, чтобы начать свой путь."}</p>
        </div>
      </section>

      <section className="learning-section" id="learning-path">
        <div className="section-heading">
          <div><span className="section-label">ПРОГРАММА ОБУЧЕНИЯ</span><h2>Твой путь</h2></div>
          <span className="stage-count">6 этапов</span>
        </div>
        <div className="stage-list">
          {stages.map((stage) => (
            <button
              className={`stage-card ${stage.status === "locked" ? "stage-locked" : ""}`}
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              aria-label={`Этап ${stage.id}: ${stage.title}`}
            >
              <span className="stage-icon">{stage.icon}</span>
              <span className="stage-info">
                <span className="stage-number">ЭТАП {stage.id}</span>
                <strong>{stage.title}</strong>
                <span className="stage-description">{stage.description}</span>
                <span className="lesson-count">{stage.lessons} уроков</span>
              </span>
              <span className="stage-arrow">{stage.status === "available" ? "→" : "🔒"}</span>
            </button>
          ))}
        </div>
      </section>

      <footer className="footer">
        <span className="footer-logo">ALIFLY</span>
        <p>Учись с интересом. Продвигайся с уверенностью.</p>
        <span>Создано с заботой о знаниях.</span>
      </footer>

      {selectedStage && (
        <div className="modal-backdrop" onClick={closeStage}>
          <section
            className={`stage-modal ${lessonStarted ? "lesson-modal" : ""}`}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="stage-modal-title"
          >
            <button className="modal-close" onClick={closeStage} aria-label="Закрыть">×</button>

            {!lessonStarted ? (
              <>
                <div className="modal-icon">{selectedStage.icon}</div>
                <span className="section-label">ЭТАП {selectedStage.id}</span>
                <h2 id="stage-modal-title">{selectedStage.title}</h2>
                <p>{selectedStage.description}</p>
                {selectedStage.status === "available" ? (
                  <>
                    <p className="modal-note">Начнём с простых букв и постепенно научимся узнавать их в словах.</p>
                    <button className="primary-button modal-button" onClick={startLesson}>Открыть первый урок →</button>
                  </>
                ) : (
                  <p className="locked-message">🔒 Этот этап откроется после прохождения предыдущего.</p>
                )}
              </>
            ) : lessonFinished ? (
              <div className="lesson-result">
                <div className="result-symbol">✦</div>
                <span className="section-label">УРОК ЗАВЕРШЁН</span>
                <h2 id="stage-modal-title">Отличное начало!</h2>
                <p>Ты ответил правильно на {correctAnswers} из {questions.length} вопросов.</p>
                <div className="result-score">{correctAnswers}/{questions.length}</div>
                <button className="primary-button modal-button" onClick={closeStage}>Вернуться к программе</button>
              </div>
            ) : (
              <>
                <div className="lesson-topline">
                  <span className="section-label">ЭТАП 1 · УРОК 1</span>
                  <span className="lesson-step">{questionIndex + 1} из {questions.length}</span>
                </div>
                <div className="lesson-progress"><span style={{ width: `${((questionIndex + (selectedAnswer ? 1 : 0)) / questions.length) * 100}%` }} /></div>
                <h2 id="stage-modal-title">Первые буквы</h2>
                <p className="lesson-intro">Запомни, как выглядят три первые буквы арабского алфавита.</p>
                <div className="letter-intro">
                  <div><strong lang="ar" dir="rtl">ا</strong><span>алиф</span></div>
                  <div><strong lang="ar" dir="rtl">ب</strong><span>ба</span></div>
                  <div><strong lang="ar" dir="rtl">ت</strong><span>та</span></div>
                </div>
                <div className="question-block">
                  <span className="question-label">ПРОВЕРЬ СЕБЯ</span>
                  <h3>{currentQuestion.prompt}</h3>
                  <div className="answer-options">
                    {currentQuestion.options.map((option) => {
                      const isCorrect = option === currentQuestion.correct;
                      const isSelected = option === selectedAnswer;
                      const stateClass = selectedAnswer === null ? "" : isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted";
                      return (
                        <button
                          key={option}
                          className={`answer-option ${stateClass}`}
                          onClick={() => answerQuestion(option)}
                          disabled={selectedAnswer !== null}
                          lang="ar"
                          dir="rtl"
                        >
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer !== null && (
                    <div className={`answer-feedback ${selectedAnswer === currentQuestion.correct ? "feedback-correct" : "feedback-wrong"}`}>
                      <strong>{selectedAnswer === currentQuestion.correct ? "Правильно!" : "Попробуй запомнить"}</strong>
                      <span>{selectedAnswer === currentQuestion.correct ? currentQuestion.explanation : `Правильный ответ: ${currentQuestion.correct}. ${currentQuestion.explanation}`}</span>
                    </div>
                  )}
                </div>
                {selectedAnswer !== null && (
                  <button className="primary-button modal-button" onClick={nextQuestion}>
                    {questionIndex === questions.length - 1 ? "Завершить урок" : "Следующий вопрос →"}
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
