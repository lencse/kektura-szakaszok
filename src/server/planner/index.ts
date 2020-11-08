import { Data, Stamp } from '../../types'
import { compile } from 'ejs'
import { renderAnalytics } from '../../frontend/analytics'
import { compress } from 'lzutf8'

const handler = (data: Data, template: string, route: string): string => {
    const parts = route.match(/(\d+-\d+-[a-f0-9]{6})/g)
        .map((stringPart) => stringPart.match(/(\d+)-(\d+)-([a-f0-9]{6})/))
        .map((partData) => ({
            ids: [partData[1], partData[2]].map((id) => Number(id)).sort((id1, id2) => id1 - id2),
            color: partData[3]
        }))
        .map((part) => {
            const checkpoints = data.checkpoints.slice(part.ids[0], part.ids[1] + 1)
            let stamps: Stamp[] = []
            // const fromName = checkpoints[0].name
            // const toName = checkpoints[checkpoints.length - 1].name
            for (const checkpoint of checkpoints) {
                stamps = stamps.concat(checkpoint.stamps)
            }
            const track = data.track.slice(
                checkpoints[0].firstNearNodeIdx,
                checkpoints[checkpoints.length - 1].lastNearNodeIdx + 1
            )
            return {
                ...part,
                track,
                stamps
            }
        })
    const partsCompressed = compress(JSON.stringify(parts), { outputEncoding: 'Base64' })
    return compile(template)({partsCompressed, renderAnalytics, pageTitle: 'Kéktúra tervező'})
}

export const getHandler  = (data: Data, template: string) => async (event, context) => {
    try {
        const route = event.path.match(/\/planner\/(.*)$/)[1]
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
