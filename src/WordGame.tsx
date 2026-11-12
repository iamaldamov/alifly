import { useMemo, useState } from "react";

type Word = {
  arabic: string;
  transliteration: string;
  translation: string;
};

const WORDS: Word[] = [
  { arabic: "كِتَاب", transliteration: "китааб", translation: "книга" },
  { arabic: "بَيْت", transliteration: "бейт", translation: "дом" },
  { arabic: "بَاب", transliteration: "бааб", translation: "дверь" },
  { arabic: "مَاء", transliteration: "маа", translation: "вода" },
  { arabic: "قَلَم", transliteration: "калам", translation: "ручка" },
  { arabic: "شَمْس", transliteration: "шамс", translation: "солнце" },
  { arabic: "قَمَر", transliteration: "камар", translation: "луна" },
  { arabic: "مَدْرَسَة", transliteration: "мадраса", translation: "школа" },
  { arabic: "وَلَد", transliteration: "валад", translation: "мальчик" },
  { arabic: "بِنْت", transliteration: "бинт", translation: "девочка" },
  { arabic: "كُرْسِيّ", transliteration: "курсий", translation: "стул" },
  { arabic: "خُبْز", transliteration: "хубз", translation: "хлеб" },
];

const ROUND_SIZE = 8;
const BEST_SCORE_KEY = "alifly-word-game-best";

function shuffle<T,>(items: T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function readBestScore(): number {
  try {
    const value = Number(localStorage.getItem(BEST_SCORE_KEY));
    return Number.isFinite(value) && value >= 0 ? value : 0;
  } catch {
    return 0;
  }
}

export default function WordGame() {
  const [roundWords, setRoundWords] = useState<Word[]>(() => shuffle(WORDS).slice(0, ROUND_SIZE));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(readBestScore);
  const [finished, setFinished] = useState(false);

  const currentWord = roundWords[currentIndex];
  const options = useMemo(() => {
    if (!currentWord) return [];
    const distractors = shuffle(WORDS.filter((word) => word.translation !== currentWord.translation)).slice(0, 3);
    return shuffle([currentWord, ...distractors]);
  }, [currentWord]);

  const chooseAnswer = (answer: string) => {
    if (selectedAnswer !== null || !currentWord) return;
    setSelectedAnswer(answer);
    if (answer === currentWord.translation) setScore((value) => value + 1);
  };

  const goNext = () => {
    if (currentIndex === roundWords.length - 1) {
      setFinished(true);
      const finalScore = score;
      if (finalScore > bestScore) {
        setBestScore(finalScore);
        try {
          localStorage.setItem(BEST_SCORE_KEY, String(finalScore));
        } catch {
          // The game remains playable when browser storage is unavailable.
        }
      }
      return;
    }
    setCurrentIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const restart = () => {
    setRoundWords(shuffle(WORDS).slice(0, ROUND_SIZE));
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setScore(0);
    setFinished(false);
  };

  if (finished) {
    return (
      <section className="word-game-section" aria-labelledby="word-game-title">
        <div className="word-game-card word-game-result">
          <div className="word-game-kicker">МИНИ-ИГРА · РЕЗУЛЬТАТ</div>
          <div className="word-game-result-icon" aria-hidden="true">{score >= 6 ? "🏆" : "🌱"}</div>
          <h2 id="word-game-title">Раунд завершён!</h2>
          <p className="word-game-result-score">{score} из {roundWords.length} правильных ответов</p>
          <p className="word-game-muted">
            {score === roundWords.length
              ? "Прекрасно! Ты запомнил все слова."
              : score >= 6
                ? "Отличный результат. Повтори слова, которые вызвали трудности."
                : "Хорошее начало. Повтори слова и попробуй ещё раз."}
          </p>
          <div className="word-game-best">Лучший результат: {Math.max(bestScore, score)} / {ROUND_SIZE}</div>
          <button className="word-game-primary" type="button" onClick={restart}>Сыграть ещё раз</button>
        </div>
      </section>
    );
  }

  if (!currentWord) return null;

  return (
    <section className="word-game-section" aria-labelledby="word-game-title">
      <div className="word-game-heading">
        <div>
          <span className="section-label">ТРЕНИРУЙ ПАМЯТЬ</span>
          <h2 id="word-game-title">Слово за словом</h2>
          <p>Угадай перевод и запоминай новые арабские слова.</p>
        </div>
        <div className="word-game-best-pill">★ Рекорд: {bestScore}/{ROUND_SIZE}</div>
      </div>

      <div className="word-game-card">
        <div className="word-game-topline">
          <span>ВОПРОС {currentIndex + 1} ИЗ {roundWords.length}</span>
          <strong>{score} очков</strong>
        </div>
        <div
          className="word-game-progress"
          role="progressbar"
          aria-label="Прогресс игры"
          aria-valuemin={0}
          aria-valuemax={roundWords.length}
          aria-valuenow={currentIndex + (selectedAnswer !== null ? 1 : 0)}
        >
          <span style={{ width: `${((currentIndex + (selectedAnswer !== null ? 1 : 0)) / roundWords.length) * 100}%` }} />
        </div>

        <div className="word-game-question" aria-live="polite" aria-atomic="true">
          <div className="word-game-prompt">Что означает это слово?</div>
          <div className="word-game-arabic" lang="ar" dir="rtl">{currentWord.arabic}</div>
          <div className="word-game-transliteration">{currentWord.transliteration}</div>
        </div>
        <div className="word-game-options">
          {options.map((option) => {
            const isCorrect = option.translation === currentWord.translation;
            const isSelected = selectedAnswer === option.translation;
            const stateClass = selectedAnswer === null
              ? ""
              : isCorrect
                ? " is-correct"
                : isSelected
                  ? " is-wrong"
                  : "";
            return (
              <button
                className={`word-game-option${stateClass}`}
                type="button"
                key={option.translation}
                onClick={() => chooseAnswer(option.translation)}
                disabled={selectedAnswer !== null}
                aria-pressed={isSelected}
              >
                <span>{option.translation}</span>
                {selectedAnswer !== null && isCorrect && <span aria-hidden="true">✓</span>}
                {selectedAnswer !== null && isSelected && !isCorrect && <span aria-hidden="true">×</span>}
              </button>
            );
          })}
        </div>

        {selectedAnswer !== null && (
          <div className={`word-game-feedback ${selectedAnswer === currentWord.translation ? "is-correct" : "is-wrong"}`} role="status" aria-live="polite">
            <strong>{selectedAnswer === currentWord.translation ? "Верно! Отличная работа." : "Почти! Правильный ответ:"}</strong>
            <span>{currentWord.arabic} — {currentWord.translation}</span>
          </div>
        )}

        <button className="word-game-primary" type="button" onClick={goNext} disabled={selectedAnswer === null}>
          {currentIndex === roundWords.length - 1 ? "Завершить игру" : "Следующее слово"}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </section>
  );
}
