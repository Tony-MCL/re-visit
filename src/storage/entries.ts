import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProfileId, VisitEntry } from "../types/entry";
import { normalizeCategoryId } from "../constants/categories";

const KEY = "revisit.entries.v1";

type Stored = {
  entries: VisitEntry[];
};

function sanitize(e: any): VisitEntry | null {
  if (!e || typeof e !== "object") return null;
  if (!e.id || !e.createdAtIso || !e.photoUri || !e.rating || !e.profileId) return null;

  return {
    id: String(e.id),
    createdAtIso: String(e.createdAtIso),
    photoUri: String(e.photoUri),
    rating: e.rating,
    comment: typeof e.comment === "string" ? e.comment : undefined,
    location:
      e.location && typeof e.location === "object"
        ? {
            lat: Number(e.location.lat),
            lng: Number(e.location.lng),
            accuracyM:
              e.location.accuracyM === undefined ? undefined : Number(e.location.accuracyM),
          }
        : undefined,
    profileId: e.profileId,
    categoryId: normalizeCategoryId(e.categoryId),
  } as VisitEntry;
}

async function readAll(): Promise<Stored> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { entries: [] };

  try {
    const parsed = JSON.parse(raw) as any;
    const arr = Array.isArray(parsed?.entries) ? parsed.entries : [];
    const sanitized = arr.map(sanitize).filter(Boolean) as VisitEntry[];
    return { entries: sanitized };
  } catch {
    return { entries: [] };
  }
}

async function writeAll(data: Stored) {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function addEntry(entry: VisitEntry) {
  const data = await readAll();
  const next = [entry, ...data.entries];
  await writeAll({ entries: next });
}

export async function loadEntries(profileId?: ProfileId): Promise<VisitEntry[]> {
  const data = await readAll();
  const sorted = [...data.entries].sort((a, b) =>
    a.createdAtIso < b.createdAtIso ? 1 : -1
  );

  if (!profileId) return sorted;
  return sorted.filter((e) => e.profileId === profileId);
}

export async function deleteEntry(entryId: string) {
  const data = await readAll();
  const next = data.entries.filter((e) => e.id !== entryId);
  await writeAll({ entries: next });
}

export async function clearEntries(profileId?: ProfileId) {
  if (!profileId) {
    await writeAll({ entries: [] });
    return;
  }

  const data = await readAll();
  const kept = data.entries.filter((e) => e.profileId !== profileId);
  await writeAll({ entries: kept });
}

export async function countAllEntries(): Promise<number> {
  const data = await readAll();
  return data.entries.length;
}
