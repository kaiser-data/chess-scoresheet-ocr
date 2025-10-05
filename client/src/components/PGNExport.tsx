import { useState } from 'react';
import { Download, RotateCcw, Copy, Check } from 'lucide-react';
import { generatePGN, formatDate } from '../utils/pgnGenerator';
import type { GameMetadata } from '../types';

interface PGNExportProps {
  moves: string[];
  onReset: () => void;
}

export default function PGNExport({ moves, onReset }: PGNExportProps) {
  const [copied, setCopied] = useState(false);
  const [metadata, setMetadata] = useState<GameMetadata>({
    event: 'Casual Game',
    site: '?',
    date: formatDate(new Date()),
    round: '?',
    white: '?',
    black: '?',
    result: '*'
  });

  const pgn = generatePGN(moves, metadata);

  const handleDownload = () => {
    const blob = new Blob([pgn], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `game-${metadata.date}.pgn`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pgn);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const updateMetadata = (key: keyof GameMetadata, value: string) => {
    setMetadata(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white mb-2">Export PGN</h2>
          <p className="text-slate-400">Add game metadata and download your PGN file</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Metadata Form */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Event</label>
              <input
                type="text"
                value={metadata.event}
                onChange={(e) => updateMetadata('event', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Site</label>
              <input
                type="text"
                value={metadata.site}
                onChange={(e) => updateMetadata('site', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">White Player</label>
              <input
                type="text"
                value={metadata.white}
                onChange={(e) => updateMetadata('white', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Black Player</label>
              <input
                type="text"
                value={metadata.black}
                onChange={(e) => updateMetadata('black', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={metadata.date?.replace(/\./g, '-')}
                onChange={(e) => updateMetadata('date', e.target.value.replace(/-/g, '.'))}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 text-sm font-medium mb-2">Result</label>
              <select
                value={metadata.result}
                onChange={(e) => updateMetadata('result', e.target.value)}
                className="w-full px-4 py-2 bg-slate-900 text-white rounded border border-slate-700 focus:border-blue-500 outline-none"
              >
                <option value="*">In Progress (*)</option>
                <option value="1-0">White Wins (1-0)</option>
                <option value="0-1">Black Wins (0-1)</option>
                <option value="1/2-1/2">Draw (1/2-1/2)</option>
              </select>
            </div>
          </div>

          {/* PGN Preview */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-slate-300 text-sm font-medium">PGN Output</label>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 text-white rounded transition"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-900 text-slate-300 rounded border border-slate-700 overflow-x-auto text-sm font-mono">
              {pgn}
            </pre>
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-between">
          <button
            onClick={onReset}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <RotateCcw size={20} />
            Process Another
          </button>

          <button
            onClick={handleDownload}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Download size={20} />
            Download PGN
          </button>
        </div>
      </div>
    </div>
  );
}
