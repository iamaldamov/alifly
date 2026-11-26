export type ArabicSentenceLesson = {
  id: number;
  title: string;
  goal: string;
  letters: { character: string; name: string; note?: string }[];
  studyCards: {
    arabic: string;
    transliteration: string;
    translation: string;
    note?: string;
  }[];
  questions: {
    prompt: string;
    options: string[];
    correct: string;
    explanation: string;
    stimulus?: string;
    stimulusLang?: "ar" | "ru";
    stimulusDir?: "rtl" | "ltr";
  }[];
};

// Examples are based on Madinah Arabic, Grammar Course, Lesson 1 (Parts 1–3).
// No audio is attached: sentence recordings need their own verified source and rights review.
export const arabicSentenceLessons: ArabicSentenceLesson[] = [
  {
    id: 38,
    title: "Что это? — вопрос и ответ",
    goal: "Прочитай короткий вопрос и ответь целым предложением, используя уже знакомые слова.",
    letters: [],
    studyCards: [
      {
        arabic: "مَا هَٰذَا؟",
        transliteration: "mā hādhā?",
        translation: "Что это?",
        note: "مَا — «что?», هَٰذَا — «это» для существительного мужского рода.",
      },
      {
        arabic: "هَٰذَا كِتَابٌ.",
        transliteration: "hādhā kitābun",
        translation: "Это книга.",
        note: "В настоящем времени отдельное слово «есть» не требуется. Окончание -un — танвин.",
      },
      {
        arabic: "هَٰذَا بَابٌ.",
        transliteration: "hādhā bābun",
        translation: "Это дверь.",
        note: "Та же модель предложения с другим знакомым существительным.",
      },
      {
        arabic: "هَٰذَا بَيْتٌ.",
        transliteration: "hādhā baytun",
        translation: "Это дом.",
      },
    ],
    questions: [
      {
        prompt: "Что означает вопрос مَا هَٰذَا؟",
        options: ["Что это?", "Кто это?", "Где дом?"],
        correct: "Что это?",
        explanation: "مَا означает «что?», а هَٰذَا — «это».",
        stimulus: "مَا هَٰذَا؟",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Выбери предложение «Это книга».",
        options: ["هَٰذَا كِتَابٌ.", "هَٰذَا بَابٌ.", "هَٰذَا بَيْتٌ."],
        correct: "هَٰذَا كِتَابٌ.",
        explanation: "كِتَابٌ означает «книга». В настоящем времени связка «есть» обычно не выражается отдельным словом.",
        stimulus: "هَٰذَا كِتَابٌ.",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Какое слово в هَٰذَا بَابٌ означает «дверь»?",
        options: ["هَٰذَا", "بَابٌ", "مَا"],
        correct: "بَابٌ",
        explanation: "بَابٌ — «дверь». هَٰذَا — «это», а مَا — «что?».",
        stimulus: "هَٰذَا بَابٌ.",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Выбери предложение «Это дом».",
        options: ["هَٰذَا بَيْتٌ.", "هَٰذَا كِتَابٌ.", "مَا هَٰذَا؟"],
        correct: "هَٰذَا بَيْتٌ.",
        explanation: "بَيْتٌ означает «дом». Читай арабскую строку справа налево.",
        stimulus: "هَٰذَا بَيْتٌ.",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
    ],
  },
  {
    id: 39,
    title: "Вопросы с ответом «да» и «нет»",
    goal: "Узнай вопрос с частицей أَ и научись выбирать короткий ответ نَعَمْ или لا.",
    letters: [],
    studyCards: [
      {
        arabic: "أَهَٰذَا بَيْتٌ؟",
        transliteration: "a-hādhā baytun?",
        translation: "Это дом?",
        note: "Начальная أَ превращает фразу в вопрос «Это …?».",
      },
      {
        arabic: "نَعَمْ، هَٰذَا بَيْتٌ.",
        transliteration: "naʿam, hādhā baytun",
        translation: "Да, это дом.",
      },
      {
        arabic: "أَهَٰذَا مِفْتَاحٌ؟",
        transliteration: "a-hādhā miftāḥun?",
        translation: "Это ключ?",
      },
      {
        arabic: "لا، هَٰذَا قَلَمٌ.",
        transliteration: "lā, hādhā qalamun",
        translation: "Нет, это ручка.",
        note: "قَلَمٌ — «ручка», مِفْتَاحٌ — «ключ».",
      },
    ],
    questions: [
      {
        prompt: "Что означает أَهَٰذَا بَيْتٌ؟",
        options: ["Это дом?", "Что это?", "Это книга."],
        correct: "Это дом?",
        explanation: "Частица أَ в начале превращает высказывание в вопрос «Это …?».",
        stimulus: "أَهَٰذَا بَيْتٌ؟",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Как по-арабски сказать «да»?",
        options: ["لا", "نَعَمْ", "مَا"],
        correct: "نَعَمْ",
        explanation: "نَعَمْ означает «да».",
        stimulus: "نَعَمْ",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Как по-арабски сказать «нет»?",
        options: ["هَٰذَا", "نَعَمْ", "لا"],
        correct: "لا",
        explanation: "لا означает «нет».",
        stimulus: "لا",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Выбери ответ «Нет, это ручка» на вопрос «Это ключ?».",
        options: ["نَعَمْ، هَٰذَا بَيْتٌ.", "لا، هَٰذَا قَلَمٌ.", "هَٰذَا كِتَابٌ."],
        correct: "لا، هَٰذَا قَلَمٌ.",
        explanation: "لا — «нет», هَٰذَا قَلَمٌ — «это ручка».",
        stimulus: "أَهَٰذَا مِفْتَاحٌ؟",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
      {
        prompt: "Выбери ответ «Да, это дом».",
        options: ["لا، هَٰذَا قَلَمٌ.", "نَعَمْ، هَٰذَا بَيْتٌ.", "مَا هَٰذَا؟"],
        correct: "نَعَمْ، هَٰذَا بَيْتٌ.",
        explanation: "نَعَمْ — «да», هَٰذَا بَيْتٌ — «это дом».",
        stimulus: "أَهَٰذَا بَيْتٌ؟",
        stimulusLang: "ar",
        stimulusDir: "rtl",
      },
    ],
  },
];
