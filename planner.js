const { getHandler } = require('./build/server/planner')
const data = require('./_data/data.json')
const { readFileSync } = require('fs')
const { resolve } = require('path')

const template = readFileSync(resolve(__dirname, 'ejs-templates/planner.ejs')).toString()

exports.handler = getHandler(data, template)
