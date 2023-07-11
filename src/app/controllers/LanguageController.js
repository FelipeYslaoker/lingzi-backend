const uniqid = require('uniqid')

const router = require('express').Router()
const Language = require('../models/Language')
const auth = require('../middlewares/auth')

router.get('/', auth(), async (req, res) => {
  const { id } = req.query
  try {
    if (id) {
      const language = await Language.findOne({ id })
      if (!language) {
        return res.status(404).send()
      }
      return res.send(language)
    }
    const languages = await Language.find()
    return res.send(languages)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})

router.post('/', auth(), async (req, res) => {
  const id = uniqid('language-')
  const { language, name } = req.body
  try {
    const user = req.user._id
    const lang = await Language.create({
      id, name, language, user
    })
    return res.send(lang)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})
router.patch('/', auth(), async (req, res) => {
  try {
    console.log(req.body.categories)
    const language = await Language.findOneAndUpdate({ id: req.body.id }, { name: req.body.name, categories: req.body.categories })
    return res.send(language)
  } catch (e) {
    console.log(e)
    return res.status(500).send()
  }
})
module.exports = (app) => app.use('/languages', router)
