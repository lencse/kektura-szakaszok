import * as leaflet from 'leaflet'
import { map as config } from '../../config'
import { Coordinate, Stamp } from '../../types'
import ready from '../ready'

const renderMap = (track: Coordinate[], stamps: Stamp[], redirectTo?: string) => {
    const minLat = Math.min(...track.map((coord) => coord.lat))
    const maxLat = Math.max(...track.map((coord) => coord.lat))
    const minLon = Math.min(...track.map((coord) => coord.lon))
    const maxLon = Math.max(...track.map((coord) => coord.lon))
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
    leaflet.polyline(track.map((coord) => [coord.lat, coord.lon]), {color: '#0047ab'}).addTo(map)
    stamps.forEach((stamp) => leaflet.marker([
        stamp.coordinate.lat,
        stamp.coordinate.lon
    ], {
        keyboard: false,
        title: stamp.name
    }).addTo(map))
    if (redirectTo) {
        window.location.replace(redirectTo)
    }
}

ready(async () => {
    const {track, stamps, redirectTo } = JSON.parse(document.querySelector('body').dataset.data)
    renderMap(track, stamps, redirectTo)
})
