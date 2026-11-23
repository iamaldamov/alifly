// Canonical ALIFLY curriculum data and lesson-question logic.
// Keep this module independent from UI so the website, Telegram bot and Mini App can share it.

export type Stage = {
  id: number;
  title: string;
  description: string;
  icon: string;
  lessons: number;
  status: "available" | "locked";
};

export type Question = {
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

export type Lesson = {
  id: number;
  title: string;
  goal: string;
  letters: { character: string; name: string; note?: string }[];
  studyCards?: StudyCard[];
  questions: Question[];
};

export const stages: Stage[] = [
  { id: 1, title: "Арабский алфавит", description: "Знакомство с 28 буквами и их звучанием", icon: "ا", lessons: 9, status: "available" },
  { id: 2, title: "Огласовки", description: "Фатха, кясра и дамма — три основные огласовки", icon: "َ", lessons: 3, status: "locked" },
  { id: 3, title: "Знакомство", description: "Первые диалоги на современном литературном арабском", icon: "م", lessons: 5, status: "locked" },
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
export const lessons: Lesson[] = [
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

export const stageTwoLessons: Lesson[] = [
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

export const stageThreeLessons: Lesson[] = [
  makeIntroductionLesson(
    30,
    "Приветствие и ответ",
    "Научись начинать разговор и отвечать на приветствие. Сначала пойми пару, затем вспоминай её без подсказки.",
    [
      {
        arabic: "السَّلَامُ عَلَيْكُمْ",
        transliteration: "as-salāmu ʿalaykum",
        translation: "Мир вам",
        acceptedTransliterations: ["as-salamu alaykum", "assalamu alaykum", "ас-саляму алейкум", "ассаляму алейкум"],
        acceptedTranslations: ["мир вам", "мир вам всем"],
      },
      {
        arabic: "وَعَلَيْكُمُ السَّلَامُ",
        transliteration: "wa-ʿalaykumu s-salām",
        translation: "И вам мир",
        acceptedTransliterations: ["wa alaykumu s-salam", "waalaykumu salam", "уа алейкуму салям", "уа алейкуму ссалям"],
        acceptedTranslations: ["и вам мир", "и вам мир тоже"],
      },
      {
        arabic: "مَرْحَبًا",
        transliteration: "marḥaban",
        translation: "Здравствуйте",
        acceptedTransliterations: ["marhaban", "мархабан"],
        acceptedTranslations: ["здравствуйте", "привет", "добро пожаловать"],
      },
      {
        arabic: "أَهْلًا وَسَهْلًا",
        transliteration: "ahlan wa-sahlan",
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
        transliteration: "mā ismuka?",
        translation: "Как тебя зовут?",
        note: "Форма обращения к мужчине.",
        recallCue: "Как тебя зовут? (обращение к мужчине)",
        acceptedTransliterations: ["ma ismuka", "maa ismuka", "ма исмука"],
        acceptedTranslations: ["как тебя зовут", "какое у тебя имя", "как вас зовут"],
      },
      {
        arabic: "مَا اسْمُكِ؟",
        transliteration: "mā ismuki?",
        translation: "Как тебя зовут?",
        note: "Форма обращения к женщине.",
        recallCue: "Как тебя зовут? (обращение к женщине)",
        acceptedTransliterations: ["ma ismuki", "maa ismuki", "ма исмуки"],
        acceptedTranslations: ["как тебя зовут", "какое у тебя имя", "как вас зовут"],
      },
      {
        arabic: "اسْمِي ...",
        transliteration: "ismī ...",
        translation: "Меня зовут…",
        acceptedTransliterations: ["ismi", "исми"],
        acceptedTranslations: ["меня зовут", "мое имя"],
      },
      {
        arabic: "تَشَرَّفْنَا",
        transliteration: "tasharrafnā",
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
        transliteration: "min ayna anta?",
        translation: "Откуда ты?",
        note: "Форма обращения к мужчине.",
        recallCue: "Откуда ты? (обращение к мужчине)",
        acceptedTransliterations: ["min ayna anta", "min aina anta", "мин айна анта"],
        acceptedTranslations: ["откуда ты", "откуда вы"],
      },
      {
        arabic: "مِنْ أَيْنَ أَنْتِ؟",
        transliteration: "min ayna anti?",
        translation: "Откуда ты?",
        note: "Форма обращения к женщине.",
        recallCue: "Откуда ты? (обращение к женщине)",
        acceptedTransliterations: ["min ayna anti", "min aina anti", "мин айна анти"],
        acceptedTranslations: ["откуда ты", "откуда вы"],
      },
      {
        arabic: "أَنَا مِنْ ...",
        transliteration: "anā min ...",
        translation: "Я из…",
        acceptedTransliterations: ["ana min", "anaa min", "ана мин"],
        acceptedTranslations: ["я из", "я родом из"],
      },
      {
        arabic: "أَنَا مِنْ رُوسِيَا",
        transliteration: "anā min rūsiyā",
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
        transliteration: "kayfa ḥāluka?",
        translation: "Как ты?",
        note: "Форма обращения к мужчине.",
        recallCue: "Как ты? (обращение к мужчине)",
        acceptedTransliterations: ["kayfa haluka", "kayfa haaluka", "кайфа халука"],
        acceptedTranslations: ["как ты", "как дела", "как поживаешь"],
      },
      {
        arabic: "كَيْفَ حَالُكِ؟",
        transliteration: "kayfa ḥāluki?",
        translation: "Как ты?",
        note: "Форма обращения к женщине.",
        recallCue: "Как ты? (обращение к женщине)",
        acceptedTransliterations: ["kayfa haluki", "kayfa haaluki", "кайфа халики"],
        acceptedTranslations: ["как ты", "как дела", "как поживаешь"],
      },
      {
        arabic: "أَنَا بِخَيْرٍ، شُكْرًا",
        transliteration: "anā bikhayr, shukran",
        translation: "У меня всё хорошо, спасибо",
        acceptedTransliterations: ["ana bikhayr shukran", "anaa bikhair shukran", "ана бихайр шукран"],
        acceptedTranslations: ["у меня все хорошо спасибо", "я в порядке спасибо", "все хорошо спасибо"],
      },
      {
        arabic: "وَأَنْتَ؟",
        transliteration: "wa anta?",
        translation: "А ты?",
        note: "При обращении к женщине: وَأَنْتِ؟ (wa anti?).",
        recallCue: "А ты? (обращение к мужчине)",
        acceptedTransliterations: ["wa anta", "уа анта"],
        acceptedTranslations: ["а ты", "а вы", "а у тебя"],
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ",
        transliteration: "al-ḥamdu lillāh",
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
        transliteration: "as-salāmu ʿalaykum\nwa-ʿalaykumu s-salām",
        translation: "— Мир вам. — И вам мир.",
        acceptedTransliterations: ["as salamu alaykum wa alaykumu salam", "as-salamu alaykum wa alaykumu s-salam", "ассаляму алейкум уа алейкуму салям"],
        acceptedTranslations: ["мир вам и вам мир", "мир вам и вам мир тоже"],
      },
      {
        arabic: "مَا اسْمُكِ؟\nاسْمِي سَارَةُ",
        transliteration: "mā ismuki? ismī sāra",
        translation: "— Как тебя зовут? — Меня зовут Сара.",
        note: "Вопрос обращён к женщине.",
        recallCue: "Диалог: спроси у женщины имя и представься Сарой.",
        acceptedTransliterations: ["ma ismuki ismi sara", "maa ismuki ismi sara", "ма исмуки исми сара"],
        acceptedTranslations: ["как тебя зовут меня зовут сара", "меня зовут сара"],
      },
      {
        arabic: "مِنْ أَيْنَ أَنْتِ؟\nأَنَا مِنْ رُوسِيَا",
        transliteration: "min ayna anti? anā min rūsiyā",
        translation: "— Откуда ты? — Я из России.",
        note: "Форма обращения к женщине.",
        recallCue: "Диалог: спроси женщину, откуда она, и ответь, что ты из России.",
        acceptedTransliterations: ["min ayna anti ana min rusiya", "мин айна анти ана мин русия"],
        acceptedTranslations: ["откуда ты я из россии", "я из россии"],
      },
      {
        arabic: "كَيْفَ حَالُكِ؟\nأَنَا بِخَيْرٍ، شُكْرًا",
        transliteration: "kayfa ḥāluki? anā bikhayr, shukran",
        translation: "— Как дела? — Хорошо, спасибо.",
        note: "Форма обращения к женщине.",
        recallCue: "Диалог: спроси женщину, как у неё дела, и ответь, что у тебя всё хорошо.",
        acceptedTransliterations: ["kayfa haluki ana bikhayr shukran", "кайфа халики ана бихайр шукран"],
        acceptedTranslations: ["как дела хорошо спасибо", "у меня все хорошо спасибо"],
      },
      {
        arabic: "تَشَرَّفْنَا",
        transliteration: "tasharrafnā",
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

export function isCorrectAnswer(question: Question, answer: string): boolean {
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

export function buildLessonQuestions(lesson: Lesson): Question[] {
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

export function buildExamRecallQuestions(): Question[] {
  const allLetters = lessons.flatMap((lesson) => lesson.letters);
  const sampledQuestions = shuffleQuestions(allLetters.flatMap((letter) => buildLetterRecallQuestions(letter).slice(0, 1))).slice(0, 10);
  return sampledQuestions.map((question) => ({
    ...question,
    prompt: "Вспомни название буквы и напиши его без вариантов ответа.",
  }));
}


export const legacyAlphabetProgress: Record<number, number[]> = {
  1: [20],
  2: [21, 22],
  3: [23],
  4: [24, 25],
  5: [26, 27, 28],
};

