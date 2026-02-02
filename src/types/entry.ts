import type { CategoryId } from "../constants/categories";

export type Rating = "yes" | "neutral" | "no";
export type ProfileId = "private" | "work";

export type VisitEntry = {
  id: string;
  createdAtIso: string;

  photoUri: string;
  rating: Rating;
  comment?: string;

  location?: {
    lat: number;
    lng: number;
    accuracyM?: number;
  };

  profileId: ProfileId;

  // NEW
  categoryId: CategoryId;
};
