import { type RequestHandler, Router } from 'express'

import asyncMiddleware from '../middleware/asyncMiddleware'
import type { Services } from '../services'

export default function routes(service: Services): Router {
  const router = Router()
  const get = (path: string | string[], handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  get('/', async (req, res, next) => {
    const { clientToken } = res.locals
    const download = await service.prisonerLocationService.todaysFile(clientToken)
    res.render('pages/index', { latestFileName: download?.name })
  })
  get('/historic-reports', async (req, res, next) => {
    const { clientToken } = res.locals
    const downloads = await service.prisonerLocationService.historicFiles(clientToken)
    res.render('pages/historic', { nomisReports: downloads?.files })
  })
  get('/download/:filename', async (req, res, next) => {
    const { filename } = req.params
    const { clientToken } = res.locals

    const download = await service.prisonerLocationService.download(clientToken, filename)
    res.type('application/x-zip-compressed')
    download.pipe(res)
  })

  return router
}
