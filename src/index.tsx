import React from "react"
import ReactDOM from "react-dom"
import "./index.css"
import App from "./App"
import { ThemeProvider, createTheme, StyledEngineProvider } from "@mui/material/styles"

const theme = createTheme()

ReactDOM.render(
    <ThemeProvider theme={theme}>
        <StyledEngineProvider injectFirst>
            <React.StrictMode>
                <App />
            </React.StrictMode>
        </StyledEngineProvider>
    </ThemeProvider>,
    document.getElementById("root")
)
