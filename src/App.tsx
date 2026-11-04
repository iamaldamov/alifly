
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
  {
    id: 1,
    title: "Арабский алфавит",
    description: "Знакомство с 28 буквами и их звучанием",
    icon: "ا",
    lessons: 8,
    status: "available",
  },
  {
    id: 2,
    title: "Огласовки",
    description: "Учимся правильно читать арабские буквы",
    icon: "َ",
    lessons: 8,
    status: "locked",
  },
  {
    id: 3,
    title: "Первые слова",
    description: "Изучаем простые слова и выражения",
    icon: "ك",
    lessons: 10,
    status: "locked",
  },
  {
    id: 4,
    title: "Основы грамматики",
    description: "Строим простые предложения",
    icon: "ن",
    lessons: 10,
    status: "locked",
  },
  {
    id: 5,
    title: "Разговорный арабский",
    description: "Знакомство и повседневные диалоги",
    icon: "ح",
    lessons: 10,
    status: "locked",
  },
  {
    id: 6,
    title: "Чтение и понимание",
    description: "Читаем небольшие тексты",
    icon: "ق",
    lessons: 10,
    status: "locked",
  },
];

export default function App() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="#">
          <span className="logo-mark">ا</span>
          <span>ALIFLY</span>
        </a>

        <div className="topbar-right">
          <span className="language">🇷🇺 RU</span>
          <span className="streak">🔥 0</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">ТВОЙ ПУТЬ К ЗНАНИЯМ</span>

          <h1>
            Арабский язык
            <br />
            <span>с нуля</span>
          </h1>

          <p>
            Начни изучать арабский постепенно.
            Маленькие уроки — большие достижения.
          </p>

          <button
            className="primary-button"
            onClick={() =>
              document
                .getElementById("learning-path")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            Начать обучение <span>→</span>
          </button>

          <div className="hero-note">
            <span>✦</span> Первые 5 уроков бесплатно
          </div>
        </div>

        <div className="hero-art" aria-label="Арабская буква Алиф">
          <div className="art-circle">
            <span>ا</span>
          </div>
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
          <div className="progress-info">
            <span>Начало пути</span>
            <strong>0%</strong>
          </div>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
          <p>Пройди первый урок, чтобы начать свой путь.</p>
        </div>
      </section>

      <section className="learning-section" id="learning-path">
        <div className="section-heading">
          <div>
            <span className="section-label">ПРОГРАММА ОБУЧЕНИЯ</span>
            <h2>Твой путь</h2>
          </div>
          <span className="stage-count">6 этапов</span>
        </div>

        <div className="stage-list">
          {stages.map((stage) => (
            <button
              className={`stage-card ${
                stage.status === "locked" ? "stage-locked" : ""
              }`}
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
            >
              <span className="stage-icon">{stage.icon}</span>

              <span className="stage-info">
                <span className="stage-number">
                  ЭТАП {stage.id}
                </span>
                <strong>{stage.title}</strong>
                <span className="stage-description">
                  {stage.description}
                </span>
                <span className="lesson-count">
                  {stage.lessons} уроков
                </span>
              </span>

              <span className="stage-arrow">
                {stage.status === "available" ? "→" : "🔒"}
              </span>
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
        <div
          className="modal-backdrop"
          onClick={() => setSelectedStage(null)}
        >
          <div
            className="stage-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedStage(null)}
              aria-label="Закрыть"
            >
              ×
            </button>

            <div className="modal-icon">{selectedStage.icon}</div>

            <span className="section-label">
              ЭТАП {selectedStage.id}
            </span>

            <h2>{selectedStage.title}</h2>
            <p>{selectedStage.description}</p>

            {selectedStage.status === "available" ? (
              <>
                <p className="modal-note">
                  Здесь начнётся твоё изучение арабского языка.
                </p>
                <button
                  className="primary-button modal-button"
                  onClick={() => setSelectedStage(null)}
                >
                  Скоро начнём →
                </button>
              </>
            ) : (
              <p className="locked-message">
                🔒 Этот этап откроется после прохождения предыдущего.
              </p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
