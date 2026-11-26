import { useEffect, useRef, useState } from "react";
import LetterMakhrajDiagram from "./components/LetterMakhrajDiagram";
import { useLocation, useNavigate } from "react-router-dom";
import DailyQuest, { type DailyGoal } from "./DailyQuest";
import AuthPanel from "./auth/AuthPanel";
import LevelPlacement, { isLearningLevel, type LearningLevel } from "./LevelPlacement";
import WordGame, { type Word } from "./WordGame";
import { useAuth } from "./auth/AuthContext";
import ArabicLetterNames from "./data/arabic-letter-names.json";
import { fullAlphabetAudioUrl } from "./data/arabic-audio-sources";
import { auth, db } from "./lib/firebase";
import { addDoc, collection, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { appendReviewResult, createMemoryItem, getDueMemoryItems, reviewMemoryItem } from "./memory/engine";
import { loadMemoryState, saveMemoryState } from "./memory/storage";
import { createLessonMemoryIdentity } from "./memory/lessonAdapter";
import { getMemoryInsights, memorySkillLabel } from "./memory/analytics";
import { EMPTY_MEMORY_STATE, type MemoryErrorType, type MemoryGrade, type MemoryState } from "./memory/types";

const arabicLetterNames = Object.fromEntries(
  ArabicLetterNames.map(({ character, name }) => [character, name]),
) as Record<string, string>;

const arabicLetterAudio = Object.fromEntries(
  ArabicLetterNames.map(({ character, slug }) => [
    character,
    `${import.meta.env.BASE_URL}audio/letters/${slug}.wav`,
  ]),
) as Record<string, string>;

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
  stimulusLang?: "ar" | "ru";
  stimulusDir?: "rtl" | "ltr";
  acceptedAnswers?: string[];
};

type StudyCard = {
  arabic: string;
  transliteration: string;
  translation: string;
  note?: string;
};

type Lesson = {
  id: number;
  title: string;
  goal: string;
  letters: { character: string; name: string; note?: string }[];
  studyCards?: StudyCard[];
  questions: Question[];
};

const stages: Stage[] = [
  { id: 1, title: "Арабский алфавит", description: "Знакомство с 28 буквами и их звучанием", icon: "ا", lessons: 9, status: "available" },
  { id: 2, title: "Огласовки", description: "Фатха, кясра и дамма — три основные огласовки", icon: "َ", lessons: 3, status: "locked" },
  { id: 3, title: "Читаем первые слова", description: "Короткие слова с огласовками и чтение без подсказок", icon: "ك", lessons: 3, status: "locked" },
  { id: 4, title: "Первые диалоги", description: "Приветствия и простые разговоры на современном литературном арабском", icon: "م", lessons: 5, status: "locked" },
];

