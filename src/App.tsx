import { useEffect, useState } from "react";

type Stage = {
  id: number;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  status: "available" | "locked";
};

type Question = {
  prompt: string;
  options: string[];
  correct: string;
  explanation: string;
};

type Lesson = {
  id: number;
  title: string;
  goal: string;
  letters: { character: string; name: string; note?: string }[];
  questions: Question[];
};

const stages: Stage[] = [
  { id: 1, title: "Арабский алфавит", description: "Знакомство с 28 буквами и их звучанием", icon: "ا", lessons: 5, status: "available" },
  { id: 2, title: "Огласовки", description: "Фатха, кясра и дамма — три основные огласовки", icon: "َ", lessons: 3, status: "locked" },
  { id: 3, title: "Первые слова", description: "Изучаем простые слова и выражения", icon: "ك", lessons: 10, status: "locked" },
  { id: 4, title: "Основы грамматики", description: "Строим простые предложения", icon: "ن", lessons: 10, status: "locked" },
  { id: 5, title: "Разговорный арабский", description: "Знакомство и повседневные диалоги", icon: "ح", lessons: 10, status: "locked" },
  { id: 6, title: "Чтение и понимание", description: "Читаем небольшие тексты", icon: "ق", lessons: 10, status: "locked" },
];

const lessons: Lesson[] = [
  {
    id: 1,
    title: "Первые четыре буквы",
    goal: "Научись узнавать алиф, ба, та и са.",
    letters: [
      { character: "ا", name: "алиф", note: "Прямая вертикальная форма." },
      { character: "ب", name: "ба", note: "Одна точка снизу." },
      { character: "ت", name: "та", note: "Две точки сверху." },
      { character: "ث", name: "са", note: "Три точки сверху; звук произносится между зубами." },
    ],
    questions: [
      { prompt: "У какой буквы одна точка снизу?", options: ["ت", "ب", "ث"], correct: "ب", explanation: "Это ба — ب. У неё одна точка под буквой." },
      { prompt: "Найди букву «та».", options: ["ث", "ا", "ت"], correct: "ت", explanation: "Это та — ت. У неё две точки сверху." },
      { prompt: "Узнай алиф.", options: ["ا", "ب", "ث"], correct: "ا", explanation: "Это алиф — ا. Он выглядит как вертикальная линия." },
    ],
  },
  {
    id: 2,
    title: "Буквы с одной, двумя и тремя точками",
    goal: "Познакомься с джим, ха, ха, даль и заль.",
    letters: [
      { character: "ج", name: "джим", note: "Одна точка снизу." },
      { character: "ح", name: "ха", note: "Без точек." },
      { character: "خ", name: "ха", note: "Одна точка сверху." },
      { character: "د", name: "даль", note: "Без точек." },
      { character: "ذ", name: "заль", note: "Одна точка сверху." },
    ],
    questions: [
      { prompt: "Найди джим — букву с точкой снизу.", options: ["ح", "ج", "خ"], correct: "ج", explanation: "Это джим — ج. Её отличительный знак — точка снизу." },
      { prompt: "Какая буква не имеет точек?", options: ["خ", "ذ", "ح"], correct: "ح", explanation: "Это ха — ح. У неё нет точек." },
      { prompt: "Найди даль.", options: ["د", "ذ", "ج"], correct: "د", explanation: "Это даль — د. Она пишется без точки." },
    ],
  },
  {
    id: 3,
    title: "Буквы ра, зай, син и шин",
    goal: "Научись различать четыре новые буквы.",
    letters: [
      { character: "ر", name: "ра" },
      { character: "ز", name: "зай", note: "Одна точка сверху." },
      { character: "س", name: "син", note: "Три зубца, без точек." },
      { character: "ش", name: "шин", note: "Три точки сверху." },
    ],
    questions: [
      { prompt: "Найди букву «зай».", options: ["ر", "ز", "س"], correct: "ز", explanation: "Это зай — ز. У неё одна точка сверху." },
      { prompt: "Какая буква имеет три точки сверху?", options: ["ش", "س", "ر"], correct: "ش", explanation: "Это шин — ش. Три точки отличают её от син — س." },
      { prompt: "Найди син без точек.", options: ["ز", "ش", "س"], correct: "س", explanation: "Это син — س. У неё три зубца и нет точек." },
    ],
  },
  {
    id: 4,
    title: "Буквы с особым произношением",
    goal: "Познакомься с буквами сад, дад, та, за, айн и гайн.",
    letters: [
      { character: "ص", name: "сад" },
      { character: "ض", name: "дад" },
      { character: "ط", name: "та" },
      { character: "ظ", name: "за" },
      { character: "ع", name: "айн", note: "Глубокий гортанный звук, без точного аналога в русском." },
      { character: "غ", name: "гайн", note: "Звонкий звук, образуется в глубине горла." },
    ],
    questions: [
      { prompt: "Найди букву «айн».", options: ["غ", "ع", "ط"], correct: "ع", explanation: "Это айн — ع. Её произношение требует отдельной практики." },
      { prompt: "Какая буква имеет одну точку сверху и относится к этой группе?", options: ["ص", "ض", "ظ"], correct: "ظ", explanation: "Это за — ظ. У неё одна точка сверху." },
      { prompt: "Найди гайн.", options: ["ع", "غ", "ص"], correct: "غ", explanation: "Это гайн — غ. У неё одна точка сверху." },
    ],
  },
  {
    id: 5,
    title: "Последние буквы алфавита",
    goal: "Познакомься с оставшимися буквами и заверши первый блок.",
    letters: [
      { character: "ف", name: "фа" },
      { character: "ق", name: "къаф" },
      { character: "ك", name: "каф" },
      { character: "ل", name: "лям" },
      { character: "م", name: "мим" },
      { character: "ن", name: "нун" },
      { character: "ه", name: "ха" },
      { character: "و", name: "уау" },
      { character: "ي", name: "йа" },
    ],
    questions: [
      { prompt: "Найди букву «фа».", options: ["ق", "ف", "ك"], correct: "ف", explanation: "Это фа — ف. У неё одна точка сверху." },
      { prompt: "Найди букву «мим».", options: ["ن", "م", "ل"], correct: "م", explanation: "Это мим — م." },
      { prompt: "Какая буква называется «йа»?", options: ["و", "ه", "ي"], correct: "ي", explanation: "Это йа — ي." },
    ],
  },
];


