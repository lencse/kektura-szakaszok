export const map = {
    mapboxToken: process.env.MAPBOX_TOKEN
}

export const analytics = {
    enabled: 'true' === process.env.ANALYTICS_ENABLED,
    fathomSiteId: process.env.FATHOM_SITE_ID
}
