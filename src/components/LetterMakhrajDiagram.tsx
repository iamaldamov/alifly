import type { ReactElement } from "react";

type Place="open"|"lips"|"lip-teeth"|"teeth"|"between"|"alveolar"|"sibilant"|"palate"|"side"|"velum"|"pharynx"|"glottis";
type Info={place:Place;title:string;instruction:string;emphatic?:boolean};
const data:Record<string,Info>={
"ا":{place:"open",title:"Открытая полость рта",instruction:"Рот открыт, язык не перекрывает проход воздуха. Долгий гласный звучит ровно."},
"ب":{place:"lips",title:"Губы",instruction:"Полностью сомкни верхнюю и нижнюю губы, затем мягко раскрой их со звуком «б»."},
"ت":{place:"teeth",title:"Кончик языка у верхних зубов",instruction:"Коснись кончиком языка основания верхних передних зубов и сразу отпусти."},
"ث":{place:"between",title:"Между передними зубами",instruction:"Слегка помести кончик языка между зубами и выпусти воздух без голоса."},
"ج":{place:"palate",title:"Середина языка у нёба",instruction:"Подними середину языка к твёрдому нёбу, оставив небольшой проход."},
"ح":{place:"pharynx",title:"Средняя часть глотки",instruction:"Создай мягкое сужение в средней части глотки и выдохни без голоса."},
"خ":{place:"velum",title:"Задняя часть языка у мягкого нёба",instruction:"Подними заднюю часть языка к мягкому нёбу и создай глухое трение."},
"د":{place:"teeth",title:"Кончик языка у верхних зубов",instruction:"Коснись кончиком языка основания верхних передних зубов и отпусти со звонким звуком."},
"ذ":{place:"between",title:"Между передними зубами",instruction:"Слегка покажи кончик языка между зубами и произнеси звук с голосом."},
"ر":{place:"alveolar",title:"Область за верхними зубами",instruction:"Коснись кончиком языка бугорка за верхними передними зубами; сделай короткий лёгкий удар."},
"ز":{place:"sibilant",title:"Узкий проход у передних зубов",instruction:"Оставь узкий проход для воздуха за передними зубами; голос включён."},
"س":{place:"sibilant",title:"Узкий проход у передних зубов",instruction:"Оставь узкий проход для воздуха за передними зубами; голос не включай."},
"ش":{place:"palate",title:"Середина языка у нёба",instruction:"Приподними середину языка к нёбу и направь воздух через широкий проход."},
"ص":{place:"sibilant",title:"Передняя часть языка",instruction:"Сформируй узкий проход у передних зубов.",emphatic:true},
"ض":{place:"side",title:"Бок языка у коренных зубов",instruction:"Прижми боковую сторону языка к верхним коренным зубам; не заменяй звук обычным «д».",emphatic:true},
"ط":{place:"teeth",title:"Кончик языка у верхних зубов",instruction:"Коснись основания верхних передних зубов и произнеси твёрдый звук.",emphatic:true},
"ظ":{place:"between",title:"Край языка у верхних зубов",instruction:"Покажи кончик языка у края верхних зубов и произнеси звонкий твёрдый звук.",emphatic:true},
"ع":{place:"pharynx",title:"Средняя часть глотки",instruction:"Сформируй звук сужением средней части глотки; не заменяй его обычным гласным."},
"غ":{place:"velum",title:"Задняя часть языка у мягкого нёба",instruction:"Подними заднюю часть языка к мягкому нёбу и добавь голос к трению."},
"ف":{place:"lip-teeth",title:"Верхние зубы и нижняя губа",instruction:"Легко коснись верхними передними зубами внутренней стороны нижней губы."},
"ق":{place:"velum",title:"Самая задняя часть языка",instruction:"Подними заднюю часть языка к мягкому нёбу ближе к горлу."},
"ك":{place:"velum",title:"Задняя часть языка у нёба",instruction:"Подними заднюю часть языка к мягкому нёбу, немного ближе ко рту, чем для ق."},
"ل":{place:"alveolar",title:"Передняя часть языка у дёсен",instruction:"Коснись кончиком языка верхних дёсен за передними зубами."},
"م":{place:"lips",title:"Сомкнутые губы",instruction:"Мягко сомкни губы и пропусти голос через нос."},
"ن":{place:"alveolar",title:"Кончик языка у верхних дёсен",instruction:"Коснись кончиком языка области за верхними передними зубами; звук имеет носовой резонанс."},
"ه":{place:"glottis",title:"Голосовая щель",instruction:"Сделай лёгкий ровный выдох через открытую голосовую щель."},
"و":{place:"lips",title:"Округлённые губы",instruction:"Округли губы и слегка выдвини их вперёд, не смыкая."},
"ي":{place:"palate",title:"Середина языка у нёба",instruction:"Подними середину языка к твёрдому нёбу, оставив узкий проход."}
};
const points:Record<Place,[number,number]>={open:[260,175],lips:[77,180],"lip-teeth":[108,180],teeth:[150,137],between:[132,159],alveolar:[179,131],sibilant:[181,154],palate:[290,119],side:[248,191],velum:[378,136],pharynx:[430,168],glottis:[473,169]};
export default function LetterMakhrajDiagram({letter}:{letter:string}):ReactElement{
 const info=data[letter]??data["ا"];const [x,y]=points[info.place];const lips=info.place==="lips"||info.place==="lip-teeth";
 return <section className={`pronunciation-visual pronunciation-visual--${info.place}`} aria-label={`Произношение буквы ${letter}`}>
 <svg className="pronunciation-visual__svg" viewBox="0 0 560 310" role="img" aria-label={`Анатомический разрез речевого аппарата. Выделено место: ${info.title}`}>
 <defs><linearGradient id="pv-tissue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#DDE8DF" stopOpacity=".2"/><stop offset="1" stopColor="#AFC8B5" stopOpacity=".06"/></linearGradient><linearGradient id="pv-tongue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#B7D8C0"/><stop offset="1" stopColor="#719B80"/></linearGradient></defs>
 <path d="M34 166 C42 90 107 37 206 31 C307 24 390 61 432 112 C455 139 481 143 523 155 L523 210 C481 226 454 253 414 267 C320 301 174 290 92 251 C50 231 30 201 34 166Z" fill="url(#pv-tissue)" stroke="currentColor" strokeOpacity=".22" strokeWidth="2"/>
 <path d="M55 158 C103 108 175 87 256 91 C337 93 392 117 430 155 C447 173 440 204 418 220 C348 244 252 245 170 224 C112 209 77 191 55 176Z" fill="#16231C" fillOpacity=".4" stroke="#B8CDBD" strokeOpacity=".5" strokeWidth="2"/>
 <path d="M77 151 C147 102 243 91 329 111 C370 120 400 138 423 161" fill="none" stroke="#C8D8CD" strokeOpacity=".8" strokeWidth="14" strokeLinecap="round"/><path d="M423 161 C445 182 438 213 416 235" fill="none" stroke="#C8D8CD" strokeOpacity=".7" strokeWidth="13" strokeLinecap="round"/>
 <g fill="#E6EEE8" fillOpacity=".9" stroke="#9FB4A5" strokeWidth="2"><path d="M75 149 L113 135 L132 163 L82 171Z"/><path d="M79 178 L128 180 L143 207 L88 196Z"/><path d="M139 124 L164 119 L178 144 L145 151Z"/><path d="M146 193 L180 194 L193 219 L156 213Z"/></g>
 <g className="pronunciation-visual__tongue"><path d="M91 195 C151 198 195 190 239 180 C293 167 341 174 397 191 C375 240 311 257 236 251 C168 246 119 225 91 195Z" fill="url(#pv-tongue)" fillOpacity=".9" stroke="#D4E7D9" strokeOpacity=".75" strokeWidth="3"/><path d="M130 211 C206 222 284 221 353 204" fill="none" stroke="#E4F0E7" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round"/></g>
 {lips&&<g className="pronunciation-visual__lips"><path d="M36 158 Q62 145 87 159" fill="none" stroke="#D8AFA7" strokeWidth="9" strokeLinecap="round"/><path d="M36 187 Q62 201 87 185" fill="none" stroke="#D8AFA7" strokeWidth="9" strokeLinecap="round"/></g>}
 <path d="M437 156 C463 151 483 159 501 174" fill="none" stroke="#B7D0BE" strokeOpacity=".45" strokeWidth="5" strokeLinecap="round"/>
 <circle className="pronunciation-visual__halo" cx={x} cy={y} r="25"/><circle className="pronunciation-visual__point" cx={x} cy={y} r="8"/><path d={`M${x} ${y} l${x<180?34:-34} -28`} fill="none" stroke="#C6F432" strokeOpacity=".75" strokeWidth="2"/>
 </svg>
 <div className="pronunciation-visual__caption"><strong>{info.title}</strong><span>{info.instruction}</span>{info.emphatic&&<small>Также приподними заднюю часть языка: это придаёт звуку твёрдость.</small>}</div>
 </section>;
}
