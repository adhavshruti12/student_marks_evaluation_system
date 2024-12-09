// utils/yourOCRUtils.js
const fs = require('fs');
const pdfLib = require('pdf-lib');
const { createWorker } = require('tesseract.js');

// Convert PDF pages to images
const pdfToImages = async (pdfPath) => {
  const pdfBytes = fs.readFileSync(pdfPath);
  const pdfDoc = await pdfLib.PDFDocument.load(pdfBytes);
  const pdfImages = [];

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i);
    const { width, height } = page.getSize();

    // Render the page as a PNG image
    const pngImage = await page.render({ width, height }); // Make sure the pdf-lib version supports this
    const imagePath = `uploads/page-${i + 1}.png`;

    // Save the image to the file system
    fs.writeFileSync(imagePath, pngImage);
    pdfImages.push(imagePath);
  }

  return pdfImages;
};

// Perform OCR on the image
const performOCR = async (imagePath) => {
  const worker = createWorker();
  await worker.load();
  await worker.loadLanguage('eng');
  await worker.initialize('eng');

  const { data: { text } } = await worker.recognize(imagePath);
  await worker.terminate();

  return text;
};

module.exports = { pdfToImages, performOCR };
