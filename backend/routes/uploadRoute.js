const pdf = require('pdf-parse');
const { fromPath } = require('pdf2pic'); // Keep for PDF processing

app.post('/api/marks/upload', upload.single('marksheet'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded. Please select a file.' });
    }

    console.log('Uploaded file details:', req.file);

    const filePath = req.file.path;

    // Determine the file type based on the extension
    const fileExtension = path.extname(req.file.originalname).toLowerCase();

    let text = '';
    let marksData = [];

    // If the file is a PDF, process it as a PDF
    if (fileExtension === '.pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdf(dataBuffer);
      const totalPages = pdfData.numpages;

      if (totalPages === 0) {
        throw new Error('PDF file has no pages.');
      }

      const convert = fromPath(filePath, {
        density: 100,
        savePath: 'uploads/',
        format: 'png',
      });

      for (let page = 1; page <= totalPages; page++) {
        try {
          const pageImage = await convert(page);
          const pageText = await performOCR(pageImage.path);
          text += pageText + '\n'; // Concatenate text from all pages
        } catch (err) {
          console.error(`Error processing page ${page}:`, err);
          continue; // Skip to the next page if one fails
        }
      }

    } else {
      // If the file is an image, process it directly
      text = await performOCR(filePath);
    }

    // Extract marks from the recognized text
    marksData = extractMarksFromText(text);

    // Return successful response with extracted data
    res.json({ message: 'File uploaded and data extracted successfully', data: marksData });
  } catch (error) {
    console.error('Error uploading or processing marksheet:', error);
    res.status(500).json({ error: 'Failed to upload and process marksheet. Please try again.' });
  }
});
