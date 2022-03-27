import axios, { AxiosError, AxiosResponse } from "axios"
import React, { createContext, PropsWithChildren, useEffect, useState } from "react"

export const UserContext = createContext<any>({})
export default function Context(props: PropsWithChildren<any>) {
    const [user, setUser] = useState<any>()

    // Check and retrieve the user if they were logged in.
    useEffect(() => {
        axios
            .get("http://localhost:4000/user", { withCredentials: true })
            .then((res: AxiosResponse) => {
                if (res.data) {
                    console.log("[GAS] Successfully retrieved the logged in user. ", res.data)
                    setUser(res.data)
                }
            })
            .catch((err: AxiosError) => {
                console.error("[GAS] Unable to fetch previously logged in user: ", err.response?.data)
            })
    }, [])

    return <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
}
