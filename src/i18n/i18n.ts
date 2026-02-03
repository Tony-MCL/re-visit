import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import { no } from "./no";
import { en } from "./en";

export type Lang = "no" | "en";

const KEY = "revisit.lang.v1";
const dict = { no, en };

let currentLang: Lang = "no";
let current = dict.no;

function normalizeToLang(deviceTag: string | null | undefined): Lang {
  const tag = (deviceTag || "").toLowerCase();

  if (tag.startsWith("nb") || tag.startsWith("nn") || tag.startsWith("no")) return "no";
  if (tag.startsWith("en")) return "en";

  return "en";
}

export async function initI18n() {
  const stored = await AsyncStorage.getItem(KEY);
  if (stored === "en" || stored === "no") {
    currentLang = stored;
    current = dict[currentLang];
    return;
  }

  const locales = Localization.getLocales?.() || [];
  const primary = locales[0]?.languageTag || Localization.locale || "";
  const autoLang = normalizeToLang(primary);

  currentLang = autoLang;
  current = dict[currentLang];

  // store auto choice (so it stays stable until user changes it)
  await AsyncStorage.setItem(KEY, currentLang);
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
    if (obj == null) return path;
  }
  return typeof obj === "string" ? obj : path;
}
