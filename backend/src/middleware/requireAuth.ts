import { Request, Response, NextFunction } from "express"

// This workaround method is only for the use of Tauri to work around the fact that the headers are stripped in the response when Tauri receives it from the server.
export const authenticationWorkaround = async (username: string, password: string) => {
    try {
        await fetch("http://localhost:4000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username: username, password: password }),
        })
        return true
    } catch {
        return false
    }
}

// This middleware guards routes that require an authenticated user.
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
        const { username, password } = req.body
        if ((username !== undefined || password !== undefined) && !authenticationWorkaround) {
            res.status(401).send({ message: "Not Authenticated." })
            return
        }
    }
    next()
}
