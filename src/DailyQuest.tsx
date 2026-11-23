import type { ReactElement } from "react";

export type DailyGoal = 1 | 2 | 3;

type DailyQuestProps = {
  goal: DailyGoal;
  completedCount: number;
  onGoalChange: (goal: DailyGoal) => void;
};

const goalOptions: DailyGoal[] = [1, 2, 3];

export default function DailyQuest({
  goal,
  completedCount,
  onGoalChange,
}: DailyQuestProps): ReactElement {
  const completed = completedCount >= goal;
  const visibleCount = Math.min(completedCount, goal);
  const progress = Math.round((visibleCount / goal) * 100);

  return (
    <section className="daily-quest-section" aria-labelledby="daily-quest-title">
      <div className={`daily-quest-card ${completed ? "is-complete" : ""}`}>
        <div className="daily-quest-copy">
          <span className="daily-quest-kicker">НЕБОЛЬШОЙ ШАГ К БОЛЬШОЙ ЦЕЛИ</span>
          <h2 id="daily-quest-title">Миссия дня</h2>
          <p>
            {completed
              ? "Отлично! Сегодняшняя цель выполнена. Знания растут благодаря постоянству."
              : `Выбери комфортный темп и пройди ещё ${goal - completedCount} ${goal - completedCount === 1 ? "урок" : "урока"} сегодня.`}
          </p>
          <div className="daily-quest-options" role="group" aria-label="Дневная цель">
            {goalOptions.map((option) => (
              <button
                key={option}
                type="button"
                className={`daily-quest-option ${goal === option ? "is-selected" : ""}`}
                data-touch-hint={`Дневная цель: ${option} ${option === 1 ? "урок" : "урока"}. Меняй её под свой темп`}
                onClick={() => onGoalChange(option)}
                aria-pressed={goal === option}
              >
                {option} {option === 1 ? "урок" : "урока"}
              </button>
            ))}
          </div>
          <span className="daily-quest-note">Цель и отметки дня сохраняются на этом устройстве.</span>
        </div>

        <div className="daily-quest-summary">
          <div className="daily-quest-emblem" aria-hidden="true">
            <svg viewBox="0 0 72 72" role="presentation">
              <circle cx="36" cy="36" r="31" fill="#dce8d4" />
              <path d="M18 43c5-10 12-15 19-15s13 5 17 15" fill="none" stroke="#719275" strokeWidth="3" strokeLinecap="round" />
              <path d="M23 46h26l-3 10H26z" fill="#f7f1df" stroke="#8aa18a" strokeWidth="2" />
              {completed ? <path d="m27 34 6 6 13-15" fill="none" stroke="#315b43" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /> : <text x="36" y="43" textAnchor="middle" fill="#315b43" fontSize="27" fontFamily="Noto Naskh Arabic, Amiri, serif">ا</text>}
            </svg>
          </div>
          <strong>{visibleCount} / {goal}</strong>
          <span>уроков сегодня</span>
          <div
            className="daily-quest-progress"
            role="progressbar"
            aria-label="Прогресс дневной цели"
            aria-valuemin={0}
            aria-valuemax={goal}
            aria-valuenow={visibleCount}
          >
            <span style={{ width: `${progress}%` }} />
          </div>
          <span className="daily-quest-status" role="status" aria-live="polite">
            {completed ? "Цель выполнена" : `${progress}% выполнено`}
          </span>
        </div>
      </div>
    </section>
  );
}
