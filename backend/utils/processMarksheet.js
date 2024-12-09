// utils/processMarksheet.js
const { PDFDocument } = require('pdf-lib');
const fs = require('fs-extra');
const path = require('path');
const Tesseract = require('tesseract.js');

// Function to process the marksheet PDF
async function processMarksheet(pdfPath) {
  try {
    // Load PDF document
    const pdfData = await fs.readFile(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfData);
    const pageCount = pdfDoc.getPageCount();

    let extractedText = '';

    for (let i = 0; i < pageCount; i++) {
      const page = pdfDoc.getPage(i);
      const text = await page.getTextContent();
      
      if (text) {
        extractedText += text;
      } else {
        const imageBuffer = await pageToImage(pdfDoc, i);
        const ocrResult = await performOCR(imageBuffer);
        extractedText += ocrResult;
      }
    }

    return parseData(extractedText);

  } catch (error) {
    console.error('Error processing marksheet:', error);
    throw error;
  }
}

// Convert PDF page to image
async function pageToImage(pdfDoc, pageIndex) {
  const imagePath = path.resolve(__dirname, '../uploads/temp_image.png');
  await pdfDoc.saveAsPng(pageIndex, imagePath);
  const imageData = await fs.readFile(imagePath);
  await fs.unlink(imagePath); // Clean up temporary image file
  return imageData;
}

// Perform OCR on image
async function performOCR(imageBuffer) {
  const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng');
  return text;
}

// Parse extracted text to structure data
function parseData(text) {
  const lines = text.split('\n');
  const subjectMarks = [];

  lines.forEach(line => {
    const [subject, marks] = line.split(/\s{2,}/); // Adjust splitting logic based on text pattern
    if (subject && marks) {
      subjectMarks.push({ subject, marks });
    }
  });

  return subjectMarks;
}

module.exports = { processMarksheet };
