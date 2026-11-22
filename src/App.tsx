import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Seo from "./Seo";
import DailyQuest, { type DailyGoal } from "./DailyQuest";
import AuthPanel from "./auth/AuthPanel";
import { useAuth } from "./auth/AuthContext";
import { db } from "./lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Arabic letter names are spoken in Arabic, not through Russian transliteration.
const arabicLetterNames: Record<string, string> = {
  "ا": "أَلِف",
  "ب": "بَاء",
  "ت": "تَاء",
  "ث": "ثَاء",
  "ج": "جِيم",
  "ح": "حَاء",
  "خ": "خَاء",
  "د": "دَال",
  "ذ": "ذَال",
  "ر": "رَاء",
  "ز": "زَاي",
  "س": "سِين",
  "ش": "شِين",
  "ص": "صَاد",
  "ض": "ضَاد",
  "ط": "طَاء",
  "ظ": "ظَاء",
  "ع": "عَيْن",
  "غ": "غَيْن",
  "ف": "فَاء",
  "ق": "قَاف",
  "ك": "كَاف",
  "ل": "لَام",
  "م": "مِيم",
  "ن": "نُون",
  "ه": "هَاء",
  "و": "وَاو",
  "ي": "يَاء",
};

type MakhrajInfo = {
  point: [number, number];
  title: string;
  description: string;
};

const makhrajByLetter: Record<string, MakhrajInfo> = {
  "ا": { point: [166, 83], title: "Полость рта", description: "Долгий звук алифа произносится свободным потоком воздуха, без смыкания языка с нёбом." },
  "ب": { point: [39, 99], title: "Две губы", description: "Мягко сомкни обе губы и раскрой их, выпуская звук." },
  "ت": { point: [76, 101], title: "Кончик языка и верхние зубы", description: "Кончик языка касается основания верхних передних зубов, затем быстро отходит." },
  "ث": { point: [58, 91], title: "Кончик языка у края зубов", description: "Слегка покажи кончик языка между передними зубами и пропусти воздух без голоса." },
  "ج": { point: [158, 105], title: "Середина языка", description: "Середина языка поднимается к твёрдому нёбу." },
  "ح": { point: [286, 108], title: "Середина горла", description: "Звук формируется в средней части горла, без участия кончика языка." },
  "خ": { point: [275, 82], title: "Верхняя часть горла", description: "Звук образуется в верхней части горла, ближе ко рту." },
  "د": { point: [76, 101], title: "Кончик языка и верхние зубы", description: "Кончик языка касается основания верхних передних зубов и отходит со звонким звуком." },
  "ذ": { point: [58, 91], title: "Кончик языка у края зубов", description: "Кончик языка слегка выходит между передними зубами; звук произносится с голосом." },
  "ر": { point: [84, 108], title: "Кончик языка у дёсен", description: "Кончик языка касается участка дёсен сразу за верхними передними зубами." },
  "ز": { point: [66, 96], title: "Кончик языка у передних зубов", description: "Кончик языка находится близко к нижней стороне верхних передних зубов; воздух проходит с голосом." },
  "س": { point: [66, 96], title: "Кончик языка у передних зубов", description: "Кончик языка находится близко к передним зубам; воздух проходит узкой струёй без голоса." },
  "ش": { point: [158, 105], title: "Середина языка", description: "Середина языка поднимается к нёбу, оставляя узкий проход для воздуха." },
  "ص": { point: [66, 96], title: "Передняя часть языка", description: "Кончик языка находится у передних зубов, а задняя часть языка приподнята; звук твёрдый." },
  "ض": { point: [122, 125], title: "Боковая сторона языка", description: "Одна из боковых сторон языка прижимается к верхним коренным зубам." },
  "ط": { point: [76, 101], title: "Кончик языка и верхние зубы", description: "Кончик языка касается основания верхних передних зубов; задняя часть языка приподнята." },
  "ظ": { point: [58, 91], title: "Кончик языка у края зубов", description: "Кончик языка касается края верхних передних зубов и слегка выходит между ними." },
  "ع": { point: [286, 108], title: "Середина горла", description: "Звук формируется в средней части горла; это не обычный звук русского «а»." },
  "غ": { point: [275, 82], title: "Верхняя часть горла", description: "Звук образуется в верхней части горла, ближе ко рту, с голосом." },
  "ف": { point: [47, 109], title: "Нижняя губа и верхние зубы", description: "Край верхних передних зубов мягко касается внутренней стороны нижней губы." },
  "ق": { point: [225, 94], title: "Корень языка", description: "Самая задняя часть языка поднимается к мягкому нёбу." },
  "ك": { point: [204, 98], title: "Задняя часть языка", description: "Задняя часть языка касается нёба немного ближе ко рту, чем при ق." },
  "ل": { point: [110, 118], title: "Боковая часть языка у дёсен", description: "Передняя боковая часть языка касается дёсен за верхними зубами." },
  "م": { point: [39, 99], title: "Две губы", description: "Обе губы смыкаются; звук сопровождается носовым резонансом." },
  "ن": { point: [84, 108], title: "Кончик языка у дёсен", description: "Кончик языка касается дёсен за верхними передними зубами; звук имеет носовой резонанс." },
  "ه": { point: [298, 132], title: "Глубина горла", description: "Лёгкий выдох выходит из самой глубокой части горла." },
  "و": { point: [39, 99], title: "Округлённые губы", description: "Округли губы вперёд, как будто произносишь короткое «у»." },
  "ي": { point: [158, 105], title: "Середина языка", description: "При согласном ي середина языка поднимается к нёбу; в долгом звуке положение свободнее." },
};

