import axios from 'axios'
import { load } from 'cheerio'
import { parseString } from 'xml2js'
import { Coordinate, Stamp, StampWithPathNodes, Data, Checkpoint } from '../types'
import { getDistance, convertSpeed } from 'geolib'
import { writeFileSync } from 'fs'
import { resolve } from 'path'

const httpGet = async (url: string): Promise<string> => {
    const res = await axios.get(url)
    return res.data
}

const xml2json = (xml: string): Promise<any> => new Promise((resolve, reject) => {
    parseString(xml, (err, json) => {
        if (err) {
            reject(err)
        } else {
            resolve(json)
        }
    })
})

const coordinatesFromGpx = async (gpx: string): Promise<Coordinate[]> => {
    const data: any = await xml2json(gpx)
    return data.gpx
        .trk[0]
        .trkseg[0]
        .trkpt
        .map((node) => ({
            lat: Number(node.$.lat),
            lon: Number(node.$.lon)
        }))
}

const trackGpxUrl = (links: Cheerio): string => {
    for (const idx in Object.keys(links)) {
        const { href } = links[idx].attribs
        if (idx.match(/^\d+$/) && href.match(/okt_teljes_gpx/)) {
            return href
        }
    }
    throw new Error('Not found track gpx link')
}

const exceptions = {
    'Kő-hegy, Lokó-pihenő OKTPH_85_2': '85_2',
    'Magyarkút OKTPH_85_1': '85_1'
}

const reorder = {
    'Csobánci OKTPH_31_B': +1,
    'Káptalantóti OKTPH_31': -1
}

const rename = {
    'Csobánci OKTPH_31_B': 'Csobánc OKTPH_31_B'
}

const stampsFromGpx = async (gpx: string): Promise<Stamp[]> => {
    const data: any = await xml2json(gpx.toString())
    return data.gpx
        .wpt
        .map((node) =>({
            coordinate: {
                lat: Number(node.$.lat),
                lon: Number(node.$.lon),
            },
            description: String(node.desc[0]),
            url: String(node.url[0]),
            name: String(node.name[0])
            // name: console.dir(node) || String(node.name[0])
        }))
        .filter((unfilteredStamp) => unfilteredStamp.name.match(/OKTPH/))
        .map((stamp, idx) => ({
            coordinate: stamp.coordinate,
            name:
                rename[stamp.name] ||
                stamp.name,
            checkpointId:
                exceptions[stamp.name] ||
                stamp.name.match(/OKTPH_([0-9]+(_[A-Z])?)/)[1],
            description: stamp.description,
            url: stamp.url,
            id: idx + (reorder[stamp.name] || 0)
        }))
        .sort((cp1, cp2) => cp1.id - cp2.id)
}

const getTrack = async (): Promise<Coordinate[]> => {
    const html = await httpGet('https://kektura.hu/szakaszok.html')
    const dom = load(html)
    const links = dom('a[href$=".gpx"]')
    const trackGpx = await httpGet(`https://kektura.hu/${trackGpxUrl(links)}`)
    return await coordinatesFromGpx(trackGpx)
}

const distanceInMeters = (coord1: Coordinate, coord2: Coordinate): number => getDistance(
    { longitude: coord1.lon, latitude: coord1.lat },
    { longitude: coord2.lon, latitude: coord2.lat }
)

const getStamps = async (trackNodes): Promise<StampWithPathNodes[]> => {
    const gpx = await httpGet(`http://turistautak.openstreetmap.hu/pecsetmind.php?ph=Orsz%C3%A1gos%20K%C3%A9kt%C3%BAra`)
    const stamps = await stampsFromGpx(gpx)
    console.info(stamps.length, 'stamps data downloaded from kektura.hu')
    return stamps.map((stamp, stampIdx) => {
        const distances = trackNodes.map((node) => distanceInMeters(node, stamp.coordinate))
        const minDistance = Math.min(...distances.filter((d) => d < 3000))
        const nearestIdx = distances.findIndex((d) => minDistance === d)
        const nearestNode = trackNodes[nearestIdx]
        let first = nearestIdx
        // while (first >= 0 && distanceInMeters(trackNodes[first], nearestNode) < 50) {
        //     --first
        // }
        let last = nearestIdx
        // while (last < trackNodes.length && distanceInMeters(trackNodes[last], nearestNode) < 50) {
        //     ++last
        // }
        console.info(stampIdx + 1, '/', stamps.length, 'stamps processed')
        return {
            ...stamp,
            firstNearNodeIdx: Math.max(0, first),
            lastNearNodeIdx: Math.min(trackNodes.length - 1, last)
        }
    })
}

const getCheckpoints = (stamps: StampWithPathNodes[]): Checkpoint[] => {
    const ch = new Map<string, Checkpoint>()
    stamps.forEach((stamp) => {
        if (!ch.has(stamp.checkpointId)) {
            ch.set(stamp.checkpointId, {
                name: stamp.name.replace(/\s+OKTPH.*$/, ''),
                id: stamp.checkpointId,
                firstNearNodeIdx: stamp.firstNearNodeIdx,
                lastNearNodeIdx: stamp.lastNearNodeIdx,
                stamps: []
            })
        }
        const c = ch.get(stamp.checkpointId)
        c.firstNearNodeIdx = Math.min(c.firstNearNodeIdx, stamp.firstNearNodeIdx)
        c.lastNearNodeIdx = Math.max(c.lastNearNodeIdx, stamp.lastNearNodeIdx)
        c.stamps.push({
            checkpointId: stamp.checkpointId,
            coordinate: stamp.coordinate,
            id: stamp.id,
            name: stamp.name,
            description: stamp.description,
            url: stamp.url
        })
    })
    const result = []
    for (let i of ch.values()) {
        result.push(i)
    }
    return result
}
const download = async () => {
    const track = (await getTrack()) // .filter((v, i) => i%100 === 0)
    console.info(track.length, 'track nodes downloaded from kektura.hu')
    const stamps = await getStamps(track)
    const checkpoints = getCheckpoints(stamps)
    const data: Data = {
        checkpoints,
        track
    }
    writeFileSync(resolve(process.cwd(), '_data/data.json'), JSON.stringify(data))
}

download()
