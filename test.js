const { readFileSync, statSync } = require('fs')
const childProcess = require('child_process')
const { get } = require('axios')

const readFile = (path) => readFileSync(`${__dirname}/${path}`).toString()

const fileSize = (path) => statSync(`${__dirname}/${path}`).size

const delay = (ms) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}

test('HTML content', () => {
    expect(readFile('_site/index.html')).toMatch(/<html.*Tokod/s)
    expect(readFile('_site/mi-ez.html')).toMatch(/<html.*Lencse/s)
})

test('Static files', () => {
    expect(fileSize('favicon.ico')).toBeGreaterThan(0)
    expect(fileSize('dist/index.css')).toBeGreaterThan(0)
    expect(fileSize('dist/index.js')).toBeGreaterThan(0)
    expect(fileSize('dist/leaflet.css')).toBeGreaterThan(0)
    expect(fileSize('dist/map.css')).toBeGreaterThan(0)
    expect(fileSize('dist/map.js')).toBeGreaterThan(0)
    expect(fileSize('images/marker-icon.png')).toBeGreaterThan(0)
})

test('Server files', () => {
    expect(fileSize('functions/download/download.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download/_data/data.json')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/download-map.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download/node_modules/tokml/tokml.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/download-map.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/_data/data.json')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/build/config.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/node_modules/ejs/ejs.min.js')).toBeGreaterThan(0)
    expect(fileSize('functions/download-map/ejs-templates/map.ejs')).toBeGreaterThan(0)
    expect(fileSize('functions/map/map.js')).toBeGreaterThan(0)
    expect(fileSize('functions/map/_data/data.json')).toBeGreaterThan(0)
    expect(fileSize('functions/map/build/config.js')).toBeGreaterThan(0)
    expect(fileSize('functions/map/node_modules/ejs/ejs.min.js')).toBeGreaterThan(0)
    expect(fileSize('functions/map/ejs-templates/map.ejs')).toBeGreaterThan(0)
})

test('Track data', () => {
    const data = JSON.parse(readFile('_data/data.json'))
    expect(data.track.length).toBeGreaterThan(5000)
    expect(data.checkpoints.length).toBeGreaterThan(100)
    data.checkpoints.forEach((checkpoint) => {
        expect(checkpoint.stamps.length).toBeGreaterThan(0)
    })
})

test('Server HTTP response', async () => {
    const process = childProcess.fork(`${__dirname}/server.js`)
    await delay(3000)
    const map = await get('http://localhost:4571/map/85-86/nagy-hideg-hegy--nograd')
    const downloadMap = await get('http://localhost:4571/download-map/26-32/tapolca--szentbekkalla')
    const download = await get('http://localhost:4571/download/76-82/dobogoko--nagymaros')
    process.kill()
    expect(map.status).toBe(200)
    expect(map.data).toMatch(/<html.*Hideg/s)
    expect(downloadMap.status).toBe(200)
    expect(downloadMap.data).toMatch(/<html.*Csobánc/s)
    expect(download.status).toBe(200)
    expect(download.data).toMatch(/<kml.*Sikáros/s)
})

