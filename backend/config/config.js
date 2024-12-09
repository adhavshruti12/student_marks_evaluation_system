require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
  DB_URI: process.env.DB_URI,
};
