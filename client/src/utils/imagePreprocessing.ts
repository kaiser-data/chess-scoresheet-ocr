// OpenCV.js operations for professional image preprocessing
import type { GridCell } from '../types';

declare const cv: any; // OpenCV.js global

export async function loadOpenCV(): Promise<void> {
  if (typeof cv !== 'undefined' && cv.Mat) {
    return; // Already loaded
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
    script.async = true;
    script.onload = () => {
      // Wait for cv to be ready
      const checkCV = setInterval(() => {
        if (typeof cv !== 'undefined' && cv.Mat) {
          clearInterval(checkCV);
          resolve();
        }
      }, 100);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export interface PreprocessConfig {
  detectGrid: boolean;
  adaptiveThreshold: boolean;
  perspectiveCorrect: boolean;
  denoise: boolean;
}

export async function preprocessImage(
  imageData: string,
  config: PreprocessConfig = {
    detectGrid: true,
    adaptiveThreshold: true,
    perspectiveCorrect: true,
    denoise: true
  }
): Promise<{ processedImage: string; cells: GridCell[] }> {

  await loadOpenCV();

  // Load image into OpenCV Mat
  const img = await loadImageToMat(imageData);
  let processed = img.clone();

  try {
    // 1. Convert to grayscale
    const gray = new cv.Mat();
    cv.cvtColor(processed, gray, cv.COLOR_RGBA2GRAY);

    // 2. Perspective correction (if document not straight)
    if (config.perspectiveCorrect) {
      const corrected = correctPerspective(gray);
      gray.delete();
      processed = corrected;
    } else {
      processed.delete();
      processed = gray;
    }

    // 3. Adaptive thresholding (better for varying lighting)
    if (config.adaptiveThreshold) {
      const binary = new cv.Mat();
      cv.adaptiveThreshold(
        processed,
        binary,
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11, // blockSize
        2   // C constant
      );
      processed.delete();
      processed = binary;
    }

    // 4. Denoise
    if (config.denoise) {
      const denoised = new cv.Mat();
      const kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(2, 2));
      cv.morphologyEx(processed, denoised, cv.MORPH_CLOSE, kernel);
      kernel.delete();
      processed.delete();
      processed = denoised;
    }

    // 5. Extract grid cells
    let cells: GridCell[] = [];
    if (config.detectGrid) {
      cells = extractGridCells(processed);
    }

    // Convert back to base64
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, processed);
    const processedImage = canvas.toDataURL('image/jpeg', 0.95);

    processed.delete();
    img.delete();

    return { processedImage, cells };

  } catch (error) {
    processed.delete();
    img.delete();
    throw error;
  }
}

function loadImageToMat(imageData: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);
      const mat = cv.imread(canvas);
      resolve(mat);
    };
    img.onerror = reject;
    img.src = imageData;
  });
}

function correctPerspective(src: any): any {
  // Detect edges
  const edges = new cv.Mat();
  cv.Canny(src, edges, 50, 150);

  // Find contours
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();
  cv.findContours(edges, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

  // Find largest rectangular contour
  let maxArea = 0;
  let bestContourIndex = -1;

  for (let i = 0; i < contours.size(); i++) {
    const contour = contours.get(i);
    const area = cv.contourArea(contour);

    if (area > maxArea && area > src.rows * src.cols * 0.1) {
      maxArea = area;
      bestContourIndex = i;
    }
  }

  edges.delete();
  hierarchy.delete();

  if (bestContourIndex === -1) {
    contours.delete();
    return src.clone();
  }

  // Get corners and apply perspective transform
  const bestContour = contours.get(bestContourIndex);
  const peri = cv.arcLength(bestContour, true);
  const approx = new cv.Mat();
  cv.approxPolyDP(bestContour, approx, 0.02 * peri, true);

  contours.delete();

  if (approx.rows !== 4) {
    approx.delete();
    return src.clone();
  }

  // Four-point perspective transform
  const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
    approx.data32F[0], approx.data32F[1],
    approx.data32F[2], approx.data32F[3],
    approx.data32F[4], approx.data32F[5],
    approx.data32F[6], approx.data32F[7]
  ]);

  const width = Math.max(
    distance(approx.data32F[0], approx.data32F[1], approx.data32F[2], approx.data32F[3]),
    distance(approx.data32F[4], approx.data32F[5], approx.data32F[6], approx.data32F[7])
  );

  const height = Math.max(
    distance(approx.data32F[0], approx.data32F[1], approx.data32F[6], approx.data32F[7]),
    distance(approx.data32F[2], approx.data32F[3], approx.data32F[4], approx.data32F[5])
  );

  const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
    0, 0,
    width, 0,
    width, height,
    0, height
  ]);

  const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
  const dst = new cv.Mat();
  const dsize = new cv.Size(width, height);
  cv.warpPerspective(src, dst, M, dsize);

  srcPoints.delete();
  dstPoints.delete();
  M.delete();
  approx.delete();

  return dst;
}

function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function extractGridCells(src: any): GridCell[] {
  const cells: GridCell[] = [];

  try {
    // Detect lines using HoughLinesP
    const lines = new cv.Mat();
    cv.HoughLinesP(src, lines, 1, Math.PI / 180, 100, 50, 10);

    const horizontal: any[] = [];
    const vertical: any[] = [];

    // Separate horizontal and vertical lines
    for (let i = 0; i < lines.rows; i++) {
      const x1 = lines.data32S[i * 4];
      const y1 = lines.data32S[i * 4 + 1];
      const x2 = lines.data32S[i * 4 + 2];
      const y2 = lines.data32S[i * 4 + 3];

      const angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;

      if (Math.abs(angle) < 10 || Math.abs(angle) > 170) {
        horizontal.push({ x1, y1, x2, y2, y: (y1 + y2) / 2 });
      } else if (Math.abs(Math.abs(angle) - 90) < 10) {
        vertical.push({ x1, y1, x2, y2, x: (x1 + x2) / 2 });
      }
    }

    lines.delete();

    // Sort lines
    horizontal.sort((a, b) => a.y - b.y);
    vertical.sort((a, b) => a.x - b.x);

    // Extract cells from grid intersections
    const canvas = document.createElement('canvas');
    cv.imshow(canvas, src);

    let cellIndex = 0;
    for (let i = 0; i < horizontal.length - 1; i++) {
      for (let j = 0; j < vertical.length - 1; j++) {
        const y = Math.floor(horizontal[i].y);
        const height = Math.floor(horizontal[i + 1].y - y);
        const x = Math.floor(vertical[j].x);
        const width = Math.floor(vertical[j + 1].x - x);

        if (width > 20 && height > 20 && width < src.cols && height < src.rows) {
          // Extract cell region
          const rect = new cv.Rect(x, y, width, height);
          const cell = src.roi(rect);

          const cellCanvas = document.createElement('canvas');
          cv.imshow(cellCanvas, cell);

          cells.push({
            index: cellIndex++,
            image: cellCanvas.toDataURL('image/jpeg', 0.95),
            bounds: { x, y, width, height }
          });

          cell.delete();
        }
      }
    }

  } catch (error) {
    console.error('Grid extraction error:', error);
  }

  return cells;
}
