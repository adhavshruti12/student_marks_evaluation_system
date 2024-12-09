const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  prnNumber: { type: String, required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  // Add any additional fields like address, phone, etc.
});

const Profile = mongoose.model('Profile', profileSchema);

module.exports = Profile;
