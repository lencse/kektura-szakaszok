const { zipFunctions } = require('@netlify/zip-it-and-ship-it')
const { createReadStream } = require('fs')
const { resolve } = require('path')
const { Extract } = require('unzipper')

const build = async () => {
    await zipFunctions('.tmp/functions', '.tmp')
    createReadStream(resolve(process.cwd(), '.tmp/download.zip'))
       .pipe(Extract({ path: resolve(process.cwd(), 'functions/download') }))
    createReadStream(resolve(process.cwd(), '.tmp/map.zip'))
       .pipe(Extract({ path: resolve(process.cwd(), 'functions/map') }))
    createReadStream(resolve(process.cwd(), '.tmp/download-map.zip'))
       .pipe(Extract({ path: resolve(process.cwd(), 'functions/download-map') }))
}

build()
