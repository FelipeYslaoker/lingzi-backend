const bcrypt = require('bcryptjs')
const mongoose = require('../../config/db')

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  surname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    select: false
  },
  favorites: {
    type: Array,
    default: []
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
})

UserSchema.pre('save', async function (next) {
  const hash = await bcrypt.hash(this.password, 10)
  this.password = hash
  next()
})

const User = mongoose.model('Users', UserSchema)

module.exports = User
