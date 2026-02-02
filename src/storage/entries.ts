import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ProfileId, VisitEntry } from "../types/entry";

const KEY = "revisit.entries.v1";

type Stored = {
  entries: VisitEntry[];
};

async function readAll(): Promise<Stored> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return { entries: [] };

  try {
    const parsed = JSON.parse(raw) as Stored;
    if (!parsed || !Array.isArray(parsed.entries)) return { entries: [] };
    return parsed;
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

export async function clearEntries(profileId?: ProfileId) {
  if (!profileId) {
    await writeAll({ entries: [] });
    return;
  }

  const data = await readAll();
  const kept = data.entries.filter((e) => e.profileId !== profileId);
  await writeAll({ entries: kept });
}
