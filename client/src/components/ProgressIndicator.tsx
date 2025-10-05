import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  message: string;
}

export default function ProgressIndicator({ message }: ProgressIndicatorProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl p-12 text-center">
        <Loader2 size={64} className="mx-auto text-blue-400 animate-spin mb-6" />
        <h2 className="text-2xl font-bold text-white mb-3">{message}</h2>
        <p className="text-slate-400">This may take a few seconds...</p>
      </div>
    </div>
  );
}
