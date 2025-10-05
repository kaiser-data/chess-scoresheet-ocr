// Minimal Express server that proxies to Google Vision API
const express = require('express');
const cors = require('cors');
const vision = require('@google-cloud/vision');
const multer = require('multer');
const config = require('./config');

const app = express();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxFileSize }
});

// Initialize Google Vision client
const visionClient = new vision.ImageAnnotatorClient({
  keyFilename: config.googleCredentials
});

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'chess-ocr' });
});

// OCR endpoint - accepts image, returns text
app.post('/api/ocr', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image provided' });
    }

    console.log(`Processing image: ${req.file.size} bytes`);

    const [result] = await visionClient.documentTextDetection({
      image: { content: req.file.buffer },
      imageContext: {
        languageHints: ['en'],
        // Enable handwriting-specific features
        textDetectionParams: {
          enableTextDetectionConfidenceScore: true
        }
      }
    });

    if (!result.fullTextAnnotation) {
      return res.json({
        text: '',
        confidence: 0,
        words: []
      });
    }

    const fullText = result.fullTextAnnotation.text;
    const pages = result.fullTextAnnotation.pages || [];
    const confidence = pages[0]?.confidence || 0;

    // Extract word-level details with bounding boxes
    const words = [];
    if (result.textAnnotations && result.textAnnotations.length > 0) {
      // Skip first annotation (full text), process individual words
      for (let i = 1; i < result.textAnnotations.length; i++) {
        const annotation = result.textAnnotations[i];
        words.push({
          text: annotation.description,
          confidence: annotation.confidence || 0,
          bounds: annotation.boundingPoly.vertices
        });
      }
    }

    console.log(`OCR complete: ${words.length} words detected`);

    res.json({
      text: fullText,
      confidence,
      words
    });

  } catch (error) {
    console.error('OCR error:', error);
    res.status(500).json({
      error: 'OCR processing failed',
      message: error.message
    });
  }
});

// Batch OCR for multiple cells
app.post('/api/ocr/batch', upload.array('images', config.maxBatchSize), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images provided' });
    }

    console.log(`Processing ${req.files.length} cells`);

    const results = await Promise.all(
      req.files.map(async (file, index) => {
        try {
          const [result] = await visionClient.documentTextDetection({
            image: { content: file.buffer },
            imageContext: {
              languageHints: ['en']
            }
          });

          const text = result.fullTextAnnotation?.text || '';
          const confidence = result.fullTextAnnotation?.pages?.[0]?.confidence || 0;

          return {
            cellIndex: index,
            text: text.trim(),
            confidence
          };
        } catch (error) {
          console.error(`Cell ${index} error:`, error);
          return {
            cellIndex: index,
            text: '',
            confidence: 0,
            error: error.message
          };
        }
      })
    );

    console.log(`Batch OCR complete: ${results.length} cells processed`);

    res.json({ results });

  } catch (error) {
    console.error('Batch OCR error:', error);
    res.status(500).json({
      error: 'Batch OCR processing failed',
      message: error.message
    });
  }
});

const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Chess OCR server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
