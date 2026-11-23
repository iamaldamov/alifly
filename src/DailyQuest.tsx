import type { ReactElement } from "react";

export type DailyGoal = 1 | 2 | 3;

type DailyQuestProps = {
  goal: DailyGoal;
  completedCount: number;
  onEdit: () => void;
};

export default function DailyQuest({
  goal,
  completedCount,
  onEdit,
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
          <div className="daily-quest-current-goal">
            Твоя цель: <strong>{goal} {goal === 1 ? "урок" : "урока"}</strong>
            <button type="button" onClick={onEdit}>Изменить в настройках</button>
          </div>
          <span className="daily-quest-note">Цель и отметки дня сохраняются на этом устройстве.</span>
        </div>

        <div className="daily-quest-summary">
          <div className="daily-quest-emblem" aria-hidden="true">
            {completed ? "✓" : "ا"}
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
