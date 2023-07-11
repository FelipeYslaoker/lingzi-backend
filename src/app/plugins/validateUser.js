const User = require('../models/User')

async function canBeCreated (user) {
  const userWithEmail = await User.findOne({ email: user.email })
  if (userWithEmail) {
    return 'email_already_in'
  }
  return true
}

function validateEmail (email) {
  return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email)
}

function validateName (user) {
  if (!user.name || !user.surname) {
    return false
  }
  if (user.name.length < 2 || user.surname.length < 2) {
    return false
  }
  return true
}

module.exports = async (user) => {
  if (
    !user.email
        || !user.password
        || !validateEmail(user.email)
        || user.password.length < 8
        || !validateName(user)
  ) {
    return false
  }
  const alreadyInUse = await canBeCreated(user)
  if (/already_in_use/g.test(alreadyInUse)) {
    return alreadyInUse
  }
  return true
}
