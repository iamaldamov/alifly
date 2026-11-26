import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { resolve, join } from "node:path";
const manifest=JSON.parse(await readFile(resolve("src/data/arabic-letter-names.json"),"utf8"));
const articulation=JSON.parse(await readFile(resolve("src/data/pronunciation-articulation.json"),"utf8"));
if(!Array.isArray(manifest)||manifest.length!==28||Object.keys(articulation).length!==28)throw new Error("Expected 28 letters and 28 articulation records.");
const out=resolve("public/pronunciation");await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
function render(letter,p){
const {x,y,dx,dy,mode}=p;
const tongue=mode==="tongue"?\`style="--dx:\${dx}px;--dy:\${dy}px;animation:tongueMove 2.8s ease-in-out 1 both"\`:"";
const upper=mode==="lips"||mode==="rounded-lips"?\`style="animation:upperLip 2.8s ease-in-out 1 both"\`:"";
const lower=mode==="lips"?\`style="animation:lowerLip 2.8s ease-in-out 1 both"\`:mode==="rounded-lips"?\`style="animation:roundLip 2.8s ease-in-out 1 both"\`:mode==="lip-teeth"?\`style="animation:labio 2.8s ease-in-out 1 both"\`:"";
const throat=mode==="throat"?\`style="animation:throatMove 2.8s ease-in-out 1 both"\`:"";
return \`<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 760 460" role="img" aria-labelledby="title">
<title id="title">Анатомическая схема артикуляции арабской буквы \${letter}</title>
<defs>
<linearGradient id="skin" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#F0D7C6"/><stop offset=".55" stop-color="#D9B5A1"/><stop offset="1" stop-color="#B98778"/></linearGradient>
<linearGradient id="tongue" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#E7A39D"/><stop offset="1" stop-color="#B96F76"/></linearGradient>
<linearGradient id="bone" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#F3E6D2"/><stop offset="1" stop-color="#CDB99E"/></linearGradient>
<radialGradient id="focus"><stop stop-color="#C6F432" stop-opacity=".48"/><stop offset="1" stop-color="#C6F432" stop-opacity="0"/></radialGradient>
</defs>
<!-- Чистый боковой анатомический разрез, фон прозрачный -->
<path d="M585 22 C500 15 389 28 313 66 C258 93 225 128 190 151 C161 168 125 173 103 188 C88 199 97 213 126 223 C146 230 165 235 168 250 C171 265 153 274 150 286 C147 302 163 313 185 321 C204 329 211 348 222 374 C238 411 290 427 384 427 H548 C650 427 708 348 711 238 C715 132 685 38 585 22Z" fill="url(#skin)" stroke="#956D61" stroke-width="5" stroke-linejoin="round"/>
<path d="M221 151 C270 103 357 78 450 92 C509 101 555 127 585 164 C554 175 525 177 490 166 C399 137 303 143 221 178Z" fill="#7F4F4C" opacity=".72" stroke="#A76E66" stroke-width="3"/>
<path d="M253 150 C327 111 414 111 493 139 C525 150 548 164 561 184" fill="none" stroke="#E9CDBA" stroke-width="10" stroke-linecap="round" opacity=".9"/>
<path d="M158 206 C229 164 348 155 465 174 C525 184 568 211 590 245 C544 270 470 270 383 258 C286 245 210 241 158 228Z" fill="#302629" stroke="#8C5E58" stroke-width="4"/>
<path d="M172 194 C260 148 377 151 493 178 C532 187 563 208 579 235" fill="none" stroke="url(#bone)" stroke-width="26" stroke-linecap="round"/><path d="M173 193 C260 151 377 154 493 180 C532 189 562 209 579 235" fill="none" stroke="#A88E77" stroke-width="3" stroke-linecap="round"/>
<g fill="#FFF9EC" stroke="#B8A58F" stroke-width="2"><rect x="174" y="202" width="28" height="43" rx="10" transform="rotate(-12 188 223)"/><rect x="199" y="195" width="29" height="47" rx="10" transform="rotate(-7 213 218)"/><rect x="226" y="191" width="29" height="46" rx="10" transform="rotate(-2 240 214)"/><rect x="254" y="190" width="29" height="44" rx="10" transform="rotate(3 268 212)"/><rect x="282" y="192" width="28" height="42" rx="10" transform="rotate(8 296 213)"/><rect x="309" y="197" width="27" height="39" rx="10" transform="rotate(12 322 216)"/><rect x="335" y="203" width="25" height="35" rx="9" transform="rotate(16 347 220)"/></g>
<path d="M167 267 C201 335 279 375 382 377 C472 379 546 344 584 292" fill="none" stroke="url(#bone)" stroke-width="28" stroke-linecap="round"/><path d="M170 265 C207 329 281 365 380 366 C466 367 536 336 575 291" fill="none" stroke="#A78E77" stroke-width="3" stroke-linecap="round"/>
<g fill="#FFF9EC" stroke="#B8A58F" stroke-width="2"><rect x="178" y="262" width="27" height="35" rx="9" transform="rotate(8 191 280)"/><rect x="204" y="272" width="27" height="38" rx="9" transform="rotate(5 217 291)"/><rect x="231" y="279" width="28" height="39" rx="9" transform="rotate(1 245 298)"/><rect x="259" y="281" width="28" height="38" rx="9" transform="rotate(-3 273 300)"/><rect x="287" y="279" width="27" height="37" rx="9" transform="rotate(-7 300 297)"/></g>
<g class="tongue-art" \${tongue}><path d="M163 264 C221 239 285 220 354 224 C425 228 487 250 529 283 C500 323 439 344 361 343 C275 342 205 314 163 264Z" fill="url(#tongue)" stroke="#9E5E65" stroke-width="4"/><path d="M197 268 C269 245 353 240 425 260" fill="none" stroke="#F2B6AE" stroke-width="4" stroke-linecap="round" opacity=".65"/></g>
<g class="throat-wall" \${throat}><path d="M579 178 C621 201 648 245 648 298 C649 337 629 370 602 390" fill="none" stroke="#9F6865" stroke-width="26" stroke-linecap="round"/><path d="M584 180 C619 210 635 249 635 294 C635 331 620 359 600 379" fill="none" stroke="#E5B6A5" stroke-width="5" stroke-linecap="round" opacity=".8"/></g>
<g class="upper-lip" \${upper}><path d="M99 184 C123 174 149 180 173 197 L169 213 C143 205 122 205 103 211 C91 204 90 192 99 184Z" fill="#C97F7D" stroke="#8F595C" stroke-width="3"/><path d="M104 190 C124 186 145 193 161 202" fill="none" stroke="#E6AAA0" stroke-width="4" stroke-linecap="round"/></g>
<g class="lower-lip" \${lower}><path d="M102 216 C125 215 149 224 171 239 L165 255 C139 245 119 240 101 241 C90 234 91 222 102 216Z" fill="#D68D87" stroke="#8F595C" stroke-width="3"/><path d="M105 224 C126 225 145 233 160 243" fill="none" stroke="#F0B6A9" stroke-width="4" stroke-linecap="round"/></g>
<circle cx="\${x}" cy="\${y}" r="38" fill="url(#focus)"/><circle class="target-ring" cx="\${x}" cy="\${y}" r="20" fill="#C6F432" fill-opacity=".18" stroke="#B9EA38" stroke-width="3"/><circle cx="\${x}" cy="\${y}" r="6" fill="#D9FF78" stroke="#315C39" stroke-width="2"/>
<style>
.tongue-art{transform-box:fill-box;transform-origin:0 0}
@keyframes tongueMove{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(var(--dx),var(--dy))}}
@keyframes upperLip{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(0,5px)}}
@keyframes lowerLip{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(0,-6px)}}
@keyframes roundLip{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(8px,-1px)}}
@keyframes labio{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(0,-9px)}}
@keyframes throatMove{0%,100%{transform:translate(0,0)}38%,62%{transform:translate(-7px,0)}}
.target-ring{transform-box:fill-box;transform-origin:center;animation:targetPulse 1.4s ease-in-out 2}
@keyframes targetPulse{0%,100%{opacity:.45;transform:scale(.86)}50%{opacity:1;transform:scale(1.08)}}
@media(prefers-reduced-motion:reduce){.tongue-art,.upper-lip,.lower-lip,.throat-wall,.target-ring{animation:none!important}}
</style></svg>\`;
}
for(const item of manifest){const info=articulation[item.character];if(!info||!item.slug)throw new Error("Missing articulation for "+item.character);await writeFile(join(out,item.slug+".svg"),render(item.character,info),"utf8");}
console.log(\`Generated \${manifest.length} animated articulation illustrations.\`);
