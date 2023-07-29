const uniqid = require('uniqid')

const router = require('express').Router()
const Deck = require('../models/Deck')
const auth = require('../middlewares/auth')

router.get('/', auth(), async (req, res) => {
  const { id } = req.query
  try {
    if (id) {
      const deck = await Deck.findOne({ id })
      if (!deck) {
        return res.status(404).send()
      }
      return res.send(deck)
    }
    const decks = await Deck.find()
    return res.send(decks)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.post('/', auth(), async (req, res) => {
  const id = uniqid('deck-')
  const { name } = req.body
  try {
    const user = req.user._id
    const deck = await Deck.create({
      id, name, user
    })
    return res.send(deck)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})
router.patch('/', auth(), async (req, res) => {
  try {
    console.log(req.body.categories)
    const deck = await Deck.findOneAndUpdate({ id: req.body.id }, { name: req.body.name, categories: req.body.categories })
    return res.send(deck)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})
module.exports = (app) => app.use('/decks', router)
