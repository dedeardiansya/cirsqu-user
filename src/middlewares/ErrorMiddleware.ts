import { Application, Request, Response, NextFunction } from 'express'
import config from '../config/config'
import logger from '../config/logger'
import ApiError from '../shared/ApiError'

class ErrorMiddleware {
  private app: Application

  constructor(app: Application) {
    this.app = app
    this.app.use(this.catch404)
    this.app.use(this.errorConverter)
    this.app.use(this.makeErrorResponse)
  }

  /**
   * Catch not found
   *
   * @param req
   * @param res
   * @param next
   */
  catch404(req: Request, res: Response, next: NextFunction): void {
    next(new ApiError(404, 'Not found'))
  }

  /**
   * Converting the error.
   * @param err
   * @param req
   * @param res
   * @param next
   */
  errorConverter(
    err: ApiError | Error,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    let error = err
    if (err.name !== 'ApiError') {
      const msg = err.message || 'Internal server error'
      error = new ApiError(500, msg, err.stack)
      logger.error(err)
    }
    next(error)
  }

  /**
   * Send error to client
   *
   * @param err
   * @param req
   * @param res
   * @param next
   */
  makeErrorResponse(
    err: ApiError,
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const { statusCode, message } = err
    res.status(statusCode).json({
      statusCode,
      message,
      ...(config.isDev ? err : {}),
    })
  }
}

export default ErrorMiddleware
