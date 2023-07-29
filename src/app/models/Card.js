const uniqid = require('uniqid')
const mongoose = require('../../config/db')
const getSubCategories = require('../plugins/getSubCategories')

const CardSchema = new mongoose.Schema({
  id: {
    type: String,
    default () {
      return uniqid('card-')
    },
    unique: true
  },
  user: {
    type: String,
    required: true
  },
  deck: {
    type: String,
    required: true
  },
  template: {
    type: String,
    default: 'target+example'
  },
  category: {
    type: String,
    required: true
  },
  target: {
    type: Object,
    required: true
  },
  example: {
    type: Object
  },
  notes: {
    type: Array,
    default: []
  }
})

CardSchema.methods.splittedCards = async function (categoryid, deckid) {
  let cards = []
  if (categoryid && deckid) {
    const deck = await this.model('decks').findOne({ id: deckid })
    const categories = getSubCategories(categoryid, deck.categories)
    cards = await this.model('Card').find({
      category: {
        $in: categories
      },
      deck: deckid
    })
  } else if (deckid) {
    cards = await this.model('Card').find({ deck: deckid })
  } else {
    await this.model('Card').find()
  }
  const allCards = cards.reduce((acumulator, currentValue) => {
    const cardBase = {
      id: currentValue.id,
      deck: currentValue.deck,
      template: currentValue.template,
      category: currentValue.category,
      notes: currentValue.notes
    }
    if (currentValue.example) {
      acumulator.push({
        type: 'example',
        target: currentValue.target,
        ...currentValue.example,
        ...cardBase
      })
      acumulator.push({
        type: 'target',
        example: currentValue.example,
        ...currentValue.target,
        ...cardBase
      })
    } else {
      acumulator.push({
        type: 'target',
        ...currentValue.target,
        ...cardBase
      })
    }
    return acumulator
  }, [])
  return allCards
}

CardSchema.methods.calculateNextReview = async function (isCorrect, cardType) {
  const maximumInterval = 60 * 24 * 365
  const minimumInterval = 60 * 24

  this[cardType].reviewedAt = new Date()
  if (isCorrect) {
    let nextInterval
    if (this[cardType].correctResponses === 1) {
      nextInterval = minimumInterval
    } else if (this[cardType].correctResponses === 2) {
      nextInterval = 60 * 24 * 6
    } else if (this[cardType].correctResponses === 3) {
      nextInterval = 60 * 24 * 7
    } else {
      nextInterval = Math.min(this[cardType].interval * this[cardType].easinessFactor, maximumInterval)
      nextInterval = Math.max(nextInterval, minimumInterval)
    }
    this[cardType].correctResponses += 1
    this[cardType].consecutiveResponses = 0
    this[cardType].interval = nextInterval
  } else {
    if (this[cardType].interval > 60 * 24 * 7) {
      this[cardType].easinessFactor = Math.max(this[cardType].easinessFactor * 0.8, 1.3)
    }
    this[cardType].consecutiveResponses += 1
    if (this[cardType].interval === 1) {
      this[cardType].interval = Math.max(this[cardType].interval / (this[cardType].consecutiveResponses + 1), 1)
    } else {
      const intervalReduction = Math.max(this[cardType].interval / (this[cardType].consecutiveResponses + 2), minimumInterval)
      this[cardType].interval = Math.max(this[cardType].interval - intervalReduction, minimumInterval)
    }
  }
  await this.model('Card').findOneAndUpdate({ id: this.id }, this)
}
const Card = mongoose.model('Card', CardSchema)

module.exports = Card
