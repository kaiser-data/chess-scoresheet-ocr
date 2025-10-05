import type { OCRResult, GridCell } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export async function processImage(imageData: string): Promise<OCRResult> {
  try {
    // Convert base64 to blob
    const blob = await fetch(imageData).then(r => r.blob());

    const formData = new FormData();
    formData.append('image', blob, 'scoresheet.jpg');

    const response = await fetch(`${API_BASE_URL}/api/ocr`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`OCR request failed: ${response.statusText}`);
    }

    const result: OCRResult = await response.json();
    return result;

  } catch (error) {
    console.error('OCR service error:', error);
    throw new Error(`Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function processCells(cells: GridCell[]): Promise<Array<{ cellIndex: number; text: string; confidence: number }>> {
  try {
    const formData = new FormData();

    // Convert each cell image to blob and add to form
    for (const cell of cells) {
      const blob = await fetch(cell.image).then(r => r.blob());
      formData.append('images', blob, `cell-${cell.index}.jpg`);
    }

    const response = await fetch(`${API_BASE_URL}/api/ocr/batch`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Batch OCR request failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results;

  } catch (error) {
    console.error('Batch OCR service error:', error);
    throw new Error(`Failed to process cells: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