const stageTwoLessons: Lesson[] = [
  {
    id: 6,
    title: "Фатха — короткий звук «а»",
    goal: "Узнай знак фатха и научись читать простые сочетания с ним.",
    letters: [
      { character: "بَ", name: "ба", note: "Фатха над буквой даёт короткий звук «а»." },
      { character: "تَ", name: "та", note: "Та с фатхой читается как «та»." },
      { character: "مَ", name: "ма", note: "Мим с фатхой читается как «ма»." },
    ],
    questions: [
      { prompt: "Как называется знак над буквой, который даёт короткий звук «а»?", options: ["Фатха", "Кясра", "Дамма"], correct: "Фатха", explanation: "Фатха — короткая диагональная черта над буквой. Например: بَ — «ба»." },
      { prompt: "Как читается сочетание بَ?", options: ["би", "бу", "ба"], correct: "ба", explanation: "Буква ба с фатхой читается «ба»." },
      { prompt: "Где находится фатха?", options: ["Под буквой", "Над буквой", "После буквы"], correct: "Над буквой", explanation: "Фатха ставится над согласной буквой." },
    ],
  },
  {
    id: 7,
    title: "Кясра — короткий звук «и»",
    goal: "Научись замечать кясру под буквой и читать сочетания с ней.",
    letters: [
      { character: "بِ", name: "би", note: "Кясра под буквой даёт короткий звук «и»." },
      { character: "تِ", name: "ти", note: "Та с кясрой читается как «ти»." },
      { character: "مِ", name: "ми", note: "Мим с кясрой читается как «ми»." },
    ],
    questions: [
      { prompt: "Как называется короткая черта под буквой?", options: ["Дамма", "Фатха", "Кясра"], correct: "Кясра", explanation: "Кясра — короткая черта под буквой. Она обозначает короткий звук «и»." },
      { prompt: "Как читается сочетание بِ?", options: ["ба", "би", "бу"], correct: "би", explanation: "Ба с кясрой читается «би»." },
      { prompt: "Где ставится кясра?", options: ["Под буквой", "Над буквой", "Слева от буквы"], correct: "Под буквой", explanation: "Кясра располагается под согласной буквой." },
    ],
  },
  {
    id: 8,
    title: "Дамма — короткий звук «у»",
    goal: "Познакомься с даммой и сравни три основные огласовки.",
    letters: [
      { character: "بُ", name: "бу", note: "Дамма над буквой даёт короткий звук «у»." },
      { character: "تُ", name: "ту", note: "Та с даммой читается как «ту»." },
      { character: "مُ", name: "му", note: "Мим с даммой читается как «му»." },
    ],
    questions: [
      { prompt: "Как называется знак, похожий на маленькую запятую над буквой?", options: ["Кясра", "Дамма", "Фатха"], correct: "Дамма", explanation: "Дамма ставится над буквой и обозначает короткий звук «у»." },
      { prompt: "Как читается сочетание بُ?", options: ["бу", "би", "ба"], correct: "бу", explanation: "Ба с даммой читается «бу»." },
      { prompt: "Какое соответствие верное?", options: ["Фатха — «и»", "Кясра — «у»", "Дамма — «у»"], correct: "Дамма — «у»", explanation: "Запомни: фатха — короткое «а», кясра — короткое «и», дамма — короткое «у»." },
    ],
  },
];