const legacyLessons: Lesson[] = [
  {
    id: 1,
    title: "Первые четыре буквы",
    goal: "Научись узнавать алиф, ба, та и са.",
    letters: [
      { character: "ا", name: "алиф", note: "Прямая вертикальная форма." },
      { character: "ب", name: "ба", note: "Одна точка снизу." },
      { character: "ت", name: "та", note: "Две точки сверху." },
      { character: "ث", name: "са (межзубная)", note: "Три точки сверху. Кончик языка слегка располагается между верхними и нижними зубами; звук произносится без голоса. Это не обычное русское «с»." },
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
      { character: "ح", name: "ха (глубокая)", note: "Без точек. Глухой глоточный звук; обычная русская «х» не передаёт его точно." },
      { character: "خ", name: "ха (с трением)", note: "Одна точка сверху. Шумный звук, похожий на русское «х»." },
      { character: "د", name: "даль", note: "Без точек." },
      { character: "ذ", name: "заль (межзубная)", note: "Одна точка сверху. Кончик языка слегка выходит между зубами; звук произносится с голосом." },
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
      { character: "ظ", name: "за (твёрдая межзубная)", note: "Одна точка сверху. В литературном арабском это звонкий межзубный эмфатический звук; русская «з» — лишь приблизительная подсказка." },
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
      { character: "ق", name: "къаф", note: "Глубокий заднеязычный звук; не обычное русское «к»." },
      { character: "ك", name: "каф" },
      { character: "ل", name: "лям" },
      { character: "م", name: "мим" },
      { character: "ن", name: "нун" },
      { character: "ه", name: "ха (лёгкая)", note: "Лёгкий выдох, не путай с ح и خ." },
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

function makeMicroLesson(
  sourceIndex: number,
  id: number,
  title: string,
  goal: string,
  letterIndexes: number[],
  questionIndexes: number[],
): Lesson {
  const source = legacyLessons[sourceIndex];
  return {
    id,
    title,
    goal,
    letters: letterIndexes.map((index) => source.letters[index]),
    questions: questionIndexes.map((index) => source.questions[index]).filter(Boolean),
  };
}

// Nine short lessons of 2–4 letters. Existing Arabic letter notes are reused unchanged.
const lessons: Lesson[] = [
  { ...legacyLessons[0], id: 20, title: "Алиф, ба, та и са", goal: "Научись узнавать и самостоятельно вспоминать алиф, ба, та и са." },
  makeMicroLesson(1, 21, "Джим, ха и ха", "Различай три похожие по основе буквы и обращай внимание на точки.", [0, 1, 2], [0, 1]),
  makeMicroLesson(1, 22, "Даль и заль", "Запомни пару букв, которые отличаются точкой сверху.", [3, 4], [2]),
  { ...legacyLessons[2], id: 23, title: "Ра, зай, син и шин" },
  makeMicroLesson(3, 24, "Сад, дад и эмфатическая та", "Познакомься с тремя эмфатическими согласными и их особенностями.", [0, 1, 2], []),
  makeMicroLesson(3, 25, "За, айн и гайн", "Различай три буквы с особыми артикуляционными особенностями.", [3, 4, 5], [0, 1, 2]),
  makeMicroLesson(4, 26, "Фа, къаф и каф", "Сравни три буквы и запомни их характерные формы.", [0, 1, 2], [0]),
  makeMicroLesson(4, 27, "Лям, мим и нун", "Закрепи три новые буквы и их отличительные формы.", [3, 4, 5], [1]),
  makeMicroLesson(4, 28, "Ха, уау и йа", "Заверши знакомство с алфавитом: изучи последние три буквы.", [6, 7, 8], [2]),
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


type VocabularyCard = StudyCard & {
  acceptedTransliterations: string[];
};

function makeVocabularyLesson(
  id: number,
  title: string,
  goal: string,
  cards: VocabularyCard[],
): Lesson {
  const questions: Question[] = cards.flatMap((card) => [
    {
      prompt: "Прочитай слово и введи его звучание.",
      options: [],
      correct: card.transliteration,
      acceptedAnswers: card.acceptedTransliterations,
      mode: "recall" as const,
      stimulus: card.arabic,
      stimulusLang: "ar",
      stimulusDir: "rtl",
      explanation: card.arabic + " — " + card.transliteration + ".",
    },
    {
      prompt: "Что означает это слово?",
      options: cards.map((item) => item.translation),
      correct: card.translation,
      mode: "choice" as const,
      stimulus: card.arabic,
      stimulusLang: "ar",
      stimulusDir: "rtl",
      explanation: card.arabic + " — «" + card.translation + "».",
    },
  ]);

  return { id, title, goal, letters: [], studyCards: cards, questions };
}

const stageThreeLessons: Lesson[] = [
  makeVocabularyLesson(
    35,
    "Книга и ручка",
    "Прочитай два простых существительных. Обрати внимание на долгий гласный в слове كِتَاب.",
    [
      {
        arabic: "كِتَاب",
        transliteration: "китааб",
        translation: "книга",
        note: "Алиф после ت передаёт долгий звук «а».",
        acceptedTransliterations: ["kitāb", "kitab", "китаб"],
      },
      {
        arabic: "قَلَم",
        transliteration: "къалам",
        translation: "ручка",
        note: "Буква ق произносится глубже, чем ك.",
        acceptedTransliterations: ["qalam", "калам", "къалам"],
      },
    ],
  ),
  makeVocabularyLesson(
    36,
    "Дом и дверь",
    "Прочитай ещё два коротких слова и сравни долгие гласные и сочетания букв.",
    [
      {
        arabic: "بَاب",
        transliteration: "бааб",
        translation: "дверь",
        note: "Алиф после ب обозначает долгий звук «а».",
        acceptedTransliterations: ["bāb", "bab", "баб"],
      },
      {
        arabic: "بَيْت",
        transliteration: "байт",
        translation: "дом",
        note: "Сочетание بَيْ читается как «бай».",
        acceptedTransliterations: ["bayt", "бейт"],
      },
    ],
  ),
  makeVocabularyLesson(
    37,
    "Повторение первых слов",
    "Повтори четыре знакомых слова: сначала вспомни их чтение, затем значение.",
    [
      {
        arabic: "كِتَاب",
        transliteration: "китааб",
        translation: "книга",
        acceptedTransliterations: ["kitāb", "kitab", "китаб"],
      },
      {
        arabic: "قَلَم",
        transliteration: "къалам",
        translation: "ручка",
        acceptedTransliterations: ["qalam", "калам", "къалам"],
      },
      {
        arabic: "بَاب",
        transliteration: "бааб",
        translation: "дверь",
        acceptedTransliterations: ["bāb", "bab", "баб"],
      },
      {
        arabic: "بَيْت",
        transliteration: "байт",
        translation: "дом",
        acceptedTransliterations: ["bayt", "бейт"],
      },
    ],
  ),
];

type IntroCard = StudyCard & {
  acceptedTransliterations: string[];
  acceptedTranslations?: string[];
  recallCue?: string;
};

function makeIntroductionLesson(
  id: number,
  title: string,
  goal: string,
  cards: IntroCard[],
): Lesson {
  const questions: Question[] = cards.flatMap((card) => [
    {
      prompt: "Переведи фразу на русский. Ответ введи самостоятельно.",
      options: [],
      correct: card.translation,
      acceptedAnswers: card.acceptedTranslations ?? [card.translation],
      mode: "recall",
      stimulus: card.arabic,
      stimulusLang: "ar",
      stimulusDir: "rtl",
      explanation: `Это значит: «${card.translation}». Произношение: ${card.transliteration}.`,
    },
    {
      prompt: "Как сказать это по-арабски? Введи звучание по памяти.",
      options: [],
      correct: card.transliteration,
      acceptedAnswers: card.acceptedTransliterations,
      mode: "recall",
      stimulus: card.recallCue ?? card.translation,
      stimulusLang: "ru",
      stimulusDir: "ltr",
      explanation: `${card.arabic} — ${card.transliteration}.`,
    },
  ]);
  return {
    id,
    title,
    goal,
    letters: [],
    studyCards: cards,
    questions,
  };
}

const stageFourLessons: Lesson[] = [
  makeIntroductionLesson(
    30,
    "Приветствие и ответ",
    "Научись начинать разговор и отвечать на приветствие. Сначала пойми пару, затем вспоминай её без подсказки.",
    [
      {
        arabic: "السَّلَامُ عَلَيْكُمْ",
        transliteration: "ас-саляму алейкум",
        translation: "Мир вам",
        acceptedTransliterations: ["as-salamu alaykum", "assalamu alaykum", "ас-саляму алейкум", "ассаляму алейкум"],
        acceptedTranslations: ["мир вам", "мир вам всем"],
      },
      {
        arabic: "وَعَلَيْكُمُ السَّلَامُ",
        transliteration: "уа алейкуму-с-салям",
        translation: "И вам мир",
        acceptedTransliterations: ["wa alaykumu s-salam", "waalaykumu salam", "уа алейкуму салям", "уа алейкуму ссалям"],
        acceptedTranslations: ["и вам мир", "и вам мир тоже"],
      },
      {
        arabic: "مَرْحَبًا",
        transliteration: "мархабан",
        translation: "Здравствуйте",
        acceptedTransliterations: ["marhaban", "мархабан"],
        acceptedTranslations: ["здравствуйте", "привет", "добро пожаловать"],
      },
      {
        arabic: "أَهْلًا وَسَهْلًا",
        transliteration: "ахлян уа сахлян",
        translation: "Добро пожаловать",
        acceptedTransliterations: ["ahlan wa sahlan", "ахлан уа сахлан", "ахлан васахлан"],
        acceptedTranslations: ["добро пожаловать", "добро пожаловать к нам"],
      },
    ],
  ),
  makeIntroductionLesson(
    31,
    "Как тебя зовут?",
    "Спроси имя собеседника, ответь о себе и обрати внимание на форму обращения к мужчине и женщине.",
    [
      {
        arabic: "مَا اسْمُكَ؟",
        transliteration: "маа исмука?",
        translation: "Как тебя зовут?",
        note: "Форма обращения к мужчине.",
        recallCue: "Как тебя зовут? (обращение к мужчине)",
        acceptedTransliterations: ["ma ismuka", "maa ismuka", "ма исмука"],
        acceptedTranslations: ["как тебя зовут", "какое у тебя имя", "как вас зовут"],
      },
      {
        arabic: "مَا اسْمُكِ؟",
        transliteration: "маа исмуки?",
        translation: "Как тебя зовут?",
        note: "Форма обращения к женщине.",
        recallCue: "Как тебя зовут? (обращение к женщине)",
        acceptedTransliterations: ["ma ismuki", "maa ismuki", "ма исмуки"],
        acceptedTranslations: ["как тебя зовут", "какое у тебя имя", "как вас зовут"],
      },
      {
        arabic: "اسْمِي ...",
        transliteration: "исми ...",
        translation: "Меня зовут…",
        acceptedTransliterations: ["ismi", "исми"],
        acceptedTranslations: ["меня зовут", "мое имя"],
      },
      {
        arabic: "تَشَرَّفْنَا",
        transliteration: "ташаррафна",
        translation: "Рад(а) знакомству",
        acceptedTransliterations: ["tasharrafna", "ташаррафна"],
        acceptedTranslations: ["рад знакомству", "рада знакомству", "приятно познакомиться", "рад а знакомству"],
      },
    ],
  ),
  makeIntroductionLesson(
    32,
    "Откуда ты?",
    "Спроси, откуда человек, ответь о себе и различай формы обращения к мужчине и женщине.",
    [
      {
        arabic: "مِنْ أَيْنَ أَنْتَ؟",
        transliteration: "мин айна анта?",
        translation: "Откуда ты?",
        note: "Форма обращения к мужчине.",
        recallCue: "Откуда ты? (обращение к мужчине)",
        acceptedTransliterations: ["min ayna anta", "min aina anta", "мин айна анта"],
        acceptedTranslations: ["откуда ты", "откуда вы"],
      },
      {
        arabic: "مِنْ أَيْنَ أَنْتِ؟",
        transliteration: "мин айна анти?",
        translation: "Откуда ты?",
        note: "Форма обращения к женщине.",
        recallCue: "Откуда ты? (обращение к женщине)",
        acceptedTransliterations: ["min ayna anti", "min aina anti", "мин айна анти"],
        acceptedTranslations: ["откуда ты", "откуда вы"],
      },
      {
        arabic: "أَنَا مِنْ ...",
        transliteration: "ана мин ...",
        translation: "Я из…",
        acceptedTransliterations: ["ana min", "anaa min", "ана мин"],
        acceptedTranslations: ["я из", "я родом из"],
      },
      {
        arabic: "أَنَا مِنْ رُوسِيَا",
        transliteration: "ана мин русийа",
        translation: "Я из России",
        acceptedTransliterations: ["ana min rusiya", "anaa min rusiya", "ана мин русия"],
        acceptedTranslations: ["я из россии", "я родом из россии"],
      },
    ],
  ),
  makeIntroductionLesson(
    33,
    "Как дела?",
    "Спроси, как дела, ответь вежливо и верни вопрос собеседнику.",
    [
      {
        arabic: "كَيْفَ حَالُكَ؟",
        transliteration: "кайфа хаалюка?",
        translation: "Как ты?",
        note: "Форма обращения к мужчине.",
        recallCue: "Как ты? (обращение к мужчине)",
        acceptedTransliterations: ["kayfa haluka", "kayfa haaluka", "кайфа халука"],
        acceptedTranslations: ["как ты", "как дела", "как поживаешь"],
      },
      {
        arabic: "كَيْفَ حَالُكِ؟",
        transliteration: "кайфа хаалюки?",
        translation: "Как ты?",
        note: "Форма обращения к женщине.",
        recallCue: "Как ты? (обращение к женщине)",
        acceptedTransliterations: ["kayfa haluki", "kayfa haaluki", "кайфа халики"],
        acceptedTranslations: ["как ты", "как дела", "как поживаешь"],
      },
      {
        arabic: "أَنَا بِخَيْرٍ، شُكْرًا",
        transliteration: "ана бихайр, шукраан",
        translation: "У меня всё хорошо, спасибо",
        acceptedTransliterations: ["ana bikhayr shukran", "anaa bikhair shukran", "ана бихайр шукран"],
        acceptedTranslations: ["у меня все хорошо спасибо", "я в порядке спасибо", "все хорошо спасибо"],
      },
      {
        arabic: "وَأَنْتَ؟",
        transliteration: "уа анта?",
        translation: "А ты?",
        note: "При обращении к женщине: وَأَنْتِ؟ (wa anti?).",
        recallCue: "А ты? (обращение к мужчине)",
        acceptedTransliterations: ["wa anta", "уа анта"],
        acceptedTranslations: ["а ты", "а вы", "а у тебя"],
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "аль-хамду ли-Ллях",
        translation: "Хвала Аллаху",
        acceptedTransliterations: ["alhamdu lillah", "al hamdu lillah", "альхамду лиллях", "альхамдулиллях"],
        acceptedTranslations: ["хвала аллаху", "слава аллаху", "вся хвала аллаху"],
      },
    ],
  ),
  makeIntroductionLesson(
    34,
    "Знакомство — полный диалог",
    "Собери знакомство от приветствия до вопроса о самочувствии. Это итоговая практика знакомых выражений в контексте.",
    [
      {
        arabic: "السَّلَامُ عَلَيْكُمْ\nوَعَلَيْكُمُ السَّلَامُ",
        transliteration: "ас-саляму алейкум\nуа алейкуму-с-салям",
        translation: "— Мир вам. — И вам мир.",
        acceptedTransliterations: ["as salamu alaykum wa alaykumu salam", "as-salamu alaykum wa alaykumu s-salam", "ассаляму алейкум уа алейкуму салям"],
        acceptedTranslations: ["мир вам и вам мир", "мир вам и вам мир тоже"],
      },
      {
        arabic: "مَا اسْمُكِ؟\nاسْمِي سَارَةُ",
        transliteration: "маа исмуки? исми Саара",
        translation: "— Как тебя зовут? — Меня зовут Сара.",
        note: "Вопрос обращён к женщине.",
        recallCue: "Диалог: спроси у женщины имя и представься Сарой.",
        acceptedTransliterations: ["ma ismuki ismi sara", "maa ismuki ismi sara", "ма исмуки исми сара"],
        acceptedTranslations: ["как тебя зовут меня зовут сара", "меня зовут сара"],
      },
      {
        arabic: "مِنْ أَيْنَ أَنْتِ؟\nأَنَا مِنْ رُوسِيَا",
        transliteration: "мин айна анти? ана мин русийа",
        translation: "— Откуда ты? — Я из России.",
        note: "Форма обращения к женщине.",
        recallCue: "Диалог: спроси женщину, откуда она, и ответь, что ты из России.",
        acceptedTransliterations: ["min ayna anti ana min rusiya", "мин айна анти ана мин русия"],
        acceptedTranslations: ["откуда ты я из россии", "я из россии"],
      },
      {
        arabic: "كَيْفَ حَالُكِ؟\nأَنَا بِخَيْرٍ، شُكْرًا",
        transliteration: "кайфа хаалюки? ана бихайр, шукраан",
        translation: "— Как дела? — Хорошо, спасибо.",
        note: "Форма обращения к женщине.",
        recallCue: "Диалог: спроси женщину, как у неё дела, и ответь, что у тебя всё хорошо.",
        acceptedTransliterations: ["kayfa haluki ana bikhayr shukran", "кайфа халики ана бихайр шукран"],
        acceptedTranslations: ["как дела хорошо спасибо", "у меня все хорошо спасибо"],
      },
      {
        arabic: "تَشَرَّفْنَا",
        transliteration: "ташаррафна",
        translation: "Рад(а) знакомству",
        acceptedTransliterations: ["tasharrafna", "ташаррафна"],
        acceptedTranslations: ["рад знакомству", "рада знакомству", "приятно познакомиться"],
      },
    ],
  ),
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

function buildLetterRecallQuestions(letter: Lesson["letters"][number]): Question[] {
  const acceptedNames = recallAliases[letter.character] ?? [letter.name];
  return [{
    prompt: "Как называется эта буква?",
    options: [],
    correct: acceptedNames[0],
    acceptedAnswers: acceptedNames,
    mode: "recall",
    stimulus: letter.character,
    explanation: `Это буква ${letter.name} — ${letter.character}.${letter.note ? ` ${letter.note}` : ""}`,
  }];
}

function shuffleItems<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

function shuffleQuestions(questions: Question[]): Question[] {
  return shuffleItems(questions);
}

function buildVowelPracticeQuestions(lesson: Lesson): Question[] {
  const letterQuestions = lesson.letters.map((letter) => ({
    prompt: "Посмотри на сочетание и введи его звучание.",
    options: [],
    correct: letter.name,
    acceptedAnswers: [letter.name],
    mode: "recall" as const,
    stimulus: letter.character,
    explanation: `${letter.character} читается «${letter.name}». ${letter.note ?? ""}`.trim(),
  }));

  const syllableSets: Record<number, { text: string; answer: string; explanation: string }[]> = {
    6: [
      { text: "بَتَ", answer: "бата", explanation: "Справа налево: بَ — «ба», затем تَ — «та». Это учебная цепочка слогов, не слово." },
      { text: "مَنَ", answer: "мана", explanation: "Справа налево: مَ — «ма», затем نَ — «на». Это учебная цепочка слогов, не слово." },
    ],
    7: [
      { text: "بِتِ", answer: "бити", explanation: "Справа налево: بِ — «би», затем تِ — «ти». Это учебная цепочка слогов, не слово." },
      { text: "مِتِ", answer: "мити", explanation: "Справа налево: مِ — «ми», затем تِ — «ти». Это учебная цепочка слогов, не слово." },
    ],
    8: [
      { text: "بُتُ", answer: "буту", explanation: "Справа налево: بُ — «бу», затем تُ — «ту». Это учебная цепочка слогов, не слово." },
      { text: "مُتُ", answer: "муту", explanation: "Справа налево: مُ — «му», затем تُ — «ту». Это учебная цепочка слогов, не слово." },
    ],
  };

  const sequenceQuestions = (syllableSets[lesson.id] ?? []).map((item) => ({
    prompt: "Прочитай всю цепочку справа налево и введи звучание.",
    options: [],
    correct: item.answer,
    acceptedAnswers: [item.answer],
    mode: "recall" as const,
    stimulus: item.text,
    explanation: item.explanation,
  }));

  return shuffleQuestions([...lesson.questions, ...letterQuestions, ...sequenceQuestions]);
}

function buildLessonQuestions(lesson: Lesson): Question[] {
  if (lesson.id >= 30) return shuffleQuestions(lesson.questions);
  if (lesson.id >= 6 && lesson.id <= 8) return buildVowelPracticeQuestions(lesson);

  const allLetters = lessons.flatMap((item) => item.letters);
  const questions = lesson.letters.flatMap((letter) => {
    const distractors = shuffleItems(
      allLetters
        .filter((item) => item.character !== letter.character)
        .map((item) => item.character),
    ).slice(0, 3);

    const recognition: Question = {
      prompt: `Найди букву «${letter.name.split(" (")[0]}».`,
      options: shuffleItems([letter.character, ...distractors]),
      correct: letter.character,
      mode: "choice",
      explanation: `Это буква «${letter.name}» — ${letter.character}.${letter.note ? ` ${letter.note}` : ""}`,
    };
    return [recognition, ...buildLetterRecallQuestions(letter)];
  });

  return shuffleQuestions(questions);
}

function buildExamRecallQuestions(): Question[] {
  const allLetters = lessons.flatMap((lesson) => lesson.letters);
  const sampledQuestions = shuffleQuestions(allLetters.flatMap((letter) => buildLetterRecallQuestions(letter).slice(0, 1))).slice(0, 10);
  return sampledQuestions.map((question) => ({
    ...question,
    prompt: "Вспомни название буквы и напиши его без вариантов ответа.",
  }));
}


const legacyAlphabetProgress: Record<number, number[]> = {
  1: [20],
  2: [21, 22],
  3: [23],
  4: [24, 25],
  5: [26, 27, 28],
};

function normalizeCompletedLessonIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((id): id is number => Number.isInteger(id));
  const alreadyMigrated = ids.some((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 37));
  const normalized = alreadyMigrated
    ? ids.filter((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 37) || (id >= 6 && id <= 8))
    : ids.flatMap((id) => legacyAlphabetProgress[id] ?? ((id >= 6 && id <= 8) ? [id] : []));
  return [...new Set(normalized)];
}

function normalizeDailyLessonIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((id): id is number => Number.isInteger(id));
  const alreadyMigrated = ids.some((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 37));
  const normalized = alreadyMigrated
    ? ids.filter((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 37) || (id >= 6 && id <= 8))
    : ids.flatMap((id) => legacyAlphabetProgress[id] ?? ((id >= 6 && id <= 8) ? [id] : []));
  return [...new Set(normalized)];
}

function readCompletedLessons(): number[] {
  try {
    const saved = localStorage.getItem("alifly-completed-lessons");
    if (!saved) return [];
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) return [];
    return normalizeCompletedLessonIds(parsed);
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

function startingLevelStorageKey(userId: string): string {
  return "alifly-starting-level:" + userId;
}

function readStartingLevel(userId: string): LearningLevel | null {
  try {
    const saved = Number(localStorage.getItem(startingLevelStorageKey(userId)));
    if (isLearningLevel(saved)) return saved;
    const legacy = Number(localStorage.getItem(learningLevelStorageKey(userId)));
    return isLearningLevel(legacy) ? legacy : null;
  } catch {
    return null;
  }
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

    const lessonIds = normalizeDailyLessonIds(value.lessonIds);
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

function hasDailyGoalChoice(userId: string): boolean {
  try {
    return localStorage.getItem(dailyGoalStorageKey(userId)) !== null;
  } catch {
    return true;
  }
}

function learningLevelStorageKey(userId: string): string {
  return `alifly-learning-level:${userId}`;
}

function readLearningLevel(userId: string): LearningLevel {
  try {
    const value = Number(localStorage.getItem(learningLevelStorageKey(userId)));
    return isLearningLevel(value) ? value : 1;
  } catch {
    return 1;
  }
}

export default function App() {
  const { user, isLoading: authLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeHandled = useRef<string | null>(null);
  const routePath = location.pathname.replace(/\/+$/, "") || "/";
  const isLessonsRoute = routePath === "/lessons";
  const isAlifRoute = routePath === "/lessons/alif";
  const isLoginRoute = routePath === "/login";
  const dailyUserId = user?.uid ?? "guest";
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => readDailyGoal("guest"));
  const [dailyActivity, setDailyActivity] = useState<DailyActivity>(() => readDailyActivity("guest"));
  const [showDailyMissionSetup, setShowDailyMissionSetup] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [learningLevel, setLearningLevel] = useState<LearningLevel>(() => readLearningLevel("guest"));
  const [cloudReady, setCloudReady] = useState(false);
  const [startingLevel, setStartingLevel] = useState<LearningLevel | null>(() => readStartingLevel("guest"));
  const [showLevelSettings, setShowLevelSettings] = useState(false);
  const [showWordGame, setShowWordGame] = useState(false);
  const [progressOwnerId, setProgressOwnerId] = useState("guest");
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "loading" | "pending" | "saving" | "saved" | "error">("idle");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonPhase, setLessonPhase] = useState<"study" | "practice">("study");
  const [showAlphabetTips, setShowAlphabetTips] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const letterTouchStartX = useRef<number | null>(null);
  const letterAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioRequestIdRef = useRef(0);
  const autoPlayedLetterRef = useRef<string | null>(null);
  const [autoLetterAudio, setAutoLetterAudio] = useState<boolean>(() => {
    try { return localStorage.getItem("alifly-auto-letter-audio") === "enabled"; } catch { return false; }
  });
  const [letterAudioStatus, setLetterAudioStatus] = useState<"idle" | "loading" | "playing" | "error">("idle");
  const [letterAudioType, setLetterAudioType] = useState<"letter" | "alphabet">("letter");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lessonFinished, setLessonFinished] = useState(false);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>(readCompletedLessons);
  const [mistakes, setMistakes] = useState<Mistake[]>(readMistakes);
  const [memoryState, setMemoryState] = useState<MemoryState>(() => loadMemoryState(null));
  const [memoryOwnerId, setMemoryOwnerId] = useState("guest");
  const [selectedMemoryGrade, setSelectedMemoryGrade] = useState<MemoryGrade | null>(null);
  const [selectedMemoryError, setSelectedMemoryError] = useState<MemoryErrorType>("unknown");
  const savedMemoryAssessmentRef = useRef<string | null>(null);
  const saveMemoryAssessmentRef = useRef<() => void>(() => {});
  const [streak, setStreak] = useState<number>(() => readNumber("alifly-streak"));
  const [lastStudyDate, setLastStudyDate] = useState<string>(readLastStudyDate);
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewMistakeIds, setReviewMistakeIds] = useState<string[]>([]);
  const [examMode, setExamMode] = useState(false);
  const [examPassed, setExamPassed] = useState<boolean>(() => readBoolean("alifly-stage-1-exam-passed"));
  const [reportOpen, setReportOpen] = useState(false);
  const [reportCategory, setReportCategory] = useState("incorrect_answer");
  const [reportDescription, setReportDescription] = useState("");
  const [reportStatus, setReportStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      return localStorage.getItem("alifly-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
    }
  });

  const stopLetterAudio = () => {
    audioRequestIdRef.current += 1;
    if (letterAudioRef.current) {
      letterAudioRef.current.pause();
      letterAudioRef.current.onended = null;
      letterAudioRef.current.onerror = null;
      letterAudioRef.current.onplaying = null;
      letterAudioRef.current = null;
    }
    setLetterAudioStatus("idle");
  };

  const playAudioSample = (url: string, type: "letter" | "alphabet") => {
    if (letterAudioStatus === "playing" && letterAudioType === type) {
      stopLetterAudio();
      return;
    }

    stopLetterAudio();
    const requestId = audioRequestIdRef.current;
    const audio = new Audio(url);
    audio.preload = "none";
    audio.onplaying = () => {
      if (requestId === audioRequestIdRef.current) setLetterAudioStatus("playing");
    };
    audio.onended = () => {
      if (requestId === audioRequestIdRef.current) {
        setLetterAudioStatus("idle");
        letterAudioRef.current = null;
      }
    };
    audio.onerror = () => {
      if (requestId === audioRequestIdRef.current) setLetterAudioStatus("error");
    };
    letterAudioRef.current = audio;
    setLetterAudioType(type);
    setLetterAudioStatus("loading");
    void audio.play().catch(() => {
      if (requestId === audioRequestIdRef.current) setLetterAudioStatus("error");
    });
  };

  useEffect(() => {
    if (!selectedLesson || !selectedStage) stopLetterAudio();
  }, [selectedLesson, selectedStage]);

  useEffect(() => {
    if (!selectedLesson || !selectedStage || lessonPhase !== "study" || selectedLesson.studyCards || !autoLetterAudio) return;
    const current = selectedLesson.letters[activeLetterIndex];
    if (!current) return;
    const playbackKey = `${selectedLesson.id ?? "lesson"}:${activeLetterIndex}:${current.character}`;
    if (autoPlayedLetterRef.current === playbackKey) return;
    autoPlayedLetterRef.current = playbackKey;
    const audioUrl = arabicLetterAudio[current.character];
    if (audioUrl) playAudioSample(audioUrl, "letter");
  }, [selectedLesson, selectedStage, activeLetterIndex, lessonPhase, autoLetterAudio]);

  useEffect(() => () => {
    if (letterAudioRef.current) {
      letterAudioRef.current.pause();
      letterAudioRef.current.onended = null;
      letterAudioRef.current.onerror = null;
      letterAudioRef.current.onplaying = null;
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("alifly-theme", theme); } catch { /* Storage may be unavailable. */ }
  }, [theme]);

  useEffect(() => {
    setDailyGoal(readDailyGoal(dailyUserId));
    setDailyActivity(readDailyActivity(dailyUserId));
    const restoredLevel = readStartingLevel(dailyUserId);
    setStartingLevel(restoredLevel);
    setLearningLevel(restoredLevel ?? readLearningLevel(dailyUserId));
    setShowDailyMissionSetup(false);
  }, [dailyUserId]);

  useEffect(() => {
    if (startingLevel === null) return;
    try {
      localStorage.setItem(startingLevelStorageKey(dailyUserId), String(startingLevel));
      localStorage.setItem(learningLevelStorageKey(dailyUserId), String(startingLevel));
    } catch {
      // The selected route remains available for this session if storage is blocked.
    }
  }, [dailyUserId, startingLevel]);

  useEffect(() => {
    const hasExistingLearningData = completedLessonIds.length > 0 || mistakes.length > 0 || dailyActivity.lessonIds.length > 0;
    if (selectedLesson === null && (startingLevel !== null || hasExistingLearningData) && !hasDailyGoalChoice(dailyUserId)) {
      setShowDailyMissionSetup(true);
    }
  }, [dailyUserId, startingLevel, selectedLesson, completedLessonIds.length, mistakes.length, dailyActivity.lessonIds.length]);

  // Keep the new memory store isolated per guest/account on this device.
  useEffect(() => {
    const storageUserId = dailyUserId === "guest" ? null : dailyUserId;
    setMemoryState(loadMemoryState(storageUserId));
    setMemoryOwnerId(dailyUserId);
  }, [dailyUserId]);

  useEffect(() => {
    if (memoryOwnerId !== dailyUserId) return;
    saveMemoryState(dailyUserId === "guest" ? null : dailyUserId, memoryState);
  }, [dailyUserId, memoryOwnerId, memoryState]);

  useEffect(() => {
    if (!selectedStage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        saveMemoryAssessmentRef.current();
        setSelectedStage(null);
        setSelectedLesson(null);
        setQuestionIndex(0);
        setSelectedAnswer(null);
        setSelectedMemoryGrade(null);
        setSelectedMemoryError("unknown");
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
    if (dailyUserId !== "guest" || progressOwnerId !== "guest") return;
    try { localStorage.setItem("alifly-completed-lessons", JSON.stringify(completedLessonIds)); } catch { /* Storage may be unavailable. */ }
  }, [completedLessonIds, dailyUserId, progressOwnerId]);

  useEffect(() => {
    if (dailyUserId !== "guest" || progressOwnerId !== "guest") return;
    try { localStorage.setItem("alifly-mistakes", JSON.stringify(mistakes)); } catch { /* Storage may be unavailable. */ }
  }, [mistakes, dailyUserId, progressOwnerId]);

  useEffect(() => {
    if (dailyUserId !== "guest" || progressOwnerId !== "guest") return;
    try { localStorage.setItem("alifly-streak", String(streak)); } catch { /* Storage may be unavailable. */ }
  }, [streak, dailyUserId, progressOwnerId]);

  useEffect(() => {
    if (dailyUserId !== "guest" || progressOwnerId !== "guest") return;
    try { localStorage.setItem("alifly-last-study-date", lastStudyDate); } catch { /* Storage may be unavailable. */ }
  }, [lastStudyDate, dailyUserId, progressOwnerId]);

  useEffect(() => {
    if (dailyUserId !== "guest" || progressOwnerId !== "guest") return;
    try { localStorage.setItem("alifly-stage-1-exam-passed", String(examPassed)); } catch { /* Storage may be unavailable. */ }
  }, [examPassed, dailyUserId, progressOwnerId]);

  // Load the signed-in learner's progress before allowing cloud writes.
  useEffect(() => {
    let cancelled = false;

    if (authLoading) return;

    if (!user) {
      setCloudReady(false);
      setCloudSaveStatus("idle");
      // Restore the guest snapshot after sign-out; never expose the previous account's in-memory progress.
      setCompletedLessonIds(readCompletedLessons());
      setMistakes(readMistakes());
      setStreak(readNumber("alifly-streak"));
      setLastStudyDate(readLastStudyDate());
      setExamPassed(readBoolean("alifly-stage-1-exam-passed"));
      setDailyGoal(readDailyGoal("guest"));
      setDailyActivity(readDailyActivity("guest"));
      setStartingLevel(readStartingLevel("guest"));
      setLearningLevel(readLearningLevel("guest"));
      setProgressOwnerId("guest");
      return;
    }

    setCloudReady(false);
    setCloudSaveStatus("loading");

    const loadProgress = async () => {
      type CloudProgress = { completed_lesson_ids?: unknown; mistakes?: unknown; streak?: number; last_study_date?: string | null; exam_passed?: boolean; daily_goal?: number; daily_activity?: unknown; starting_level?: unknown };
      let data: CloudProgress | null = null;
      try {
        const progressRef = doc(db, "users", user.uid, "progress", "current");
        const snapshot = await getDoc(progressRef);
        if (snapshot.exists()) data = snapshot.data() as CloudProgress;
      } catch (error) {
        if (cancelled) return;
        console.error("ALIFLY: could not load cloud progress", error);
        // Keep the signed-in learner isolated even when the network is unavailable.
        setCompletedLessonIds([]);
        setMistakes([]);
        setStreak(0);
        setLastStudyDate("");
        setExamPassed(false);
        setDailyGoal(1);
        setDailyActivity({ date: "", lessonIds: [] });
        setProgressOwnerId(user.uid);
        setCloudSaveStatus("error");
        return;
      }

      if (cancelled) return;

      if (data) {
        const restoredLevel = isLearningLevel(data.starting_level)
          ? data.starting_level
          : readStartingLevel(user.uid) ?? readStartingLevel("guest");
        setStartingLevel(restoredLevel);
        setLearningLevel(restoredLevel ?? readLearningLevel(user.uid));
        setCompletedLessonIds(normalizeCompletedLessonIds(data.completed_lesson_ids));
        setMistakes(Array.isArray(data.mistakes) ? data.mistakes as Mistake[] : []);
        setStreak(typeof data.streak === "number" && Number.isFinite(data.streak) ? data.streak : 0);
        setLastStudyDate(data.last_study_date ?? "");
        setExamPassed(Boolean(data.exam_passed));
        setDailyGoal(data.daily_goal === 2 || data.daily_goal === 3 ? data.daily_goal : 1);
        const cloudDailyActivity = data.daily_activity as DailyActivity | null;
        setDailyActivity(cloudDailyActivity && typeof cloudDailyActivity.date === "string" && Array.isArray(cloudDailyActivity.lessonIds)
          ? { date: cloudDailyActivity.date, lessonIds: normalizeDailyLessonIds(cloudDailyActivity.lessonIds) }
          : { date: "", lessonIds: [] });
      } else {
        const restoredLevel = readStartingLevel(user.uid) ?? readStartingLevel("guest");
        setStartingLevel(restoredLevel);
        setLearningLevel(restoredLevel ?? readLearningLevel(user.uid));
        // An empty/new account must never inherit guest or another account's local progress.
        setCompletedLessonIds([]);
        setMistakes([]);
        setStreak(0);
        setLastStudyDate("");
        setExamPassed(false);
        setDailyGoal(1);
        setDailyActivity({ date: "", lessonIds: [] });
      }

      setProgressOwnerId(user.uid);
      setCloudSaveStatus(data ? "saved" : "pending");
      setCloudReady(true);
    };

    void loadProgress();
    return () => { cancelled = true; };
  }, [user?.uid, authLoading]);

  // Debounce writes and expose whether cloud sync actually succeeded.
  useEffect(() => {
    if (!user || !cloudReady) return;

    let cancelled = false;
    const timeout = window.setTimeout(async () => {
      setCloudSaveStatus("saving");
      try {
        const progressRef = doc(db, "users", user.uid, "progress", "current");
        await setDoc(progressRef, {
          completed_lesson_ids: completedLessonIds,
          mistakes,
          streak,
          last_study_date: lastStudyDate || null,
          exam_passed: examPassed,
          daily_goal: dailyGoal,
          daily_activity: dailyActivity,
          starting_level: startingLevel,
          updated_at: serverTimestamp(),
        }, { merge: true });

        if (cancelled) return;
        setCloudSaveStatus("saved");
      } catch (error) {
        if (cancelled) return;
        console.error("ALIFLY: could not save cloud progress", error);
        setCloudSaveStatus("error");
      }
    }, 600);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [user?.uid, cloudReady, completedLessonIds, mistakes, streak, lastStudyDate, examPassed, dailyGoal, dailyActivity, startingLevel]);


  const updateDailyGoal = (goal: DailyGoal) => {
    setDailyGoal(goal);
    try {
      localStorage.setItem(dailyGoalStorageKey(dailyUserId), String(goal));
    } catch {
      // The daily goal remains available for this session if storage is blocked.
    }
    setShowDailyMissionSetup(false);
  };

  const updateLearningLevel = (level: LearningLevel) => {
    setLearningLevel(level);
    setStartingLevel(level);
    try {
      localStorage.setItem(learningLevelStorageKey(dailyUserId), String(level));
      localStorage.setItem(startingLevelStorageKey(dailyUserId), String(level));
    } catch {
      // The selected route remains active for this session if storage is blocked.
    }
  };

  const closeStage = () => {
    if (routePath === "/lessons/alif") navigate("/lessons");
    saveCurrentMemoryAssessment();
    setSelectedStage(null);
    setSelectedLesson(null);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(false);
  };

  const startLesson = (lesson: Lesson) => {
    savedMemoryAssessmentRef.current = null;
    setSelectedLesson({ ...lesson, questions: buildLessonQuestions(lesson) });
    setLessonPhase("study");
    setShowAlphabetTips(false);
    setActiveLetterIndex(0);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(false);
    if (lesson.id === 20 && routePath !== "/lessons/alif") navigate("/lessons/alif");
  };

  const startLearningLevel = (level: LearningLevel) => {
    const stage = level === 1 ? stages[0] : level === 2 ? stages[1] : level === 3 ? stages[2] : stages[3];
    const firstLesson = level === 1
      ? lessons[0]
      : level === 2
        ? stageTwoLessons[0]
        : level === 3
          ? stageThreeLessons[0]
          : stageFourLessons[0];

    setStartingLevel(level);
    setLearningLevel(level);
    try {
      localStorage.setItem(learningLevelStorageKey(dailyUserId), String(level));
      localStorage.setItem(startingLevelStorageKey(dailyUserId), String(level));
    } catch { /* The chosen level remains active for this session. */ }
    setShowLevelSettings(false);
    setSelectedStage(stage);
    startLesson(firstLesson);
  };

  const recordWordGameAnswer = (word: Word, correct: boolean) => {
    if (memoryOwnerId !== dailyUserId) return;
    const identity = createLessonMemoryIdentity(90, "word-game-" + word.arabic, true);
    const previous = memoryState.items.find((item) => item.id === identity.id) ?? createMemoryItem({
      id: identity.id,
      contentType: "word",
      contentId: identity.contentId,
      skill: "meaning",
    });
    const result = reviewMemoryItem(previous, {
      grade: correct ? "good" : "again",
      errorType: correct ? null : "meaning",
      usedHint: false,
    }, "word-game-event-" + identity.id + "-" + Date.now());
    setMemoryState((current) => appendReviewResult(current, result));
  };

  const answerQuestion = (answer: string) => {
    if (selectedAnswer !== null || !selectedLesson) return;
    setSelectedAnswer(answer);
    const question = selectedLesson.questions[questionIndex];
    const answerIsCorrect = isCorrectAnswer(question, answer);
    setSelectedMemoryGrade(answerIsCorrect ? "good" : "again");
    setSelectedMemoryError("unknown");
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
          {
            id: mistakeId,
            // Preserve original lesson metadata when the question is replayed
            // inside the combined review lesson (whose temporary ID is 0).
            lessonId: previous?.lessonId ?? selectedLesson.id,
            lessonTitle: previous?.lessonTitle ?? selectedLesson.title,
            question: previous?.question ?? question,
          },
          isCorrect,
        );
        return [...current.filter((item) => item.id !== mistakeId), card];
      });
    }
  };

  const saveCurrentMemoryAssessment = () => {
    if (memoryOwnerId !== dailyUserId || !selectedLesson || selectedAnswer === null || examMode || !selectedMemoryGrade) return;
    const question = selectedLesson.questions[questionIndex];
    const mistakeId = reviewMode
      ? reviewMistakeIds[questionIndex]
      : `${selectedLesson.id}:${question.prompt}${question.stimulus ? `:${question.stimulus}` : ""}`;
    if (!mistakeId) return;
    const assessmentKey = `${selectedLesson.id}:${questionIndex}:${mistakeId}`;
    if (savedMemoryAssessmentRef.current === assessmentKey) return;
    savedMemoryAssessmentRef.current = assessmentKey;
    const sourceMistake = reviewMode ? mistakes.find((item) => item.id === mistakeId) : undefined;
    const sourceQuestion = sourceMistake?.question ?? question;
    const identity = createLessonMemoryIdentity(
      sourceMistake?.lessonId ?? selectedLesson.id,
      sourceMistake?.id ?? mistakeId,
      sourceQuestion.mode === "recall",
    );
    setMemoryState((current) => {
      const previous = current.items.find((item) => item.id === identity.id);
      const memoryItem = previous ?? createMemoryItem({
        ...identity,
        contentType: "lesson_question",
      });
      const reviewed = reviewMemoryItem(
        memoryItem,
        {
          grade: selectedMemoryGrade,
          errorType: selectedMemoryGrade === "again" ? selectedMemoryError : null,
        },
        `${identity.id}-${Date.now().toString(36)}-${current.recentEvents.length.toString(36)}`,
      );
      return appendReviewResult(current, reviewed);
    });
  };

  // Keep the latest assessment callback available to the Escape-key listener.
  saveMemoryAssessmentRef.current = saveCurrentMemoryAssessment;

  const nextQuestion = () => {
    if (!selectedLesson) return;
    saveCurrentMemoryAssessment();
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
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setTypedAnswer("");
  };

  const startExam = () => {
    if (firstStageCompletedCount < lessons.length) return;
    savedMemoryAssessmentRef.current = null;
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
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(true);
  };

  const memoryForCurrentUser = memoryOwnerId === dailyUserId ? memoryState : EMPTY_MEMORY_STATE;
  const memoryInsights = getMemoryInsights(memoryForCurrentUser);
  const dueMemoryItemIds = new Set(
    getDueMemoryItems(memoryForCurrentUser, Date.now(), Number.MAX_SAFE_INTEGER).map((item) => item.id),
  );
  const dueMistakes = mistakes.filter((item) => {
    const identity = createLessonMemoryIdentity(
      item.lessonId,
      item.id,
      item.question.mode === "recall",
    );
    const memoryItem = memoryForCurrentUser.items.find((candidate) => candidate.id === identity.id);
    // New cards follow MEMORY ENGINE scheduling; legacy cards keep their old due date.
    return memoryItem ? dueMemoryItemIds.has(memoryItem.id) : item.dueAt <= Date.now();
  });
  // Include cards marked difficult in MEMORY ENGINE, even when the legacy
  // mistake counter did not increase (for example, a learner chose "Again"
  // after a correct guess). Keep legacy-only cards in the same queue.
  const weakMistakes = mistakes.filter((item) => {
    const identity = createLessonMemoryIdentity(
      item.lessonId,
      item.id,
      item.question.mode === "recall",
    );
    const memoryItem = memoryForCurrentUser.items.find((candidate) => candidate.id === identity.id);
    return item.errorCount > 0 || (memoryItem?.lapseCount ?? 0) > 0;
  });

  const startWeakReview = () => {
    const weak = [...weakMistakes]
      .sort((a, b) => {
        const getWeaknessScore = (item: Mistake) => {
          const identity = createLessonMemoryIdentity(item.lessonId, item.id, item.question.mode === "recall");
          const memoryItem = memoryForCurrentUser.items.find((candidate) => candidate.id === identity.id);
          return item.errorCount + (memoryItem?.lapseCount ?? 0) * 2;
        };
        return getWeaknessScore(b) - getWeaknessScore(a);
      });
    if (weak.length === 0) return;
    savedMemoryAssessmentRef.current = null;
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
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(true);
    setExamMode(false);
  };

  const startReview = () => {
    const due = dueMistakes;
    if (due.length === 0) return;
    savedMemoryAssessmentRef.current = null;
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
    setSelectedMemoryGrade(null);
    setSelectedMemoryError("unknown");
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(true);
    setExamMode(false);
  };

  useEffect(() => {
    const titles: Record<string, string> = {
      "/": "ALIFLY — арабский язык с нуля | Уроки и практика",
      "/lessons": "Уроки арабского языка с нуля | ALIFLY",
      "/lessons/alif": "Алиф — первая буква арабского алфавита | ALIFLY",
      "/login": "Вход в аккаунт ALIFLY | Сохранение прогресса",
    };
    document.title = titles[routePath] ?? titles["/"];
    const description = document.querySelector('meta[name="description"]');
    if (description) {
      description.setAttribute("content", routePath === "/lessons"
        ? "Последовательные бесплатные уроки арабского языка для начинающих: алфавит, огласовки, чтение и практика."
        : routePath === "/lessons/alif"
          ? "Арабская буква Алиф: форма, название, произношение и первое упражнение в интерактивном уроке ALIFLY."
          : "Изучайте арабский язык с нуля вместе с ALIFLY: интерактивные уроки алфавита, произношение букв, огласовки, упражнения и отслеживание прогресса.");
    }

    if (isLessonsRoute && routeHandled.current !== routePath) {
      if (routeHandled.current === "/lessons/alif") closeStage();
      routeHandled.current = routePath;
      window.requestAnimationFrame(() => {
        document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    if (routePath === "/" && routeHandled.current === "/lessons/alif") {
      routeHandled.current = "/";
      closeStage();
      return;
    }

    if (isAlifRoute && routeHandled.current !== routePath) {
      routeHandled.current = routePath;
      setSelectedStage(stages[0]);
      startLesson(lessons[0]);
    }
  }, [location.pathname]);

  const currentQuestion = selectedLesson?.questions[questionIndex];
  const currentQuestionCorrect = currentQuestion && selectedAnswer !== null
    ? isCorrectAnswer(currentQuestion, selectedAnswer)
    : false;

  const submitLessonReport = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedLesson || !currentQuestion || reportStatus === "sending") return;
    setReportStatus("sending");
    try {
      const reporter = auth.currentUser ?? (await signInAnonymously(auth)).user;
      await addDoc(collection(db, "lessonReports"), {
        category: reportCategory,
        description: reportDescription.trim(),
        lessonId: selectedLesson.id,
        lessonTitle: selectedLesson.title,
        questionIndex: questionIndex + 1,
        prompt: currentQuestion.prompt,
        stimulus: currentQuestion.stimulus ?? "",
        reporterUid: reporter.uid,
        source: "lesson",
        status: "new",
        createdAt: serverTimestamp(),
      });
      setReportStatus("sent");
      setReportDescription("");
    } catch (error) {
      console.error("Не удалось отправить жалобу ALIFLY:", error);
      setReportStatus("error");
    }
  };
  const firstStageCompletedCount = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const today = localDateKey();
  const dailyCompletedCount = dailyActivity.date === today ? dailyActivity.lessonIds.length : 0;
  const stageTwoUnlocked = examPassed || (startingLevel !== null && startingLevel >= 2);
  const stageThreeUnlocked = stageTwoLessons.every((lesson) => completedLessonIds.includes(lesson.id)) || (startingLevel !== null && startingLevel >= 3);
  const stageFourUnlocked = stageThreeLessons.every((lesson) => completedLessonIds.includes(lesson.id)) || (startingLevel !== null && startingLevel >= 4) || (startingLevel === null && stageTwoLessons.every((lesson) => completedLessonIds.includes(lesson.id))) || stageFourLessons.some((lesson) => completedLessonIds.includes(lesson.id));
  const activeRoute = stageFourUnlocked
    ? { title: "диалогов", stageTitle: "Первые диалоги", lessons: stageFourLessons }
    : stageThreeUnlocked
      ? { title: "чтения слов", stageTitle: "Читаем первые слова", lessons: stageThreeLessons }
      : stageTwoUnlocked
        ? { title: "огласовок", stageTitle: "Огласовки", lessons: stageTwoLessons }
        : { title: "алфавита", stageTitle: "Арабский алфавит", lessons };
  const activeRouteCompletedCount = activeRoute.lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const activeRoutePercent = Math.round((activeRouteCompletedCount / activeRoute.lessons.length) * 100);
  const hasExistingLearningData = completedLessonIds.length > 0 || mistakes.length > 0 || dailyActivity.lessonIds.length > 0;
  const shouldShowLevelPlacement = startingLevel === null && !hasExistingLearningData && (!user || cloudReady);

  if (authLoading || progressOwnerId !== dailyUserId) {
    return (
      <main className="app app-loading" aria-live="polite">
        <div className="app-loading-message">
          <span className="logo-mark" aria-hidden="true">ا</span>
          <strong>ALIFLY</strong>
          <p>Загружаем твой прогресс…</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app">
      <header className="topbar">
        <a className="logo" href={import.meta.env.BASE_URL} aria-label="ALIFLY — главная">
          <span className="logo-mark">ا</span>
          <span>ALIFLY</span>
        </a>
        <div className="topbar-right">
          <span className={streak > 0 ? "streak is-active" : "streak"} aria-label={`Серия занятий: ${streak} дней`}>
            <span className="streak-icon" aria-hidden="true">🔥</span>
            <span className="streak-count">{streak}</span>
          </span>
          <AuthPanel cloudStatus={cloudSaveStatus} onChangeLevel={() => setShowLevelSettings(true)} suppressInitialPrompt={shouldShowLevelPlacement || showLevelSettings || selectedLesson !== null || !hasDailyGoalChoice(dailyUserId)} openOnMount={isLoginRoute} onClose={() => { if (isLoginRoute) navigate("/"); }} />
          <button
            className="theme-toggle"
            data-touch-hint={theme === "dark" ? "Нажми, чтобы включить светлую тему" : "Нажми, чтобы включить тёмную тему"}
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

      {showSettings && (
        <div className="alifly-settings-backdrop" onClick={() => setShowSettings(false)}>
          <section className="alifly-settings-panel" role="dialog" aria-modal="true" aria-labelledby="alifly-settings-title" onClick={(event) => event.stopPropagation()}>
            <button className="alifly-settings-close" type="button" onClick={() => setShowSettings(false)} aria-label="Закрыть настройки">×</button>
            <span className="section-label">ПЕРСОНАЛЬНЫЕ ПАРАМЕТРЫ</span>
            <h2 id="alifly-settings-title">Настройки</h2>
            <div className="settings-group">
              <h3>Внешний вид</h3>
              <p>Выбери удобную тему оформления.</p>
              <div className="settings-choice-row" role="group" aria-label="Тема оформления">
                <button type="button" className={theme === "light" ? "settings-choice is-active" : "settings-choice"} aria-pressed={theme === "light"} onClick={() => setTheme("light")}>☀ Светлая</button>
                <button type="button" className={theme === "dark" ? "settings-choice is-active" : "settings-choice"} aria-pressed={theme === "dark"} onClick={() => setTheme("dark")}>☾ Тёмная</button>
              </div>
            </div>
            <div className="settings-group">
              <h3>Миссия дня</h3>
              <p>Сколько уроков ты хочешь проходить ежедневно?</p>
              <div className="settings-choice-row" role="group" aria-label="Дневная цель">
                {([1, 2, 3] as DailyGoal[]).map((goal) => <button key={goal} type="button" className={dailyGoal === goal ? "settings-choice is-active" : "settings-choice"} aria-pressed={dailyGoal === goal} onClick={() => updateDailyGoal(goal)}>{goal} {goal === 1 ? "урок" : "урока"}</button>)}
              </div>
              <small>Цель и отметки сохраняются на этом устройстве.</small>
            </div>
            <div className="settings-group">
              <h3>Мой уровень арабского</h3>
              <p>Выбери этап, с которого тебе удобнее продолжить. Пройденные уроки сохраняются.</p>
              <div className="settings-level-list" role="group" aria-label="Уровень арабского">
                <button type="button" className={learningLevel === 1 ? "settings-level is-active" : "settings-level"} aria-pressed={learningLevel === 1} onClick={() => updateLearningLevel(1)}><strong>1 · С нуля</strong><span>Начинаю с арабских букв</span></button>
                <button type="button" className={learningLevel === 2 ? "settings-level is-active" : "settings-level"} aria-pressed={learningLevel === 2} onClick={() => updateLearningLevel(2)}><strong>2 · Знаю буквы</strong><span>Хочу изучать огласовки</span></button>
                <button type="button" className={learningLevel === 3 ? "settings-level is-active" : "settings-level"} aria-pressed={learningLevel === 3} onClick={() => updateLearningLevel(3)}><strong>3 · Читаю слова</strong><span>Хочу перейти к простым фразам</span></button>
                <button type="button" className={learningLevel === 4 ? "settings-level is-active" : "settings-level"} aria-pressed={learningLevel === 4} onClick={() => updateLearningLevel(4)}><strong>4 · Уже умею читать</strong><span>Хочу сразу перейти к диалогам</span></button>
                <button type="button" className="level-diagnostic-button" onClick={() => setShowLevelSettings(true)}>Пройти короткую диагностику уровня</button>
              </div>
            </div>
            <button className="settings-done-button" type="button" onClick={() => setShowSettings(false)}>Готово</button>
          </section>
        </div>
      )}

      {showDailyMissionSetup && (
        <div className="daily-mission-backdrop">
          <section className="daily-mission-dialog" role="dialog" aria-modal="true" aria-labelledby="daily-mission-heading">
            <span className="daily-quest-kicker">НЕБОЛЬШОЙ ШАГ К БОЛЬШОЙ ЦЕЛИ</span>
            <div className="daily-mission-symbol" aria-hidden="true">ا</div>
            <h2 id="daily-mission-heading">Миссия дня</h2>
            <p>Выбери комфортный темп и пройди ещё несколько уроков сегодня.</p>
            <div className="daily-mission-options" role="group" aria-label="Выбери дневную цель">
              {([1, 2, 3] as DailyGoal[]).map((goal) => <button key={goal} type="button" onClick={() => updateDailyGoal(goal)}><strong>{goal}</strong><span>{goal === 1 ? "урок" : "урока"}</span></button>)}
            </div>
            <small>Цель и отметки дня сохраняются на этом устройстве. Изменить цель можно позже в настройках.</small>
          </section>
        </div>
      )}

      {(shouldShowLevelPlacement || showLevelSettings) && (
        <LevelPlacement
          currentLevel={startingLevel}
          onSelectLevel={startLearningLevel}
          onClose={showLevelSettings && !shouldShowLevelPlacement ? () => setShowLevelSettings(false) : undefined}
        />
      )}

      <section className="hero">
        <div className="hero-content">
          <div className="hero-overline">
            <span className="hero-overline-line" />
            <span>{startingLevel === 4 ? "АРАБСКИЙ · ПРАКТИКА" : startingLevel === 3 ? "АРАБСКИЙ · ЧТЕНИЕ" : startingLevel === 2 ? "АРАБСКИЙ · ОГЛАСОВКИ" : "АРАБСКИЙ · С НУЛЯ"}</span>
            <span className="hero-overline-index">01 / 04</span>
          </div>
          <h1>Открой для себя <span>арабский язык.</span></h1>
          <p>Понятный путь от первой буквы до уверенного чтения. Короткие уроки и заметный прогресс — в твоём темпе.</p>
          <div className="hero-actions">
            <button className="primary-button" data-touch-hint="Перейди к программе и начни с первого короткого урока" onClick={() => { if (location.pathname !== "/lessons") navigate("/lessons"); else document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" }); }}>
              Начать обучение <span>↗</span>
            </button>
            <span className="hero-action-note">Первые уроки доступны бесплатно</span>
          </div>
          <div className="hero-bottomline">
            <span>БУКВЫ</span><i />
            <span>ЧТЕНИЕ</span><i />
            <span>ПРОГРЕСС</span>
          </div>
        </div>
        <div className="hero-index-art" aria-hidden="true">
          <span className="hero-index-caption">THE ARABIC<br/>LEARNING JOURNEY</span>
          <span className="hero-index-number">01</span>
          <span className="hero-index-orbit hero-index-orbit-one" />
          <span className="hero-index-orbit hero-index-orbit-two" />
          <span className="hero-index-foot">ALIFLY® · EST. FOR LEARNERS</span>
        </div>
      </section>

      <DailyQuest
        goal={dailyGoal}
        completedCount={dailyCompletedCount}
        onEdit={() => setShowSettings(true)}
      />

      <section className="progress-section">
        <div>
          <span className="section-label">ТВОЙ ПРОГРЕСС</span>
          <h2>Каждый шаг важен</h2>
        </div>
        <div className="progress-card">
          <div className="progress-info"><span>{activeRouteCompletedCount} из {activeRoute.lessons.length} уроков · {activeRoute.stageTitle}</span><strong>{activeRoutePercent}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${activeRoutePercent}%` }} /></div>
          <p>{activeRouteCompletedCount === activeRoute.lessons.length ? "Этот учебный маршрут завершён. Отличная работа!" : "Продолжай с того места, где остановился. Прогресс сохраняется в твоём аккаунте."}</p>
          <div className="memory-insights" aria-label="Состояние памяти">
            <div className="memory-insight"><strong>{memoryInsights.totalItems}</strong><span>карточек в памяти</span></div>
            <div className="memory-insight"><strong>{dueMistakes.length}</strong><span>пора повторить</span></div>
            <div className="memory-insight"><strong>{memoryInsights.accuracyPercent}%</strong><span>успешных ответов</span></div>
            {memoryInsights.skillCounts.length > 0 && (
              <div className="memory-skill-list">
                <span className="memory-skill-heading">Что требует внимания</span>
                {memoryInsights.skillCounts.slice(0, 3).map((skill) => (
                  <div className="memory-skill-row" key={skill.skill}>
                    <span>{memorySkillLabel(skill.skill)}</span>
                    <strong>{skill.accuracyPercent}%</strong>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="memory-actions">
            <button className="review-button" type="button" onClick={() => setShowWordGame((visible) => !visible)}>
              {showWordGame ? "Скрыть игру" : "Мини-игра: слова"}
            </button>
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
            <button className="review-button level-change-button" type="button" onClick={() => setShowLevelSettings(true)}>
              Изменить уровень
            </button>
          </div>
          {showWordGame && <WordGame onAnswer={recordWordGameAnswer} />}
        </div>
      </section>

      <section className="learning-section" id="learning-path">
        <div className="section-heading">
          <div><span className="section-label">ПРОГРАММА ОБУЧЕНИЯ</span><h2>Твой путь</h2></div>
          <span className="stage-count">4 этапа</span>
        </div>
        <div className="stage-list">
          {stages.map((stage) => {
            const unlocked = stage.id === 1 || (stage.id === 2 && stageTwoUnlocked) || (stage.id === 3 && stageThreeUnlocked) || (stage.id === 4 && stageFourUnlocked);
            return (
              <button className={`stage-card ${unlocked ? "" : "stage-locked"}`} key={stage.id} data-touch-hint={unlocked ? `Открой этап «${stage.title}» и выбери доступный урок` : undefined} disabled={!unlocked} onClick={() => { setSelectedStage(stage); setSelectedLesson(null); }}>
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-info">
                  <span className="stage-number">ЭТАП {stage.id}</span>
                  <strong>{stage.title}</strong>
                  <span className="stage-description">{stage.description}</span>
                  <span className="lesson-count">
                    {stage.id === 1
                      ? firstStageCompletedCount + "/" + lessons.length + " уроков алфавита"
                      : stage.id === 2
                        ? unlocked ? (examPassed ? "Открыт после экзамена" : "Открыт по выбранному уровню") : stage.lessons + " урока"
                        : stage.id === 3
                          ? stageThreeLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length + "/" + stageThreeLessons.length + " урока чтения"
                          : stageFourLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length + "/" + stageFourLessons.length + " уроков диалогов"}
                  </span>
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
        <a className="support-project-button" href="https://t.me/tribute/app?startapp=g6Qg" target="_blank" rel="noopener noreferrer" aria-label="Открыть страницу поддержки ALIFLY в Telegram">
          Поддержать ALIFLY в Telegram <span aria-hidden="true">↗</span>
        </a>
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
                ) : selectedStage.id === 3 && stageThreeUnlocked ? (
                  <div className="lesson-picker">
                    <p className="modal-note">Короткий словарь современного литературного арабского. Сначала изучи слово и его значение, затем введи чтение без подсказки.</p>
                    {stageThreeLessons.map((lesson, index) => {
                      const previousLesson = index > 0 ? stageThreeLessons[index - 1] : undefined;
                      const isOpen = index === 0 || (previousLesson !== undefined && completedLessonIds.includes(previousLesson.id));
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={"lesson-pick " + (isCompleted ? "lesson-pick-done" : "")} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(index + 1).padStart(2, "0")}</span>
                          <span className="lesson-pick-text">
                            <strong>{lesson.title}</strong>
                            <small>{lesson.studyCards?.length ?? 0} слова · {lesson.questions.length} задания</small>
                          </span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <p className="local-progress-note">Следующий урок откроется после завершения предыдущего. Прогресс сохраняется на устройстве и в аккаунте.</p>
                  </div>
                ) : selectedStage.id === 4 && stageFourUnlocked ? (
                  <div className="lesson-picker">
                    <p className="modal-note">Пять коротких уроков на современном литературном арабском (MSA): приветствие, знакомство, происхождение и самочувствие.</p>
                    {stageFourLessons.map((lesson, index) => {
                      const previousLesson = index > 0 ? stageFourLessons[index - 1] : undefined;
                      const isOpen = index === 0 || (previousLesson !== undefined && completedLessonIds.includes(previousLesson.id));
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={"lesson-pick " + (isCompleted ? "lesson-pick-done" : "")} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(index + 1).padStart(2, "0")}</span>
                          <span className="lesson-pick-text">
                            <strong>{lesson.title}</strong>
                            <small>{lesson.studyCards?.length ?? 0} фраз · {lesson.questions.length} заданий</small>
                          </span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <p className="local-progress-note">Прогресс сохраняется на устройстве и в аккаунте. Расширенная грамматика будет добавлена отдельным блоком.</p>
                  </div>
) : selectedStage.id === 1 ? (
                  <div className="lesson-picker">
                    <p className="modal-note">Девять коротких уроков доступны бесплатно. Проходи их по порядку или повторяй для закрепления.</p>
                    {lessons.map((lesson) => {
                      const lessonPosition = lessons.findIndex((item) => item.id === lesson.id);
                      const previousLesson = lessonPosition > 0 ? lessons[lessonPosition - 1] : undefined;
                      const isOpen = lessonPosition === 0 || (previousLesson !== undefined && completedLessonIds.includes(previousLesson.id));
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={`lesson-pick ${isCompleted ? "lesson-pick-done" : ""}`} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(lessonPosition + 1).padStart(2, "0")}</span>
                          <span className="lesson-pick-text"><strong>{lesson.title}</strong><small>{lesson.letters.length} букв · {buildLessonQuestions(lesson).length} заданий</small></span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <button className={`exam-pick ${examPassed ? "exam-pick-passed" : ""}`} type="button" onClick={startExam} disabled={firstStageCompletedCount < lessons.length}>
                      <span className="exam-pick-mark">{examPassed ? "✓" : "10"}</span>
                      <span className="lesson-pick-text"><strong>Итоговый экзамен</strong><small>{examPassed ? "Экзамен успешно сдан" : "10 вопросов · нужно 8 правильных"}</small></span>
                      <span className="lesson-pick-state">{examPassed ? "Пройден" : firstStageCompletedCount === lessons.length ? "Начать →" : `Сначала ${lessons.length} уроков`}</span>
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
                  <span className="lesson-step">{selectedLesson.studyCards?.length ?? selectedLesson.letters.length} элементов</span>
                </div>
                <h2 id="stage-modal-title">{selectedLesson.title}</h2>
                <p className="lesson-intro">{selectedLesson.goal}</p>
                <p className="study-guidance">
                  {selectedLesson.studyCards
                    ? "Прочитай фразу, её звучание и значение. Затем попробуй вспомнить их без подсказки."
                    : "Сначала внимательно изучи карточки всех букв. Когда будешь готов, переходи к простой проверке."}
                </p>
                {selectedLesson.studyCards ? (
                  <div className="study-phrase-cards">
                    {selectedLesson.studyCards.map((card, index) => (
                      <article className="study-phrase-card" key={`${index}-${card.arabic}`}>
                        <strong className="study-phrase-arabic" lang="ar" dir="rtl">{card.arabic}</strong>
                        <span className="study-phrase-transliteration">{card.transliteration}</span>
                        <span className="study-phrase-translation">{card.translation}</span>
                        {card.note && <small>{card.note}</small>}
                      </article>
                    ))}
                  </div>
                ) : (
                  <>
                    {(() => {
                      const letter = selectedLesson.letters[activeLetterIndex];
                      if (!letter) return null;
                      const speakLetter = () => {
                        const audioUrl = arabicLetterAudio[letter.character];
                        if (!audioUrl) {
                          setLetterAudioStatus("error");
                          return;
                        }
                        playAudioSample(audioUrl, "letter");
                      };
                      const enableAutoAudio = () => {
                        try { localStorage.setItem("alifly-auto-letter-audio", "enabled"); } catch { /* The current session can still use autoplay. */ }
                        autoPlayedLetterRef.current = `${selectedLesson.id ?? "lesson"}:${activeLetterIndex}:${letter.character}`;
                        setAutoLetterAudio(true);
                        const audioUrl = arabicLetterAudio[letter.character];
                        if (audioUrl) playAudioSample(audioUrl, "letter");
                      };
                      const moveLetter = (direction: -1 | 1) => {
                        stopLetterAudio();
                        setActiveLetterIndex((current) => Math.max(0, Math.min(selectedLesson.letters.length - 1, current + direction)));
                      };
                      return (
                        <div className="alphabet-flashcards">
                          <div className="letter-learning-hint">
                            <span className="letter-hint-icon">ا</span>
                            <p><strong>Изучай по одной букве</strong><small>Посмотри на форму, послушай название и повтори его вслух. Листай карточки в своём темпе.</small></p>
                            <button className="letter-alphabet-audio-button" type="button" onClick={() => playAudioSample(fullAlphabetAudioUrl, "alphabet")}>Слушать весь алфавит · голос носителя</button>
                            <small className="letter-alphabet-audio-credit">Запись M. Abuhelwa · общественное достояние</small>
                          </div>
                          <div
                            className="letter-flashcard"
                            onTouchStart={(event) => { letterTouchStartX.current = event.touches[0]?.clientX ?? null; }}
                            onTouchEnd={(event) => {
                              if (letterTouchStartX.current === null) return;
                              const delta = event.changedTouches[0].clientX - letterTouchStartX.current;
                              if (Math.abs(delta) > 45) moveLetter(delta < 0 ? 1 : -1);
                              letterTouchStartX.current = null;
                            }}
                          >
                            <div className="letter-flashcard-top">
                              <span>БУКВА {String(activeLetterIndex + 1).padStart(2, "0")}</span>
                              <span>{activeLetterIndex + 1} / {selectedLesson.letters.length}</span>
                            </div>
                            <strong className="letter-flashcard-character" lang="ar" dir="rtl">{letter.character}</strong>
                            <span className="letter-flashcard-name">{letter.name.split(" (")[0]}</span>
                            <p className="letter-flashcard-note">{letter.note ?? "Внимательно рассмотри форму этой буквы."}</p>
                            <div className="letter-audio-actions">
                              <button className={autoLetterAudio ? "letter-auto-audio is-enabled" : "letter-auto-audio"} type="button" onClick={enableAutoAudio} aria-pressed={autoLetterAudio}>
                                {autoLetterAudio ? "Автозвук включён" : "Включить автозвук"}
                              </button>
                              <button className={letterAudioStatus === "playing" && letterAudioType === "letter" ? "letter-speak-button is-playing" : "letter-speak-button"} type="button" onClick={speakLetter} aria-label={`Повторить произношение буквы ${letter.character}`} data-touch-hint="Повторить звук" title="Повторить звук">
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" /></svg>
                              </button>
                            </div>
                            <small className="letter-audio-status" role="status">{letterAudioStatus === "loading" ? (letterAudioType === "alphabet" ? "Загружаем запись алфавита…" : "Загружаем голосовой образец…") : letterAudioStatus === "playing" ? (letterAudioType === "alphabet" ? "Воспроизводится запись алфавита" : "Воспроизводится арабское произношение") : letterAudioStatus === "error" ? "Не удалось воспроизвести аудио. Проверь интернет и попробуй снова." : "Арабская нейроозвучка · литературный арабский"}</small>
                            <LetterMakhrajDiagram letter={letter.character} />
                          </div>
                          <div className="letter-flashcard-progress" aria-label={`Карточка ${activeLetterIndex + 1} из ${selectedLesson.letters.length}`}>
                            {selectedLesson.letters.map((item, index) => (
                              <button
                                key={item.character}
                                type="button"
                                className={index === activeLetterIndex ? "letter-progress-dot is-active" : "letter-progress-dot"}
                                data-touch-hint={`Перейти к букве ${index + 1}`}
                                aria-label={`Перейти к букве ${index + 1}`}
                                aria-current={index === activeLetterIndex ? "step" : undefined}
                                onClick={() => { stopLetterAudio(); setActiveLetterIndex(index); }}
                              />
                            ))}
                          </div>
                          <div className="letter-flashcard-navigation">
                            <button type="button" className="letter-nav-button" onClick={() => moveLetter(-1)} disabled={activeLetterIndex === 0}>← Назад</button>
                            <button type="button" className="letter-nav-button letter-nav-next" onClick={() => moveLetter(1)} disabled={activeLetterIndex === selectedLesson.letters.length - 1}>Следующая →</button>
                          </div>
                        </div>
                      );
                    })()}
                    <div className="alphabet-tips">
                      <button className="alphabet-tips-toggle" type="button" aria-expanded={showAlphabetTips} onClick={() => setShowAlphabetTips((value) => !value)}>
                        <span>Советы: как выучить буквы</span><span aria-hidden="true">{showAlphabetTips ? "−" : "+"}</span>
                      </button>
                      {showAlphabetTips && (
                        <div className="alphabet-tips-content">
                          <p><strong>1. Заведи отдельный блокнот.</strong> Записывай букву крупно, рядом — её название и произношение.</p>
                          <p><strong>2. Слушай и повторяй.</strong> Нажми на звук, затем произнеси название самостоятельно.</p>
                          <p><strong>3. Пиши рукой.</strong> Повтори каждую букву 5 раз, сверяясь с карточкой.</p>
                          <p><strong>4. Повторяй понемногу.</strong> Изучи 2–4 буквы, сделай перерыв и вернись к ним позже.</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
                {!selectedLesson.studyCards && activeLetterIndex < selectedLesson.letters.length - 1 ? (
                  <button className="primary-button modal-button study-start" type="button" onClick={() => setActiveLetterIndex((current) => Math.min(selectedLesson.letters.length - 1, current + 1))}>
                    Следующая буква →
                  </button>
                ) : (
                  <button className="primary-button modal-button study-start" type="button" onClick={() => { setLessonPhase("practice"); setQuestionIndex(0); setSelectedAnswer(null); setTypedAnswer(""); }}>
                    Перейти к закреплению →
                  </button>
                )}
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
                        <div
                          className={`recall-stimulus ${currentQuestion.stimulusLang === "ru" ? "recall-stimulus-text" : ""} ${currentQuestion.stimulus.length > 24 ? "recall-stimulus-long" : ""}`}
                          lang={currentQuestion.stimulusLang ?? "ar"}
                          dir={currentQuestion.stimulusDir ?? "rtl"}
                        >{currentQuestion.stimulus}</div>
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
                  {selectedAnswer !== null && !examMode && (
                    <div className="memory-rating" aria-label="Оцени, насколько легко вспомнил">
                      <span className="memory-rating-title">Насколько легко вспомнил?</span>
                      <div className="memory-rating-options">
                        {([
                          ["again", "Не вспомнил"],
                          ["hard", "Трудно"],
                          ["good", "Нормально"],
                          ["easy", "Легко"],
                        ] as Array<[MemoryGrade, string]>).map(([grade, label]) => (
                          <button
                            key={grade}
                            type="button"
                            className={`memory-rating-button ${selectedMemoryGrade === grade ? "is-selected" : ""}`}
                            aria-pressed={selectedMemoryGrade === grade}
                            onClick={() => setSelectedMemoryGrade(grade)}
                          >{label}</button>
                        ))}
                      </div>
                      {selectedMemoryGrade === "again" && (
                        <div className="memory-error-options">
                          <label htmlFor="memory-error-type">Что именно было сложно?</label>
                          <select id="memory-error-type" value={selectedMemoryError} onChange={(event) => setSelectedMemoryError(event.target.value as MemoryErrorType)}>
                            <option value="unknown">Пока не знаю</option>
                            <option value="shape">Перепутал форму</option>
                            <option value="dots">Перепутал точки</option>
                            <option value="letter_name">Забыл название</option>
                            <option value="pronunciation">Сложно произнести</option>
                            <option value="meaning">Забыл значение</option>
                            <option value="reading">Сложно прочитать</option>
                            <option value="attention">Невнимательность</option>
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" className="lesson-report-trigger" onClick={() => { setReportOpen((open) => !open); setReportStatus("idle"); }} aria-expanded={reportOpen}>⚑ Сообщить о проблеме</button>
                {reportOpen && (
                  <form className="lesson-report-panel" onSubmit={submitLessonReport}>
                    {reportStatus === "sent" ? <p className="lesson-report-success" role="status">Спасибо! Жалоба отправлена на проверку.</p> : (
                      <>
                        <label htmlFor="lesson-report-category">Что не так?</label>
                        <select id="lesson-report-category" value={reportCategory} onChange={(event) => setReportCategory(event.target.value)}>
                          <option value="incorrect_translation">Неверный перевод</option>
                          <option value="arabic_text">Ошибка в арабском тексте</option>
                          <option value="pronunciation">Неправильное произношение</option>
                          <option value="incorrect_answer">Неверный правильный ответ</option>
                          <option value="technical_issue">Техническая проблема</option>
                          <option value="other">Другое</option>
                        </select>
                        <label htmlFor="lesson-report-description">Подробности (необязательно)</label>
                        <textarea id="lesson-report-description" value={reportDescription} onChange={(event) => setReportDescription(event.target.value.slice(0, 1000))} placeholder="Опиши проблему..." rows={3} maxLength={1000} />
                        {reportStatus === "error" && <p className="lesson-report-error" role="alert">Не удалось отправить. Попробуй ещё раз позже.</p>}
                        <div className="lesson-report-actions">
                          <button type="button" className="lesson-report-cancel" onClick={() => setReportOpen(false)}>Отмена</button>
                          <button type="submit" className="lesson-report-submit" disabled={reportStatus === "sending"}>{reportStatus === "sending" ? "Отправка..." : "Отправить жалобу"}</button>
                        </div>
                      </>
                    )}
                  </form>
                )}
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
