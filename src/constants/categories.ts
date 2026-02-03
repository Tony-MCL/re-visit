export type CategoryId =
  | "restaurant"
  | "cafe"
  | "hotel"
  | "travel"
  | "experience"
  | "activity"
  | "other";

export type CategoryDef = {
  id: CategoryId;
  emoji: string;
  labelKey: string; // i18n key, e.g. "categories.restaurant"
};

export const CATEGORIES: CategoryDef[] = [
  { id: "restaurant", emoji: "🍽️", labelKey: "categories.restaurant" },
  { id: "cafe", emoji: "☕", labelKey: "categories.cafe" },
  { id: "hotel", emoji: "🏨", labelKey: "categories.hotel" },
  { id: "travel", emoji: "✈️", labelKey: "categories.travel" },
  { id: "experience", emoji: "🎭", labelKey: "categories.experience" },
  { id: "activity", emoji: "🏃", labelKey: "categories.activity" },
  { id: "other", emoji: "📍", labelKey: "categories.other" },
];

export function isCategoryId(v: unknown): v is CategoryId {
  return (
    v === "restaurant" ||
    v === "cafe" ||
    v === "hotel" ||
    v === "travel" ||
    v === "experience" ||
    v === "activity" ||
    v === "other"
  );
}

export function normalizeCategoryId(v: unknown): CategoryId {
  return isCategoryId(v) ? v : "other";
}
