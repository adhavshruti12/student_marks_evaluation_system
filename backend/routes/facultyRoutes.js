const express = require("express");
const { addStudent, getStudents, uploadStudentData } = require("../controllers/facultyController");
const router = express.Router();
const multer = require('multer');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Existing routes
router.post("/add-student", addStudent);
router.get("/students", getStudents);

// New route for uploading student data
router.post("/upload-student-data", upload.single('file'), uploadStudentData);

module.exports = router;
