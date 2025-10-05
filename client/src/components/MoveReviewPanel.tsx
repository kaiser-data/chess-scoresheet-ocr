import { useState } from 'react';
import { ChevronRight, Download, AlertCircle, CheckCircle } from 'lucide-react';
import type { ParsedMove } from '../types';
import { ChessValidator } from '../utils/chessValidator';

interface MoveReviewPanelProps {
  moves: ParsedMove[];
  originalImage: string;
  validator: ChessValidator;
  onCorrection: (index: number, correctedMove: string) => void;
  onExport: () => void;
}

export default function MoveReviewPanel({
  moves,
  originalImage,
  validator,
  onCorrection,
  onExport
}: MoveReviewPanelProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const needsReview = moves.filter(m => m.needsReview).length;
  const allValid = moves.every(m => !m.needsReview);

  const handleEdit = (index: number, move: ParsedMove) => {
    setEditingIndex(index);
    setEditValue(move.move);
  };

  const handleSave = (index: number) => {
    onCorrection(index, editValue);
    setEditingIndex(null);
    setEditValue('');
  };

  const handleSelectLegal = (index: number, legalMove: string) => {
    onCorrection(index, legalMove);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">Review Moves</h2>
          <div className="flex items-center gap-4 text-sm">
            {needsReview > 0 ? (
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle size={16} />
                <span>{needsReview} move{needsReview !== 1 ? 's' : ''} need review</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle size={16} />
                <span>All moves validated</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 p-6">
          {/* Move List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {moves.map((move, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  move.needsReview
                    ? 'bg-yellow-500/10 border-yellow-500'
                    : 'bg-slate-700 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm">
                    Move {index + 1} {index % 2 === 0 ? '(White)' : '(Black)'}
                  </span>
                  {move.confidence !== 'failed' && (
                    <span className={`text-xs px-2 py-1 rounded ${
                      move.confidence === 'high' ? 'bg-green-500/20 text-green-400' :
                      move.confidence === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {move.confidence}
                    </span>
                  )}
                </div>

                {editingIndex === index ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 text-white rounded border border-slate-600 focus:border-blue-500 outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSave(index)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white font-mono text-lg">{move.move || '---'}</span>
                      {move.needsReview && (
                        <button
                          onClick={() => handleEdit(index, move)}
                          className="text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Edit
                        </button>
                      )}
                    </div>

                    {move.original && move.original !== move.move && (
                      <p className="text-slate-400 text-sm">OCR: {move.original}</p>
                    )}

                    {move.legalMoves && move.legalMoves.length > 0 && (
                      <div className="mt-2">
                        <p className="text-slate-400 text-xs mb-1">Legal moves:</p>
                        <div className="flex flex-wrap gap-1">
                          {move.legalMoves.slice(0, 10).map((legalMove, i) => (
                            <button
                              key={i}
                              onClick={() => handleSelectLegal(index, legalMove)}
                              className="px-2 py-1 text-xs bg-slate-600 hover:bg-blue-600 text-white rounded transition"
                            >
                              {legalMove}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Preview Image */}
          <div className="sticky top-6">
            <div className="bg-slate-900 rounded-lg p-4">
              <h3 className="text-white font-semibold mb-3">Processed Image</h3>
              <img
                src={originalImage}
                alt="Processed scoresheet"
                className="w-full rounded border border-slate-700"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-end">
          <button
            onClick={onExport}
            disabled={!allValid}
            className="px-8 py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Download size={20} />
            Export PGN
          </button>
        </div>
      </div>
    </div>
  );
}
