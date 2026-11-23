import type { SVGProps } from "react";

type ArtworkProps = SVGProps<SVGSVGElement>;

export function AliflyHeroArtwork(props: ArtworkProps) {
  return (
    <svg className="alifly-hero-artwork" viewBox="0 0 520 430" role="img" aria-label="Иллюстрация ALIFLY: арабские буквы, карточки для обучения и открытая книга">
      <defs>
        <linearGradient id="alifly-book-left" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf1" />
          <stop offset="1" stopColor="#dce8d4" />
        </linearGradient>
        <linearGradient id="alifly-book-right" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f5f0dc" />
          <stop offset="1" stopColor="#c4d8c1" />
        </linearGradient>
        <linearGradient id="alifly-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8f4e5" />
          <stop offset="1" stopColor="#d8e5d2" />
        </linearGradient>
        <filter id="alifly-art-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="18" stdDeviation="15" floodColor="#071b12" floodOpacity=".22" />
        </filter>
      </defs>
      <circle cx="264" cy="214" r="174" fill="#b9c9a7" opacity=".09" />
      <circle cx="264" cy="214" r="145" fill="none" stroke="#d9e4ce" strokeOpacity=".28" strokeDasharray="3 11" />
      <path d="M65 325C124 357 189 370 265 366c75-4 136-21 190-53" fill="none" stroke="#dce8d4" strokeOpacity=".24" strokeWidth="2" />
      <g filter="url(#alifly-art-shadow)">
        <path d="M91 170c58-25 116-20 174 14v153c-58-34-116-39-174-14z" fill="url(#alifly-book-left)" stroke="#f7f4e5" strokeWidth="3" />
        <path d="M265 184c58-34 116-39 174-14v153c-58-25-116-20-174 14z" fill="url(#alifly-book-right)" stroke="#f7f4e5" strokeWidth="3" />
        <path d="M265 184v153" stroke="#8ca78b" strokeWidth="3" opacity=".7" />
        <path d="M111 205c39-13 82-8 126 15M111 235c39-13 82-8 126 15M111 265c39-13 82-8 126 15" fill="none" stroke="#8aa18a" strokeWidth="3" strokeLinecap="round" opacity=".48" />
        <path d="M293 220c40-18 82-21 125-9M293 250c40-18 82-21 125-9M293 280c40-18 82-21 125-9" fill="none" stroke="#8aa18a" strokeWidth="3" strokeLinecap="round" opacity=".48" />
        <path d="M265 185c-10-8-20-14-31-18v153c11 4 21 10 31 17z" fill="#b9cba9" opacity=".65" />
      </g>
      <g className="alifly-art-tile alifly-art-tile-one" filter="url(#alifly-art-shadow)">
        <rect x="39" y="70" width="112" height="112" rx="27" fill="url(#alifly-tile)" stroke="#fffdf2" strokeWidth="2" />
        <text x="95" y="151" textAnchor="middle" fill="#315b43" fontSize="77" fontFamily="Noto Naskh Arabic, Amiri, serif">ا</text>
      </g>
      <g className="alifly-art-tile alifly-art-tile-two" filter="url(#alifly-art-shadow)">
        <rect x="357" y="49" width="105" height="105" rx="26" fill="#e5edda" stroke="#fffdf2" strokeWidth="2" />
        <text x="409" y="125" textAnchor="middle" fill="#315b43" fontSize="70" fontFamily="Noto Naskh Arabic, Amiri, serif">ب</text>
        <circle cx="409" cy="137" r="4.5" fill="#c18e49" />
      </g>
      <g className="alifly-art-tile alifly-art-tile-three">
        <rect x="371" y="268" width="82" height="82" rx="23" fill="#d9e7d1" stroke="#fffdf2" strokeWidth="2" />
        <text x="412" y="326" textAnchor="middle" fill="#315b43" fontSize="57" fontFamily="Noto Naskh Arabic, Amiri, serif">م</text>
      </g>
      <path d="m180 83 7 17 17 7-17 7-7 17-7-17-17-7 17-7z" fill="#e4c78c" />
      <path d="m327 112 5 12 12 5-12 5-5 12-5-12-12-5 12-5z" fill="#e4c78c" opacity=".9" />
      <circle cx="77" cy="260" r="5" fill="#e4c78c" />
      <circle cx="473" cy="218" r="4" fill="#e4c78c" />
      <path d="M77 217c-14 13-20 29-17 47" fill="none" stroke="#d9e4ce" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 7" opacity=".65" />
      <g className="alifly-art-label">
        <rect x="179" y="350" width="171" height="38" rx="19" fill="#e5edda" />
        <circle cx="199" cy="369" r="4" fill="#4d825c" />
        <text x="213" y="373" fill="#315b43" fontSize="11" fontWeight="700" letterSpacing="1.3">LEARN · READ · GROW</text>
      </g>
      <title>ALIFLY — изучай арабский шаг за шагом</title>
      {props.children}
    </svg>
  );
}

