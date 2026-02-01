import AsyncStorage from "@react-native-async-storage/async-storage";
import type { VisitEntry } from "../types/entry";

const KEY = "revisit.entries.v1";

export async function loadEntries(): Promise<VisitEntry[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as VisitEntry[];
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

export async function saveEntries(entries: VisitEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(entries));
}

export async function addEntry(entry: VisitEntry): Promise<VisitEntry[]> {
  const entries = await loadEntries();
  const next = [entry, ...entries];
  await saveEntries(next);
  return next;
}

export async function clearEntries(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
