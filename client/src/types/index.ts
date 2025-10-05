export interface OCRResult {
  text: string;
  confidence: number;
  words?: Array<{
    text: string;
    confidence: number;
    bounds: Array<{ x: number; y: number }>;
  }>;
}

export interface GridCell {
  index: number;
  image: string; // base64
  bounds: { x: number; y: number; width: number; height: number };
}

export interface ParsedMove {
  original: string;
  move: string;
  confidence: 'high' | 'medium' | 'low' | 'failed';
  needsReview: boolean;
  source: 'ocr-direct' | 'castling-fix' | 'disambiguation' | 'fuzzy-match' | 'manual-required';
  legalMoves?: string[];
  suggestion?: string;
  cellIndex?: number;
}

export interface GameMetadata {
  event?: string;
  site?: string;
  date?: string;
  round?: string;
  white?: string;
  black?: string;
  result?: '1-0' | '0-1' | '1/2-1/2' | '*';
}

export interface PreprocessingResult {
  processedImage: string;
  cells: GridCell[];
  detectedGrid: boolean;
}
