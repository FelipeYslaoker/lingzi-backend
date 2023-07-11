require('dotenv').config()
const jwt = require('jsonwebtoken')
const Lingzi = require('../plugins/Lingzi')
const User = require('../models/User')

function auth () {
  return async (req, res, next) => {
    const authHeader = req.headers.authorization
    if (!authHeader) {
      return res.status(401).send(Lingzi.errors.auth.loginRequired)
    }
    const parts = authHeader.split(' ')
    if (!(parts.length === 2)) {
      return res.status(401).send(Lingzi.errors.auth.loginRequired)
    }

    const [scheme, token] = parts

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).send(Lingzi.errors.auth.loginRequired)
    }
    jwt.verify(token, process.env.LINGZI_AUTH_HASH, async (err, decoded) => {
      if (err) {
        return res.status(401).send(Lingzi.errors.auth.loginRequired)
      }
      const user = await User.findById(decoded.id)
      req.user = user
      req.user.logged = true
      return next()
    })
  }
}
module.exports = auth
