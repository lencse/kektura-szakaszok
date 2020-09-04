const { getHandler } = require('./build/server/download')
const data = require('./_data/data.json')

exports.handler = getHandler(data)
