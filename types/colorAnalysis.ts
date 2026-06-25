// types/colorAnalysis.ts — Personal Color Analysis feature type definitions

export interface FaceAttributes {
  skin_tone: string;
  skin_depth: string;
  skin_brightness: number;
  skin_saturation: number;
  eye_color: string;
  hair_color: string;
  hair_depth: string;
  lip_color: string;
  contrast_level: string;
}

export interface UndertoneResult {
  undertone: "warm" | "cool" | "neutral" | "olive";
  warm_score: number;
  cool_score: number;
  neutral_score: number;
  olive_score: number;
  confidence: number;
  reasoning: string;
}

export interface ContrastResult {
  contrast: "low" | "medium" | "high";
  hair_vs_skin: number;
  eyes_vs_skin: number;
  score: number;
}

export interface SeasonResult {
  primary: string;
  secondary: string;
  confidence: number;
  reasoning: string;
}

export interface ColorEntry {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  category: "primary" | "secondary" | "accent" | "business" | "casual" | "statement" | "formal";
  why_it_works?: string;
}

export interface NeutralColors {
  best_whites: ColorEntry[];
  best_blacks: ColorEntry[];
  business_neutrals: ColorEntry[];
  casual_neutrals: ColorEntry[];
  denim_recommendations: string[];
}

export interface AvoidColor {
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  reason: string;
}

export interface BeautyRecommendations {
  lipstick: ColorEntry[];
  blush: ColorEntry[];
  eyeshadow: ColorEntry[];
  jewelry: string;
  frames: ColorEntry[];
  handbags: ColorEntry[];
  footwear: ColorEntry[];
}

export interface StylingRecommendation {
  category: "workwear" | "casual" | "vacation" | "evening" | "wedding_guest" | "activewear";
  description: string;
  color_suggestions: string[];
  outfit_ideas: string[];
}

export interface ClothingComparison {
  best_match: { color: ColorEntry; explanation: string };
  neutral: { color: ColorEntry; explanation: string };
  avoid: { color: ColorEntry; explanation: string };
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  confidence: number;
}

export interface ColorAnalysisResult {
  id: string;
  face_attributes: FaceAttributes;
  undertone: UndertoneResult;
  contrast: ContrastResult;
  season: SeasonResult;
  best_colors: ColorEntry[];
  neutrals: NeutralColors;
  avoid_colors: AvoidColor[];
  beauty: BeautyRecommendations;
  styling: StylingRecommendation[];
  clothing_comparison: ClothingComparison;
  narrative: string;
  created_at: number;
  image_thumbnail?: string;
}

export interface ColorAnalysisHistory {
  analyses: ColorAnalysisResult[];
}
