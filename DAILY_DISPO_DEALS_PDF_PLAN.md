# Daily Dispo Deals - PDF & Image Analysis Plan

## Problem Statement

Many dispensaries upload PDFs to Weedmaps containing their daily deals. These PDFs often contain:
- Product images
- Text with product names, prices, THC%, weights
- Special promotions and discounts
- Handwritten or stylized text (hard to scrape)

We need to:
1. **Download PDFs** from Weedmaps
2. **Extract text** from PDFs
3. **Extract images** from PDFs
4. **Analyze images** with OCR/AI vision
5. **Extract product data** (name, price, THC%, weight, type)

---

## 1. Architecture Overview

### PDF Processing Pipeline

```
Weedmaps Dispensary Page
  ↓
Detect PDF Link (menu/deals PDF)
  ↓
Download PDF
  ↓
Extract Text (PDF.js or pdf-parse)
  ↓
Extract Images (pdf-poppler or pdf-image)
  ↓
For each image:
  ├─→ OCR (Tesseract or Google Vision)
  └─→ AI Vision (OpenAI Vision, Claude, or GPT-4V)
  ↓
Combine text + OCR + AI results
  ↓
Extract products with AI
  ↓
Store in database
```

---

## 2. PDF Download & Detection

### Finding PDFs on Weedmaps

**File: `lib/fetch/weedmaps-scraper.ts`**

```typescript
import * as cheerio from 'cheerio';

interface WeedmapsDispensary {
  slug: string;
  name: string;
  menuUrl: string;
}

/**
 * Scrape Weedmaps dispensary page to find PDF links
 */
export async function findWeedmapsPDFs(
  dispensarySlug: string
): Promise<string[]> {
  const url = `https://weedmaps.com/dispensaries/${dispensarySlug}`;
  
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  
  const html = await response.text();
  const $ = cheerio.load(html);
  
  const pdfLinks: string[] = [];
  
  // Look for PDF links in various places
  $('a[href$=".pdf"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href) {
      pdfLinks.push(href.startsWith('http') ? href : `https://weedmaps.com${href}`);
    }
  });
  
  // Also check for menu/deals links that might be PDFs
  $('a[href*="menu"], a[href*="deals"], a[href*="specials"]').each((_, el) => {
    const href = $(el).attr('href');
    if (href && href.includes('.pdf')) {
      pdfLinks.push(href.startsWith('http') ? href : `https://weedmaps.com${href}`);
    }
  });
  
  return pdfLinks;
}

/**
 * Download PDF from URL
 */
export async function downloadPDF(pdfUrl: string): Promise<Buffer> {
  const response = await fetch(pdfUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
```

---

## 3. PDF Text Extraction

### Using pdf-parse (Lightweight)

**Install:**
```bash
npm install pdf-parse
npm install @types/pdf-parse
```

**File: `lib/pdf/extract-text.ts`**

```typescript
import pdfParse from 'pdf-parse';

/**
 * Extract text from PDF
 */
export async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(pdfBuffer);
    return data.text;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw error;
  }
}

/**
 * Extract text with page numbers (for debugging)
 */
export async function extractTextByPage(pdfBuffer: Buffer): Promise<Map<number, string>> {
  const data = await pdfParse(pdfBuffer);
  const pages = new Map<number, string>();
  
  // pdf-parse doesn't give page-by-page by default
  // For page-by-page, we'd need to split the PDF or use a different library
  pages.set(1, data.text);
  
  return pages;
}
```

### Alternative: pdfjs-dist (More Control)

**Install:**
```bash
npm install pdfjs-dist
```

**File: `lib/pdf/extract-text-pdfjs.ts`**

```typescript
import * as pdfjsLib from 'pdfjs-dist';

// Set worker path
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function extractTextFromPDFPages(pdfBuffer: Buffer): Promise<Map<number, string>> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  
  const pages = new Map<number, string>();
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    const pageText = textContent.items
      .map((item: any) => item.str)
      .join(' ');
    
    pages.set(i, pageText);
  }
  
  return pages;
}
```

---

## 4. PDF Image Extraction

### Using pdf-poppler (Requires poppler-utils)

**Install:**
```bash
npm install pdf-poppler
```

**Note:** Requires `poppler-utils` system package:
- macOS: `brew install poppler`
- Ubuntu: `apt-get install poppler-utils`
- Windows: Download from poppler website

**File: `lib/pdf/extract-images.ts`**

```typescript
import pdf from 'pdf-poppler';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

