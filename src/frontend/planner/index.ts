import * as leaflet from 'leaflet'
import { map as config } from '../../config'
import { Coordinate, Part, Stamp } from '../../types'
import ready from '../ready'
import { decompress } from 'lzutf8'

const renderMap = (parts: Part[]) => {
    const minLat = Math.min(...parts.map(
        (part) => Math.min(...part.track.map((coord) => coord.lat))
    ))
    const maxLat = Math.max(...parts.map(
        (part) => Math.max(...part.track.map((coord) => coord.lat))
    ))
    const minLon = Math.min(...parts.map(
        (part) => Math.min(...part.track.map((coord) => coord.lon))
    ))
    const maxLon = Math.max(...parts.map(
        (part) => Math.max(...part.track.map((coord) => coord.lon))
    ))
    const map = leaflet.map('map').fitBounds([
        [minLat, minLon],
        [maxLat, maxLon]
    ])
    leaflet.tileLayer(
        `https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}`
            + `?access_token=${config.mapboxToken}`,
        {
            attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">'
            + 'OpenStreetMap</a> contributors, '
            + '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, '
            + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            maxZoom: 18,
            tileSize: 512,
            id: 'mapbox/outdoors-v11',
            zoomOffset: -1
        }
    ).addTo(map)
    parts.forEach((part) => {
        leaflet.polyline(part.track.map((coord) => [coord.lat, coord.lon]), {color: `#${part.color}`}).addTo(map)
        part.stamps.forEach((stamp) => leaflet.marker([
            stamp.coordinate.lat,
            stamp.coordinate.lon
        ], {
            keyboard: false,
            title: stamp.name
        }).addTo(map))
    })
}

ready(async () => {
    const parts = JSON.parse(
        decompress(
            JSON.parse(document.querySelector('body').dataset.data).partsCompressed,
            { inputEncoding: 'Base64' }
        )
    )
    renderMap(parts)
})
