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
  // deviceTag examples: "nb-NO", "nn-NO", "en-US", "en", "no", etc.
  const tag = (deviceTag || "").toLowerCase();

  // Norwegian variants
  if (tag.startsWith("nb") || tag.startsWith("nn") || tag.startsWith("no")) return "no";

  // English variants
  if (tag.startsWith("en")) return "en";

  // Default fallback
  return "en";
}

export async function initI18n() {
  // 1) If user has chosen language before -> use that
  const stored = await AsyncStorage.getItem(KEY);
  if (stored === "en" || stored === "no") {
    currentLang = stored;
    current = dict[currentLang];
    return;
  }

  // 2) Otherwise choose from device language
  // Expo Localization: locale can be "nb-NO" etc.
  // Some Android setups use languageTag in Localization.getLocales()
  const locales = Localization.getLocales?.() || [];
  const primary = locales[0]?.languageTag || Localization.locale || "";

  const autoLang = normalizeToLang(primary);
  currentLang = autoLang;
  current = dict[currentLang];

  // Optional: store it so the app is stable across launches,
  // until user explicitly changes it in-app later.
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
    if (obj == null) return path; // fallback
  }
  return typeof obj === "string" ? obj : path;
}
