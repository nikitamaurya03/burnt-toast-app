export const WARDROBE_CATEGORIES = [
  "Tops", "Bottoms", "Jeans", "Trousers", "Shirts", "T-Shirts",
  "Kurtas", "Dresses", "Sarees", "Blazers", "Jackets", "Footwear",
  "Handbags", "Jewelry", "Watches", "Belts", "Ethnic Wear",
  "Activewear", "Loungewear", "Outerwear", "Accessories",
] as const;

export type WardrobeCategory = (typeof WARDROBE_CATEGORIES)[number];

export type ItemSource = "manual" | "upload" | "purchase" | "recommendation" | "lookbook" | "tryon";
export type ItemStatus = "active" | "donated" | "sold" | "archived";

export interface WardrobeItem {
  id: string;
  imageUrl: string;
  imageThumbnail?: string;
  category: string;
  subCategory?: string;
  color: string;
  pattern?: string;
  season?: string;
  brand?: string;
  size?: string;
  fit?: string;
  fabric?: string;
  occasion?: string;
  style?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentStatus: ItemStatus;
  wearCount: number;
  favorite: boolean;
  tags: string[];
  source: ItemSource;
  createdAt: number;
  updatedAt: number;
}

export interface WardrobeAnalytics {
  totalItems: number;
  totalValue: number;
  categoryDistribution: Record<string, number>;
  colorDistribution: Record<string, number>;
  mostWorn: WardrobeItem[];
  unused: WardrobeItem[];
  favoriteCount: number;
  avgCostPerWear: number;
}

export interface OutfitSuggestion {
  id: string;
  top?: WardrobeItem;
  bottom?: WardrobeItem;
  shoes?: WardrobeItem;
  bag?: WardrobeItem;
  jewelry?: WardrobeItem;
  outerwear?: WardrobeItem;
  occasion: string;
  reasoning: string;
  createdAt: number;
}

export interface AITagResult {
  category: string;
  color: string;
  pattern: string;
  season: string;
  occasion: string;
  style: string;
  fabric: string;
  brand: string;
  fit: string;
  tags: string[];
}
