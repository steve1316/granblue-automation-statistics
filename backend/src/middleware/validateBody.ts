import { Response } from "express"

/**
 * Checks that every supplied value is a non-empty string, replying with the API's standard 400 when
 * one is not. Narrowing the argument keeps route handlers from having to re-assert that a URL
 * parameter is a string, which Express types as possibly being an array.
 *
 * @param res The response to write the rejection to.
 * @param params The values to check, keyed by name. Keys are only used for readability at the call site.
 * @returns True when every value is a non-empty string, false when the rejection has been sent.
 */
export const requireStringParams = <T extends Record<string, unknown>>(res: Response, params: T): params is T & Record<keyof T, string> => {
    for (const value of Object.values(params)) {
        if (!value || typeof value !== "string") {
            res.status(400).send({ message: "Improper values for parameters." })
            return false
        }
    }

    return true
}