const examQuestions: Question[] = [
  { prompt: "Какая буква называется «алиф»?", options: ["ا", "ب", "ت"], correct: "ا", explanation: "Алиф — ا. Она выглядит как вертикальная линия." },
  { prompt: "У какой буквы одна точка снизу?", options: ["ت", "ب", "ث"], correct: "ب", explanation: "Ба — ب. У неё одна точка снизу." },
  { prompt: "Найди букву «та» с двумя точками сверху.", options: ["ث", "ت", "ج"], correct: "ت", explanation: "Та — ت. У неё две точки сверху." },
  { prompt: "Какая буква имеет три точки сверху?", options: ["ب", "ش", "س"], correct: "ش", explanation: "Шин — ش. Её отличают три точки сверху." },
  { prompt: "Найди букву «джим».", options: ["ح", "خ", "ج"], correct: "ج", explanation: "Джим — ج. У неё одна точка снизу." },
  { prompt: "Какая буква называется «даль»?", options: ["ذ", "د", "ر"], correct: "د", explanation: "Даль — د. Она пишется без точки." },
  { prompt: "Найди букву «зай».", options: ["ز", "ر", "س"], correct: "ز", explanation: "Зай — ز. У неё одна точка сверху." },
  { prompt: "Какая буква называется «айн»?", options: ["غ", "ع", "ض"], correct: "ع", explanation: "Айн — ع. Это гортанный звук, которому нужна отдельная практика." },
  { prompt: "Найди букву «фа».", options: ["ق", "ف", "ك"], correct: "ف", explanation: "Фа — ف. В этой учебной форме у неё одна точка сверху." },
  { prompt: "Какая буква называется «мим»?", options: ["ن", "م", "ل"], correct: "م", explanation: "Мим — م." },
];

function readCompletedLessons(): number[] {
  try {
    const saved = localStorage.getItem("alifly-completed-lessons");
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => Number.isInteger(value) && value >= 1 && value <= 8);
  } catch {
    return [];
  }
}


type Mistake = {
  id: string;
  lessonId: number;
  lessonTitle: string;
  question: Question;
  dueAt: number;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
};

const REVIEW_DELAY_MINUTES = 10;

