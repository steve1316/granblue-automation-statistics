import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles"
import { UserContextProvider } from "./context/UserContext"
import dotenv from "dotenv"

dotenv.config()

const theme = createTheme()

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
            <React.StrictMode>
                <UserContextProvider>
                    <App />
                </UserContextProvider>
            </React.StrictMode>
        </StyledEngineProvider>
    </ThemeProvider>,
    document.getElementById("root")
)