function LetterMakhrajDiagram({ letter }: { letter: string }) {
  const info = makhrajByLetter[letter] ?? {
    point: [160, 105] as [number, number],
    title: "Место образования звука",
    description: "",
  };
  const [pointX, pointY] = info.point;
  const isOpenCavity = letter === "ا";
  const isThroat = ["ء", "ه", "ع", "ح", "غ", "خ"].includes(letter);
  const isBackTongue = ["ق", "ك"].includes(letter);
  const isMiddleTongue = ["ج", "ش", "ي"].includes(letter);
  const isSideTongue = letter === "ض";
  const isLip = ["ب", "م", "و", "ف"].includes(letter);
  const zoneRadius = isThroat ? 16 : isBackTongue || isMiddleTongue || isSideTongue ? 14 : isLip ? 12 : 11;

  return (
    <section className="letter-makhraj" aria-label={`Схема места образования звука буквы ${letter}`}>
      <svg
        className="letter-mouth-diagram"
        viewBox="0 0 420 238"
        role="img"
        aria-label={`Вид сбоку на ротовую полость. Выделена область образования звука буквы ${letter}.`}
      >
        <defs>
          <linearGradient id="alifly-head" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F8EBDD" />
            <stop offset="1" stopColor="#DCC8B6" />
          </linearGradient>
          <linearGradient id="alifly-tongue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#F0B4AE" />
            <stop offset="1" stopColor="#C8757A" />
          </linearGradient>
          <filter id="alifly-zone-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        {/* Clean side-view cross section: lips on the left, throat on the right */}
        <path d="M72 17 C157 -1 282 9 335 47 C353 60 365 78 371 94 L402 108 L374 121 L390 135 L356 151 C345 190 303 218 240 225 L116 224 C69 218 42 189 39 153 L21 139 L39 126 L24 112 L43 100 C45 63 52 34 72 17Z"
          fill="url(#alifly-head)" stroke="#B7A28F" strokeWidth="3" strokeLinejoin="round" />
        <path d="M43 105 C93 77 188 71 274 86 C311 92 336 111 341 137 C319 157 282 169 228 173 C151 178 84 158 43 132Z"
          fill="#FFFDF8" stroke="#C7B7A6" strokeWidth="2.5" />
        <path d="M52 94 C122 68 215 72 291 91" fill="none" stroke="#B9947D" strokeWidth="11" strokeLinecap="round" />
        <path d="M292 92 C319 103 331 123 325 145 C319 163 306 177 291 188" fill="none" stroke="#B9947D" strokeWidth="13" strokeLinecap="round" />
        <path d="M49 129 C91 151 133 164 182 157 C231 150 282 145 324 157 C301 185 252 202 194 201 C129 199 77 170 49 129Z"
          fill="url(#alifly-tongue)" stroke="#B96F73" strokeWidth="2.5" />
        <path d="M24 107 C35 101 44 102 54 109 M24 132 C36 140 46 140 55 133"
          fill="none" stroke="#BD7778" strokeWidth="8" strokeLinecap="round" />
        <path d="M49 99 L78 94 L94 119 L54 126Z M50 133 L87 136 L101 157 L56 148Z"
          fill="#FFFFFF" stroke="#B9ADA1" strokeWidth="2" strokeLinejoin="round" />
        <path d="M105 92 C151 79 207 80 250 91" fill="none" stroke="#D8A5A0" strokeWidth="3" strokeLinecap="round" />
        <path d="M42 183 C66 205 91 213 124 216" fill="none" stroke="#B9A28F" strokeWidth="2" strokeLinecap="round" opacity=".7" />

        {isOpenCavity ? (
          <>
            <path d="M91 119 C150 102 237 107 305 130" fill="none" stroke="#8AC5A0" strokeWidth="19" strokeLinecap="round" opacity=".24" />
            <path d="M91 119 C150 102 237 107 305 130" fill="none" stroke="#36885D" strokeWidth="4" strokeLinecap="round" strokeDasharray="3 11" />
            <path d="M195 102 L195 77 M186 86 L195 77 L204 86" fill="none" stroke="#36885D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          </>
        ) : (
          <>
            <circle cx={pointX} cy={pointY} r={zoneRadius + 8} fill="#A5D95B" opacity=".25" filter="url(#alifly-zone-glow)" />
            <circle cx={pointX} cy={pointY} r={zoneRadius} fill="#B8E76C" opacity=".88" stroke="#548B36" strokeWidth="3" />
            <circle cx={pointX} cy={pointY} r="4.5" fill="#285B45" stroke="#FFFFFF" strokeWidth="2" />
          </>
        )}
      </svg>
    </section>
  );
}

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

