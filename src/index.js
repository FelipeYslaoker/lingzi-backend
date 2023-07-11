require('dotenv').config()
const cors = require('cors')
const express = require('express')
const Controllers = require('./app/controllers/GlobalController')

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

Controllers(app)

app.get('/', (req, res) => {
  res.send('OK')
})

const appPort = process.env.LINGZI_BACKEND_PORT || process.env.PORT || 4000
app.listen(appPort, async () => {
  console.log('Server running on port', appPort)
})
