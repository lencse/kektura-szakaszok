import { Data, Stamp } from '../../types'
import { compile } from 'ejs'
import { renderAnalytics } from '../../frontend/analytics'

const handler = (data: Data, template: string, route: string): string => {
    const ids = route.match(/^(\d+)-(\d+)/).slice(1)
        .map((id) => Number(id))
        .sort((id1, id2) => id1 - id2)
    const checkpoints = data.checkpoints.slice(ids[0], ids[1] + 1)
    const fromName = checkpoints[0].name
    const toName = checkpoints[checkpoints.length - 1].name
    const pageTitle = `Kéktúra: ${fromName} - ${toName}`
    let stamps: Stamp[] = []
    for (const checkpoint of checkpoints) {
        stamps = stamps.concat(checkpoint.stamps)
    }
    const track = data.track.slice(
        checkpoints[0].firstNearNodeIdx,
        checkpoints[checkpoints.length - 1].lastNearNodeIdx + 1
    )
    const redirectTo = [
        process.env.SERVER_PREFIX,
        'download',
        `${route}.kml`
    ].join('/')
    return compile(template)({track, stamps, redirectTo, renderAnalytics, pageTitle})
}

export const getHandler  = (data: Data, template: string) => async (event) => {
    try {
        const route = event.path.match(/\/download-map\/(.*)$/)[1]
        const body = handler(data, template, route)
        return {
            statusCode: 200,
            body,
            headers: {
                'Content-Type': 'text/html; charset=UTF-8'
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
