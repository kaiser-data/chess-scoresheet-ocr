import { RotateCw, ZoomIn, Check, X } from 'lucide-react';

interface ImagePreviewProps {
  image: string;
  onProcess: () => void;
  onRetake: () => void;
}

export default function ImagePreview({ image, onProcess, onRetake }: ImagePreviewProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">Preview Scoresheet</h2>
          <p className="text-slate-400 mt-1">Review the image before processing</p>
        </div>

        <div className="p-6">
          <div className="relative">
            <img
              src={image}
              alt="Captured scoresheet"
              className="w-full rounded-lg border-2 border-slate-700"
            />
          </div>
        </div>

        <div className="p-6 border-t border-slate-700 flex justify-between items-center">
          <button
            onClick={onRetake}
            className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition flex items-center gap-2"
          >
            <X size={20} />
            Retake
          </button>

          <button
            onClick={onProcess}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition flex items-center gap-2"
          >
            <Check size={20} />
            Process Image
          </button>
        </div>
      </div>
    </div>
  );
}
