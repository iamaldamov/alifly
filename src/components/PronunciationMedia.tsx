import articulation from "../data/pronunciation-articulation.json";

type PronunciationRecord = { zone: string; instruction: string; secondary?: string };
const records = articulation as Record<string, PronunciationRecord>;

export default function PronunciationMedia({ letter, slug }: { letter: string; slug: string }) {
  const info = records[letter];
  if (!info) return null;
  return (
    <figure className="pronunciation-visual" aria-label={`Анимация артикуляции арабской буквы ${letter}`}>
      <div className="pronunciation-visual-art">
        <img key={letter} src={`${import.meta.env.BASE_URL}pronunciation/${slug}.svg`} alt={`Анатомическая анимация: ${info.zone.toLowerCase()}`} decoding="async" />
      </div>
      <figcaption className="pronunciation-visual-caption">
        <strong>{info.zone}</strong><p>{info.instruction}</p>
        {info.secondary && <small>{info.secondary}</small>}
      </figcaption>
    </figure>
  );
}
