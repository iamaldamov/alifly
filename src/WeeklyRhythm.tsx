import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "alifly-weekly-rhythm-v1";

function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeek(date: Date): Date[] {
  const monday = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = (monday.getDay() + 6) % 7;
  monday.setDate(monday.getDate() - offset);
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday);
    day.setDate(monday.getDate() + index);
    return day;
  });
}

const weekdayLabels = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

export default function WeeklyRhythm() {
  const [completedDays, setCompletedDays] = useState<string[]>([]);
  const today = new Date();
  const todayKey = dateKey(today);
  const week = useMemo(() => getWeek(today), [todayKey]);
  const weekKeys = week.map(dateKey);
  const completedThisWeek = weekKeys.filter((key) => completedDays.includes(key)).length;
  const todayDone = completedDays.includes(todayKey);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.every((value) => typeof value === "string")) {
          setCompletedDays(parsed);
        }
      }
    } catch {
      // Keep the feature usable when browser storage is unavailable.
    }
  }, []);

  const toggleToday = () => {
    setCompletedDays((current) => {
      const next = todayDone
        ? current.filter((key) => key !== todayKey)
        : [...current, todayKey].slice(-90);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // The current session still updates if storage is blocked.
      }
      return next;
    });
  };

  return (
    <section className="weekly-rhythm" aria-labelledby="weekly-rhythm-title">
      <div className="weekly-rhythm-heading">
        <div>
          <span className="section-label">МАЛЕНЬКИЕ ШАГИ · БОЛЬШОЙ РЕЗУЛЬТАТ</span>
          <h2 id="weekly-rhythm-title">Твой ритм обучения</h2>
          <p>Не нужно учиться часами. Возвращайся к арабскому понемногу — день за днём.</p>
        </div>
        <div className="weekly-rhythm-count" aria-live="polite">
          <strong>{completedThisWeek}<span>/7</span></strong>
          <small>дней на этой неделе</small>
        </div>
      </div>
      <div className="weekly-rhythm-days" role="group" aria-label="Отметки занятий за текущую неделю">
        {week.map((date, index) => {
          const key = dateKey(date);
          const done = completedDays.includes(key);
          const isToday = key === todayKey;
          return (
            <div className={`weekly-day ${done ? "is-done" : ""} ${isToday ? "is-today" : ""}`} key={key}>
              <span>{weekdayLabels[index]}</span>
              <span className="weekly-day-number">{date.getDate()}</span>
              <span className="weekly-day-check" aria-label={done ? "Занятие отмечено" : "Нет отметки"}>{done ? "✓" : "·"}</span>
            </div>
          );
        })}
      </div>
      <div className="weekly-rhythm-footer">
        <p>{todayDone ? "Сегодняшний шаг уже отмечен. Продолжай в комфортном темпе." : "Закончил занятие? Отметь сегодняшний шаг и поддержи свой ритм."}</p>
        <button type="button" className={`weekly-checkin-button ${todayDone ? "is-done" : ""}`} onClick={toggleToday} aria-pressed={todayDone}>
          {todayDone ? "✓ Занятие выполнено" : "Отметить занятие"}
        </button>
      </div>
      <span className="weekly-rhythm-note">Отметки хранятся в браузере на этом устройстве.</span>
    </section>
  );
}
