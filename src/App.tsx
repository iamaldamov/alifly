import { useEffect, useState } from "react";
import ReadingTrainer from "./ReadingTrainer";
import DailyQuest, { type DailyGoal } from "./DailyQuest";
import AuthPanel from "./auth/AuthPanel";
import { useAuth } from "./auth/AuthContext";
import { supabase } from "./lib/supabase";

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
  mode?: "choice" | "recall";
  stimulus?: string;
  acceptedAnswers?: string[];
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
      { character: "ث", name: "са (thāʾ)", note: "Три точки сверху. Межзубный звук, близкий к th в английском think; это не обычный русский «с»." },
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
      { character: "ح", name: "ḥāʾ (глубокая ха)", note: "Без точек. Глухой глоточный звук; обычная русская «х» не передаёт его точно." },
      { character: "خ", name: "khāʾ (х)", note: "Одна точка сверху. Шумный звук, похожий на русское «х»." },
      { character: "د", name: "даль", note: "Без точек." },
      { character: "ذ", name: "dhāl (межзубный звук)", note: "Одна точка сверху. Звонкий межзубный звук, близкий к th в английском this." },
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
    goal: "Познакомься с буквами сад, дад, та, за, айн и гайн. Научись отличать эмфатические звуки от похожих обычных согласных.",
    letters: [
      { character: "ص", name: "сад", note: "Эмфатический звук, не обычное русское «с». При произнесении задняя часть языка отодвигается к верхней части глотки." },
      { character: "ض", name: "дад", note: "Эмфатический согласный, не обычное русское «д». Отличается от د дополнительным сужением в верхней части глотки." },
      { character: "ط", name: "та", note: "Эмфатический звук, не обычное русское «т». Отличается от ت дополнительным сужением в верхней части глотки." },
      { character: "ظ", name: "ẓāʾ (эмфатическая за)", note: "Одна точка сверху. В литературном арабском это звонкий межзубный эмфатический звук; русская «з» — лишь приблизительная подсказка." },
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
      { character: "ق", name: "qāf (къаф)", note: "Глубокий заднеязычный звук; не обычное русское «к»." },
      { character: "ك", name: "каф" },
      { character: "ل", name: "лям" },
      { character: "م", name: "мим" },
      { character: "ن", name: "нун" },
      { character: "ه", name: "hāʾ (лёгкая h)", note: "Лёгкий выдох, не путай с ح и خ." },
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
      { prompt: "Как называется знак над буквой, который даёт короткий звук «а»?", options: [], correct: "Фатха", explanation: "Фатха — короткая диагональная черта над буквой. Например: بَ — «ба».", mode: "recall" },
      { prompt: "Как читается сочетание بَ?", options: [], correct: "ба", explanation: "Буква ба с фатхой читается «ба».", mode: "recall" },
      { prompt: "Где находится фатха?", options: [], correct: "Над буквой", explanation: "Фатха ставится над согласной буквой.", mode: "recall" },
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
      { prompt: "Как называется короткая черта под буквой?", options: [], correct: "Кясра", explanation: "Кясра — короткая черта под буквой. Она обозначает короткий звук «и».", mode: "recall" },
      { prompt: "Как читается сочетание بِ?", options: [], correct: "би", explanation: "Ба с кясрой читается «би».", mode: "recall" },
      { prompt: "Где ставится кясра?", options: [], correct: "Под буквой", explanation: "Кясра располагается под согласной буквой.", mode: "recall" },
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
      { prompt: "Как называется знак, похожий на маленькую запятую над буквой?", options: [], correct: "Дамма", explanation: "Дамма ставится над буквой и обозначает короткий звук «у».", mode: "recall" },
      { prompt: "Как читается сочетание بُ?", options: [], correct: "бу", explanation: "Ба с даммой читается «бу».", mode: "recall" },
      { prompt: "Какое соответствие верное?", options: [], correct: "Дамма — «у»", explanation: "Запомни: фатха — короткое «а», кясра — короткое «и», дамма — короткое «у».", mode: "recall" },
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


const recallAliases: Record<string, string[]> = {
  "ا": ["алиф", "alif"],
  "ب": ["ба", "ba"],
  "ت": ["та", "ta"],
  "ث": ["са", "tha", "thāʾ"],
  "ج": ["джим", "jim"],
  "ح": ["ха глубокая", "ha deep"],
  "خ": ["ха", "kha", "khāʾ"],
  "د": ["даль", "dal"],
  "ذ": ["dhāl", "dhal"],
  "ر": ["ра", "ra"],
  "ز": ["зай", "zay"],
  "س": ["син", "sin"],
  "ش": ["шин", "shin"],
  "ص": ["сад", "ṣād", "sad"],
  "ض": ["дад", "ḍād", "dad"],
  "ط": ["эмфатическая та"],
  "ظ": ["эмфатическая за", "emphatic za", "ẓāʾ"],
  "ع": ["айн", "ʿayn", "ayn"],
  "غ": ["гайн", "ghayn", "ghain"],
  "ف": ["фа", "fa"],
  "ق": ["къаф", "qāf", "qaf"],
  "ك": ["каф", "kaf"],
  "ل": ["лям", "lam"],
  "م": ["мим", "mim"],
  "ن": ["нун", "nun"],
  "ه": ["ha light", "лёгкая h"],
  "و": ["уау", "waw"],
  "ي": ["йа", "ya"],
};

function normalizeTypedAnswer(value: string): string {
  return value
    .toLocaleLowerCase("ru-RU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[ʼ’'ʾʿ]/g, "")
    .replace(/ё/g, "е")
    .replace(/[^a-zа-я0-9]/gi, "");
}

function isCorrectAnswer(question: Question, answer: string): boolean {
  if (question.mode !== "recall") return answer === question.correct;
  const normalized = normalizeTypedAnswer(answer);
  if (!normalized) return false;
  return (question.acceptedAnswers ?? [question.correct])
    .some((candidate) => normalizeTypedAnswer(candidate) === normalized);
}

function buildLetterRecallQuestion(letter: Lesson["letters"][number]): Question {
  const acceptedAnswers = recallAliases[letter.character] ?? [letter.name];
  return {
    prompt: "Как называется эта буква? Напиши название по памяти.",
    options: [],
    correct: acceptedAnswers[0],
    acceptedAnswers,
    mode: "recall",
    stimulus: letter.character,
    explanation: `Это ${letter.name} — ${letter.character}.${letter.note ? ` ${letter.note}` : ""}`,
  };
}

function buildLessonQuestions(lesson: Lesson): Question[] {
  if (lesson.id >= 6) return lesson.questions;
  const recall = lesson.letters.map(buildLetterRecallQuestion);
  const mixed: Question[] = [];
  const total = Math.max(lesson.questions.length, recall.length);
  for (let index = 0; index < total; index++) {
    if (lesson.questions[index]) mixed.push(lesson.questions[index]);
    if (recall[index]) mixed.push(recall[index]);
  }
  return mixed;
}

function buildExamRecallQuestions(): Question[] {
  return examQuestions.map((question) => {
    const acceptedAnswers = recallAliases[question.correct] ?? [question.correct];
    return {
      ...question,
      prompt: "Вспомни название буквы и напиши его без вариантов ответа.",
      options: [],
      correct: acceptedAnswers[0],
      acceptedAnswers,
      mode: "recall",
      stimulus: question.correct,
    };
  });
}

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
  errorCount: number;
  lastCorrect: boolean;
};

const REVIEW_DELAY_MINUTES = 10;

function updateReviewCard(
  previous: Mistake | undefined,
  input: Omit<Mistake, "dueAt" | "intervalDays" | "repetitions" | "easeFactor" | "errorCount" | "lastCorrect">,
  correct: boolean,
): Mistake {
  const repetitions = previous?.repetitions ?? 0;
  const easeFactor = previous?.easeFactor ?? 2.5;
  const leitnerIntervals = [1, 3, 7, 14, 30];
  const intervalDays = correct
    ? leitnerIntervals[Math.min(repetitions, leitnerIntervals.length - 1)]
    : 0;
  const dueAt = correct
    ? Date.now() + intervalDays * 24 * 60 * 60 * 1000
    : Date.now() + REVIEW_DELAY_MINUTES * 60 * 1000;

  return {
    ...input,
    dueAt,
    intervalDays,
    repetitions: correct ? repetitions + 1 : 0,
    easeFactor,
    errorCount: (previous?.errorCount ?? 0) + (correct ? 0 : 1),
    lastCorrect: correct,
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
      errorCount: Number.isInteger(item.errorCount) ? Math.max(0, item.errorCount) : (item.intervalDays === 0 ? 1 : 0),
      lastCorrect: typeof item.lastCorrect === "boolean" ? item.lastCorrect : item.intervalDays > 0,
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

type DailyActivity = { date: string; lessonIds: number[] };

function dailyActivityStorageKey(userId: string): string {
  return `alifly-daily-activity:${userId}`;
}

function dailyGoalStorageKey(userId: string): string {
  return `alifly-daily-goal:${userId}`;
}

function readDailyActivity(userId: string): DailyActivity {
  try {
    const saved = localStorage.getItem(dailyActivityStorageKey(userId));
    if (!saved) return { date: "", lessonIds: [] };
    const parsed: unknown = JSON.parse(saved);
    if (!parsed || typeof parsed !== "object") return { date: "", lessonIds: [] };

    const value = parsed as { date?: unknown; lessonIds?: unknown };
    if (typeof value.date !== "string" || !Array.isArray(value.lessonIds)) {
      return { date: "", lessonIds: [] };
    }

    const lessonIds = [...new Set(value.lessonIds.filter(
      (id): id is number => Number.isInteger(id) && id >= 1 && id <= 8,
    ))];
    return { date: value.date, lessonIds };
  } catch {
    return { date: "", lessonIds: [] };
  }
}

function readDailyGoal(userId: string): DailyGoal {
  try {
    const saved = Number(localStorage.getItem(dailyGoalStorageKey(userId)));
    return saved === 2 || saved === 3 ? saved : 1;
  } catch {
    return 1;
  }
}

export default function App() {
  const { user } = useAuth();
  const dailyUserId = user?.id ?? "guest";
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => readDailyGoal("guest"));
  const [dailyActivity, setDailyActivity] = useState<DailyActivity>(() => readDailyActivity("guest"));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "loading" | "pending" | "saving" | "saved" | "error">("idle");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonPhase, setLessonPhase] = useState<"study" | "practice">("study");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(readCompletedLessons);
  const [mistakes, setMistakes] = useState<Mistake[]>(readMistakes);
  const [streak, setStreak] = useState<number>(() => readNumber("alifly-streak"));
  const [lastStudyDate, setLastStudyDate] = useState<string>(readLastStudyDate);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewMistakeIds, setReviewMistakeIds] = useState<string[]>([]);
  const [examMode, setExamMode] = useState(false);
  const [examPassed, setExamPassed] = useState<boolean>(() => readBoolean("alifly-stage-1-exam-passed"));

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("alifly-theme") === "dark" ? "dark" : "light";
    } catch {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("alifly-theme", theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);

  useEffect(() => {
    setDailyGoal(readDailyGoal(dailyUserId));
    setDailyActivity(readDailyActivity(dailyUserId));
  }, [dailyUserId]);

  useEffect(() => {
    if (!selectedStage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedStage(null);
        setSelectedLesson(null);
        setQuestionIndex(0);
        setSelectedAnswer(null);
        setCorrectAnswers(0);
        setLessonFinished(false);
        setReviewMode(false);
        setReviewMistakeIds([]);
        setExamMode(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedStage]);

  useEffect(() => {
    try { localStorage.setItem("alifly-completed-lessons", JSON.stringify(completedLessonIds)); } catch { /* Storage may be unavailable. */ }
  }, [completedLessonIds]);

  useEffect(() => {
    try { localStorage.setItem("alifly-mistakes", JSON.stringify(mistakes)); } catch { /* Storage may be unavailable. */ }
  }, [mistakes]);

  useEffect(() => {
    try { localStorage.setItem("alifly-streak", String(streak)); } catch { /* Storage may be unavailable. */ }
  }, [streak]);

  useEffect(() => {
    try { localStorage.setItem("alifly-last-study-date", lastStudyDate); } catch { /* Storage may be unavailable. */ }
  }, [lastStudyDate]);

  useEffect(() => {
    try { localStorage.setItem("alifly-stage-1-exam-passed", String(examPassed)); } catch { /* Storage may be unavailable. */ }
  }, [examPassed]);

  // Load the signed-in learner's progress before allowing cloud writes.
  useEffect(() => {
    let cancelled = false;

    if (!user) {
      setCloudReady(false);
      setCloudSaveStatus("idle");
      return;
    }

    setCloudReady(false);
    setCloudSaveStatus("loading");

    const loadProgress = async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select("completed_lesson_ids, mistakes, streak, last_study_date, exam_passed")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      // Never overwrite cloud data with local defaults after a failed read.
      if (error) {
        console.error("ALIFLY: could not load cloud progress", error);
        setCloudSaveStatus("error");
        return;
      }

      let previousCloudUserId = "";
      try {
        previousCloudUserId = localStorage.getItem("alifly-last-cloud-user-id") || "";
      } catch {
        // Cloud data remains authoritative when local storage is unavailable.
      }

      if (data) {
        setCompletedLessonIds(Array.isArray(data.completed_lesson_ids) ? data.completed_lesson_ids : []);
        setMistakes(Array.isArray(data.mistakes) ? data.mistakes as Mistake[] : []);
        setStreak(Number.isFinite(data.streak) ? data.streak : 0);
        setLastStudyDate(data.last_study_date ?? "");
        setExamPassed(Boolean(data.exam_passed));
      } else if (previousCloudUserId && previousCloudUserId !== user.id) {
        // A different person signed in on this device. Do not copy the previous
        // person's local learning history into the new account.
        setCompletedLessonIds([]);
        setMistakes([]);
        setStreak(0);
        setLastStudyDate("");
        setExamPassed(false);
      }

      try {
        localStorage.setItem("alifly-last-cloud-user-id", user.id);
      } catch {
        // The authenticated cloud account still works without local storage.
      }

      setCloudSaveStatus(data ? "saved" : "pending");
      setCloudReady(true);
    };

    void loadProgress();
    return () => { cancelled = true; };
  }, [user?.id]);

  // Debounce writes and expose whether cloud sync actually succeeded.
  useEffect(() => {
    if (!user || !cloudReady) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setCloudSaveStatus("saving");
      const { error } = await supabase.from("user_progress").upsert({
        user_id: user.id,
        completed_lesson_ids: completedLessonIds,
        mistakes,
        streak,
        last_study_date: lastStudyDate || null,
        exam_passed: examPassed,
        updated_at: new Date().toISOString(),
      });

      if (cancelled) return;
      if (error) {
        console.error("ALIFLY: could not save cloud progress", error);
        setCloudSaveStatus("error");
      } else {
        setCloudSaveStatus("saved");
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [user?.id, cloudReady, completedLessonIds, mistakes, streak, lastStudyDate, examPassed]);


  const updateDailyGoal = (goal: DailyGoal) => {
    setDailyGoal(goal);
    try {
      localStorage.setItem(dailyGoalStorageKey(dailyUserId), String(goal));
    } catch {
      // The daily goal remains available for this session if storage is blocked.
    }
  };

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
    setSelectedLesson({ ...lesson, questions: buildLessonQuestions(lesson) });
    setLessonPhase("study");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
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
      : `${selectedLesson.id}:${question.prompt}${question.stimulus ? `:${question.stimulus}` : ""}`;
    const isCorrect = isCorrectAnswer(question, answer);

    if (isCorrect) {
      setCorrectAnswers((count) => count + 1);
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
        }
      } else if (!reviewMode) {
        setCompletedLessonIds((current) => current.includes(selectedLesson.id) ? current : [...current, selectedLesson.id]);
        if (!examMode) {
          const today = localDateKey();
          const existingIds = dailyActivity.date === today ? dailyActivity.lessonIds : [];
          const next: DailyActivity = {
            date: today,
            lessonIds: [...new Set([...existingIds, selectedLesson.id])],
          };
          setDailyActivity(next);
          try {
            localStorage.setItem(dailyActivityStorageKey(dailyUserId), JSON.stringify(next));
          } catch {
            // Daily progress remains available for this session if storage is blocked.
          }
        }
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
    setTypedAnswer("");
  };

  const startExam = () => {
    if (firstStageCompletedCount < lessons.length) return;
    setSelectedStage(stages[0]);
    setSelectedLesson({
      id: 99,
      title: "Итоговый экзамен",
      goal: "Проверь, насколько хорошо ты запомнил буквы первого этапа.",
      letters: [],
      questions: buildExamRecallQuestions(),
    });
    setLessonPhase("practice");
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(true);
  };

  const dueMistakes = mistakes.filter((item) => item.dueAt <= Date.now());
  const weakMistakes = mistakes.filter((item) => item.errorCount > 0);

  const startWeakReview = () => {
    const weak = [...mistakes]
      .filter((item) => item.errorCount > 0)
      .sort((a, b) => b.errorCount - a.errorCount);
    if (weak.length === 0) return;
    setSelectedStage(stages[0]);
    setSelectedLesson({
      id: 0,
      title: "Слабые слова",
      goal: "Здесь собраны буквы и задания, в которых раньше были ошибки. Попробуй ответить самостоятельно.",
      letters: [],
      questions: weak.map((item) => item.question),
    });
    setLessonPhase("practice");
    setReviewMistakeIds(weak.map((item) => item.id));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(true);
    setExamMode(false);
  };

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
    setLessonPhase("practice");
    setReviewMistakeIds(due.map((item) => item.id));
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(true);
  };

  const currentQuestion = selectedLesson?.questions[questionIndex];
  const currentQuestionCorrect = currentQuestion && selectedAnswer !== null
    ? isCorrectAnswer(currentQuestion, selectedAnswer)
    : false;
  const firstStageCompletedCount = completedLessonIds.filter((id) => id >= 1 && id <= 5).length;
  const progressPercent = Math.round((firstStageCompletedCount / lessons.length) * 100);
  const today = localDateKey();
  const dailyCompletedCount = dailyActivity.date === today ? dailyActivity.lessonIds.length : 0;
  const stageTwoUnlocked = examPassed;

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href="#" aria-label="ALIFLY — главная">
          <span className="logo-mark">ا</span>
          <span>ALIFLY</span>
        </a>
        <div className="topbar-right">
          <span className="streak" aria-label="Серия занятий">🔥 {streak}</span>
          <AuthPanel cloudStatus={cloudSaveStatus} />
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => current === "dark" ? "light" : "dark")}
            aria-label={theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему"}
            title={theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            aria-pressed={theme === "dark"}
          >
            <span aria-hidden="true">{theme === "dark" ? "☀" : "☾"}</span>
            <span className="theme-toggle-label">{theme === "dark" ? "Светлая" : "Тёмная"}</span>
          </button>
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

      <DailyQuest
        goal={dailyGoal}
        completedCount={dailyCompletedCount}
        onGoalChange={updateDailyGoal}
      />

      <ReadingTrainer />

      <section className="progress-section">
        <div>
          <span className="section-label">ТВОЙ ПРОГРЕСС</span>
          <h2>Каждый шаг важен</h2>
        </div>
        <div className="progress-card">
          <div className="progress-info"><span>{firstStageCompletedCount} из 5 бесплатных уроков</span><strong>{progressPercent}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
          <p>{firstStageCompletedCount === 5 ? "Все пять первых уроков завершены. Отличная работа!" : "Пройди уроки по порядку и возвращайся к ним для повторения."}</p>
          <div className="memory-actions">
            {dueMistakes.length > 0 && (
              <button className="review-button" type="button" onClick={startReview}>
                Повторить по расписанию · {dueMistakes.length}
              </button>
            )}
            {weakMistakes.length > 0 && (
              <button className="review-button weak-words-button" type="button" onClick={startWeakReview}>
                Слабые слова · {weakMistakes.length}
              </button>
            )}
            {dueMistakes.length === 0 && mistakes.length > 0 && (
              <p className="memory-next-review">Следующее повторение запланировано автоматически.</p>
            )}
          </div>
        </div>
      </section>

      <section className="learning-section" id="learning-path">
        <div className="section-heading">
          <div><span className="section-label">ПРОГРАММА ОБУЧЕНИЯ</span><h2>Твой путь</h2></div>
          <span className="stage-count">2 этапа</span>
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
                  <span className="lesson-count">{stage.id === 1 ? `${firstStageCompletedCount}/5 бесплатных уроков` : stage.id === 2 && unlocked ? "Открыт после экзамена" : `${stage.lessons} уроков`}</span>
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
                    <p className="local-progress-note">Прогресс сохраняется на устройстве, а после входа — в твоём аккаунте.</p>
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
                          <span className="lesson-pick-text"><strong>{lesson.title}</strong><small>{lesson.letters.length} букв · {buildLessonQuestions(lesson).length} заданий</small></span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <button className={`exam-pick ${examPassed ? "exam-pick-passed" : ""}`} type="button" onClick={startExam} disabled={firstStageCompletedCount < lessons.length}>
                      <span className="exam-pick-mark">{examPassed ? "✓" : "10"}</span>
                      <span className="lesson-pick-text"><strong>Итоговый экзамен</strong><small>{examPassed ? "Экзамен успешно сдан" : "10 вопросов · нужно 8 правильных"}</small></span>
                      <span className="lesson-pick-state">{examPassed ? "Пройден" : firstStageCompletedCount === lessons.length ? "Начать →" : "Сначала 5 уроков"}</span>
                    </button>
                    <p className="local-progress-note">Прогресс сохраняется на устройстве, а после входа — в твоём аккаунте.</p>
                  </div>
                ) : (
                  <p className="locked-message">🔒 Этот этап пока закрыт. Сначала пройди предыдущие уроки.</p>
                )}
              </>
            ) : lessonPhase === "study" && !examMode && !reviewMode ? (
              <div className="lesson-study">
                <div className="lesson-topline">
                  <span className="section-label">СНАЧАЛА ИЗУЧИ</span>
                  <span className="lesson-step">{selectedLesson.letters.length} элементов</span>
                </div>
                <h2 id="stage-modal-title">{selectedLesson.title}</h2>
                <p className="lesson-intro">{selectedLesson.goal}</p>
                <p className="study-guidance">Изучи буквы и их особенности. Перед проверкой карточки исчезнут — придётся вспоминать самостоятельно.</p>
                <div className="letter-intro lesson-letters">
                  {selectedLesson.letters.map((letter) => (
                    <div key={letter.character}>
                      <strong lang="ar" dir="rtl">{letter.character}</strong>
                      <span>{letter.name}</span>
                      {letter.note && <small>{letter.note}</small>}
                    </div>
                  ))}
                </div>
                <button className="primary-button modal-button study-start" type="button" onClick={() => setLessonPhase("practice")}>
                  Начать вспоминание →
                </button>
              </div>
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
                  <span className="section-label">{examMode ? "ЭКЗАМЕН · ЭТАП 1" : reviewMode ? "ПОВТОРЕНИЕ · АКТИВНОЕ ВСПОМИНАНИЕ" : `УРОК ${selectedLesson.id} · ПРАКТИКА`}</span>
                  <span className="lesson-step">{questionIndex + 1} из {selectedLesson.questions.length}</span>
                </div>
                <div className="lesson-progress"><span style={{ width: `${((questionIndex + (selectedAnswer ? 1 : 0)) / selectedLesson.questions.length) * 100}%` }} /></div>
                <h2 id="stage-modal-title">{selectedLesson.title}</h2>
                <p className="lesson-intro">{selectedLesson.goal}</p>
                <div className="question-block">
                  <span className="question-label">ПРОВЕРЬ СЕБЯ</span>
                  <h3>{currentQuestion.prompt}</h3>
                  {currentQuestion.mode === "recall" ? (
                    <>
                      {currentQuestion.stimulus && (
                        <div className="recall-stimulus" lang="ar" dir="rtl">{currentQuestion.stimulus}</div>
                      )}
                      <form className="recall-form" onSubmit={(event) => { event.preventDefault(); if (typedAnswer.trim()) answerQuestion(typedAnswer.trim()); }}>
                        <label className="recall-label" htmlFor="recall-answer">Твой ответ по памяти</label>
                        <input
                          id="recall-answer"
                          className="recall-input"
                          type="text"
                          value={typedAnswer}
                          onChange={(event) => setTypedAnswer(event.target.value)}
                          placeholder="Введи ответ..."
                          autoComplete="off"
                          autoCapitalize="none"
                          spellCheck={false}
                          disabled={selectedAnswer !== null}
                        />
                        {selectedAnswer === null && (
                          <button className="primary-button modal-button" type="submit" disabled={!typedAnswer.trim()}>
                            Проверить ответ
                          </button>
                        )}
                      </form>
                    </>
                  ) : (
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
                  )}
                  {selectedAnswer !== null && (
                    <div className={`answer-feedback ${currentQuestionCorrect ? "feedback-correct" : "feedback-wrong"}`} aria-live="polite">
                      <strong>{currentQuestionCorrect ? "Правильно!" : "Правильный ответ"}</strong>
                      <span>{currentQuestionCorrect ? currentQuestion.explanation : `${currentQuestion.correct}. ${currentQuestion.explanation}`}</span>
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