function updateReviewCard(
  previous: Mistake | undefined,
  input: Omit<Mistake, "dueAt" | "intervalDays" | "repetitions" | "easeFactor">,
  correct: boolean,
): Mistake {
  const repetitions = previous?.repetitions ?? 0;
  const easeFactor = previous?.easeFactor ?? 2.5;
  const nextEase = correct
    ? Math.min(3, easeFactor + 0.1)
    : Math.max(1.3, easeFactor - 0.2);
  const intervalDays = correct
    ? repetitions === 0 ? 1 : repetitions === 1 ? 3 : Math.max(1, Math.round((previous?.intervalDays ?? 3) * nextEase))
    : 0;
  const dueAt = correct
    ? Date.now() + intervalDays * 24 * 60 * 60 * 1000
    : Date.now() + REVIEW_DELAY_MINUTES * 60 * 1000;

  return {
    ...input,
    dueAt,
    intervalDays,
    repetitions: correct ? repetitions + 1 : 0,
    easeFactor: nextEase,
  };
}

function readMistakes(): Mistake[] {
  try {
    const saved = localStorage.getItem("alifly-mistakes");
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is Mistake =>
      item !== null &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      Number.isInteger(item.lessonId) &&
      typeof item.lessonTitle === "string" &&
      item.question !== null &&
      typeof item.question === "object" &&
      typeof item.question.prompt === "string" &&
      Array.isArray(item.question.options) &&
      typeof item.question.correct === "string" &&
      typeof item.question.explanation === "string"
    ).map((item) => ({
      ...item,
      dueAt: Number.isFinite(item.dueAt) ? item.dueAt : Date.now(),
      intervalDays: Number.isFinite(item.intervalDays) ? item.intervalDays : 0,
      repetitions: Number.isInteger(item.repetitions) ? item.repetitions : 0,
      easeFactor: Number.isFinite(item.easeFactor) ? item.easeFactor : 2.5,
    }));
  } catch {
    return [];
  }
}

function readNumber(key: string): number {
  try {
    const value = Number(localStorage.getItem(key) || 0);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
  } catch {
    return 0;
  }
}

function readBoolean(key: string): boolean {
  try { return localStorage.getItem(key) === "true"; } catch { return false; }
}

function readLastStudyDate(): string {
  try {
    return localStorage.getItem("alifly-last-study-date") || "";
  } catch {
    return "";
  }
}

function localDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

type TutorMessage = { role: "user" | "assistant"; content: string };

