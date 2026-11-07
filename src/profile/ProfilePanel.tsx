import { useEffect, useMemo, useState } from "react";
import CharacterAvatar from "./CharacterAvatar";
import { useProfile, type AvatarId, type Gender } from "./ProfileContext";

const avatars: { id: AvatarId; label: string }[] = [
  { id: "sprout", label: "Росток" },
  { id: "leaf", label: "Листочек" },
  { id: "moon", label: "Луна" },
  { id: "star", label: "Звезда" },
  { id: "book", label: "Книга" },
  { id: "palm", label: "Пальма" },
];

function getTrialLabel(endsAt: string, now: number) {
  const remaining = new Date(endsAt).getTime() - now;
  if (!Number.isFinite(remaining) || remaining <= 0) return "Бесплатный период завершён";
  const days = Math.ceil(remaining / 86400000);
  if (days === 1) return "Остался 1 день бесплатного доступа";
  return `Осталось ${days} дней бесплатного доступа`;
}

export default function ProfilePanel() {
  const { profile, profileLoading, profileError, saveProfile, refreshProfile } = useProfile();
  const [isOpen, setIsOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState<Gender>(null);
  const [avatarId, setAvatarId] = useState<AvatarId>("sprout");
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!profile) return;
    setDisplayName(profile.display_name || "");
    setAge(profile.age === null ? "" : String(profile.age));
    setGender(profile.gender);
    setAvatarId(profile.avatar_id);
    if (!profile.display_name) setIsOpen(true);
  }, [profile?.user_id]);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(interval);
  }, []);

  const trialLabel = useMemo(
    () => profile ? getTrialLabel(profile.trial_ends_at, now) : "Рассчитываем бесплатный период…",
    [profile?.trial_ends_at, now],
  );
  const trialExpired = Boolean(profile && new Date(profile.trial_ends_at).getTime() <= now);

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback("");
    const parsedAge = age.trim() ? Number(age) : null;
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
      setFeedback("Укажи возраст от 13 до 120 лет или оставь поле пустым.");
      return;
    }
    setSaving(true);
    const ok = await saveProfile({ display_name: displayName, age: parsedAge, gender, avatar_id: avatarId });
    setSaving(false);
    if (ok) {
      setFeedback("Профиль сохранён.");
      setIsOpen(false);
    }
  };

  return (
    <div className="profile-control">
      <button className="profile-trigger" type="button" onClick={() => setIsOpen(true)} aria-label="Открыть личный кабинет">
        {profile ? <CharacterAvatar id={profile.avatar_id} size={28} /> : <span className="profile-trigger-dot">●</span>}
        <span>Профиль</span>
      </button>

      {isOpen && (
        <div className="profile-backdrop" onClick={() => setIsOpen(false)}>
          <section className="profile-modal" role="dialog" aria-modal="true" aria-labelledby="profile-title" onClick={(event) => event.stopPropagation()}>
            <button className="profile-close" type="button" onClick={() => setIsOpen(false)} aria-label="Закрыть">×</button>
            <div className="profile-heading">
              {profile ? <CharacterAvatar id={avatarId} size={62} /> : <div className="profile-loading-avatar" />}
              <div><span className="auth-kicker">ЛИЧНЫЙ КАБИНЕТ</span><h2 id="profile-title">Твой профиль</h2></div>
            </div>
            {profileLoading && <p className="profile-note">Загружаем профиль…</p>}
            {profileError && <p className="auth-error" role="alert">{profileError}<button className="profile-retry" type="button" onClick={() => void refreshProfile()}>Повторить</button></p>}
            {profile && (
              <>
                <div className={trialExpired ? "trial-card is-expired" : "trial-card"}>
                  <span className="trial-label">БЕСПЛАТНЫЙ ДОСТУП</span>
                  <strong>{trialLabel}</strong>
                  <small>Отсчёт начинается с момента регистрации.</small>
                  {trialExpired && <small>Раздел оплаты будет добавлен после подключения платёжного сервиса.</small>}
                </div>
                <form className="profile-form" onSubmit={(event) => void handleSave(event)}>
                  <label htmlFor="profile-name">Как к тебе обращаться</label>
                  <input id="profile-name" maxLength={40} placeholder="Твоё имя" value={displayName} onChange={(event) => setDisplayName(event.target.value)} />
                  <div className="profile-fields">
                    <div><label htmlFor="profile-age">Возраст <span>необязательно</span></label><input id="profile-age" type="number" min="13" max="120" placeholder="Например, 24" value={age} onChange={(event) => setAge(event.target.value)} /></div>
                    <div><label htmlFor="profile-gender">Пол <span>необязательно</span></label><select id="profile-gender" value={gender ?? ""} onChange={(event) => setGender((event.target.value || null) as Gender)}><option value="">Не указывать</option><option value="male">Мужской</option><option value="female">Женский</option><option value="prefer_not_to_say">Не хочу указывать</option></select></div>
                  </div>
                  <span className="profile-avatar-label">Выбери своего персонажа</span>
                  <div className="avatar-grid">
                    {avatars.map((avatar) => (
                      <button key={avatar.id} type="button" className={avatarId === avatar.id ? "avatar-choice is-selected" : "avatar-choice"} onClick={() => setAvatarId(avatar.id)} aria-pressed={avatarId === avatar.id}>
                        <CharacterAvatar id={avatar.id} size={43} /><span>{avatar.label}</span>
                      </button>
                    ))}
                  </div>
                  <button className="auth-submit profile-save" type="submit" disabled={saving}>{saving ? "Сохраняем…" : "Сохранить профиль"}</button>
                  {feedback && <p className="auth-message" role="status">{feedback}</p>}
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
