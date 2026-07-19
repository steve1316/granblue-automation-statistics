import React from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App"
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles"
import { UserContextProvider } from "./context/UserContext"

const theme = createTheme()

const container = document.getElementById("app")
const root = createRoot(container!);

root.render(
    <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
            <React.StrictMode>
                <UserContextProvider>
                    <App />
                </UserContextProvider>
            </React.StrictMode>
        </StyledEngineProvider>
    </ThemeProvider>
)
