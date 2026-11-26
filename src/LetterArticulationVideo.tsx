import "./letter-articulation-video.css";

type Group = "jawf" | "lips" | "rounded-lips" | "lip-teeth" | "tip-roots" | "interdental" | "tip-sibilants" | "tip-gums" | "middle-tongue" | "side-tongue" | "lam" | "back-qaf" | "back-kaf" | "throat-deep" | "throat-middle" | "throat-near";
type Articulation = { group: Group; title: string; description: string };
const byLetter: Record<string, Articulation> = {
"ا":{group:"jawf",title:"Полость рта",description:"Долгий звук проходит через свободную полость рта. Язык не прижимается к нёбу; сохраняй правильную длительность гласного."},
"ب":{group:"lips",title:"Две губы",description:"Мягко сомкни обе губы, затем раскрой их. Не добавляй после буквы лишний гласный звук."},
"ت":{group:"tip-roots",title:"Корни верхних передних зубов",description:"Кончик языка касается области корней верхних резцов и быстро отходит."},
"ث":{group:"interdental",title:"Межзубное положение",description:"Кончик языка слегка показывается между передними зубами; воздух проходит без голоса."},
"ج":{group:"middle-tongue",title:"Середина языка и твёрдое нёбо",description:"Середина языка поднимается к твёрдому нёбу. Не заменяй звук привычным русским сочетанием."},
"ح":{group:"throat-middle",title:"Средняя часть горла",description:"Звук образуется в средней части глотки; это не обычный русский «х»."},
"خ":{group:"throat-near",title:"Верхняя часть горла",description:"Звук образуется в верхней части горла, ближе ко рту, с характерным трением."},
"د":{group:"tip-roots",title:"Корни верхних передних зубов",description:"Кончик языка касается области корней верхних резцов и отходит со звонким звуком."},
"ذ":{group:"interdental",title:"Межзубное положение",description:"Кончик языка слегка показывается между передними зубами; звук произносится с голосом."},
"ر":{group:"tip-gums",title:"Кончик языка у дёсен",description:"Кончик языка касается области верхних дёсен за передними зубами. Не делай долгую раскатистую вибрацию."},
"ز":{group:"tip-sibilants",title:"Узкий проход у передних зубов",description:"Передняя часть языка оставляет узкий канал для воздуха; звук произносится с голосом."},
"س":{group:"tip-sibilants",title:"Узкий проход у передних зубов",description:"Передняя часть языка формирует узкий канал для воздуха без голоса."},
"ش":{group:"middle-tongue",title:"Середина языка и твёрдое нёбо",description:"Середина языка поднимается к нёбу, оставляя проход для воздуха."},
"ص":{group:"tip-sibilants",title:"Передняя часть языка и подъём задней части",description:"Передняя часть языка формирует узкий проход, задняя часть приподнимается: звук становится твёрдым."},
"ض":{group:"side-tongue",title:"Боковая сторона языка и коренные зубы",description:"Для ض важен контакт боковой стороны языка с верхними коренными зубами. Показан отдельный увеличенный ракурс."},
"ط":{group:"tip-roots",title:"Корни верхних передних зубов",description:"Кончик языка касается области корней верхних резцов, задняя часть языка приподнята."},
"ظ":{group:"interdental",title:"Межзубное положение",description:"Кончик языка касается края верхних передних зубов и слегка показывается между ними; звук твёрдый и звонкий."},
"ع":{group:"throat-middle",title:"Средняя часть глотки",description:"Звук формируется в средней части глотки. Не заменяй его обычным русским «а»."},
"غ":{group:"throat-near",title:"Верхняя часть горла",description:"Звук образуется в верхней части горла, ближе ко рту, с голосом."},
"ف":{group:"lip-teeth",title:"Нижняя губа и верхние резцы",description:"Край верхних передних зубов мягко касается внутренней стороны нижней губы."},
"ق":{group:"back-qaf",title:"Самая задняя часть языка",description:"Самая задняя часть языка поднимается к мягкому нёбу, ближе к горлу."},
"ك":{group:"back-kaf",title:"Задняя часть языка",description:"Задняя часть языка касается области нёба немного ближе ко рту, чем при ق."},
"ل":{group:"lam",title:"Передняя часть языка у верхних дёсен",description:"Передняя часть и боковые края языка соприкасаются с областью верхних дёсен за зубами."},
"م":{group:"lips",title:"Две сомкнутые губы",description:"Губы мягко смыкаются; звук сопровождается носовым резонансом."},
"ن":{group:"tip-gums",title:"Кончик языка у верхних дёсен",description:"Кончик языка касается дёсен за верхними передними зубами; звук имеет носовой резонанс."},
"ه":{group:"throat-deep",title:"Глубина горла",description:"Лёгкий звук выходит из глубины горла, без сильного трения."},
"و":{group:"rounded-lips",title:"Округлённые губы",description:"При согласном звуке губы округляются вперёд, но не смыкаются."},
"ي":{group:"middle-tongue",title:"Середина языка и твёрдое нёбо",description:"При согласном ي середина языка поднимается к твёрдому нёбу."}
};
const tonguePaths: Record<Group,string> = {
jawf:"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
lips:"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
"rounded-lips":"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
"lip-teeth":"M105 250 Q133 241 166 248 Q205 258 248 258 Q276 257 294 250 L287 273 Q236 285 185 273 Q135 264 105 250Z",
"tip-roots":"M108 253 Q142 248 173 241 Q194 222 208 224 Q224 227 224 241 Q248 255 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
interdental:"M103 249 Q126 240 145 225 Q158 214 168 222 Q179 231 167 244 Q206 260 248 258 Q277 257 294 250 L287 273 Q236 285 185 273 Q132 262 103 249Z",
"tip-sibilants":"M108 253 Q145 247 174 244 Q197 238 213 244 Q246 255 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"tip-gums":"M108 253 Q142 249 169 239 Q187 222 201 225 Q217 228 214 242 Q247 255 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"middle-tongue":"M108 253 Q145 253 174 235 Q194 211 222 214 Q248 217 258 239 Q273 251 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"side-tongue":"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
lam:"M108 253 Q142 249 169 239 Q187 222 201 225 Q217 228 214 242 Q247 255 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"back-qaf":"M108 253 Q153 259 191 251 Q231 240 254 214 Q271 200 285 214 Q296 226 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"back-kaf":"M108 253 Q153 259 191 251 Q225 241 246 223 Q261 210 274 220 Q286 231 291 250 L286 274 Q234 282 184 271 Q139 263 108 253Z",
"throat-deep":"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
"throat-middle":"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z",
"throat-near":"M108 253 C145 246 178 246 212 251 C245 255 269 255 291 250 Q275 276 235 278 Q165 280 108 253Z"
};
export default function LetterArticulationVideo({letter}:{letter:string}) {
const info=byLetter[letter]??byLetter["ي"], tongue=tonguePaths[info.group];
const throat=info.group.startsWith("throat"), lips=["lips","rounded-lips","lip-teeth"].includes(info.group), side=info.group==="side-tongue";
return <section className="articulation-video" aria-label={`Артикуляция буквы ${letter}`}>
<div className="articulation-video__heading"><div><span className="articulation-video__eyebrow">АРТИКУЛЯЦИЯ · ФУСХА</span><strong>Как произнести звук</strong></div><span className="articulation-video__live"><i/>АНИМАЦИЯ</span></div>
<div className={`articulation-video__stage articulation-video__stage--${info.group}`}>
<svg viewBox="0 0 660 410" role="img" aria-label={`Полный профиль головы человека и увеличенная схема положения языка для буквы ${letter}.`}>
<defs>
<linearGradient id="av-skin" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F4DCC7"/><stop offset="1" stopColor="#C99D83"/></linearGradient>
<linearGradient id="av-neck" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#D8B49B"/><stop offset="1" stopColor="#B98470"/></linearGradient>
<linearGradient id="av-tongue" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#E69A9A"/><stop offset="1" stopColor="#B95F6A"/></linearGradient>
<linearGradient id="av-cavity" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A2530"/><stop offset="1" stopColor="#25151D"/></linearGradient>
<filter id="av-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter>
</defs>
<ellipse cx="224" cy="362" rx="158" ry="17" fill="#10291F" opacity=".12" filter="url(#av-shadow)"/>
<path d="M248 275 C263 314 260 343 283 370 L405 370 C423 332 430 292 414 247Z" fill="url(#av-neck)" stroke="#916C5D" strokeWidth="2"/>
<path d="M202 36 C112 42 63 102 66 174 C50 184 55 196 83 202 C67 215 78 226 101 229 C93 244 108 256 133 258 C142 297 179 319 228 320 C275 319 325 297 354 262 C395 215 406 139 366 83 C331 35 267 23 202 36Z" fill="url(#av-skin)" stroke="#916C5D" strokeWidth="3" strokeLinejoin="round"/>
<path d="M112 132 C131 102 167 81 211 77 C270 70 321 96 342 139 C357 171 344 205 320 226 C294 247 252 254 211 245 C177 239 142 224 111 204 C95 193 87 178 96 164Z" fill="#E8C8B2" opacity=".38"/>
<path d="M108 152 Q137 134 165 147" fill="none" stroke="#7D5B4D" strokeWidth="4" strokeLinecap="round"/><ellipse cx="138" cy="158" rx="7" ry="5" fill="#3E302D"/><circle cx="140" cy="156" r="1.8" fill="#FFFFFF"/>
<path d="M74 174 Q92 166 104 177 Q97 185 79 185" fill="none" stroke="#9B6F5C" strokeWidth="3" strokeLinecap="round"/>
<path d="M82 200 Q96 196 112 201 Q123 206 119 213 Q103 217 85 210" fill="#A85F68" stroke="#824B53" strokeWidth="2"/>
<path d="M84 218 Q103 225 121 216" fill="none" stroke="#7C424B" strokeWidth="3" strokeLinecap="round"/>
<path d="M95 229 Q124 244 154 243 Q185 245 207 232" fill="none" stroke="#936B5A" strokeWidth="2"/>
<path d="M102 240 Q142 269 195 268 Q246 265 291 246 L309 231 Q326 247 319 268 Q285 304 220 306 Q151 305 113 276Z" fill="url(#av-cavity)" stroke="#895E55" strokeWidth="2"/>
<path d="M111 239 Q165 216 222 222 Q267 226 306 245" fill="none" stroke="#F4E8D7" strokeWidth="13" strokeLinecap="round"/>
<path d="M110 240 Q167 225 221 229 Q268 232 302 247" fill="none" stroke="#BCA99A" strokeWidth="2.5" strokeLinecap="round"/>
<g fill="#FFF9ED" stroke="#B7A394" strokeWidth="1.4"><path d="M104 231 Q116 225 126 232 L127 246 L110 248Z"/><path d="M128 229 L146 230 L148 247 L130 247Z"/><path d="M149 230 L167 231 L169 249 L150 248Z"/><path d="M171 232 L188 233 L190 251 L172 250Z"/></g>
<path d={tongue} className="articulation-video__tongue" fill="url(#av-tongue)" stroke="#A94F60" strokeWidth="2.5" strokeLinejoin="round"/>
<path d="M285 235 Q309 241 318 257 Q325 276 311 293" fill="none" stroke="#C58D79" strokeWidth="11" strokeLinecap="round"/>
<path d="M289 240 Q306 251 307 270" fill="none" stroke="#E8B49D" strokeWidth="3" strokeLinecap="round"/>
<path d="M112 220 Q125 211 140 219" fill="none" stroke="#B85E68" strokeWidth="5" strokeLinecap="round" className="articulation-video__lips"/>
<path d="M107 239 Q122 248 139 239" fill="none" stroke="#B85E68" strokeWidth="5" strokeLinecap="round" className="articulation-video__lower-lip"/>
<path d="M82 202 Q75 207 83 213" fill="none" stroke="#B9E85C" strokeWidth="4" strokeLinecap="round" opacity={lips?1:.15}/>
<path d="M220 343 Q278 354 334 340" fill="none" stroke="#9B6F5C" strokeWidth="2" opacity=".55"/>
<text x="202" y="391" textAnchor="middle" className="articulation-video__head-label">ПОЛНЫЙ ПРОФИЛЬ ГОЛОВЫ</text>
<g className="articulation-video__zoom"><rect x="405" y="52" width="238" height="284" rx="24" fill="#F6F4EA" stroke="#B9C9A8" strokeWidth="2"/><text x="524" y="78" textAnchor="middle" className="articulation-video__zoom-title">УВЕЛИЧЕНИЕ · РОТ И ЯЗЫК</text>
<path d="M431 145 Q492 98 612 145 L612 253 Q526 305 431 253Z" fill="#E9C9B6" stroke="#A98472" strokeWidth="2"/><path d="M440 161 Q520 129 600 160 L600 239 Q522 270 440 239Z" fill="url(#av-cavity)"/><path d="M445 159 Q520 138 595 159" fill="none" stroke="#FFF8EA" strokeWidth="16" strokeLinecap="round"/><path d="M445 239 Q521 274 595 239" fill="none" stroke="#E0C1AB" strokeWidth="13" strokeLinecap="round"/>
<path d={tongue} transform="translate(330 0) scale(.66 .72)" className="articulation-video__tongue articulation-video__tongue--zoom" fill="url(#av-tongue)" stroke="#A94F60" strokeWidth="3"/>
<path d="M440 155 L457 168 L455 185" fill="none" stroke="#B9E85C" strokeWidth="4" strokeLinecap="round" className="articulation-video__contact"/><circle cx="458" cy="176" r="13" fill="#B9E85C" opacity=".25" className="articulation-video__pulse"/>
<text x="524" y="291" textAnchor="middle" className="articulation-video__zoom-caption">ЯЗЫК · НЁБО · ЗУБЫ · ГУБЫ</text>{throat&&<path d="M603 183 Q620 204 603 224" fill="none" stroke="#B9E85C" strokeWidth="5" strokeLinecap="round" className="articulation-video__contact"/>}{side&&<g className="articulation-video__top-view">
<rect x="416" y="96" width="216" height="184" rx="18" fill="#F6F4EA" stroke="#B9C9A8" strokeWidth="2"/>
<text x="524" y="119" textAnchor="middle" className="articulation-video__zoom-title">ВИД СВЕРХУ · БОК ЯЗЫКА</text>
<ellipse cx="524" cy="194" rx="84" ry="58" fill="#E9C9B6" stroke="#A98472" strokeWidth="2"/>
<ellipse cx="524" cy="194" rx="63" ry="43" fill="#4A2530"/>
<path d="M470 168 Q524 145 578 168" fill="none" stroke="#FFF8EA" strokeWidth="12" strokeLinecap="round"/>
<path d="M470 220 Q524 243 578 220" fill="none" stroke="#E0C1AB" strokeWidth="12" strokeLinecap="round"/>
<path d="M474 171 Q459 191 475 215" fill="none" stroke="#B9E85C" strokeWidth="12" strokeLinecap="round"/>
<path d="M478 173 Q465 193 480 212" fill="none" stroke="#E69A9A" strokeWidth="10" strokeLinecap="round"/>
<circle cx="475" cy="194" r="13" fill="#B9E85C" opacity=".3" className="articulation-video__pulse"/>
<text x="524" y="263" textAnchor="middle" className="articulation-video__zoom-caption">БОК ЯЗЫКА К ВЕРХНИМ МОЛЯРАМ</text>
</g>}</g>
<text x="418" y="363" className="articulation-video__footer">Зелёный маркер — зона контакта / сужения</text>
</svg></div>
<div className="articulation-video__copy"><strong>{info.title}</strong><p>{info.description}</p><small>Учебная анатомическая анимация. Она показывает ориентир артикуляции, но не заменяет проверку произношения преподавателем арабского языка.</small></div>
</section>;
}
