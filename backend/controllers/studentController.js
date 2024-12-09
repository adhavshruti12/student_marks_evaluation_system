const Marks = require('../models/Marks');
const Profile = require('../models/Profile');

// Add or update student marks
exports.addMarks = async (req, res) => {
  const { studentId, year, semester, marks } = req.body;

  try {
    const newMarks = new Marks({ studentId, year, semester, marks });
    await newMarks.save();
    res.status(200).json({ message: 'Marks added successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving marks' });
  }
};

// Add or update student profile
exports.addProfile = async (req, res) => {
  const { studentId, name, contact, address, profilePic } = req.body;

  try {
    const newProfile = new Profile({ studentId, name, contact, address, profilePic });
    await newProfile.save();
    res.status(200).json({ message: 'Profile updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error saving profile' });
  }
};
