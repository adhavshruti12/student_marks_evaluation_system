const mongoose = require('mongoose');

const marksheetSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  semester: { type: String, required: true },
  marks: [
    {
      subject: { type: String, required: true },
      marks: { type: Number, required: true },
    },
  ],
  // Fields for Profile Data
  prn: { type: String, required: true },
  regNo: { type: String, required: true },
  name: { type: String, required: true },
  contact: { type: String, required: true },
  profilePic: {
    filename: { type: String },
    filedata: { type: Buffer },
    filetype: { type: String, default: 'image/jpeg' },
  },
  // Fields for the file as binary data (Marksheet)
  filename: { type: String, required: true },    // Name of the file
  filedata: { type: Buffer, required: true },    // Binary data of the PDF
  filetype: { type: String, default: 'application/pdf' },  // MIME type of the file
  uploadedAt: { type: Date, default: Date.now },
});

const Marksheet = mongoose.model('Marksheet', marksheetSchema);

module.exports = Marksheet;
