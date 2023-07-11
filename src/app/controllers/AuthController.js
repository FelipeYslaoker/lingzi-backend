const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = require('express').Router()
const auth = require('../middlewares/auth')
const User = require('../models/User')
const validateUser = require('../plugins/validateUser')
const Lingzi = require('../plugins/Lingzi')

function generateToken (params = {}) {
  return jwt.sign(params, process.env.LINGZI_AUTH_HASH, {
    expiresIn: 86400
  })
}

router.post('/create-account', async (req, res) => {
  const {
    email, password, name, surname
  } = req.body
  try {
    const validAccount = await validateUser(req.body)
    if (/already_in_use/g.test(validAccount)) {
      return res.status(403).send(Lingzi.errors.auth.emailAlreadyInUse)
    }
    if (!validAccount) {
      return res.status(403).send(Lingzi.errors.auth.invalidCredentials)
    }
    await User.create({
      email,
      password,
      name,
      surname
    })
    return res.send()
  } catch (e) {
    console.log(e)
    return res.status(500).send(Lingzi.errors.internalServerError)
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    if (!email || !password) {
      return res.status(401).send(Lingzi.errors.auth.invalidCredentials)
    }
    const user = await User.findOne({ email }).select('+password')
    if (!user) {
      return res.status(401).send(Lingzi.errors.auth.invalidCredentials)
    }
    if (!await bcrypt.compare(password, user.password)) {
      return res.status(401).send(Lingzi.errors.auth.invalidCredentials)
    }
    user.password = undefined
    return res.send({ user, token: generateToken({ id: user.id }) })
  } catch (e) {
    console.log(e)
    return res.status(500).send(Lingzi.errors.internalServerError)
  }
})

router.post('/logout', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    return res.send({ user })
  } catch (e) {
    console.log(e)
    return res.status(500).send(Lingzi.errors.internalServerError)
  }
})

router.get('/user', auth(), async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    return res.send({ user })
  } catch (e) {
    console.log(e)
    return res.status(500).send(Lingzi.errors.internalServerError)
  }
})

module.exports = (app) => app.use('/auth', router)