/**
 * Extract images from PDF
 * Returns array of image file paths
 */
export async function extractImagesFromPDF(
  pdfBuffer: Buffer,
  outputDir?: string
): Promise<string[]> {
  // Save PDF to temp file
  const tempPdfPath = path.join(tmpdir(), `temp-${Date.now()}.pdf`);
  fs.writeFileSync(tempPdfPath, pdfBuffer);
  
  // Create output directory
  const outputPath = outputDir || path.join(tmpdir(), `pdf-images-${Date.now()}`);
  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }
  
  const options = {
    format: 'png',
    out_dir: outputPath,
    out_prefix: 'page',
    page: null, // Extract all pages
  };
  
  try {
    await pdf.convert(tempPdfPath, options);
    
    // Get all extracted images
    const files = fs.readdirSync(outputPath);
    const imageFiles = files
      .filter((file) => file.endsWith('.png'))
      .map((file) => path.join(outputPath, file));
    
    // Clean up temp PDF
    fs.unlinkSync(tempPdfPath);
    
    return imageFiles;
  } catch (error) {
    // Clean up on error
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
    throw error;
  }
}
```

### Alternative: pdf-image (Also requires poppler)

**Install:**
```bash
npm install pdf-image
```

**File: `lib/pdf/extract-images-pdfimage.ts`**

```typescript
import PDFImage from 'pdf-image';
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

export async function extractImagesFromPDFAlt(
  pdfBuffer: Buffer
): Promise<string[]> {
  const tempPdfPath = path.join(tmpdir(), `temp-${Date.now()}.pdf`);
  fs.writeFileSync(tempPdfPath, pdfBuffer);
  
  const pdfImage = new PDFImage(tempPdfPath, {
    convertOptions: {
      '-quality': '100',
      '-density': '300', // Higher DPI for better OCR
    },
  });
  
  try {
    // Convert all pages to images
    const imagePaths = await pdfImage.convertFile();
    
    // Clean up temp PDF
    fs.unlinkSync(tempPdfPath);
    
    return imagePaths;
  } catch (error) {
    if (fs.existsSync(tempPdfPath)) {
      fs.unlinkSync(tempPdfPath);
    }
    throw error;
  }
}
```

### Serverless-Friendly: pdfjs-dist (No System Dependencies)

**File: `lib/pdf/extract-images-pdfjs.ts`**

```typescript
import * as pdfjsLib from 'pdfjs-dist';
import { createCanvas } from 'canvas'; // Or use node-canvas
import * as fs from 'fs';
import * as path from 'path';
import { tmpdir } from 'os';

