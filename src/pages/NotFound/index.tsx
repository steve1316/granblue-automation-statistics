import React, { useEffect } from "react"
import { styled } from "@mui/system"
import { Link } from "react-router-dom"
import { Button, Theme } from "@mui/material"

const StyledRoot = styled("section")({
    background: "#000",
    overflow: "hidden",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    minHeight: "100vh",
})

const StyledContainer = styled("div")({
    color: "#fff",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
})

const StyledTitle = styled("h2")({
    fontSize: "40px",
    margin: "16px auto",
})

const StyledSubtitle = styled("p")({
    fontSize: "16px",
    margin: "16px auto",
})

const StyledButton = styled(Button)({
    borderRadius: "50px",
    background: "#01bf71",
    color: "#000",
    padding: "16px",
    fontSize: "16px",
    fontWeight: "normal",
    margin: "16px auto",
    "&:hover": {
        "& $link": {
            color: "white",
        },
    },
})

const StyledLink = styled(Link)({
    textDecoration: "none",
})

const NotFound = () => {
    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "404 - Not Found"
        window.scrollTo(0, 0)
    }, [])

    return (
        <StyledRoot>
            <StyledContainer>
                <StyledTitle>Sorry</StyledTitle>
                <StyledSubtitle>404 - Page cannot be found</StyledSubtitle>
                <StyledButton color="primary" variant="contained">
                    <StyledLink to="/">Head back to the Home page...</StyledLink>
                </StyledButton>
            </StyledContainer>
        </StyledRoot>
    )
}

export default NotFound
