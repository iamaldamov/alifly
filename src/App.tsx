
const stages = [
  {
    number: "01",
    title: "Арабский алфавит",
    description: "Знакомство с 28 буквами и их формами",
    detail: "Начни читать с самых основ",
    icon: "ا",
    status: "active",
    lessons: "12 уроков",
  },
  {
    number: "02",
    title: "Огласовки",
    description: "Фатха, кясра, дамма и другие знаки",
    detail: "Учимся правильно читать",
    icon: "َ",
    status: "locked",
    lessons: "10 уроков",
  },
  {
    number: "03",
    title: "Первые слова",
    description: "Слова, которые пригодятся каждый день",
    detail: "Создаём свой словарный запас",
    icon: "ك",
    status: "locked",
    lessons: "15 уроков",
  },
  {
    number: "04",
    title: "Основы грамматики",
    description: "Местоимения, предложения и глаголы",
    detail: "Понимаем устройство языка",
    icon: "ن",
    status: "locked",
    lessons: "14 уроков",
  },
  {
    number: "05",
    title: "Разговорная практика",
    description: "Диалоги и повседневное общение",
    detail: "Используем знания на практике",
    icon: "ح",
    status: "locked",
    lessons: "12 уроков",
  },
  {
    number: "06",
    title: "Чтение и понимание",
    description: "Небольшие тексты и упражнения",
    detail: "Закрепляем весь пройденный материал",
    icon: "ق",
    status: "locked",
    lessons: "12 уроков",
  },
];

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2.5L14.5 9.5L21.5 12L14.5 14.5L12 21.5L9.5 14.5L2.5 12L9.5 9.5L12 2.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 12H19M12 5L19 12L12 19"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function App() {
  return (
    <main className="app-shell">
      <header className="navbar">
        <a className="brand" href="#" aria-label="ALIFLY — главная">
          <span className="brand-mark">A</span>
          <span className="brand-name">ALIFLY</span>
        </a>

        <div className="nav-right">
          <span className="language-switch">RU</span>
          <a className="login-link" href="#program">
            Мой путь
          </a>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-content">
          <div className="welcome-label">
            <span className="welcome-dot" />
            ТВОЁ ПУТЕШЕСТВИЕ НАЧИНАЕТСЯ ЗДЕСЬ
          </div>

          <h1>
            Открой для себя
            <br />
            <span>арабский язык.</span>
          </h1>

          <p className="hero-description">
            От первой буквы до свободного чтения.
            Учись постепенно, открывай новые знания
            и замечай свой прогресс каждый день.
          </p>

          <div className="hero-actions">
            <a className="primary-button" href="#program">
              Начать обучение
              <Arrow />
            </a>
            <a className="secondary-button" href="#about">
              Узнать о программе
            </a>
          </div>

          <div className="hero-benefits">
            <span>
              <Sparkle />
              С нуля
            </span>
            <span>
              <Sparkle />
              В своём темпе
            </span>
            <span>
              <Sparkle />
              Первые 5 уроков бесплатно
            </span>
          </div>
        </div>

        <div className="hero-art" aria-label="Арабская буква Алиф">
          <div className="art-orbit orbit-one" />
          <div className="art-orbit orbit-two" />
          <div className="art-glow" />
          <div className="art-card">
            <span className="art-small-label">ТВОЯ ПЕРВАЯ БУКВА</span>
            <span className="art-letter" lang="ar" dir="rtl">
              ا
            </span>
            <span className="art-transcription">Алиф · Alif</span>
          </div>
          <span className="floating-star star-one">✦</span>
          <span className="floating-star star-two">✧</span>
          <span className="floating-star star-three">✦</span>
          <div className="art-caption">
            <span className="caption-icon">ا</span>
            <span>
              <strong>Каждая буква —</strong>
              <small>новое открытие</small>
            </span>
          </div>
        </div>
      </section>

      <section className="quick-stats" id="about">
        <div className="stat-item">
          <span className="stat-number">28</span>
          <span className="stat-label">букв алфавита</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">6</span>
          <span className="stat-label">этапов обучения</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-item">
          <span className="stat-number">∞</span>
          <span className="stat-label">возможностей учиться</span>
        </div>
      </section>

      <section className="program-section" id="program">
        <div className="section-topline">
          <div>
            <span className="section-kicker">ТВОЯ ДОРОЖНАЯ КАРТА</span>
            <h2>Путь к арабскому</h2>
            <p className="section-description">
              Шесть последовательных этапов.
              Каждый открывает новую ступень знаний.
            </p>
          </div>
          <div className="progress-circle">
            <span>0%</span>
            <small>пройдено</small>
          </div>
        </div>

        <div className="learning-path">
          {stages.map((stage) => (
            <article
              className={`stage-card ${stage.status}`}
              key={stage.number}
            >
              <div className="stage-symbol" lang="ar" dir="rtl">
                {stage.icon}
              </div>

              <div className="stage-content">
                <div className="stage-meta">
                  <span>ЭТАП {stage.number}</span>
                  <span>{stage.lessons}</span>
                </div>

                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
                <span className="stage-detail">{stage.detail}</span>
              </div>

              {stage.status === "active" ? (
                <a
                  className="stage-action"
                  href="#start"
                  aria-label="Перейти к первому этапу"
                >
                  <Arrow />
                </a>
              ) : (
                <span className="stage-lock" aria-label="Закрытый этап">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="5"
                      y="10"
                      width="14"
                      height="11"
                      rx="2.5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V7a4 4 0 0 1 8 0v3"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              )}
            </article>
          ))}
        </div>
      </section>

      <section className="start-banner" id="start">
        <div className="banner-decoration">ب</div>
        <div className="banner-content">
          <span className="section-kicker">ТВОЙ ПЕРВЫЙ ШАГ</span>
          <h2>Большой путь начинается с одной буквы.</h2>
          <p>
            Не нужно знать всё сразу. Просто начни —
            и двигайся вперёд шаг за шагом.
          </p>
          <a className="primary-button banner-button" href="#program">
            Изучить программу
            <Arrow />
          </a>
        </div>
      </section>

      <footer className="footer">
        <a className="brand footer-brand" href="#">
          <span className="brand-mark">A</span>
          <span className="brand-name">ALIFLY</span>
        </a>
        <p>Учись с интересом. Шаг за шагом.</p>
        <span className="footer-note">
          Создано с заботой о знаниях.
        </span>
      </footer>
    </main>
  );
}
