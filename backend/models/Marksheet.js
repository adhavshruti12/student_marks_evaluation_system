// models/Marksheet.js
const mongoose = require('mongoose');

const MarksSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  subjectMarks: [{
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
  }],
  semester: { type: String, required: true },
});

module.exports = mongoose.model('Marksheet', MarksSchema);
