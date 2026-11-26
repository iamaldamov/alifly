import type { ReactElement } from "react";

type Point =
  | "jawf" | "aqsa-halq" | "wasat-halq" | "adna-halq"
  | "qaf" | "kaf" | "wasat-lisan" | "daad" | "lam" | "nun"
  | "ra" | "ta" | "sin" | "tha" | "fa" | "lips";
type LetterInfo = {
  point: Point;
  title: string;
  instruction: string;
  note?: string;
  emphatic?: boolean;
  nasal?: boolean;
};

const letters: Record<string, LetterInfo> = {
  "ا": { point: "jawf", title: "Полость рта и горла", instruction: "Для долгого «а» оставь проход открытым: язык не касается нёба или зубов.", note: "Здесь показан алиф удлинения. Гортанная смычка хамзы — отдельный звук." },
  "ب": { point: "lips", title: "Две сомкнутые губы", instruction: "Мягко сомкни обе губы, на мгновение задержи воздух и раскрой их со звуком «б»." },
  "ت": { point: "ta", title: "Кончик языка у основания верхних зубов", instruction: "Прижми кончик языка к основанию верхних передних зубов и сразу отпусти." },
  "ث": { point: "tha", title: "Кончик языка у края верхних зубов", instruction: "Слегка покажи кончик языка у края верхних передних зубов и выпусти воздух." },
  "ج": { point: "wasat-lisan", title: "Середина языка у нёба", instruction: "Подними середину языка к твёрдому нёбу; звук начинается при кратком смыкании и раскрытии." },
  "ح": { point: "wasat-halq", title: "Средняя часть горла", instruction: "Сузь проход в средней части глотки и выдохни без голоса." },
  "خ": { point: "adna-halq", title: "Верхняя часть горла", instruction: "Создай трение в верхней части горла, ближе ко рту, без голоса." },
  "د": { point: "ta", title: "Кончик языка у основания верхних зубов", instruction: "Коснись кончиком языка основания верхних передних зубов и отпусти со звуком «д»." },
  "ذ": { point: "tha", title: "Кончик языка у края верхних зубов", instruction: "Слегка покажи кончик языка у края верхних передних зубов и произнеси звук с голосом." },
  "ر": { point: "ra", title: "Кончик языка за верхними зубами", instruction: "Коснись кончиком языка области нёба сразу за верхними передними зубами; не зажимай язык." },
  "ز": { point: "sin", title: "Узкий проход у передних зубов", instruction: "Оставь узкий канал для воздуха у передних зубов и включи голос." },
  "س": { point: "sin", title: "Узкий проход у передних зубов", instruction: "Оставь узкий канал для воздуха у передних зубов; голос не включай." },
  "ش": { point: "wasat-lisan", title: "Середина языка у нёба", instruction: "Приподними середину языка к нёбу и направь воздух через широкий проход." },
  "ص": { point: "sin", title: "Передняя часть языка у зубов", instruction: "Сформируй узкий проход у передних зубов и одновременно приподними заднюю часть языка.", emphatic: true },
  "ض": { point: "daad", title: "Боковая сторона языка у коренных зубов", instruction: "Прижми один бок языка к верхним коренным зубам. Не пытайся произнести этот звук кончиком языка.", emphatic: true },
  "ط": { point: "ta", title: "Кончик языка у основания верхних зубов", instruction: "Коснись кончиком языка основания верхних передних зубов; одновременно приподними заднюю часть языка.", emphatic: true },
  "ظ": { point: "tha", title: "Кончик языка у края верхних зубов", instruction: "Покажи кончик языка у края верхних передних зубов и добавь подъём задней части языка.", emphatic: true },
  "ع": { point: "wasat-halq", title: "Средняя часть горла", instruction: "Сформируй звук сужением средней части глотки; не заменяй его обычным гласным." },
  "غ": { point: "adna-halq", title: "Верхняя часть горла", instruction: "Создай трение в верхней части горла, ближе ко рту, с голосом." },
  "ف": { point: "fa", title: "Нижняя губа и верхние зубы", instruction: "Легко коснись верхними передними зубами внутренней стороны нижней губы и выпусти воздух." },
  "ق": { point: "qaf", title: "Самая задняя часть языка у мягкого нёба", instruction: "Подними заднюю часть языка к мягкому нёбу в самой глубине рта." },
  "ك": { point: "kaf", title: "Задняя часть языка у нёба", instruction: "Подними заднюю часть языка к нёбу немного ближе ко рту, чем для ق." },
  "ل": { point: "lam", title: "Край языка у верхних дёсен возле коренных зубов", instruction: "Прижми передний боковой край языка к верхним дёснам в области боковых зубов." },
  "م": { point: "lips", title: "Две сомкнутые губы", instruction: "Мягко сомкни обе губы и пропусти голос через нос.", nasal: true },
  "ن": { point: "nun", title: "Кончик языка у верхних дёсен", instruction: "Коснись кончиком языка верхних дёсен за передними зубами; звук имеет носовой резонанс.", nasal: true },
  "ه": { point: "aqsa-halq", title: "Самая глубокая часть горла", instruction: "Сделай лёгкий выдох через голосовую щель в глубине горла, не напрягая её." },
  "و": { point: "lips", title: "Округлённые губы", instruction: "Округли губы и слегка выдвини их вперёд, не смыкая.", note: "Это положение для согласного «у/в». При долгом гласном وْ после даммы звук тянется в полости рта." },
  "ي": { point: "wasat-lisan", title: "Середина языка у твёрдого нёба", instruction: "Подними середину языка к твёрдому нёбу, оставив узкий проход.", note: "Это положение для согласного «й». При долгом гласном يْ после касры звук тянется в полости рта." }
};

