import { Chess } from 'chess.js';
import type { ParsedMove } from '../types';

const CHARACTER_CONFUSIONS: Record<string, string[]> = {
  '0': ['O'],
  'O': ['0', 'Q'],
  '8': ['B', '&'],
  'B': ['8', 'R'],
  '6': ['b', 'G'],
  'b': ['6'],
  '5': ['S'],
  'S': ['5'],
  '1': ['l', 'I', '|'],
  'l': ['1', 'I'],
  'I': ['1', 'l'],
  'x': ['×', 'X'],
  '+': ['†', '#'],
  'a': ['o'],
  'c': ['e'],
  'd': ['b', 'cl'],
  'N': ['H', 'M'],
  'Q': ['O', '0'],
  'K': ['R'],
  'R': ['K', 'B']
};

export class ChessValidator {
  private game: Chess;
  private moveHistory: ParsedMove[];

  constructor() {
    this.game = new Chess();
    this.moveHistory = [];
  }

  reset(): void {
    this.game.reset();
    this.moveHistory = [];
  }

  getCurrentFEN(): string {
    return this.game.fen();
  }

  getLegalMoves(): string[] {
    return this.game.moves();
  }

  validateMove(ocrText: string, confidence: number, cellIndex?: number): ParsedMove {
    const cleaned = this.cleanOCRText(ocrText);

    // 1. Try direct OCR result
    const directMove = this.tryMove(cleaned);
    if (directMove) {
      return {
        original: ocrText,
        move: cleaned,
        confidence: confidence > 0.9 ? 'high' : 'medium',
        needsReview: confidence < 0.9,
        source: 'ocr-direct',
        cellIndex
      };
    }

    // 2. Handle castling notation (common confusion)
    if (/[O0][-−][O0]/.test(cleaned)) {
      const castlingVariants = [
        cleaned.replace(/0/g, 'O').replace(/−/g, '-'),
        cleaned.replace(/O/g, '0').replace(/−/g, '-')
      ];

      for (const variant of castlingVariants) {
        const move = this.tryMove(variant);
        if (move) {
          return {
            original: ocrText,
            move: variant,
            confidence: 'medium',
            needsReview: true,
            source: 'castling-fix',
            cellIndex
          };
        }
      }
    }

    // 3. Generate candidates from confusion matrix
    const candidates = this.generateCandidates(cleaned);

    for (const candidate of candidates) {
      const move = this.tryMove(candidate);
      if (move) {
        return {
          original: ocrText,
          move: candidate,
          confidence: 'medium',
          needsReview: true,
          source: 'disambiguation',
          cellIndex
        };
      }
    }

    // 4. Fuzzy matching against legal moves
    const legalMoves = this.game.moves();
    const closest = this.findClosestMatch(cleaned, legalMoves);

    if (closest.distance <= 2) {
      return {
        original: ocrText,
        move: closest.move,
        confidence: 'low',
        needsReview: true,
        source: 'fuzzy-match',
        suggestion: closest.move,
        cellIndex
      };
    }

    // 5. Manual correction required
    return {
      original: ocrText,
      move: cleaned,
      confidence: 'failed',
      needsReview: true,
      source: 'manual-required',
      legalMoves,
      cellIndex
    };
  }

  commitMove(moveText: string): boolean {
    try {
      const move = this.game.move(moveText);
      if (move) {
        this.moveHistory.push({
          original: moveText,
          move: moveText,
          confidence: 'high',
          needsReview: false,
          source: 'ocr-direct'
        });
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  undoMove(): void {
    this.game.undo();
    this.moveHistory.pop();
  }

  private tryMove(moveText: string): string | null {
    try {
      const move = this.game.move(moveText);
      if (move) {
        this.game.undo(); // Don't commit yet
        return moveText;
      }
    } catch {
      return null;
    }
    return null;
  }

  private cleanOCRText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, '')
      .replace(/[.,;]$/g, ''); // Remove trailing punctuation
  }

  private generateCandidates(text: string): string[] {
    const candidates = new Set<string>([text]);

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const alternatives = CHARACTER_CONFUSIONS[char] || [];

      for (const alt of alternatives) {
        const candidate = text.substring(0, i) + alt + text.substring(i + 1);
        candidates.add(candidate);

        // Try double substitutions for very confused cases
        if (i < text.length - 1) {
          const nextChar = text[i + 1];
          const nextAlts = CHARACTER_CONFUSIONS[nextChar] || [];

          for (const nextAlt of nextAlts) {
            const doubleCandidate =
              text.substring(0, i) + alt + nextAlt + text.substring(i + 2);
            candidates.add(doubleCandidate);
          }
        }
      }
    }

    return Array.from(candidates);
  }

  private findClosestMatch(text: string, legalMoves: string[]): { move: string; distance: number } {
    let minDistance = Infinity;
    let bestMatch = legalMoves[0] || '';

    const lowerText = text.toLowerCase();

    for (const legal of legalMoves) {
      const distance = this.levenshteinDistance(lowerText, legal.toLowerCase());

      if (distance < minDistance) {
        minDistance = distance;
        bestMatch = legal;
      }
    }

    return { move: bestMatch, distance: minDistance };
  }

  private levenshteinDistance(a: string, b: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= b.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  getHistory(): ParsedMove[] {
    return this.moveHistory;
  }

  isGameOver(): boolean {
    return this.game.isGameOver();
  }

  getResult(): string {
    if (this.game.isCheckmate()) {
      return this.game.turn() === 'w' ? '0-1' : '1-0';
    }
    if (this.game.isDraw()) {
      return '1/2-1/2';
    }
    return '*';
  }
}
