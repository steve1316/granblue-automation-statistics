import { NextFunction, Request, Response } from "express"

/**
 * Turns an unhandled route error into a JSON 500. Without it Express replies with an HTML error page,
 * which a client parsing JSON cannot read and which can leak a stack trace.
 *
 * @param err The error thrown by the route.
 * @param _req The request that failed.
 * @param res The response to write the error to.
 * @param next Passes the error along when a response has already started.
 */
export const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
    console.error("[error] Unhandled error while serving a request: ", err)

    if (res.headersSent) {
        next(err)
        return
    }

    res.status(500).send({ message: "Internal server error." })
}
