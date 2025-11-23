/**
 * PDF Processor - Downloads and processes PDFs from Weedmaps
 * Uses hybrid approach: OCR + GPT-4o Text API + OpenAI Vision fallback
 */

import { extractProductsFromOCRText } from '../ai/extract-from-ocr';
import { analyzeDealImageOpenAI } from '../ai/vision-openai';
import { RawProduct } from './json-api';

/**
 * Process PDF from URL and extract deals
 * Hybrid approach: OCR → GPT-4o Text → OpenAI Vision (if needed)
 */
export async function processWeedmapsPDF(
  pdfUrl: string
): Promise<RawProduct[]> {
  try {
    // Step 1: Download PDF
    const pdfBuffer = await downloadPDF(pdfUrl);
    
    // Step 2: Extract text from PDF (if possible)
    const pdfText = await extractTextFromPDF(pdfBuffer);
    
    // Step 3: Extract images from PDF
    const imageBuffers = await extractImagesFromPDF(pdfBuffer);
    
    const allProducts: RawProduct[] = [];
    
    // Step 4: Process PDF text (if available)
    if (pdfText && pdfText.length > 100) {
      try {
        const textProducts = await extractProductsFromOCRText(pdfText);
        allProducts.push(...textProducts
          .filter(p => p.priceUSD !== null && p.priceUSD !== undefined) // Filter out products without prices
          .map(p => ({
            productName: p.productName,
            productType: p.productType,
            thcPercent: p.thcPercent,
            weightGrams: p.weightGrams,
            priceUSD: p.priceUSD ?? 0, // Ensure it's never null
            rawData: { source: 'pdf_text' },
          })));
      } catch (error) {
        console.warn('Failed to extract from PDF text:', error);
      }
    }
    
    // Step 5: Process each image with hybrid approach
    for (const imageBuffer of imageBuffers) {
      try {
        // Try OCR + GPT-4o Text API first (cheaper)
        // Note: For Edge Functions, we'd need to use Google Vision OCR
        // For now, fallback to OpenAI Vision directly
        
        // Option A: Use OpenAI Vision (if OCR not available)
        const visionProducts = await analyzeDealImageOpenAI(imageBuffer);
        allProducts.push(...visionProducts
          .filter(p => p.priceUSD !== null && p.priceUSD !== undefined) // Filter out products without prices
          .map(p => ({
            productName: p.productName,
            productType: p.productType,
            thcPercent: p.thcPercent,
            weightGrams: p.weightGrams,
            priceUSD: p.priceUSD ?? 0, // Ensure it's never null
            rawData: { source: 'openai_vision' },
          })));
        
        // Option B: If we had OCR, we'd do:
        // const ocrText = await extractTextFromImage(imageBuffer);
        // if (ocrText && ocrText.length > 100) {
        //   const textProducts = await extractProductsFromOCRText(ocrText);
        //   allProducts.push(...textProducts.map(p => ({
        //     ...p,
        //     rawData: { source: 'ocr_text' },
        //   })));
        // } else {
        //   const visionProducts = await analyzeDealImageOpenAI(imageBuffer);
        //   allProducts.push(...visionProducts.map(p => ({
        //     ...p,
        //     rawData: { source: 'openai_vision' },
        //   })));
        // }
      } catch (error) {
        console.error('Error processing PDF image:', error);
      }
    }
    
    // Step 6: Deduplicate
    return deduplicateProducts(allProducts);
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
}

/**
 * Download PDF from URL
 */
async function downloadPDF(pdfUrl: string): Promise<Buffer> {
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

/**
 * Extract text from PDF
 * Note: This would use pdf-parse or similar library
 */
async function extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
  // For Edge Functions, we'd need a Deno-compatible PDF parser
  // For now, return empty - images will be processed instead
  return '';
}

/**
 * Extract images from PDF
 * Note: This would use pdf-poppler or similar
 */
async function extractImagesFromPDF(pdfBuffer: Buffer): Promise<Buffer[]> {
  // For Edge Functions, we'd need a Deno-compatible PDF image extractor
  // For now, return empty array
  // In production, this would extract all pages as images
  return [];
}

/**
 * Deduplicate products
 */
function deduplicateProducts(products: RawProduct[]): RawProduct[] {
  const seen = new Set<string>();
  const unique: RawProduct[] = [];
  
  for (const product of products) {
    // Skip products without valid prices
    if (!product.priceUSD || product.priceUSD <= 0) {
      continue;
    }
    
    const key = `${product.productName}-${product.priceUSD}-${product.weightGrams}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(product);
    }
  }
  
  return unique;
}

