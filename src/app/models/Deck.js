const mongoose = require('../../config/db')

const DeckSchema = new mongoose.Schema({
  id: {
    type: String,
    unique: true,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  private: {
    type: Boolean,
    default: true
  },
  user: {
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

const Deck = mongoose.model('decks', DeckSchema)

module.exports = Deck