const locations: Record<Point, [number, number]> = {
  jawf: [255, 207],
  "aqsa-halq": [548, 237],
  "wasat-halq": [506, 207],
  "adna-halq": [462, 180],
  qaf: [397, 161],
  kaf: [365, 151],
  "wasat-lisan": [288, 147],
  daad: [286, 220],
  lam: [182, 191],
  nun: [160, 181],
  ra: [142, 168],
  ta: [124, 158],
  sin: [108, 146],
  tha: [91, 137],
  fa: [65, 182],
  lips: [42, 205]
};

export default function LetterMakhrajDiagram({ letter }: { letter: string }): ReactElement {
  const info = letters[letter] ?? letters["ا"];
  const [x, y] = locations[info.point];
  const frontTongue = ["lam", "nun", "ra", "ta", "sin", "tha"].includes(info.point);
  const backTongue = ["qaf", "kaf", "wasat-lisan", "daad"].includes(info.point);
  const throat = ["aqsa-halq", "wasat-halq", "adna-halq"].includes(info.point);
  const lipSound = info.point === "lips" || info.point === "fa";
  const bilabial = info.point === "lips" && letter !== "و";
  const roundedLip = letter === "و";
  const sideTongue = info.point === "daad";

  return (
    <section className={`pronunciation-visual pronunciation-visual--${info.point}${info.emphatic ? " pronunciation-visual--emphatic" : ""}`} aria-label={`Место образования буквы ${letter}`}>
      <div className="pronunciation-visual__meta"><span>ВИД СБОКУ</span><span>МЕСТО ЗВУКА</span></div>
      <svg className="pronunciation-visual__svg" viewBox="0 0 640 330" role="img" aria-label={`Схема речевого аппарата в разрезе. Выделено: ${info.title}`}>
        <defs>
          <linearGradient id="pv-tissue" x1="0" y1="0" x2="0.9" y2="1"><stop offset="0" stopColor="#D8E8DC" stopOpacity=".17"/><stop offset="1" stopColor="#A8C6B1" stopOpacity=".035"/></linearGradient>
          <linearGradient id="pv-tongue-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#C6DCCB"/><stop offset="1" stopColor="#789E83"/></linearGradient>
          <linearGradient id="pv-air" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#C6F432" stopOpacity="0"/><stop offset=".5" stopColor="#C6F432" stopOpacity=".85"/><stop offset="1" stopColor="#C6F432" stopOpacity="0"/></linearGradient>
        </defs>

        {/* Simplified sagittal anatomy: face/lips at left, throat at right. */}
        <path d="M22 182 C27 111 86 55 171 38 C249 22 329 35 385 70 C421 92 442 122 465 142 C488 161 533 173 589 179 L589 278 C541 279 498 298 442 306 C344 323 208 310 117 278 C57 256 23 222 22 182Z" fill="url(#pv-tissue)" stroke="currentColor" strokeOpacity=".2" strokeWidth="2"/>
        {/* Nasal passage and oral cavity. */}
        <path d="M79 126 C130 83 201 70 282 81 C326 87 355 101 380 123" fill="none" stroke="#B8CDBD" strokeOpacity=".62" strokeWidth="13" strokeLinecap="round"/>
        <path d="M82 153 C143 112 223 104 300 113 C355 120 392 141 420 166 C440 184 434 216 409 235 C354 267 270 274 194 255 C139 241 100 216 70 190" fill="#132019" fillOpacity=".34" stroke="#B8CDBD" strokeOpacity=".5" strokeWidth="2"/>
        {/* Hard palate, soft palate and pharynx wall. */}
        <path d="M78 151 C143 112 222 104 299 113 C329 117 353 125 372 138" fill="none" stroke="#D8E4DA" strokeOpacity=".9" strokeWidth="15" strokeLinecap="round"/>
        <path d="M372 138 Q397 142 407 164 Q412 173 406 182" fill="none" stroke="#D8E4DA" strokeOpacity=".82" strokeWidth="12" strokeLinecap="round"/>
        <path d="M423 161 C445 178 445 211 421 242" fill="none" stroke="#D8E4DA" strokeOpacity=".7" strokeWidth="13" strokeLinecap="round"/>
        {/* Upper and lower teeth. */}
        <g fill="#E7EEE8" fillOpacity=".94" stroke="#A8BBAE" strokeWidth="1.7">
          <path d="M69 151 L103 137 L119 160 L77 174Z"/><path d="M102 139 L128 132 L143 155 L117 164Z"/>
          <path d="M73 190 L116 191 L131 215 L84 210Z"/><path d="M112 195 L146 202 L157 225 L128 216Z"/>
          <path d="M145 124 L168 119 L181 140 L151 148Z"/>
        </g>
        {/* Jaw and tongue. */}
        <path d="M64 221 C119 270 207 293 315 286 C361 283 398 269 421 244" fill="none" stroke="#C9D8CD" strokeOpacity=".36" strokeWidth="8" strokeLinecap="round"/>
        <path d="M91 238 C141 249 174 237 207 214 C246 186 293 174 337 184 C365 190 387 206 405 225 C386 259 335 278 273 279 C192 281 128 263 91 238Z" fill="url(#pv-tongue-fill)" fillOpacity=".94" stroke="#D9E8DC" strokeOpacity=".8" strokeWidth="2.5"/>
        <path d="M108 239 C170 250 222 226 267 207 C315 188 357 202 386 224" fill="none" stroke="#EFF6F0" strokeOpacity=".38" strokeWidth="3" strokeLinecap="round"/>
        {/* The highlighted articulator moves, not the whole illustration. */}
        <g className={frontTongue ? "pv-moving pv-moving--front" : backTongue ? "pv-moving pv-moving--back" : "pv-moving"}>
          <path d={frontTongue ? "M92 237 C128 244 164 233 199 214" : backTongue ? "M292 205 C329 183 368 195 395 222" : "M184 226 C230 199 280 187 326 190"} fill="none" stroke="#C6F432" strokeOpacity=".78" strokeWidth="5" strokeLinecap="round"/>
        </g>
        <g className={throat ? "pv-throat pv-throat--active" : "pv-throat"}>
          <path d="M432 174 Q446 199 429 228" fill="none" stroke="#C6F432" strokeOpacity=".72" strokeWidth="5" strokeLinecap="round"/>
        </g>
        <g className={bilabial ? "pv-lips pv-lips--active" : roundedLip ? "pv-lips pv-lips--rounded" : "pv-lips"}>
          <path d="M26 179 Q48 166 75 179" fill="none" stroke="#D9B7AF" strokeWidth="8" strokeLinecap="round"/>
          <path className={info.point === "fa" ? "pv-lip-lower pv-lip-lower--active" : "pv-lip-lower"} d="M26 195 Q49 210 75 195" fill="none" stroke="#D9B7AF" strokeWidth="8" strokeLinecap="round"/>
        </g>
        {info.emphatic && <path className="pv-emphasis pv-emphasis--active" d="M300 244 Q346 218 388 235" fill="none" stroke="#C6F432" strokeOpacity=".8" strokeWidth="5" strokeLinecap="round"/>}
        {/* Airflow is shown only for sounds with an open passage. */}
        <path className="pv-airflow" d="M45 186 C112 177 180 179 245 184 C315 189 370 184 421 197" fill="none" stroke="url(#pv-air)" strokeWidth="3" strokeDasharray="7 9" strokeLinecap="round"/>
        {/* Articulation focus. */}
        <circle className="pronunciation-visual__halo" cx={x} cy={y} r="23"/>
        <circle className="pronunciation-visual__point" cx={x} cy={y} r="7"/>
        <path d={`M${x} ${y} l${x < 180 ? 30 : -30} -25`} fill="none" stroke="#C6F432" strokeOpacity=".8" strokeWidth="2"/>
        {info.nasal && <g className="pv-nasal-focus"><circle cx="238" cy="82" r="15"/><circle cx="238" cy="82" r="5"/></g>}
        {sideTongue && (
          <g className="pv-inset">
            <rect x="456" y="12" width="166" height="106" rx="14"/>
            <text x="539" y="29" textAnchor="middle">ВИД СВЕРХУ</text>
            <path d="M478 47 Q539 32 600 47 L592 94 Q539 109 486 94Z"/>
            <path d="M514 48 Q539 41 564 48 L570 84 Q539 99 508 84Z"/>
            <path d="M485 67 Q500 57 511 63" fill="none" stroke="#C6F432" strokeWidth="5" strokeLinecap="round"/>
            <circle cx="500" cy="62" r="8"/>
          </g>
        )}
      </svg>
      <div className="pronunciation-visual__caption">
        <strong>{info.title}</strong>
        <span>{info.instruction}</span>
        {info.emphatic && <small>Твёрдая буква: задняя часть языка дополнительно приподнимается.</small>}
        {info.nasal && <small>Носовой резонанс отмечен отдельной точкой в носовом проходе; основное место образования звука показано на схеме.</small>}
        {info.note && <small>{info.note}</small>}
      </div>
      <span className="pronunciation-visual__disclaimer">Схема учебная и упрощённая. Точное произношение закрепляй по образцу преподавателя.</span>
    </section>
  );
}