export async function extractImagesFromPDFServerless(
  pdfBuffer: Buffer
): Promise<string[]> {
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  
  const imagePaths: string[] = [];
  const outputDir = path.join(tmpdir(), `pdf-images-${Date.now()}`);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2.0 }); // Higher scale = better quality
    
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    await page.render({ canvasContext: context, viewport }).promise;
    
    const imagePath = path.join(outputDir, `page-${i}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(imagePath, buffer);
    
    imagePaths.push(imagePath);
  }
  
  return imagePaths;
}
```

**Note:** `canvas` package requires system dependencies. For Vercel/serverless, consider using a service or converting to base64 and processing in memory.

---

## 5. OCR: Text Extraction from Images

### Option A: Tesseract.js (Free, Self-Hosted)

**Install:**
```bash
npm install tesseract.js
```

**File: `lib/ocr/tesseract.ts`**

```typescript
import Tesseract from 'tesseract.js';
import * as fs from 'fs';

/**
 * Extract text from image using Tesseract OCR
 */
export async function extractTextFromImage(
  imagePath: string
): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(
    imagePath,
    'eng', // Language
    {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    }
  );
  
  return text;
}

/**
 * Extract text from multiple images
 */
export async function extractTextFromImages(
  imagePaths: string[]
): Promise<Map<string, string>> {
  const results = new Map<string, string>();
  
  for (const imagePath of imagePaths) {
    try {
      const text = await extractTextFromImage(imagePath);
      results.set(imagePath, text);
    } catch (error) {
      console.error(`Error OCRing ${imagePath}:`, error);
      results.set(imagePath, '');
    }
  }
  
  return results;
}
```

**Pros:**
- Free
- No API costs
- Works offline

**Cons:**
- Slower (CPU-intensive)
- Less accurate than cloud OCR
- Large bundle size

### Option B: Google Cloud Vision API (Better Accuracy)

**Install:**
```bash
npm install @google-cloud/vision
```

**File: `lib/ocr/google-vision.ts`**

```typescript
import { ImageAnnotatorClient } from '@google-cloud/vision';
import * as fs from 'fs';

const client = new ImageAnnotatorClient({
  keyFilename: process.env.GOOGLE_VISION_KEY_FILE, // Or use credentials JSON
  // OR use environment variable:
  // credentials: JSON.parse(process.env.GOOGLE_VISION_CREDENTIALS || '{}'),
});

/**
 * Extract text from image using Google Vision OCR
 */
export async function extractTextFromImageGoogle(
  imagePath: string
): Promise<string> {
  const [result] = await client.textDetection(imagePath);
  const detections = result.textAnnotations;
  
  if (!detections || detections.length === 0) {
    return '';
  }
  
  // First detection is the full text
  return detections[0].description || '';
}

/**
 * Extract text from image buffer (for serverless)
 */
export async function extractTextFromImageBuffer(
  imageBuffer: Buffer
): Promise<string> {
  const [result] = await client.textDetection({
    image: { content: imageBuffer },
  });
  
  const detections = result.textAnnotations;
  if (!detections || detections.length === 0) {
    return '';
  }
  
  return detections[0].description || '';
}
```

**Cost:** ~$1.50 per 1,000 images (first 1,000 free/month)

### Option C: AWS Textract (Good for Tables)

**Install:**
```bash
npm install @aws-sdk/client-textract
```

**File: `lib/ocr/aws-textract.ts`**

```typescript
import { TextractClient, DetectDocumentTextCommand } from '@aws-sdk/client-textract';

const client = new TextractClient({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function extractTextFromImageBuffer(
  imageBuffer: Buffer
): Promise<string> {
  const command = new DetectDocumentTextCommand({
    Document: { Bytes: imageBuffer },
  });
  
  const response = await client.send(command);
  
  if (!response.Blocks) {
    return '';
  }
  
  // Extract text from blocks
  const textBlocks = response.Blocks
    .filter((block) => block.BlockType === 'LINE')
    .map((block) => block.Text)
    .filter(Boolean)
    .join('\n');
  
  return textBlocks;
}
```

**Cost:** ~$1.50 per 1,000 pages (first 1,000 free/month)

---

## 6. AI Vision: Analyzing Deal Images

### Option A: OpenAI GPT-4 Vision (Best for Structured Extraction)

**File: `lib/ai/vision-openai.ts`**

```typescript
import OpenAI from 'openai';
import * as fs from 'fs';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Analyze deal image and extract product information
 */
export async function analyzeDealImage(
  imagePath: string
): Promise<{
  products: Array<{
    productName: string;
    productType: 'flower' | 'cart' | 'edible' | 'concentrate' | 'topical' | 'other';
    thcPercent: number | null;
    weightGrams: number | null;
    priceUSD: number | null;
  }>;
}> {
  // Read image as base64
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o', // or 'gpt-4-vision-preview'
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this dispensary deal image and extract ALL products with their details.

Extract:
- Product name
- Product type (flower, cart, edible, concentrate, topical, other)
- THC percentage (if shown)
- Weight in grams (if shown)
- Price in USD (if shown)

Return a JSON array with this exact structure:
[
  {
    "productName": "string (required)",
    "productType": "flower" | "cart" | "edible" | "concentrate" | "topical" | "other",
    "thcPercent": number (0-100, null if not found),
    "weightGrams": number (null if not found),
    "priceUSD": number (null if not found, extract numeric value only)
  }
]

Rules:
- Extract ONLY numeric values (remove $, %, "g", etc.)
- If a field is missing, use null
- Return empty array [] if no products found
- Return only valid JSON, no markdown formatting`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/png;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
  });
  
  const content = response.choices[0]?.message?.content || '[]';
  
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error('Failed to parse AI response:', content);
    return { products: [] };
  }
}

/**
 * Analyze image from buffer (for serverless)
 */
