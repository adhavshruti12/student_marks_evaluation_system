// routes/marks.js
const express = require('express');
const Marks = require('../models/Marks'); // MongoDB model
const router = express.Router();

// API to save marksheet data
router.post('/upload', async (req, res) => {
  const { year, semester, batch, uploadedBy, students } = req.body;

  if (!year || !semester || !batch || !uploadedBy || !students) {
    return res.status(400).json({ message: 'Incomplete data' });
  }

  try {
    const newMarks = new Marks({
      year,
      semester,
      batch,
      uploadedBy,
      students,
    });

    await newMarks.save();
    res.status(201).json({ message: 'Marksheet data saved successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to save marksheet data' });
  }
});

// API to fetch marksheets uploaded by a specific faculty
router.get('/faculty/:uploadedBy', async (req, res) => {
  try {
    const marksheets = await Marks.find({ uploadedBy: req.params.uploadedBy });
    res.json(marksheets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch marksheet data' });
  }
});

module.exports = router;
