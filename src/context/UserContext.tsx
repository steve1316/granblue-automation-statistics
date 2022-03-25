import Axios from "axios"
import React, { createContext, PropsWithChildren, useEffect, useState } from "react"

export const UserContext = createContext<any>({})
export default function Context(props: PropsWithChildren<any>) {
    const [user, setUser] = useState<any>()

    // Check and retrieve the user if they were logged in.
    useEffect(() => {
        Axios.get("http://localhost:4000/user", { withCredentials: true })
            .then((res) => {
                setUser(res.data)
            })
            .catch((err) => {
                console.error("Unable to fetch previously logged in user: ", err)
            })
    }, [])

    return <UserContext.Provider value={user}>{props.children}</UserContext.Provider>
}
