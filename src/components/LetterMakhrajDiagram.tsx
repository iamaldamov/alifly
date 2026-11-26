import type { ReactElement } from "react";

type Group =
  | "jawf" | "lips" | "rounded-lips" | "lip-teeth" | "tip-roots"
  | "interdental" | "tip-sibilants" | "tip-gums" | "middle-tongue"
  | "side-tongue" | "lam" | "back-qaf" | "back-kaf"
  | "throat-deep" | "throat-middle" | "throat-near";

type Info = { group: Group; title: string; instruction: string; view?: "top" };

const articulation: Record<string, Info> = {
  "ا": { group: "jawf", title: "Открытая полость рта", instruction: "Рот открыт. Язык не касается нёба: воздух проходит свободно, а гласный звук тянется." },
  "ب": { group: "lips", title: "Обе губы", instruction: "Мягко сомкни верхнюю и нижнюю губы, затем коротко раскрой их." },
  "ت": { group: "tip-roots", title: "Кончик языка у верхних зубов", instruction: "Кончик языка касается основания верхних передних зубов и сразу отходит." },
  "ث": { group: "interdental", title: "Язык между зубами", instruction: "Слегка покажи кончик языка между верхними и нижними передними зубами. Выпусти воздух без голоса." },
  "ج": { group: "middle-tongue", title: "Середина языка и нёбо", instruction: "Подними середину языка к твёрдому нёбу, оставив небольшой проход." },
  "ح": { group: "throat-middle", title: "Средняя часть горла", instruction: "Сузь среднюю часть глотки и выпусти ровный глухой звук без резкого русского «х»." },
  "خ": { group: "throat-near", title: "Верхняя часть горла", instruction: "Создай трение в верхней части горла, ближе ко рту." },
  "د": { group: "tip-roots", title: "Кончик языка у верхних зубов", instruction: "Коснись кончиком языка основания верхних передних зубов и отведи его со звонким звуком." },
  "ذ": { group: "interdental", title: "Язык между зубами", instruction: "Слегка покажи кончик языка между зубами и произнеси звук с голосом." },
  "ر": { group: "tip-gums", title: "Кончик языка у дёсен", instruction: "Коснись области за верхними передними зубами. Не раскатывай звук слишком долго." },
  "ز": { group: "tip-sibilants", title: "Узкий проход у передних зубов", instruction: "Оставь узкий проход для воздуха у передних зубов; голосовые связки работают." },
  "س": { group: "tip-sibilants", title: "Узкий проход у передних зубов", instruction: "Оставь узкий проход для воздуха у передних зубов; голосовые связки не работают." },
  "ش": { group: "middle-tongue", title: "Середина языка и нёбо", instruction: "Приподними середину языка к нёбу, оставив широкий проход для воздуха." },
  "ص": { group: "tip-sibilants", title: "Передняя часть языка и задний подъём", instruction: "Сформируй узкий проход у передних зубов и одновременно приподними заднюю часть языка." },
  "ض": { group: "side-tongue", title: "Бок языка у коренных зубов", instruction: "Прижми боковую сторону языка к верхним коренным зубам. Схема показывает область контакта сверху.", view: "top" },
  "ط": { group: "tip-roots", title: "Кончик языка у верхних зубов", instruction: "Коснись основания верхних передних зубов; задняя часть языка приподнята." },
  "ظ": { group: "interdental", title: "Язык у края верхних зубов", instruction: "Покажи кончик языка у края верхних зубов; произнеси звук с голосом и подъёмом задней части языка." },
  "ع": { group: "throat-middle", title: "Средняя часть горла", instruction: "Сформируй звук сужением средней части глотки. Не заменяй его обычным гласным." },
  "غ": { group: "throat-near", title: "Верхняя часть горла", instruction: "Создай трение в верхней части горла и добавь голос." },
  "ف": { group: "lip-teeth", title: "Верхние зубы и нижняя губа", instruction: "Коснись внутренней стороны нижней губы краем верхних передних зубов." },
  "ق": { group: "back-qaf", title: "Самая задняя часть языка", instruction: "Подними заднюю часть языка к мягкому нёбу, ближе к горлу." },
  "ك": { group: "back-kaf", title: "Задняя часть языка", instruction: "Подними заднюю часть языка к нёбу, но немного ближе ко рту, чем для ق." },
  "ل": { group: "lam", title: "Кончик и края языка у дёсен", instruction: "Передняя часть языка касается области верхних дёсен за передними зубами." },
  "م": { group: "lips", title: "Обе сомкнутые губы", instruction: "Мягко сомкни губы; звук сопровождается носовым резонансом." },
  "ن": { group: "tip-gums", title: "Кончик языка у верхних дёсен", instruction: "Коснись кончиком языка области за верхними передними зубами; звук имеет носовой резонанс." },
  "ه": { group: "throat-deep", title: "Глубина горла", instruction: "Выпусти лёгкий выдох из глубины горла, без сильного трения." },
  "و": { group: "rounded-lips", title: "Округлённые губы", instruction: "Округли губы и слегка выдвини их вперёд, не смыкая." },
  "ي": { group: "middle-tongue", title: "Середина языка и нёбо", instruction: "Подними середину языка к твёрдому нёбу." },
};

