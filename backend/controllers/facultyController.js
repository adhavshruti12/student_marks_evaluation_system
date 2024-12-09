const Faculty = require('../models/Faculty');
const Student = require('../models/Student');
const XLSX = require('xlsx'); // Import XLSX library
const express = require('express');
const router = express.Router();

// Existing functions...

// Upload student data from Excel file
router.post('/upload-student-data', async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    // Read the uploaded Excel file
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]); // Convert sheet to JSON

    // Process each student entry in the Excel data
    const students = await Student.insertMany(data);

    res.status(200).json({ message: 'Students added successfully', students });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({ message: 'Error processing file' });
  }
});

// Export the router
module.exports = router;
