import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { renderAnalytics } from '../frontend/analytics'

writeFileSync(resolve(process.cwd(), '_includes/analytics.html'), renderAnalytics())
