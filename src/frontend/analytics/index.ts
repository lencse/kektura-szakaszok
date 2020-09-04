import { analytics } from '../../config'

const siteId = analytics.fathomSiteId

export const renderAnalytics = () => analytics.enabled ?
    `<script src="https://cdn.usefathom.com/script.js" site="${siteId}" defer></script>` :
    ''
