import AsyncStorage from "@react-native-async-storage/async-storage";
import { no } from "./no";
import { en } from "./en";

export type Lang = "no" | "en";

const KEY = "revisit.lang.v1";

const dict = { no, en };

let currentLang: Lang = "no";
let current = dict.no;

export async function initI18n() {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored === "en" || stored === "no") {
    currentLang = stored;
    current = dict[currentLang];
  } else {
    // Simple default: Norwegian first (can change later to device locale)
    currentLang = "no";
    current = dict.no;
  }
}

export function getLang(): Lang {
  return currentLang;
}

export async function setLang(lang: Lang) {
  currentLang = lang;
  current = dict[lang];
  await AsyncStorage.setItem(KEY, lang);
}

export function t(path: string): string {
  const parts = path.split(".");
  let obj: any = current;
  for (const p of parts) {
    obj = obj?.[p];
    if (obj == null) return path; // fallback
  }
  return typeof obj === "string" ? obj : path;
}
