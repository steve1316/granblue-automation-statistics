import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles"
import UserContext from "./context/UserContext"

require("dotenv").config()

const theme = createTheme()

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
            <React.StrictMode>
                <UserContext>
                    <App />
                </UserContext>
            </React.StrictMode>
        </StyledEngineProvider>
    </ThemeProvider>,
    document.getElementById("root")
)
