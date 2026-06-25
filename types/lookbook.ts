export type LookSource = "outfit" | "tryon" | "recommendation" | "upload" | "moodboard" | "ai-chat";

export interface LookbookItem {
  id: string;
  imageUrl: string;
  imageThumbnail?: string;
  title: string;
  description?: string;
  occasion?: string;
  season?: string;
  aesthetic?: string;
  colors: string[];
  tags: string[];
  source: LookSource;
  liked: boolean;
  collectionIds: string[];
  createdAt: number;
}

export interface LookbookCollection {
  id: string;
  name: string;
  coverImage?: string;
  description?: string;
  itemCount: number;
  createdAt: number;
  updatedAt: number;
}

export const DEFAULT_COLLECTIONS = [
  "Workwear", "Vacation", "Wedding", "Date Night", "Brunch Looks",
  "Old Money", "Quiet Luxury", "Indian Festive", "Winter Style",
  "Summer Style", "Capsule Wardrobe", "Wishlist", "Future Purchases",
] as const;