function AiTutor() {
  const [messages, setMessages] = useState<TutorMessage[]>([
    { role: "assistant", content: "Ассаляму алейкум! Я помогу тебе изучать арабский: объясню буквы, огласовки и простые правила. Спрашивай — будем разбирать всё постепенно." },
  ]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const endpoint = import.meta.env.VITE_AI_TUTOR_URL as string | undefined;
  const ready = Boolean(endpoint && endpoint.trim());

  const sendMessage = async () => {
    const question = draft.trim();
    if (!question || loading || !ready) return;
    const nextMessages: TutorMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setDraft("");
    setLoading(true);
    try {
      const response = await fetch(endpoint as string, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages.slice(-10) }),
      });
      const data: { answer?: string; error?: string } = await response.json();
      if (!response.ok || !data.answer) {
        throw new Error(data.error || "Не удалось получить ответ. Попробуй ещё раз.");
      }
      setMessages((current) => [...current, { role: "assistant", content: data.answer as string }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Связь с помощником временно недоступна.";
      setMessages((current) => [...current, { role: "assistant", content: message }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="ai-section" id="ai-tutor">
      <div className="ai-heading">
        <div>
          <span className="section-label">ТВОЙ ПОМОЩНИК</span>
          <h2>Учись вместе с ИИ</h2>
          <p>Задавай вопросы об арабском языке и получай объяснения на русском.</p>
        </div>
        <div className="ai-mark" aria-hidden="true">✦</div>
      </div>
      <div className="ai-chat">
        <div className="ai-chat-top">
          <span className="ai-avatar">ا</span>
          <div><strong>ALIFLY · ИИ-репетитор</strong><small>{ready ? "Помощник готов к работе" : "Подготовка подключения"}</small></div>
          <span className={ready ? "ai-status ai-status-ready" : "ai-status"}>{ready ? "Онлайн" : "Скоро"}</span>
        </div>
        <div className="ai-messages" aria-live="polite">
          {messages.map((message, index) => (
            <div className={`ai-message ${message.role === "user" ? "ai-message-user" : "ai-message-assistant"}`} key={index}>
              {message.content}
            </div>
          ))}
          {loading && <div className="ai-message ai-message-assistant ai-typing">Готовлю объяснение…</div>}
        </div>
        {!ready && <p className="ai-setup-note">Чат уже подготовлен, но настоящий ИИ пока не подключён. Для запуска нужен защищённый сервер и API-ключ — ключ не будет храниться в браузере.</p>}
        <div className="ai-composer">
          <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Например: чем отличаются ب и ت?" rows={2} disabled={!ready || loading} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} />
          <button type="button" onClick={() => void sendMessage()} disabled={!ready || loading || !draft.trim()} aria-label="Отправить вопрос">↑</button>
        </div>
        <div className="ai-disclaimer">ИИ может ошибаться. Учебные правила и произношение сверяй с проверенными материалами.</div>
      </div>
    </section>
  );
}

export default function App() {
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(readCompletedLessons);
  const [mistakes, setMistakes] = useState<Mistake[]>(readMistakes);
  const [xp, setXp] = useState<number>(() => readNumber("alifly-xp"));
  const [streak, setStreak] = useState<number>(() => readNumber("alifly-streak"));
  const [lastStudyDate, setLastStudyDate] = useState<string>(readLastStudyDate);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewMistakeIds, setReviewMistakeIds] = useState<string[]>([]);
  const [examMode, setExamMode] = useState(false);
  const [examPassed, setExamPassed] = useState<boolean>(() => readBoolean("alifly-stage-1-exam-passed"));

  useEffect(() => {
    try { localStorage.setItem("alifly-completed-lessons", JSON.stringify(completedLessonIds)); } catch { /* Storage may be unavailable. */ }
  }, [completedLessonIds]);

  useEffect(() => {
    try { localStorage.setItem("alifly-mistakes", JSON.stringify(mistakes)); } catch { /* Storage may be unavailable. */ }
  }, [mistakes]);

  useEffect(() => {
    try { localStorage.setItem("alifly-xp", String(xp)); } catch { /* Storage may be unavailable. */ }
  }, [xp]);

  useEffect(() => {
    try { localStorage.setItem("alifly-streak", String(streak)); } catch { /* Storage may be unavailable. */ }
  }, [streak]);

  useEffect(() => {
    try { localStorage.setItem("alifly-last-study-date", lastStudyDate); } catch { /* Storage may be unavailable. */ }
  }, [lastStudyDate]);

  useEffect(() => {
    try { localStorage.setItem("alifly-stage-1-exam-passed", String(examPassed)); } catch { /* Storage may be unavailable. */ }
  }, [examPassed]);

  const closeStage = () => {
    setSelectedStage(null);
    setSelectedLesson(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(false);
  };

  const startLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(false);
  };

  const answerQuestion = (answer: string) => {
    if (selectedAnswer !== null || !selectedLesson) return;
    setSelectedAnswer(answer);
    const question = selectedLesson.questions[questionIndex];
    const mistakeId = reviewMode
      ? reviewMistakeIds[questionIndex]
      : `${selectedLesson.id}:${question.prompt}`;
    const isCorrect = answer === question.correct;

    if (isCorrect) {
      setCorrectAnswers((count) => count + 1);
      setXp((current) => current + 10);
    }

    if (mistakeId && !examMode) {
      setMistakes((current) => {
        const previous = current.find((item) => item.id === mistakeId);
        const card = updateReviewCard(
          previous,
          { id: mistakeId, lessonId: selectedLesson.id, lessonTitle: selectedLesson.title, question },
          isCorrect,
        );
        return [...current.filter((item) => item.id !== mistakeId), card];
      });
    }
  };

  const nextQuestion = () => {
    if (!selectedLesson) return;
    if (questionIndex === selectedLesson.questions.length - 1) {
      if (examMode) {
        if (correctAnswers >= 8 && !examPassed) {
          setExamPassed(true);
          setXp((current) => current + 30);
        }
      } else if (!reviewMode) {
        setCompletedLessonIds((current) => current.includes(selectedLesson.id) ? current : [...current, selectedLesson.id]);
        setXp((current) => current + 15);
      }
      if (!reviewMode) {
        const today = localDateKey();
        if (lastStudyDate !== today) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          setStreak((current) => lastStudyDate === localDateKey(yesterday) ? current + 1 : 1);
          setLastStudyDate(today);
        }
      }
      setLessonFinished(true);
      return;
    }
    setQuestionIndex((index) => index + 1);
    setSelectedAnswer(null);
  };

  const startExam = () => {
    if (completedLessonIds.length < lessons.length) return;
    setSelectedStage(stages[0]);
    setSelectedLesson({
      id: 99,
      title: "Итоговый экзамен",
      goal: "Проверь, насколько хорошо ты запомнил буквы первого этапа.",
      letters: [],
      questions: examQuestions,
    });
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(true);
  };

  const dueMistakes = mistakes.filter((item) => item.dueAt <= Date.now());

  const startReview = () => {
    const due = mistakes.filter((item) => item.dueAt <= Date.now());
    if (due.length === 0) return;
    setSelectedStage(stages[0]);
    setSelectedLesson({
      id: 0,
      title: "Тренировка памяти",
      goal: "Повтори материал в нужный момент — так знания закрепляются надолго.",
      letters: [],
      questions: due.map((item) => item.question),
    });
    setReviewMistakeIds(due.map((item) => item.id));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(true);
  };

  const currentQuestion = selectedLesson?.questions[questionIndex];
  const progressPercent = Math.round((completedLessonIds.length / lessons.length) * 100);
  const stageTwoUnlocked = examPassed;

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="#" aria-label="ALIFLY — главная">
          <span className="logo-mark">ا</span>
          <span>ALIFLY</span>
        </a>
        <div className="topbar-right">
          <span className="language">RU · Русский</span>
          <span className="xp-counter" aria-label="Баллы опыта">✦ {xp} XP</span>
          <span className="streak" aria-label="Серия занятий">🔥 {streak}</span>
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <span className="eyebrow">ТВОЙ ПУТЬ К ЗНАНИЯМ</span>
          <h1>Арабский язык <span>с нуля</span></h1>
          <p>Начни изучать современный литературный арабский постепенно. Маленькие уроки — большие достижения.</p>
          <button className="primary-button" onClick={() => document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" })}>
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

      <AiTutor />

      <section className="progress-section">
        <div>
          <span className="section-label">ТВОЙ ПРОГРЕСС</span>
          <h2>Каждый шаг важен</h2>
        </div>
        <div className="progress-card">
          <div className="progress-info"><span>{completedLessonIds.length} из 5 бесплатных уроков</span><strong>{progressPercent}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
          <p>{completedLessonIds.length === 5 ? "Все пять первых уроков завершены. Отличная работа!" : "Пройди уроки по порядку и возвращайся к ним для повторения."}</p>
          {dueMistakes.length > 0 ? (
            <button className="review-button" type="button" onClick={startReview}>
              Тренировка памяти · {dueMistakes.length}
            </button>
          ) : mistakes.length > 0 ? (
            <p className="memory-next-review">Следующее повторение запланировано. Возвращайся позже — интервалы помогают запоминать надолго.</p>
          ) : null}
        </div>
      </section>

      <section className="learning-section" id="learning-path">
        <div className="section-heading">
          <div><span className="section-label">ПРОГРАММА ОБУЧЕНИЯ</span><h2>Твой путь</h2></div>
          <span className="stage-count">6 этапов</span>
        </div>
        <div className="stage-list">
          {stages.map((stage) => {
            const unlocked = stage.id === 1 || (stage.id === 2 && stageTwoUnlocked);
            return (
              <button className={`stage-card ${unlocked ? "" : "stage-locked"}`} key={stage.id} disabled={!unlocked} onClick={() => { setSelectedStage(stage); setSelectedLesson(null); }}>
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-info">
                  <span className="stage-number">ЭТАП {stage.id}</span>
                  <strong>{stage.title}</strong>
                  <span className="stage-description">{stage.description}</span>
                  <span className="lesson-count">{stage.id === 1 ? `${completedLessonIds.length}/5 бесплатных уроков` : stage.id === 2 && unlocked ? "Открыт после экзамена" : `${stage.lessons} уроков`}</span>
                </span>
                <span className="stage-arrow">{unlocked ? "→" : "🔒"}</span>
              </button>
            );
          })}
        </div>
      </section>

      <footer className="footer">
        <span className="footer-logo">ALIFLY</span>
        <p>Учись с интересом. Продвигайся с уверенностью.</p>
        <span>Создано с заботой о знаниях.</span>
      </footer>

      {selectedStage && (
        <div className="modal-backdrop" onClick={closeStage}>
          <section className={`stage-modal ${selectedLesson ? "lesson-modal" : ""}`} onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="stage-modal-title">
            <button className="modal-close" onClick={closeStage} aria-label="Закрыть">×</button>

            {!selectedLesson ? (
              <>
                <div className="modal-icon">{selectedStage.icon}</div>
                <span className="section-label">ЭТАП {selectedStage.id}</span>
                <h2 id="stage-modal-title">{selectedStage.title}</h2>
                <p>{selectedStage.description}</p>
                {selectedStage.id === 2 && stageTwoUnlocked ? (
                  <div className="lesson-picker">
                    <p className="modal-note">Отличная работа! Теперь изучи три основные огласовки. Уроки открываются по порядку.</p>
                    {stageTwoLessons.map((lesson) => {
                      const isOpen = lesson.id === 6 || completedLessonIds.includes(lesson.id - 1);
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={isCompleted ? "lesson-pick lesson-pick-done" : "lesson-pick"} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(lesson.id - 5).padStart(2, "0")}</span>
                          <span className="lesson-pick-text"><strong>{lesson.title}</strong><small>{lesson.letters.length} примера · 3 задания</small></span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <p className="local-progress-note">Прогресс сохраняется в этом браузере на устройстве.</p>
                  </div>
                ) : selectedStage.id === 1 ? (
                  <div className="lesson-picker">
                    <p className="modal-note">Пять первых уроков доступны бесплатно. Проходи их по порядку или повторяй для закрепления.</p>
                    {lessons.map((lesson) => {
                      const isOpen = lesson.id === 1 || completedLessonIds.includes(lesson.id - 1);
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={`lesson-pick ${isCompleted ? "lesson-pick-done" : ""}`} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(lesson.id).padStart(2, "0")}</span>
                          <span className="lesson-pick-text"><strong>{lesson.title}</strong><small>{lesson.letters.length} букв · 3 задания</small></span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <button className={`exam-pick ${examPassed ? "exam-pick-passed" : ""}`} type="button" onClick={startExam} disabled={completedLessonIds.length < lessons.length}>
                      <span className="exam-pick-mark">{examPassed ? "✓" : "10"}</span>
                      <span className="lesson-pick-text"><strong>Итоговый экзамен</strong><small>{examPassed ? "Экзамен успешно сдан" : "10 вопросов · нужно 8 правильных"}</small></span>
                      <span className="lesson-pick-state">{examPassed ? "Пройден" : completedLessonIds.length === lessons.length ? "Начать →" : "Сначала 5 уроков"}</span>
                    </button>
                    <p className="local-progress-note">Прогресс сохраняется в этом браузере на устройстве.</p>
                  </div>
                ) : (
                  <p className="locked-message">🔒 Этот этап пока закрыт. Сначала пройди предыдущие уроки.</p>
                )}
              </>
            ) : lessonFinished ? (
              <div className="lesson-result">
                {examMode ? (
                  <>
                    <div className="result-symbol">{correctAnswers >= 8 ? "✓" : "↻"}</div>
                    <span className="section-label">ИТОГОВЫЙ ЭКЗАМЕН</span>
                    <h2 id="stage-modal-title">{correctAnswers >= 8 ? "Этап пройден!" : "Попробуй ещё раз"}</h2>
                    <p>Твой результат: {correctAnswers} из 10 правильных ответов.</p>
                    <div className="result-score">{correctAnswers}/10</div>
                    <p>{correctAnswers >= 8 ? "Ма ша Аллах! Ты открыл следующий этап — «Огласовки»." : "Для открытия следующего этапа нужно набрать не менее 8 правильных ответов. Повтори уроки и возвращайся."}</p>
                    {correctAnswers >= 8 ? (
                      <button className="primary-button modal-button" onClick={() => { setSelectedLesson(null); setLessonFinished(false); setExamMode(false); setSelectedStage(stages[1]); }}>Открыть этап 2 →</button>
                    ) : (
                      <button className="primary-button modal-button" onClick={startExam}>Пересдать экзамен</button>
                    )}
                  </>
                ) : (
                  <>
                <div className="result-symbol">✦</div>
                <span className="section-label">{reviewMode ? "ТРЕНИРОВКА ПАМЯТИ ЗАВЕРШЕНА" : "УРОК ЗАВЕРШЁН"}</span>
                <h2 id="stage-modal-title">{reviewMode ? "Повторение завершено!" : "Отличная работа!"}</h2>
                <p>Правильных ответов: {correctAnswers} из {selectedLesson.questions.length}.</p>
                <div className="result-score">{correctAnswers}/{selectedLesson.questions.length}</div>
                <p>{correctAnswers === selectedLesson.questions.length ? "Прекрасно! Все ответы верные." : reviewMode ? "Правильные ответы вернутся через более длинный интервал, а ошибки появятся раньше." : "Хорошее начало. Возвращайся к материалу по расписанию — так он лучше закрепится."}</p>
                <button className="primary-button modal-button" onClick={() => { setSelectedLesson(null); setLessonFinished(false); setReviewMode(false); setReviewMistakeIds([]); setExamMode(false); }}>К списку уроков</button>
                </>
                )}
              </div>
            ) : currentQuestion ? (
              <>
                <div className="lesson-topline">
                  <span className="section-label">{examMode ? "ЭКЗАМЕН · ЭТАП 1" : `УРОК ${selectedLesson.id} · АЛФАВИТ`}</span>
                  <span className="lesson-step">{questionIndex + 1} из {selectedLesson.questions.length}</span>
                </div>
                <div className="lesson-progress"><span style={{ width: `${((questionIndex + (selectedAnswer ? 1 : 0)) / selectedLesson.questions.length) * 100}%` }} /></div>
                <h2 id="stage-modal-title">{selectedLesson.title}</h2>
                <p className="lesson-intro">{selectedLesson.goal}</p>
                {selectedLesson.letters.length > 0 && <div className="letter-intro lesson-letters">
                  {selectedLesson.letters.map((letter) => (
                    <div key={letter.character}>
                      <strong lang="ar" dir="rtl">{letter.character}</strong>
                      <span>{letter.name}</span>
                      {letter.note && <small>{letter.note}</small>}
                    </div>
                  ))}
                </div>}
                <div className="question-block">
                  <span className="question-label">ПРОВЕРЬ СЕБЯ</span>
                  <h3>{currentQuestion.prompt}</h3>
                  <div className="answer-options">
                    {currentQuestion.options.map((option) => {
                      const isCorrect = option === currentQuestion.correct;
                      const isSelected = option === selectedAnswer;
                      const stateClass = selectedAnswer === null ? "" : isCorrect ? "answer-correct" : isSelected ? "answer-wrong" : "answer-muted";
                      return (
                        <button key={option} className={`answer-option ${stateClass}`} onClick={() => answerQuestion(option)} disabled={selectedAnswer !== null} lang="ar" dir="rtl">
                          {option}
                        </button>
                      );
                    })}
                  </div>
                  {selectedAnswer !== null && (
                    <div className={`answer-feedback ${selectedAnswer === currentQuestion.correct ? "feedback-correct" : "feedback-wrong"}`}>
                      <strong>{selectedAnswer === currentQuestion.correct ? "Правильно!" : "Правильный ответ"}</strong>
                      <span>{selectedAnswer === currentQuestion.correct ? currentQuestion.explanation : `${currentQuestion.correct}. ${currentQuestion.explanation}`}</span>
                    </div>
                  )}
                </div>
                {selectedAnswer !== null && (
                  <button className="primary-button modal-button" onClick={nextQuestion}>
                    {questionIndex === selectedLesson.questions.length - 1 ? "Завершить урок" : "Следующий вопрос →"}
                  </button>
                )}
              </>
            ) : null}
          </section>
        </div>
      )}
    </main>
  );
}