const stageThreeLessons: Lesson[] = [
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
  const alreadyMigrated = ids.some((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 34));
  const normalized = alreadyMigrated
    ? ids.filter((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 34) || (id >= 6 && id <= 8))
    : ids.flatMap((id) => legacyAlphabetProgress[id] ?? ((id >= 6 && id <= 8) ? [id] : []));
  return [...new Set(normalized)];
}

function normalizeDailyLessonIds(value: unknown): number[] {
  if (!Array.isArray(value)) return [];
  const ids = value.filter((id): id is number => Number.isInteger(id));
  const alreadyMigrated = ids.some((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 34));
  const normalized = alreadyMigrated
    ? ids.filter((id) => (id >= 20 && id <= 28) || (id >= 30 && id <= 34) || (id >= 6 && id <= 8))
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

export default function App() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const routeHandled = useRef<string | null>(null);
  const isLessonsRoute = location.pathname === "/lessons";
  const isAlifRoute = location.pathname === "/lessons/alif";
  const isLoginRoute = location.pathname === "/login";
  const seoTitle = isAlifRoute
    ? "Алиф — первая буква арабского алфавита | ALIFLY"
    : isLessonsRoute
      ? "Уроки арабского языка с нуля | ALIFLY"
      : isLoginRoute
        ? "Вход в аккаунт ALIFLY | Сохранение прогресса"
        : "ALIFLY — арабский язык с нуля | Уроки и практика";
  const seoDescription = isAlifRoute
    ? "Изучи арабскую букву алиф: форма, название, произношение и первое упражнение в интерактивном уроке ALIFLY."
    : isLessonsRoute
      ? "Последовательные бесплатные уроки арабского языка для начинающих: алфавит, огласовки, чтение и практика."
      : isLoginRoute
        ? "Войди в аккаунт ALIFLY, чтобы синхронизировать прогресс и продолжать обучение на разных устройствах."
        : "Изучайте арабский язык с нуля вместе с ALIFLY: интерактивные уроки алфавита, произношение букв, огласовки, упражнения и отслеживание прогресса.";
  const canonicalUrl = `https://iamaldamov.github.io/alifly${location.pathname === "/" ? "/" : location.pathname}`;
  const dailyUserId = user?.uid ?? "guest";
  const [dailyGoal, setDailyGoal] = useState<DailyGoal>(() => readDailyGoal("guest"));
  const [dailyActivity, setDailyActivity] = useState<DailyActivity>(() => readDailyActivity("guest"));
  const [cloudReady, setCloudReady] = useState(false);
  const [cloudSaveStatus, setCloudSaveStatus] = useState<"idle" | "loading" | "pending" | "saving" | "saved" | "error">("idle");
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [lessonPhase, setLessonPhase] = useState<"study" | "practice">("study");
  const [showAlphabetTips, setShowAlphabetTips] = useState(false);
  const [activeLetterIndex, setActiveLetterIndex] = useState(0);
  const letterTouchStartX = useRef<number | null>(null);
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
      return localStorage.getItem("alifly-theme") === "light" ? "light" : "dark";
    } catch {
      return "dark";
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
      type CloudProgress = { completed_lesson_ids?: unknown; mistakes?: unknown; streak?: number; last_study_date?: string | null; exam_passed?: boolean; daily_goal?: number; daily_activity?: unknown };
      let data: CloudProgress | null = null;
      try {
        const progressRef = doc(db, "users", user.uid, "progress", "current");
        const snapshot = await getDoc(progressRef);
        if (snapshot.exists()) data = snapshot.data() as CloudProgress;
      } catch (error) {
        if (cancelled) return;
        console.error("ALIFLY: could not load cloud progress", error);
        setCloudSaveStatus("error");
        return;
      }

      if (cancelled) return;

      let previousCloudUserId = "";
      try {
        previousCloudUserId = localStorage.getItem("alifly-last-cloud-user-id") || "";
      } catch {
        // Cloud data remains authoritative when local storage is unavailable.
      }

      if (data) {
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
      } else if (previousCloudUserId && previousCloudUserId !== user.uid) {
        // A different person signed in on this device. Do not copy the previous
        // person's local learning history into the new account.
        setCompletedLessonIds([]);
        setMistakes([]);
        setStreak(0);
        setLastStudyDate("");
        setExamPassed(false);
        setDailyGoal(1);
        setDailyActivity({ date: "", lessonIds: [] });
      }

      try {
        localStorage.setItem("alifly-last-cloud-user-id", user.uid);
      } catch {
        // The authenticated cloud account still works without local storage.
      }

      setCloudSaveStatus(data ? "saved" : "pending");
      setCloudReady(true);
    };

    void loadProgress();
    return () => { cancelled = true; };
  }, [user?.uid]);

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
  }, [user?.uid, cloudReady, completedLessonIds, mistakes, streak, lastStudyDate, examPassed, dailyGoal, dailyActivity]);


  const updateDailyGoal = (goal: DailyGoal) => {
    setDailyGoal(goal);
    try {
      localStorage.setItem(dailyGoalStorageKey(dailyUserId), String(goal));
    } catch {
      // The daily goal remains available for this session if storage is blocked.
    }
  };

  const closeStage = () => {
    if (location.pathname === "/lessons/alif") navigate("/lessons");
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
    setShowAlphabetTips(false);
    setActiveLetterIndex(0);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setTypedAnswer("");
    setCorrectAnswers(0);
    setLessonFinished(false);
    setReviewMode(false);
    setReviewMistakeIds([]);
    setExamMode(false);
    if (lesson.id === 20 && location.pathname !== "/lessons/alif") navigate("/lessons/alif");
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

  useEffect(() => {
    if (isLessonsRoute && routeHandled.current !== location.pathname) {
      if (routeHandled.current === "/lessons/alif") closeStage();
      routeHandled.current = location.pathname;
      window.requestAnimationFrame(() => {
        document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" });
      });
      return;
    }

    if (location.pathname === "/" && routeHandled.current === "/lessons/alif") {
      routeHandled.current = "/";
      closeStage();
      return;
    }

    if (isAlifRoute && routeHandled.current !== location.pathname) {
      routeHandled.current = location.pathname;
      setSelectedStage(stages[0]);
      startLesson(lessons[0]);
    }
  }, [location.pathname]);

  const currentQuestion = selectedLesson?.questions[questionIndex];
  const currentQuestionCorrect = currentQuestion && selectedAnswer !== null
    ? isCorrectAnswer(currentQuestion, selectedAnswer)
    : false;
  const firstStageCompletedCount = lessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length;
  const progressPercent = Math.round((firstStageCompletedCount / lessons.length) * 100);
  const today = localDateKey();
  const dailyCompletedCount = dailyActivity.date === today ? dailyActivity.lessonIds.length : 0;
  const stageTwoUnlocked = examPassed;
  const stageThreeUnlocked = stageTwoLessons.every((lesson) => completedLessonIds.includes(lesson.id));

  return (
    <main className="app">
      <Seo title={seoTitle} description={seoDescription} url={canonicalUrl} noIndex={isLoginRoute} />
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
          <AuthPanel cloudStatus={cloudSaveStatus} openOnMount={isLoginRoute} onClose={() => { if (isLoginRoute) navigate("/"); }} />
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

      <section className="hero">
        <div className="hero-content">
          <div className="hero-overline">
            <span className="hero-overline-line" />
            <span>АРАБСКИЙ · С НУЛЯ</span>
            <span className="hero-overline-index">01 / 03</span>
          </div>
          <h1>Открой для себя <span>арабский язык.</span></h1>
          <p>Понятный путь от первой буквы до уверенного чтения. Короткие уроки и заметный прогресс — в твоём темпе.</p>
          <div className="hero-actions">
            <button className="primary-button" data-touch-hint="Перейди к программе и начни с первого короткого урока" onClick={() => {
                if (location.pathname !== "/lessons") navigate("/lessons");
                else document.getElementById("learning-path")?.scrollIntoView({ behavior: "smooth" });
              }}>
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
        onGoalChange={updateDailyGoal}
      />

      <section className="progress-section">
        <div>
          <span className="section-label">ТВОЙ ПРОГРЕСС</span>
          <h2>Каждый шаг важен</h2>
        </div>
        <div className="progress-card">
          <div className="progress-info"><span>{firstStageCompletedCount} из {lessons.length} коротких уроков</span><strong>{progressPercent}%</strong></div>
          <div className="progress-track"><div className="progress-fill" style={{ width: `${progressPercent}%` }} /></div>
          <p>{firstStageCompletedCount === lessons.length ? "Все девять уроков алфавита завершены. Отличная работа!" : "Пройди уроки по порядку и возвращайся к ним для повторения."}</p>
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
          <span className="stage-count">3 этапа</span>
        </div>
        <div className="stage-list">
          {stages.map((stage) => {
            const unlocked = stage.id === 1 || (stage.id === 2 && stageTwoUnlocked) || (stage.id === 3 && stageThreeUnlocked);
            return (
              <button className={`stage-card ${unlocked ? "" : "stage-locked"}`} key={stage.id} data-touch-hint={unlocked ? `Открой этап «${stage.title}» и выбери доступный урок` : undefined} disabled={!unlocked} onClick={() => { setSelectedStage(stage); setSelectedLesson(null); }}>
                <span className="stage-icon">{stage.icon}</span>
                <span className="stage-info">
                  <span className="stage-number">ЭТАП {stage.id}</span>
                  <strong>{stage.title}</strong>
                  <span className="stage-description">{stage.description}</span>
                  <span className="lesson-count">{stage.id === 1 ? `${firstStageCompletedCount}/${lessons.length} уроков алфавита` : stage.id === 2 && unlocked ? "Открыт после экзамена" : stage.id === 3 ? `${stageThreeLessons.filter((lesson) => completedLessonIds.includes(lesson.id)).length}/5 уроков знакомства` : `${stage.lessons} уроков`}</span>
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
        <a className="support-project-button" href="https://t.me/tribute/app?startapp=g6Qg" target="_blank" rel="noreferrer">
          Поддержать проект <span aria-hidden="true">↗</span>
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
                    <p className="modal-note">Пять уроков на современном литературном арабском (MSA). Сначала изучи фразы в ситуации, затем вспомни их перевод и звучание без подсказки.</p>
                    {stageThreeLessons.map((lesson, index) => {
                      const previousLesson = index > 0 ? stageThreeLessons[index - 1] : undefined;
                      const isOpen = index === 0 || (previousLesson !== undefined && completedLessonIds.includes(previousLesson.id));
                      const isCompleted = completedLessonIds.includes(lesson.id);
                      return (
                        <button key={lesson.id} className={`lesson-pick ${isCompleted ? "lesson-pick-done" : ""}`} disabled={!isOpen} onClick={() => startLesson(lesson)}>
                          <span className="lesson-pick-number">{isCompleted ? "✓" : String(index + 1).padStart(2, "0")}</span>
                          <span className="lesson-pick-text">
                            <strong>{lesson.title}</strong>
                            <small>{lesson.studyCards?.length ?? 0} фраз · {lesson.questions.length} заданий</small>
                          </span>
                          <span className="lesson-pick-state">{isCompleted ? "Пройден" : isOpen ? "Начать →" : "🔒"}</span>
                        </button>
                      );
                    })}
                    <p className="local-progress-note">Следующий урок откроется после завершения предыдущего. Прогресс сохраняется на устройстве и в аккаунте.</p>
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
                        if (!("speechSynthesis" in window)) return;
                        const arabicName = arabicLetterNames[letter.character];
                        if (!arabicName) return;

                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance(arabicName);
                        const arabicVoices = window.speechSynthesis.getVoices()
                          .filter((voice) => voice.lang.toLowerCase().startsWith("ar"));
                        const preferredVoice =
                          arabicVoices.find((voice) => voice.lang.toLowerCase() === "ar-sa") ??
                          arabicVoices.find((voice) => voice.lang.toLowerCase() === "ar") ??
                          arabicVoices[0];

                        utterance.lang = "ar-SA";
                        if (preferredVoice) utterance.voice = preferredVoice;
                        utterance.rate = 0.78;
                        utterance.pitch = 1;
                        utterance.volume = 1;
                        window.speechSynthesis.speak(utterance);
                      };
                      const moveLetter = (direction: -1 | 1) => {
                        setActiveLetterIndex((current) => Math.max(0, Math.min(selectedLesson.letters.length - 1, current + direction)));
                      };
                      return (
                        <div className="alphabet-flashcards">
                          <div className="letter-learning-hint">
                            <span className="letter-hint-icon">ا</span>
                            <p><strong>Изучай по одной букве</strong><small>Посмотри на форму, послушай название и повтори его вслух. Листай карточки в своём темпе.</small></p>
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
                            <button className="letter-speak-button" type="button" onClick={speakLetter} aria-label={`Прослушать название буквы ${letter.character}`} data-touch-hint="Прослушай произношение этой буквы на арабском" title="Прослушать">
                              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4Z" /><path d="M16 9.5a4 4 0 0 1 0 5M18.5 7a7.5 7.5 0 0 1 0 10" /></svg>
                            </button>
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
                                onClick={() => setActiveLetterIndex(index)}
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
