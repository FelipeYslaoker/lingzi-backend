const mongoose = require('../../config/db')

const LanguageSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  language: {
    type: String,
    required: true
  },
  categories: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

const Language = mongoose.model('languages', LanguageSchema)

module.exports = Language
