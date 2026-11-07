import type { AvatarId } from "./ProfileContext";

const palettes: Record<AvatarId, { body: string; light: string; accent: string; cheek: string }> = {
  sprout: { body: "#6f9c70", light: "#b6d49a", accent: "#e5b95e", cheek: "#e9a39a" },
  leaf: { body: "#4d8c79", light: "#a8d9bd", accent: "#e8c879", cheek: "#e7a99b" },
  moon: { body: "#7087b5", light: "#c2d0ed", accent: "#e6c36f", cheek: "#e9a8ad" },
  star: { body: "#b77f58", light: "#f0c99a", accent: "#f4df8c", cheek: "#e99c91" },
  book: { body: "#8879a8", light: "#d0c4e5", accent: "#e8c777", cheek: "#e7a3a0" },
  palm: { body: "#8a9a59", light: "#d0d89b", accent: "#e4b76b", cheek: "#e8a19a" },
};

export default function CharacterAvatar({ id = "sprout", size = 42 }: { id?: AvatarId; size?: number }) {
  const color = palettes[id];
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Персонаж ALIFLY">
      <ellipse cx="32" cy="55" rx="17" ry="4" fill="#173d2b" opacity=".10" />
      <path d="M14 35c-5-3-8-9-6-14 7 1 12 5 14 11" fill={color.light} stroke={color.body} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M50 35c5-3 8-9 6-14-7 1-12 5-14 11" fill={color.light} stroke={color.body} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M19 29c0-11 6-19 13-19s13 8 13 19v12c0 9-6 14-13 14s-13-5-13-14z" fill={color.body} stroke="#315b43" strokeWidth="1.6"/>
      <path d="M31 13c-5-8-3-12 2-12 5 3 5 8 1 13" fill={color.light} stroke={color.body} strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M27 34c-2.5 0-4 2-4 4" fill="none" stroke="#244334" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M41 34c-2.5 0-4 2-4 4" fill="none" stroke="#244334" strokeWidth="2.8" strokeLinecap="round"/>
      <path d="M29 42l3 3 3-3" fill={color.accent} stroke="#9a7440" strokeWidth="1" strokeLinejoin="round"/>
      <circle cx="21" cy="42" r="2.3" fill={color.cheek} opacity=".8"/>
      <circle cx="43" cy="42" r="2.3" fill={color.cheek} opacity=".8"/>
      <path d="M27 51c3 2 7 2 10 0" fill="none" stroke="#315b43" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
