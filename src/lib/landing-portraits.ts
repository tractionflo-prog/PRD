/** Deterministic RandomUser portraits for landing UI (Next/Image allowlisted). */
export function portrait(kind: "men" | "women", id: number) {
  const n = Math.max(0, Math.min(99, id));
  return `https://randomuser.me/api/portraits/${kind}/${n}.jpg`;
}
