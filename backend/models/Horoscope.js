const mongoose = require('mongoose');

const horoscopeSchema = new mongoose.Schema({
  sign: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  horoscope: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Horoscope', horoscopeSchema);
