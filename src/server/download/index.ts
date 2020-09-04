import { Data, Stamp } from '../../types'
import * as tokml from 'tokml'

const download = (data: Data, route: string): string => {
    const ids = route.match(/^(\d+)-(\d+)/).slice(1)
        .map((id) => Number(id))
        .sort((id1, id2) => id1 - id2)
    const checkpoints = data.checkpoints.slice(ids[0], ids[1] + 1)
    const fromName = checkpoints[0].name
    const toName = checkpoints[checkpoints.length - 1].name
    let stamps: Stamp[] = []
    for (const checkpoint of checkpoints) {
        stamps = stamps.concat(checkpoint.stamps)
    }
    const track = data.track.slice(
        checkpoints[0].firstNearNodeIdx,
        checkpoints[checkpoints.length - 1].lastNearNodeIdx + 1
    )
    return tokml(
        {
            type: 'FeatureCollection',
            features: [
                {
                    type: 'Feature',
                    geometry: {
                        type: 'LineString',
                        coordinates: track.map((node) => [node.lon, node.lat])
                    },
                    properties: {
                        name: `${fromName} - ${toName}`
                    }
                },
                ...stamps.map((stamp) => ({
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates: [stamp.coordinate.lon, stamp.coordinate.lat]
                    },
                    properties: {
                        name: stamp.name,
                        description: `${stamp.description} | ${stamp.url}`
                    }
                }))
            ]
        }
    )
}

export const getHandler  = (data: Data) => async (event, context) => {
    try {
        const route = event.path.match(/\/download\/(.*)$/)[1]
        const body = download(data, route)
        return {
            statusCode: 200,
            body,
            headers: {
                'Content-Type': 'text/xml; charset=UTF-8',
                'Content-Disposition': `attachment; filename="${route.split('/').pop()}.kml"`
            }
        }
    } catch (error) {
        console.error(error)
        return {
            statusCode: 500,
            body: 'Server error'
        }
    }
}