const contact: Record<Group, { x: number; y: number }> = {
  jawf: { x: 250, y: 168 }, lips: { x: 77, y: 174 }, "rounded-lips": { x: 77, y: 174 },
  "lip-teeth": { x: 102, y: 174 }, "tip-roots": { x: 148, y: 132 }, interdental: { x: 130, y: 158 },
  "tip-sibilants": { x: 165, y: 153 }, "tip-gums": { x: 174, y: 128 }, "middle-tongue": { x: 282, y: 119 },
  "side-tongue": { x: 275, y: 175 }, lam: { x: 175, y: 129 }, "back-qaf": { x: 395, y: 124 },
  "back-kaf": { x: 355, y: 128 }, "throat-deep": { x: 458, y: 166 }, "throat-middle": { x: 426, y: 166 },
  "throat-near": { x: 395, y: 166 },
};

export default function LetterMakhrajDiagram({ letter }: { letter: string }): ReactElement {
  const info: Info = articulation[letter] ?? { group: "middle-tongue", title: "Место образования звука", instruction: "Посмотри на выделенную область." };
  const point = contact[info.group];
  const topView = info.view === "top";
  return (
    <section className="letter-makhraj" aria-label={`Как произносить букву ${letter}`}>
      <div className="letter-makhraj-heading">
        <strong>Где образуется звук?</strong>
        <small>{topView ? "Вид сверху · показана верхняя челюсть" : "Вид сбоку · губы слева, горло справа"}</small>
      </div>
      {topView ? (
        <svg className="letter-mouth-diagram" viewBox="0 0 560 300" role="img" aria-label="Вид сверху: боковая часть языка касается верхних коренных зубов.">
          <path d="M105 48 Q280 -4 455 48 Q520 150 455 252 Q280 304 105 252 Q40 150 105 48Z" fill="#F0DCC8" stroke="#9C806B" strokeWidth="5"/>
          <path d="M130 76 Q280 20 430 76 Q480 150 430 224 Q280 280 130 224 Q80 150 130 76Z" fill="#FFFDF8" stroke="#B6A18E" strokeWidth="4"/>
          <path d="M168 91 Q280 48 392 91 Q432 150 392 209 Q280 250 168 209 Q128 150 168 91Z" fill="#D9898D" stroke="#9F5965" strokeWidth="4"/>
          <g fill="#fff" stroke="#9C806B" strokeWidth="3">
            <rect x="98" y="85" width="43" height="34" rx="9"/><rect x="78" y="132" width="43" height="34" rx="9"/><rect x="98" y="180" width="43" height="34" rx="9"/>
            <rect x="419" y="85" width="43" height="34" rx="9"/><rect x="439" y="132" width="43" height="34" rx="9"/><rect x="419" y="180" width="43" height="34" rx="9"/>
          </g>
          <path d="M155 102 Q130 150 155 198" fill="none" stroke="#C6F432" strokeWidth="19" strokeLinecap="round"/>
          <circle cx="150" cy="150" r="19" fill="#C6F432" stroke="#315A39" strokeWidth="5"/>
          <path d="M170 150 L228 150" stroke="#315A39" strokeWidth="4" strokeDasharray="7 7"/>
          <text x="280" y="287" textAnchor="middle" fontSize="18" fontWeight="800" fill="#315A39">БОК ЯЗЫКА ПРИЖАТ К ЗУБАМ</text>
        </svg>
      ) : (
        <svg className="letter-mouth-diagram" viewBox="0 0 560 300" role="img" aria-label={`Схема сбоку: губы, зубы, нёбо, язык и горло. Зелёным выделена область для буквы ${letter}.`}>
          <defs>
            <linearGradient id="alifly-new-head" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F6E8D8"/><stop offset="1" stopColor="#D7BFA8"/></linearGradient>
            <linearGradient id="alifly-new-tongue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E9A2A0"/><stop offset="1" stopColor="#B96970"/></linearGradient>
          </defs>
          <path d="M35 155 Q55 68 170 34 Q315 -2 420 62 Q474 96 516 151 L536 168 L503 184 L520 204 Q470 264 365 270 L170 270 Q70 255 48 205 L24 181Z" fill="url(#alifly-new-head)" stroke="#927A67" strokeWidth="4"/>
          <path d="M55 154 Q145 105 260 105 Q365 103 438 146 Q472 166 455 196 Q390 222 300 212 Q175 202 57 184Z" fill="#FFFDF8" stroke="#A8B2A3" strokeWidth="3"/>
          <path d="M78 140 Q190 86 325 103 Q395 111 439 146" fill="none" stroke="#A88F7B" strokeWidth="18" strokeLinecap="round"/>
          <path d="M439 146 Q475 174 449 220" fill="none" stroke="#A88F7B" strokeWidth="17" strokeLinecap="round"/>
          <path d="M76 188 Q145 194 213 204 Q306 222 394 194 Q360 253 260 252 Q145 251 76 188Z" fill="url(#alifly-new-tongue)" stroke="#9F5965" strokeWidth="4"/>
          <path d="M53 150 Q35 165 57 183" fill="none" stroke="#A85E66" strokeWidth="10" strokeLinecap="round"/>
          <path d="M63 143 L104 132 L124 160 L65 166Z M64 174 L111 176 L126 199 L66 192Z" fill="#fff" stroke="#9C806B" strokeWidth="3"/>
          <path d="M105 124 Q170 107 239 111" fill="none" stroke="#C8B5A4" strokeWidth="3"/>
          <path d="M105 191 Q180 205 256 211" fill="none" stroke="#C6F432" strokeWidth="12" opacity=".45" strokeLinecap="round"/>
          <circle cx={point.x} cy={point.y} r="25" fill="#C6F432" opacity=".24"/>
          <circle cx={point.x} cy={point.y} r="13" fill="#C6F432" stroke="#315A39" strokeWidth="5"/>
          <path d={`M${point.x} ${point.y} L${Math.max(50,Math.min(500,point.x+36))} ${Math.max(28,point.y-44)}`} stroke="#315A39" strokeWidth="3" strokeDasharray="6 5" fill="none"/>
          <g fill="#315A39" fontSize="16" fontWeight="800">
            <text x="50" y="292">ГУБЫ</text><text x="150" y="80">ЗУБЫ</text><text x="290" y="68">НЁБО</text><text x="310" y="248">ЯЗЫК</text><text x="515" y="292" textAnchor="end">ГОРЛО</text>
          </g>
        </svg>
      )}
      <div className="letter-makhraj-target"><span aria-hidden="true">●</span> {info.title}</div>
      <div className="letter-makhraj-copy">
        <strong>Что делать языком и губами</strong>
        <p>{info.instruction}</p>
        <small className="letter-makhraj-disclaimer">Схема учебная и упрощённая. Она показывает основную область артикуляции, а не заменяет образец произношения и проверку преподавателя.</small>
      </div>
    </section>
  );
}
