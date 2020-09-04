export interface Coordinate {
    lat: number
    lon: number
}

export interface Stamp {
    coordinate: Coordinate
    name: string
    checkpointId: string,
    description: string,
    url: string,
    id: number
}

interface WithPathNodes {
    firstNearNodeIdx: number
    lastNearNodeIdx: number
}

export interface StampWithPathNodes extends Stamp, WithPathNodes {}

export interface Data {
    track: Coordinate[]
    checkpoints: Checkpoint[]
}

export interface Checkpoint extends WithPathNodes {
    name: string
    id: string
    stamps: Stamp[]
}
