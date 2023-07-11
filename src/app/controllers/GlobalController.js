const fs = require('fs')
const path = require('path')

module.exports = (app) => {
  fs.readdirSync(__dirname).filter((file) => file.indexOf('.') !== 0 && file !== 'GlobalController.js' && file.includes('Controller')).forEach((file) => {
    try {
      require(path.resolve(__dirname, file))(app)
    } catch (e) {
      console.log(e)
      console.error('Controller', file, 'is invalid.')
    }
  })
}
