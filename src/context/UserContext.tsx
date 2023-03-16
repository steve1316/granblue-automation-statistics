import axios from "axios"
import React, { createContext, useCallback, useEffect, useState } from "react"
import { UserInterface } from "../interfaces/UserInterface"

// VITE_API_URL is defined per environment in .env.development / .env.production.
const ENTRY_POINT = import.meta.env.VITE_API_URL

// The API signs the website in with a session cookie, so every request has to send it.
axios.defaults.withCredentials = true

/** What the rest of the app can read about who is signed in. */
interface IProviderProps {
    /** The signed-in user's profile, or undefined when nobody is signed in. */
    user: UserInterface | undefined
    /** True until the first session check finishes. Route guards wait for this. */
    loading: boolean
    /** Where the API server lives. */
    entryPoint: string
    /** Asks the API who is signed in and updates `user` to match. Call this after logging in. */
    refreshUser: () => Promise<void>
    /** Signs the current user out. */
    signOut: () => Promise<void>
}

export const UserContext = createContext<IProviderProps>({} as IProviderProps)

/**
 * Holds the signed-in user for the whole app. The API's session cookie is the source of truth, rather than a copy cached in localStorage.
 *
 * @param children The tree that can read the context.
 * @returns The provider wrapping that tree.
 */
export const UserContextProvider = ({ children }: any): React.JSX.Element => {
    const [user, setUser] = useState<UserInterface | undefined>()
    const [loading, setLoading] = useState(true)

    const refreshUser = useCallback(async () => {
        try {
            // A 204 with no body means nobody is signed in.
            const res = await axios.get<UserInterface | "">(`${ENTRY_POINT}/api/me`)
            setUser(res.data ? { username: res.data.username, isAdmin: res.data.isAdmin } : undefined)
        } catch {
            setUser(undefined)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // Clear the key the old version cached the user under.
        localStorage.removeItem("user")
        void refreshUser()
    }, [refreshUser])

    const signOut = useCallback(async () => {
        try {
            await axios.get(`${ENTRY_POINT}/api/logout`)
        } catch (err) {
            console.error("[GAS] Failed to log out: ", err)
        }
        setUser(undefined)
    }, [])

    const providerValues: IProviderProps = {
        user,
        loading,
        entryPoint: ENTRY_POINT,
        refreshUser,
        signOut,
    }

    return <UserContext.Provider value={providerValues}>{children}</UserContext.Provider>
}
