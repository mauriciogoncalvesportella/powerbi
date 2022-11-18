import { Request, Response, NextFunction } from 'express'

export function VersionControlMiddleware (req: Request, res: Response, next: NextFunction) {
  if (req.headers['check-frontend-version']) {
    res.header('Access-Control-Expose-Headers', '*')
    res.header('version-control', process.env.VERSION)
  }

  return next()
}
