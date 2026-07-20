import { Response } from "express"
export const requireStringParams = (res: Response, params: Record<string, unknown>) => {
    for (const value of Object.values(params)) {
        if (!value || typeof value !== "string") {
            res.status(400).send({ message: "Improper values for parameters." })
            return false
        }
    }
    return true
}
