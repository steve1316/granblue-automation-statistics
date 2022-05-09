import axios, { AxiosError, AxiosResponse } from "axios"
import React, { createContext, useEffect, useState } from "react"

interface IProviderProps {
    user: any
    entryPoint: string
}

export const UserContext = createContext<IProviderProps>({} as IProviderProps)
export const UserContextProvider = ({ children }: any): JSX.Element => {
    const [user, setUser] = useState<any>()

    let entryPoint = "https://granblue-automation-statistics.com"
    if (process.env.REACT_APP_ENVIRONMENT && process.env.REACT_APP_ENVIRONMENT === "development") {
        entryPoint = "http://localhost:4000"
    }

    // Check and retrieve the user if they were logged in.
    useEffect(() => {
        let tempUser = localStorage.getItem("user")
        if (tempUser) {
            setUser(JSON.parse(tempUser))
        } else {
            axios
                .get(`${entryPoint}/api/user`, { withCredentials: true })
                .then((res: AxiosResponse) => {
                    if (res.data) {
                        console.log("[GAS] Successfully retrieved the logged in user. ", res.data)
                        setUser(res.data)
                        localStorage.setItem("user", JSON.stringify(res.data))
                    }
                })
                .catch((err: AxiosError) => {
                    console.error("[GAS] Unable to fetch previously logged in user: ", err.response?.data)
                })
        }
    }, [entryPoint])

    const providerValues: IProviderProps = {
        user,
        entryPoint,
    }

    return <UserContext.Provider value={providerValues}>{children}</UserContext.Provider>
}
