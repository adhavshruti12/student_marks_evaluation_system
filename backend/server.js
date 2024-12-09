const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
const fs = require('fs');
const xlsx = require('xlsx');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


// CORS configuration
const corsOptions = {
  origin: 'http://localhost:3000', // Update as necessary for your frontend
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// JSON parsing middleware
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Ensure directories for uploads exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Multer setup for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

// Student schema
const studentSchema = new mongoose.Schema({
  prnNumber: { type: String, required: true, unique: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  branchName: { type: String, required: true },
  studyingYear: { type: String, required: true },
  semester: { type: String, required: true },
  password: { type: String, required: true }, // Plain text for now
  marksData: [{ subject: String, marks: Number }],
  studentContact: { type: String, required: true },
  parentContact: { type: String }, // Optional
});

const Student = mongoose.model('Student', studentSchema);

// Student sign-up route
app.post('/api/signup/student', async (req, res) => {
  const {
    firstName,
    middleName,
    lastName,
    prnNumber,
    email,
    password,
    selectedClass,
    selectedSemester,
    selectedYear,
    studentContact,
    parentContact,
  } = req.body;

  // Basic validation
  if (
    !firstName ||
    !lastName ||
    !prnNumber ||
    !email ||
    !password ||
    !selectedClass ||
    !selectedSemester ||
    !selectedYear ||
    !studentContact
  ) {
    return res.status(400).json({ error: 'All required fields must be filled out.' });
  }

  try {
    // Check for existing student
    const existingStudent = await Student.findOne({ $or: [{ prnNumber }, { email }] });
    if (existingStudent) {
      return res.status(400).json({ error: 'Student with the same PRN or email already exists.' });
    }

    // Concatenate full name
    const fullName = `${firstName} ${middleName ? middleName + ' ' : ''}${lastName}`;

    // Save new student data
    const newStudent = new Student({
      prnNumber,
      fullName,
      email,
      password, // Store plaintext password (not recommended for production)
      branchName: selectedClass,
      studyingYear: selectedYear,
      semester: selectedSemester,
      studentContact,
      parentContact: parentContact || null,
    });

    await newStudent.save();
    res.status(201).json({ message: 'Signup successful', studentData: newStudent });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup.' });
  }
});

// Student sign-in route
app.post('/api/signin/student', async (req, res) => {
  const { prnNumber, password } = req.body;

  try {
    const student = await Student.findOne({ prnNumber });
    if (!student) {
      return res.status(400).json({ error: 'Invalid PRN number' });
    }

    // Verify plaintext password
    if (student.password !== password) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Sign-in successful', token, student });
  } catch (error) {
    console.error('Sign-in error:', error);
    res.status(500).json({ error: 'Server error during sign-in.' });
  }
});
// Fetch all students
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find({});
    res.status(200).json(students);
  } catch (error) {
    console.error('Error fetching all students:', error);
    res.status(500).json({ error: 'Server error while fetching students' });
  }
});

// Fetch student details by PRN
app.get('/api/student/:prn', async (req, res) => {
  const { prn } = req.params;
  try {
    const student = await Student.findOne({ prnNumber: prn });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.status(200).json(student);
  } catch (error) {
    console.error('Error fetching student details:', error);
    res.status(500).json({ error: 'Server error while fetching student details' });
  }
});

// Marks data schema
const marksSchema = new mongoose.Schema({
  year: String,
  semester: String,
  batch: String,
  marks: [{
    prnNumber: { type: String, required: true },
    fullName: { type: String, required: true },
    subject: { type: String, required: true },
    marks: { type: Number, required: true },
  }],
});

const MarksData = mongoose.model('MarksData', marksSchema);

// Route for uploading and parsing Excel files
app.post('/api/upload-marks',  upload.single('file'), async (req, res) => {
  const { year, semester, batch } = req.body;

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    // Parse the uploaded Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Use the first sheet
    const worksheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 }); // Get data with headers

    if (data.length === 0) {
      return res.status(400).json({ error: 'Uploaded file is empty.' });
    }

    // Extract headers and rows dynamically
    const headers = data[0];
    const rows = data.slice(1).map(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });
      return rowData;
    });

    // Save or update marks data
    const existingMarksData = await MarksData.findOne({ year, semester, batch });
    if (existingMarksData) {
      existingMarksData.marks = rows;
      await existingMarksData.save();
    } else {
      const marksData = new MarksData({
        year,
        semester,
        batch,
        marks: rows,
      });
      await marksData.save();
    }

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    res.status(200).json({
      message: 'File uploaded and parsed successfully',
      headers,
      rows,
    });
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    res.status(500).json({ error: 'Error parsing Excel file' });
  }
});
// Fetch marks data from the database
app.get('/api/marks', async (req, res) => {
  const { year, semester, batch } = req.query;

  try {
    const marksData = await MarksData.findOne({ year, semester, batch });
    if (!marksData) {
      return res.status(404).json({ error: 'No marks data found' });
    }
    res.status(200).json({ marks: marksData.marks });
  } catch (error) {
    console.error('Error fetching marks data:', error);
    res.status(500).json({ error: 'Server error while fetching marks data' });
  }
});
app.get('/api/saved-marksheets', async (req, res) => {
  const { uploadedBy } = req.query; // Assume the faculty ID or username is passed here

  try {
    const marksheets = await MarksData.find({ uploadedBy }); // Fetch based on faculty
    if (!marksheets || marksheets.length === 0) {
      return res.status(404).json({ message: 'No marksheets found' });
    }

    res.status(200).json({
      message: 'Saved marksheets retrieved successfully',
      marksheets,
    });
  } catch (error) {
    console.error('Error fetching saved marksheets:', error);
    res.status(500).json({ error: 'Server error while fetching marksheets' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
