export type Rating = "yes" | "neutral" | "no";

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
};
