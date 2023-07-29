const router = require('express').Router()
const auth = require('../middlewares/auth')
const Card = require('../models/Card')
const Deck = require('../models/Deck')
const getSubCategories = require('../plugins/getSubCategories')

const card = new Card()

function shuffleArray (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]
  }
  return array
}

router.post('/', auth(), async (req, res) => {
  try {
    const cardSRSPreset = {
      difficulty: 2.5,
      interval: 1,
      easinessFactor: 2.5,
      reviewedAt: new Date(),
      correctResponses: 0,
      consecutiveResponses: 0
    }
    const targetCard = {
      front: req.body.target.front,
      back: req.body.target.back,
      ...cardSRSPreset
    }
    const exampleCard = req.body.example?.front && req.body.example?.back ? {
      front: req.body.example?.front,
      back: req.body.example?.back,
      ...cardSRSPreset
    } : {
      front: req.body.target.back,
      back: req.body.target.front,
      ...cardSRSPreset
    }
    const card = await Card.create({
      deck: req.body.deck,
      category: req.body.category,
      user: req.user._id,
      target: targetCard,
      example: exampleCard,
      notes: req.body.notes
    })
    return res.send(card)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.get('/', async (req, res) => {
  const { id, categoryid, deckid } = req.query
  try {
    if (id) {
      const suffix = id.split('-')?.pop()
      if (suffix && !Number.isNaN(Number(suffix))) {
        const card = Card.findOne({ id: id.replace(/-(\w+)$/, '') })
        if (suffix === 1) {
          return res.send(card.target)
        } if (suffix === 2) {
          return res.send(card.example)
        }
      } else {
        const card = await Card.findOne({ id })
        if (card) {
          return res.send(card)
        }
        return res.status(404).send()
      }
    }
    if (categoryid || deckid) {
      const deck = await Deck.findOne({ id: deckid })
      if (deck) {
        const cards = await card.splittedCards(categoryid, deckid)
        return res.send(cards)
      }
      return res.status(404).send()
    }
    const cards = await card.splittedCards()
    return res.send(cards)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.get('/studyables', async (req, res) => {
  const { id, categoryid, deckid } = req.query
  try {
    if (id) {
      const suffix = id.split('-')?.pop()
      if (suffix && !Number.isNaN(Number(suffix))) {
        const card = Card.findOne({ id: id.replace(/-(\w+)$/, '') })
        if (suffix === 1) {
          return res.send(card.target)
        } if (suffix === 2) {
          return res.send(card.example)
        }
      } else {
        const card = await Card.findOne({ id })
        if (card) {
          return res.send(card)
        }
        return res.status(404).send()
      }
    }

    const cardsFiltered = async (categoryid, deckid) => {
      let cards = []
      if (categoryid && deckid) {
        cards = await card.splittedCards(categoryid, deckid)
      } else {
        cards = await card.splittedCards(null, deckid)
      }
      const allCards = await card.splittedCards(null, deckid)
      const newCardsStudiedToday = allCards.filter((card) => card.interval === 1440 && card.reviewedAt.toDateString() === (new Date()).toDateString() && card.correctResponses === 1).length
      const cardsFilteredByDate = cards.filter((card) => {
        if (card.interval === 1 || (card.consecutiveResponses || 0 > 0)) {
          return true
        }
        const intervalInMilliseconds = (card.interval || 1) * 60 * 1000
        const reviewdAtDate = new Date(card.reviewedAt || Date.now())
        const nextReviewTimestamp = reviewdAtDate.getTime() + intervalInMilliseconds
        const nowTimestamp = Date.now()
        return nextReviewTimestamp <= nowTimestamp || (new Date(nextReviewTimestamp)).toDateString() === (new Date(nowTimestamp)).toDateString()
      })
      const cardsFiltered = {
        newCards: cardsFilteredByDate.filter((card) => card.interval === 1).slice(0, 24 - newCardsStudiedToday < 0 ? 0 : 24 - newCardsStudiedToday),
        learningCards: cardsFilteredByDate.filter((card) => card.interval > 1 && card.interval <= 60 * 24 * 7),
        dueCards: cardsFilteredByDate.filter((card) => card.interval > 60 * 24 * 7)
      }
      return shuffleArray([...cardsFiltered.newCards, ...cardsFiltered.learningCards, ...cardsFiltered.dueCards])
    }

    if (categoryid && deckid) {
      const deck = await Deck.findOne({ id: deckid })
      if (deck) {
        return res.send(await cardsFiltered(categoryid, deckid))
      }
      return res.status(404).send()
    }
    return res.send(await cardsFiltered(null, deckid))
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.get('/category-cards-quantity', async (req, res) => {
  const { categoryid, deckid } = req.query
  try {
    if (categoryid) {
      const deck = await Deck.findOne({ id: deckid })
      if (deck) {
        const cards = await card.splittedCards(categoryid, deckid)
        const newCards = cards.filter((card) => card.interval === 1)
        const learningCards = cards.filter((card) => card.interval > 1 && card.interval <= 60 * 24 * 7)
        const dueCards = cards.filter((card) => card.interval > 60 * 24 * 7)
        return res.send({
          newQuantity: newCards.length,
          learningQuantity: learningCards.length,
          dueQuantity: dueCards.length,
          totalQuantity: cards.length
        })
      }
    } else {
      const allCategories = []
      const deck = await Deck.findOne({ id: deckid })
      for (const category of deck.categories) {
        const categories = getSubCategories(category.id, deck.categories)
        allCategories.push(...categories)
      }
      const cards = await card.splittedCards(null, deckid)

      const filterCardByDateAndCategory = (card, category) => {
        const subcategories = getSubCategories(category, deck.categories)
        if (!subcategories.includes(card.category)) {
          return false
        }
        if (card.interval === 1) {
          return true
        }
        const intervalInMilliseconds = (card.interval || 1) * 60 * 1000
        const reviewdAtDate = new Date(card.reviewedAt || Date.now())
        const nextReviewTimestamp = reviewdAtDate.getTime() + intervalInMilliseconds
        const nowTimestamp = Date.now()
        return nextReviewTimestamp <= nowTimestamp || (new Date(nextReviewTimestamp)).toDateString() === (new Date(nowTimestamp)).toDateString()
      }
      const newCardsStudiedToday = cards.filter((card) => card.interval === 1440 && card.reviewedAt.toDateString() === (new Date()).toDateString() && card.correctResponses === 1).length
      const newCardsLength = (_categoryId) => cards.filter((card) => card.interval === 1 && filterCardByDateAndCategory(card, _categoryId)).slice(0, 24 - newCardsStudiedToday < 0 ? 0 : 24 - newCardsStudiedToday).length
      const cardsQuantity = allCategories.map((_categoryId) => ({
        category: _categoryId,
        newQuantity: newCardsLength(_categoryId),
        learningQuantity: cards.filter((card) => filterCardByDateAndCategory(card, _categoryId) && card.interval > 1 && card.interval <= 60 * 24 * 7).length,
        dueQuantity: cards.filter((card) => filterCardByDateAndCategory(card, _categoryId) && card.interval > 60 * 24 * 7).length
      }))
      return res.send(cardsQuantity)
    }
    return res.send({
      newQuantity: 0,
      learningQuantity: 0,
      dueQuantity: 0,
      totalQuantity: 0
    })
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.get('/words', async (req, res) => {
  const { deckid } = req.query
  try {
    const cards = await Card.find({ deck: deckid })
    const words = cards.map((card) => card.target).map((card) => card.front).join(', ')
    return res.send(words)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.post('/answer', async (req, res) => {
  const { cardType, id, isCorrect } = req.body
  try {
    const card = await Card.findOne({ id })
    await card.calculateNextReview(isCorrect, cardType)
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

module.exports = (app) => app.use('/cards', router)
