// models/Marks.js
const mongoose = require('mongoose');

const marksSchema = new mongoose.Schema({
  year: { type: String, required: true },
  semester: { type: String, required: true },
  batch: { type: String, required: true },
  uploadedBy: { type: String, required: true }, // Faculty email or ID
  students: [
    {
      rollNo: { type: String, required: true },
      prnNo: { type: String, required: true },
      studentName: { type: String, required: true },
      marks: [{ type: Number }], // Array of marks
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Marks', marksSchema);
