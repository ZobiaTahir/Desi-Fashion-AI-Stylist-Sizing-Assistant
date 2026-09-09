export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  sizingData?: SizingResult | null;
}

export interface CustomerProfile {
  name: string;
  bust: string;
  waist: string;
  hips: string;
  height: string;
  fitPreference: 'fitted' | 'regular' | 'modest';
  preferredOccasion: string;
  gender: 'female' | 'male' | 'unisex';
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

export interface SizingResult {
  recommendedSize: string;
  sizeNumber: string;
  userMeasurements: {
    bust: number;
    waist: number | null;
    hips: number | null;
  };
  finishedGarmentBust: string;
  fitEase: string;
  seamAllowance: string;
  lehengaLengthEstimate: string;
  choliBlouseTip: string;
}

export interface TrendItem {
  id: string;
  title: string;
  category: string;
  description: string;
  fabrics: string[];
  colors: string[];
  recommendedFor: string;
}