export function AliflyStageArtwork({ stageId }: { stageId: number }) {
  if (stageId === 2) {
    return (
      <svg className="alifly-stage-artwork" viewBox="0 0 88 88" aria-hidden="true">
        <rect x="5" y="5" width="78" height="78" rx="25" fill="#e8efdf" />
        <text x="44" y="60" textAnchor="middle" fill="#315b43" fontSize="52" fontFamily="Noto Naskh Arabic, Amiri, serif">ب</text>
        <circle cx="44" cy="17" r="4" fill="#c18e49" />
        <path d="M23 26h42" stroke="#8aa18a" strokeWidth="2" strokeLinecap="round" opacity=".55" />
      </svg>
    );
  }
  if (stageId === 3) {
    return (
      <svg className="alifly-stage-artwork" viewBox="0 0 88 88" aria-hidden="true">
        <rect x="5" y="5" width="78" height="78" rx="25" fill="#e8efdf" />
        <path d="M14 20c0-6 5-10 11-10h27c6 0 11 4 11 10v17c0 6-5 10-11 10H38l-11 9v-9h-2c-6 0-11-4-11-10z" fill="#f8f4e5" stroke="#a8b99c" strokeWidth="2" />
        <path d="M40 47h20c6 0 11 4 11 10v8c0 6-5 10-11 10H49l-8 6v-6h-1c-6 0-11-4-11-10v-3" fill="#cbdcc3" stroke="#8aa18a" strokeWidth="2" />
        <text x="38" y="38" textAnchor="middle" fill="#315b43" fontSize="25" fontFamily="Noto Naskh Arabic, Amiri, serif">ا</text>
        <circle cx="49" cy="61" r="2" fill="#c18e49" /><circle cx="58" cy="61" r="2" fill="#c18e49" />
      </svg>
    );
  }
  return (
    <svg className="alifly-stage-artwork" viewBox="0 0 88 88" aria-hidden="true">
      <rect x="5" y="5" width="78" height="78" rx="25" fill="#e8efdf" />
      <path d="M14 24c0-7 6-12 13-12h34c7 0 13 5 13 12v34c0 7-6 12-13 12H27c-7 0-13-5-13-12z" fill="#f8f4e5" stroke="#a8b99c" strokeWidth="2" />
      <path d="M23 27h42M23 61h42" stroke="#c6d5bd" strokeWidth="2" strokeLinecap="round" />
      <text x="44" y="55" textAnchor="middle" fill="#315b43" fontSize="45" fontFamily="Noto Naskh Arabic, Amiri, serif">ا</text>
      <path d="m66 14 3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#c18e49" />
    </svg>
  );
}


