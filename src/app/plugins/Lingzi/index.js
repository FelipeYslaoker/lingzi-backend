const LingziPlugin = require('leechineo-backend-plugin')

const Lingzi = new LingziPlugin(process.env.LINGZI_MS_DATABASE_MANAGER_PASSWORD)

module.exports = Lingzi