export async function analyzeDealImageBuffer(
  imageBuffer: Buffer,
  mimeType: string = 'image/png'
): Promise<{
  products: Array<{
    productName: string;
    productType: string;
    thcPercent: number | null;
    weightGrams: number | null;
    priceUSD: number | null;
  }>;
}> {
  const base64Image = imageBuffer.toString('base64');
  
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this dispensary deal image and extract ALL products. Return JSON array with productName, productType, thcPercent, weightGrams, priceUSD.`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });
  
  const content = response.choices[0]?.message?.content || '{"products": []}';
  return JSON.parse(content);
}
```

**Cost:** 
- GPT-4o: ~$0.01-0.03 per image (depends on image size)
- GPT-4 Turbo with Vision: ~$0.01 per image

### Option B: Anthropic Claude 3.5 Sonnet (Good Alternative)

**File: `lib/ai/vision-claude.ts`**

```typescript
import Anthropic from '@anthropic-ai/sdk';
import * as fs from 'fs';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeDealImageClaude(
  imagePath: string
): Promise<{
  products: Array<{
    productName: string;
    productType: string;
    thcPercent: number | null;
    weightGrams: number | null;
    priceUSD: number | null;
  }>;
}> {
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  
  const message = await anthropic.messages.create({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Analyze this dispensary deal image and extract ALL products. Return JSON array with productName, productType, thcPercent, weightGrams, priceUSD.`,
          },
        ],
      },
    ],
  });
  
  const content = message.content[0];
  if (content.type === 'text') {
    try {
      return JSON.parse(content.text);
    } catch (error) {
      console.error('Failed to parse Claude response:', content.text);
      return { products: [] };
    }
  }
  
  return { products: [] };
}
```

**Cost:** ~$0.003-0.012 per image

---

## 7. Complete PDF Processing Pipeline

**File: `lib/fetch/pdf-processor.ts`**

```typescript
import { downloadPDF } from './weedmaps-scraper';
import { extractTextFromPDF } from '../pdf/extract-text';
import { extractImagesFromPDF } from '../pdf/extract-images';
import { extractTextFromImages } from '../ocr/tesseract';
import { analyzeDealImageBuffer } from '../ai/vision-openai';
import * as fs from 'fs';

interface ProcessedDeal {
  productName: string;
  productType: string;
  thcPercent: number | null;
  weightGrams: number | null;
  priceUSD: number | null;
  source: 'text' | 'ocr' | 'ai_vision';
  confidence: number;
}

/**
 * Process PDF from Weedmaps and extract deals
 */
