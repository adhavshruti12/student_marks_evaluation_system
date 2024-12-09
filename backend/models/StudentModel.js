const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  prnNumber: {
    type: String,
    required: true,
    unique: true, // Ensure PRN is unique
  },
  fullName: {
    type: String,
    required: true, // Combination of first, middle, and last name
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true, // Store plaintext for now; consider hashing in production
  },
  branchName: {
    type: String,
    required: true, // Represents class (e.g., SY, TY, BTech)
  },
  studyingYear: {
    type: String,
    required: true, // Academic year (e.g., 2024, 2025)
  },
  semester: {
    type: String,
    required: true, // Semester (e.g., III, IV, VI)
  },
  studentContact: {
    type: String,
    required: true, // Contact number of the student
  },
  parentContact: {
    type: String, // Contact number of the parent (optional)
  },
  marks: {
    type: [{ subject: String, marks: Number }], // Array of subjects with marks
    default: [], // Optional, can start empty
  },
}, { strict: true });


module.exports = mongoose.model('student', studentSchema);
