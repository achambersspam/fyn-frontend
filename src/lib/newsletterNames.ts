import type { Newsletter } from "./apiContracts";

// Newsletters are shown as "Newsletter 1", "Newsletter 2", ... in the order they were created.
// Numbers are always consecutive, so deleting one shifts the later ones down.
// Display only: nothing here is saved to the backend or used in emails.

type Numbered = Pick<Newsletter, "id" | "created_at">;

export function orderNewsletters<T extends Numbered>(list: T[]): T[] {
  return list
    .map((nl, index) => ({ nl, index }))
    .sort((a, b) => {
      const ta = a.nl.created_at ? Date.parse(a.nl.created_at) : NaN;
      const tb = b.nl.created_at ? Date.parse(b.nl.created_at) : NaN;
      if (Number.isFinite(ta) && Number.isFinite(tb) && ta !== tb) return ta - tb;
      return a.index - b.index;
    })
    .map((x) => x.nl);
}

export function newsletterNumbers(list: Numbered[]): Record<string, number> {
  return Object.fromEntries(orderNewsletters(list).map((nl, i) => [nl.id, i + 1]));
}

export function newsletterName(id: string, list: Numbered[]): string {
  const n = newsletterNumbers(list)[id];
  return n ? `Newsletter ${n}` : "Newsletter";
}

export type Renumbering = { from: number; to: number }[];

const storageKey = (userId: string) => `fyn.newsletterNumbers.${userId}`;

function readStored(userId: string): Record<string, number> | null {
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as Record<string, number>) : null;
  } catch {
    return null;
  }
}

function writeStored(userId: string, value: Record<string, number>) {
  try {
    window.localStorage.setItem(storageKey(userId), JSON.stringify(value));
  } catch {
    // storage unavailable — numbering still displays, only the notice is skipped
  }
}

// Records a baseline without consuming a pending renumber notice.
export function seedNumbering(userId: string, list: Numbered[]) {
  if (typeof window === "undefined") return;
  if (list.length > 0 && !readStored(userId)) {
    writeStored(userId, newsletterNumbers(list));
  }
}

// Compares the current numbering with what this user last saw and records the new numbering.
// Returns the shifts caused by a deletion (empty when nothing moved).
export function checkRenumbering(userId: string, list: Numbered[]): Renumbering {
  if (typeof window === "undefined") return [];
  const current = newsletterNumbers(list);
  const previous = readStored(userId) ?? {};
  writeStored(userId, current);
  return Object.entries(current)
    .filter(([id, to]) => previous[id] !== undefined && previous[id] !== to)
    .map(([id, to]) => ({ from: previous[id], to }))
    .sort((a, b) => a.to - b.to);
}
