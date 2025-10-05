import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageData: string) => void;
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCapture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        onCapture(result);
      };
      reader.readAsDataURL(file);
    }
  }, [onCapture]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {showCamera ? (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              screenshotQuality={0.95}
              videoConstraints={{
                facingMode: 'environment',
                width: { ideal: 1920 },
                height: { ideal: 1080 }
              }}
              className="w-full"
            />

            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setShowCamera(false)}
                  className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCapture}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition flex items-center gap-2"
                >
                  <Camera size={20} />
                  Capture
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center">
            <h2 className="text-2xl font-bold text-white mb-8">
              Choose how to import your scoresheet
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => setShowCamera(true)}
                className="p-8 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
              >
                <Camera size={48} className="mx-auto mb-4 text-blue-400 group-hover:scale-110 transition" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Use Camera
                </h3>
                <p className="text-slate-400 text-sm">
                  Take a photo with your device camera
                </p>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-8 bg-slate-700 hover:bg-slate-600 rounded-xl transition group"
              >
                <Upload size={48} className="mx-auto mb-4 text-green-400 group-hover:scale-110 transition" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  Upload Image
                </h3>
                <p className="text-slate-400 text-sm">
                  Choose an existing photo from your device
                </p>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        )}
      </div>

      <div className="mt-6 bg-slate-800/50 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Tips for best results:</h3>
        <ul className="text-slate-300 text-sm space-y-1">
          <li>• Ensure good lighting - avoid shadows</li>
          <li>• Hold camera parallel to scoresheet</li>
          <li>• Include entire scoresheet in frame</li>
          <li>• Make sure handwriting is clearly visible</li>
        </ul>
      </div>
    </div>
  );
}
