const data = require('./_data/data.json')

const d = data.checkpoints.map((c, i) => ({
    name: c.name,
    stamps: c.stamps.length
}))

console.table(d)