export async function processWeedmapsPDF(
  pdfUrl: string,
  dispensaryZip: string
): Promise<ProcessedDeal[]> {
  console.log(`[PDF Processor] Downloading PDF from ${pdfUrl}`);
  
  // 1. Download PDF
  const pdfBuffer = await downloadPDF(pdfUrl);
  
  // 2. Extract text from PDF
  let pdfText = '';
  try {
    pdfText = await extractTextFromPDF(pdfBuffer);
    console.log(`[PDF Processor] Extracted ${pdfText.length} characters of text`);
  } catch (error) {
    console.warn('[PDF Processor] Failed to extract text:', error);
  }
  
  // 3. Extract images from PDF
  let imagePaths: string[] = [];
  try {
    imagePaths = await extractImagesFromPDF(pdfBuffer);
    console.log(`[PDF Processor] Extracted ${imagePaths.length} images`);
  } catch (error) {
    console.warn('[PDF Processor] Failed to extract images:', error);
  }
  
  // 4. Process images: OCR + AI Vision
  const allDeals: ProcessedDeal[] = [];
  
  for (const imagePath of imagePaths) {
    try {
      // Option A: OCR first, then AI if needed
      const ocrText = await extractTextFromImage(imagePath);
      
      // Option B: AI Vision (more accurate, but costs money)
      const imageBuffer = fs.readFileSync(imagePath);
      const aiResult = await analyzeDealImageBuffer(imageBuffer);
      
      // Combine results
      const deals = aiResult.products.map((product) => ({
        ...product,
        source: 'ai_vision' as const,
        confidence: 0.9, // AI vision is usually high confidence
        zip: dispensaryZip,
      }));
      
      allDeals.push(...deals);
    } catch (error) {
      console.error(`[PDF Processor] Error processing image ${imagePath}:`, error);
    } finally {
      // Clean up image file
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
  }
  
  // 5. Also try to extract from PDF text (if any)
  if (pdfText) {
    // Use AI to extract products from text
    const textDeals = await extractProductsFromText(pdfText, dispensaryZip);
    allDeals.push(...textDeals);
  }
  
  // 6. Deduplicate and return
  return deduplicateDeals(allDeals);
}

/**
 * Extract products from text using AI
 */
async function extractProductsFromText(
  text: string,
  zip: string
): Promise<ProcessedDeal[]> {
  // Use OpenAI to extract products from text
  // (Similar to HTML extraction, but for plain text)
  // ... implementation similar to analyzeDealImage
}

/**
 * Deduplicate deals (same product, price, etc.)
 */
function deduplicateDeals(deals: ProcessedDeal[]): ProcessedDeal[] {
  const seen = new Set<string>();
  const unique: ProcessedDeal[] = [];
  
  for (const deal of deals) {
    const key = `${deal.productName}-${deal.priceUSD}-${deal.weightGrams}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(deal);
    }
  }
  
  return unique;
}
```

---

## 8. Updated Dispensary Configuration

**File: `data/dispensaries.json`** (Updated)

```json
[
  {
    "id": "dispo-1",
    "name": "Green Leaf Dispensary",
    "zip": "48060",
    "menuUrl": "https://weedmaps.com/dispensaries/green-leaf",
    "platformType": "weedmaps_pdf",
    "extractionConfig": {
      "weedmapsSlug": "green-leaf",
      "pdfDetection": true,
      "useOCR": true,
      "useAIVision": true,
      "ocrProvider": "tesseract", // or "google_vision", "aws_textract"
      "aiVisionProvider": "openai" // or "claude"
    }
  }
]
```

---

## 9. Cost Estimates

### PDF Processing Costs (Per Dispensary, Per Day)

**Scenario:** 50 dispensaries, 10 use PDFs, average 5 pages per PDF

**PDF Download & Processing:**
- Free (just bandwidth)

**Image Extraction:**
- Free (local processing)

**OCR:**
- Tesseract: Free (self-hosted)
- Google Vision: $1.50/1K images = ~$0.075 per PDF (5 pages) = $0.75/day for 10 PDFs
- AWS Textract: $1.50/1K pages = ~$0.0075 per PDF = $0.075/day

**AI Vision:**
- OpenAI GPT-4o: ~$0.02 per image = $0.10 per PDF (5 pages) = $1.00/day for 10 PDFs
- Claude 3.5 Sonnet: ~$0.006 per image = $0.03 per PDF = $0.30/day

**Total Monthly Cost:**
- **Cheapest (Tesseract OCR + Claude Vision):** ~$9/month
- **Balanced (Google OCR + OpenAI Vision):** ~$52/month
- **Best Quality (Google OCR + GPT-4o Vision):** ~$55/month

---

## 10. Implementation Strategy

### Phase 1: Basic PDF Support
- [ ] Add PDF detection to Weedmaps scraper
- [ ] Implement PDF download
- [ ] Extract text from PDFs
- [ ] Test with sample PDFs

### Phase 2: Image Extraction
- [ ] Extract images from PDFs
- [ ] Test with various PDF formats
- [ ] Handle edge cases (encrypted PDFs, etc.)

### Phase 3: OCR Integration
- [ ] Integrate Tesseract.js (free option)
- [ ] Test OCR accuracy
- [ ] Add Google Vision as premium option

### Phase 4: AI Vision
- [ ] Integrate OpenAI Vision
- [ ] Test extraction accuracy
- [ ] Compare OCR vs AI Vision results

### Phase 5: Complete Pipeline
- [ ] Combine text + OCR + AI Vision
- [ ] Deduplicate results
- [ ] Store in database
- [ ] Add error handling and retries

---

## 11. Recommended Approach

**For MVP:**
1. Use **Tesseract.js** for OCR (free, good enough)
2. Use **OpenAI GPT-4o** for AI vision (best accuracy)
3. Process PDFs: Extract text first, then images, then AI vision
4. Combine all results for maximum coverage

**For Production:**
1. Use **Google Vision OCR** (better accuracy than Tesseract)
2. Use **Claude 3.5 Sonnet** for AI vision (cheaper than GPT-4o, still good)
3. Cache results to avoid re-processing
4. Add fallback chain: AI Vision → OCR → Text extraction

---

## 12. Error Handling

**File: `lib/fetch/pdf-processor.ts`** (Error Handling)

```typescript
export async function processWeedmapsPDFWithRetry(
  pdfUrl: string,
  dispensaryZip: string,
  maxRetries: number = 3
): Promise<ProcessedDeal[]> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processWeedmapsPDF(pdfUrl, dispensaryZip);
    } catch (error) {
      lastError = error as Error;
      console.error(`[PDF Processor] Attempt ${attempt} failed:`, error);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  // Log failure
  await logPDFProcessingFailure(pdfUrl, dispensaryZip, lastError);
  
  return []; // Return empty array on failure
}
```

---

**End of PDF & Image Analysis Plan**

This plan covers downloading PDFs from Weedmaps, extracting text and images, using OCR and AI vision to analyze content, and extracting product information. Ready to implement!

