export const crew = [
  { id: "luffy", name: "Monkey D. Luffy", shortName: "Luffy", role: "Captain", symbol: "meat", color: "#ff0000" },
  { id: "zoro", name: "Roronoa Zoro", shortName: "Zoro", role: "Swordsman", symbol: "swords", color: "#78d887" },
  { id: "nami", name: "Nami", shortName: "Nami", role: "Navigator", symbol: "orange", color: "#ff6600" },
  { id: "usopp", name: "Usopp", shortName: "Usopp", role: "Sniper", symbol: "slingshot", color: "#8F321E" },
  { id: "sanji", name: "Sanji", shortName: "Sanji", role: "Cook", symbol: "chef-hat", color: "#F4FF00" },
  { id: "chopper", name: "Tony Tony Chopper", shortName: "Chopper", role: "Doctor", symbol: "cherry-blossom", color: "#f28ca6" },
  { id: "robin", name: "Nico Robin", shortName: "Robin", role: "Archaeologist", symbol: "book", color: "#bba4ff" },
  { id: "franky", name: "Franky", shortName: "Franky", role: "Shipwright", symbol: "cola", color: "#68d7e8" },
  { id: "brook", name: "Brook", shortName: "Brook", role: "Musician", symbol: "violin", color: "#d0d5ea" },
  { id: "jinbe", name: "Jinbe", shortName: "Jinbe", role: "Helmsman", symbol: "sake-cup", color: "#2b89e8" },
] as const;

export type CrewId = (typeof crew)[number]["id"];
export type CrewMember = (typeof crew)[number];
export type GameMode = "computer" | "friends";
export type Mark = 0 | 1;
export type RoundResult = { winner: Mark | null; line: number[]; final: boolean };
export type MusicTrack = { id: string; name: string; file: string };

export const tracks: MusicTrack[] = [
  { id: "overtaken", name: "Overtaken", file: "/audio/overtaken.mp3" },
  { id: "memories", name: "Memories", file: "/audio/memories.mp3" },
  { id: "drums", name: "Drums of Liberation", file: "/audio/drums-of-liberation.mp3" },
  { id: "binks", name: "Binks’ Sake", file: "/audio/binks-no-sake.mp3" },
];

export function getCrew(id: CrewId): CrewMember {
  return crew.find((member) => member.id === id) ?? crew[0];
}

export function isCrewId(value: string): value is CrewId {
  return crew.some((member) => member.id === value);
}

export function randomCrew(excluding: CrewId): CrewId {
  const choices = crew.filter((member) => member.id !== excluding);
  return choices[Math.floor(Math.random() * choices.length)]?.id ?? crew[0].id;
}

export function clampRounds(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(20, Math.max(1, Math.trunc(value)));
}

export function characterSound(id: CrewId): string {
  return `/audio/sound-effects/${id}.mp3`;
}
