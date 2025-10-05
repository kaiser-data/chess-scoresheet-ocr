import { useState } from 'react';
import CameraCapture from './components/CameraCapture';
import ImagePreview from './components/ImagePreview';
import MoveReviewPanel from './components/MoveReviewPanel';
import PGNExport from './components/PGNExport';
import ProgressIndicator from './components/ProgressIndicator';
import { preprocessImage } from './utils/imagePreprocessing';
import { processImage, processCells } from './utils/ocrService';
import { ChessValidator } from './utils/chessValidator';
import type { ParsedMove } from './types';

type AppState = 'capture' | 'preview' | 'processing' | 'review' | 'export';

function App() {
  const [state, setState] = useState<AppState>('capture');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [moves, setMoves] = useState<ParsedMove[]>([]);
  const [validator] = useState(() => new ChessValidator());
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  const handleCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setState('preview');
  };

  const handleProcess = async () => {
    setProcessing(true);
    setError('');
    setState('processing');

    try {
      // Step 1: Preprocess image
      const { processedImage, cells } = await preprocessImage(capturedImage, {
        detectGrid: true,
        adaptiveThreshold: true,
        perspectiveCorrect: true,
        denoise: true
      });

      setProcessedImage(processedImage);

      // Step 2: OCR - use cell-by-cell if grid detected, otherwise full page
      let parsedMoves: ParsedMove[];

      if (cells.length > 0) {
        // Grid detected - process individual cells
        const ocrResults = await processCells(cells);

        parsedMoves = ocrResults.map((result, index) => {
          if (!result.text || result.text.trim() === '') {
            return {
              original: '',
              move: '',
              confidence: 'failed' as const,
              needsReview: true,
              source: 'manual-required' as const,
              legalMoves: validator.getLegalMoves(),
              cellIndex: index
            };
          }

          return validator.validateMove(result.text, result.confidence, index);
        });

      } else {
        // No grid - process full page
        const ocrResult = await processImage(processedImage);
        const moveTexts = parseMovesFromFullText(ocrResult.text);

        parsedMoves = moveTexts.map((text, index) =>
          validator.validateMove(text, ocrResult.confidence, index)
        );
      }

      setMoves(parsedMoves);
      setState('review');

    } catch (err) {
      console.error('Processing error:', err);
      setError(err instanceof Error ? err.message : 'Processing failed');
      setState('preview');
    } finally {
      setProcessing(false);
    }
  };

  const handleMoveCorrection = (index: number, correctedMove: string) => {
    const updated = [...moves];
    updated[index] = {
      ...updated[index],
      move: correctedMove,
      confidence: 'high',
      needsReview: false
    };
    setMoves(updated);

    // Rebuild game state
    validator.reset();
    for (let i = 0; i <= index; i++) {
      if (updated[i].move) {
        validator.commitMove(updated[i].move);
      }
    }
  };

  const handleExport = () => {
    setState('export');
  };

  const handleReset = () => {
    setCapturedImage('');
    setProcessedImage('');
    setMoves([]);
    validator.reset();
    setError('');
    setState('capture');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Chess Scoresheet OCR
          </h1>
          <p className="text-slate-400">
            Professional handwriting recognition powered by Google Cloud Vision
          </p>
        </header>

        {error && (
          <div className="max-w-2xl mx-auto mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {state === 'capture' && (
          <CameraCapture onCapture={handleCapture} />
        )}

        {state === 'preview' && (
          <ImagePreview
            image={capturedImage}
            onProcess={handleProcess}
            onRetake={handleReset}
          />
        )}

        {state === 'processing' && (
          <ProgressIndicator message="Processing scoresheet with AI..." />
        )}

        {state === 'review' && (
          <MoveReviewPanel
            moves={moves}
            originalImage={processedImage}
            validator={validator}
            onCorrection={handleMoveCorrection}
            onExport={handleExport}
          />
        )}

        {state === 'export' && (
          <PGNExport
            moves={moves.map(m => m.move)}
            onReset={handleReset}
          />
        )}
      </div>
    </div>
  );
}

// Helper to parse moves from full-page OCR text
function parseMovesFromFullText(text: string): string[] {
  const moves: string[] = [];

  // Remove move numbers
  const cleaned = text.replace(/\d+\./g, '');

  // Split by whitespace and filter
  const tokens = cleaned.split(/\s+/).filter(t => t.trim().length > 0);

  for (const token of tokens) {
    // Basic chess move pattern
    if (/^[KQRBN]?[a-h]?[1-8]?x?[a-h][1-8](=[QRBN])?[+#]?$/.test(token) ||
        /^O-O(-O)?$/.test(token)) {
      moves.push(token);
    }
  }

  return moves;
}

export default App;