export function AliflyLessonArtwork({ variant = "alphabet" }: { variant?: "alphabet" | "vowels" | "conversation" | "memory" | "success" }) {
  const isVowels = variant === "vowels";
  const isConversation = variant === "conversation";
  const isMemory = variant === "memory";
  const isSuccess = variant === "success";
  return (
    <svg className={`alifly-lesson-artwork alifly-lesson-artwork-${variant}`} viewBox="0 0 180 132" role="img" aria-label={isVowels ? "Карточки арабских огласовок" : isConversation ? "Иллюстрация общения на арабском языке" : isMemory ? "Иллюстрация повторения и запоминания" : isSuccess ? "Иллюстрация успешного завершения урока" : "Иллюстрация изучения арабского алфавита"}>
      <defs>
        <linearGradient id="alifly-mini-paper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf2"/><stop offset="1" stopColor="#dce8d4"/>
        </linearGradient>
      </defs>
      <ellipse cx="90" cy="115" rx="67" ry="9" fill="#234b36" opacity=".09"/>
      <circle cx="90" cy="62" r="51" fill="#dfe9d6" opacity=".72"/>
      {isConversation ? (
        <>
          <path d="M25 30c0-9 7-16 16-16h54c9 0 16 7 16 16v28c0 9-7 16-16 16H65L48 88V74h-7c-9 0-16-7-16-16z" fill="url(#alifly-mini-paper)" stroke="#8aa18a" strokeWidth="2"/>
          <path d="M84 65h49c8 0 14 6 14 14v18c0 8-6 14-14 14h-8l-13 10V111H84c-8 0-14-6-14-14V79c0-8 6-14 14-14z" fill="#c9dcc2" stroke="#8aa18a" strokeWidth="2"/>
          <text x="68" y="57" textAnchor="middle" fill="#315b43" fontSize="28" fontFamily="Noto Naskh Arabic, Amiri, serif">مَرْحَبًا</text>
          <circle cx="101" cy="89" r="3" fill="#b98b4e"/><circle cx="113" cy="89" r="3" fill="#b98b4e"/><circle cx="125" cy="89" r="3" fill="#b98b4e"/>
        </>
      ) : isVowels ? (
        <>
          <rect x="24" y="29" width="42" height="62" rx="12" fill="url(#alifly-mini-paper)" stroke="#a8b99c" strokeWidth="2" transform="rotate(-9 45 60)"/>
          <rect x="68" y="18" width="44" height="72" rx="12" fill="#f7f1df" stroke="#a8b99c" strokeWidth="2"/>
          <rect x="115" y="29" width="42" height="62" rx="12" fill="#d1e1c9" stroke="#a8b99c" strokeWidth="2" transform="rotate(9 136 60)"/>
          <text x="45" y="69" textAnchor="middle" fill="#315b43" fontSize="37" fontFamily="Noto Naskh Arabic, Amiri, serif">بَ</text>
          <text x="90" y="68" textAnchor="middle" fill="#315b43" fontSize="39" fontFamily="Noto Naskh Arabic, Amiri, serif">بِ</text>
          <text x="136" y="69" textAnchor="middle" fill="#315b43" fontSize="37" fontFamily="Noto Naskh Arabic, Amiri, serif">بُ</text>
          <path d="M43 99h94" stroke="#8aa18a" strokeWidth="3" strokeLinecap="round" opacity=".5"/>
        </>
      ) : isMemory ? (
        <>
          <path d="M90 18c-24 0-43 19-43 43 0 17 10 32 25 39v13h36v-13c15-7 25-22 25-39 0-24-19-43-43-43z" fill="url(#alifly-mini-paper)" stroke="#8aa18a" strokeWidth="2.5"/>
          <path d="M73 110h34M77 119h26" stroke="#8aa18a" strokeWidth="3" strokeLinecap="round"/>
          <path d="M90 35v40M75 55l15 14 15-14" fill="none" stroke="#4d825c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m37 26 5 11 11 5-11 5-5 11-5-11-11-5 11-5zM143 30l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#c18e49"/>
        </>
      ) : isSuccess ? (
        <>
          <circle cx="90" cy="62" r="43" fill="#d1e5ca" stroke="#83a77f" strokeWidth="2.5"/>
          <path d="m66 63 16 16 34-37" fill="none" stroke="#315b43" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="m34 26 5 11 11 5-11 5-5 11-5-11-11-5 11-5zM143 29l4 8 8 4-8 4-4 8-4-8-8-4 8-4z" fill="#c18e49"/>
        </>
      ) : (
        <>
          <rect x="41" y="23" width="98" height="78" rx="17" fill="url(#alifly-mini-paper)" stroke="#a8b99c" strokeWidth="2"/>
          <path d="M54 42h72M54 83h72" stroke="#c6d5bd" strokeWidth="2" strokeLinecap="round"/>
          <text x="90" y="79" textAnchor="middle" fill="#315b43" fontSize="57" fontFamily="Noto Naskh Arabic, Amiri, serif">ا</text>
          <path d="m137 17 4 9 9 4-9 4-4 9-4-9-9-4 9-4z" fill="#c18e49"/>
        </>
      )}
    </svg>
  );
}
