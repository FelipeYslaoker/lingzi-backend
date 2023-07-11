const db = require('mongoose')

db.set('strictQuery', true)

db.connect(process.env.LINGZI_DB_URL || '').then(() => {
  console.log('Connected to DB.')
}).catch((e) => {
  console.log('Connection with DB failed,', e)
})

db.Promise = global.Promise

module.exports = db
