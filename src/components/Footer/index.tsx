import { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import { styled } from "@mui/system"

const StyledRoot = styled("section")({
    padding: "16px 0 16px 0",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#101522",
    width: "100%",
    overflow: "hidden",
})

const StyledLinksContainer = styled("div")({
    display: "flex",
    justifyContent: "center",
})

const StyledLinksWrapper = styled("div")(({ theme }) => ({
    display: "flex",
    width: "100%",
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}))

const StyledLinksItem = styled("div")(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    margin: "16px",
    textAlign: "left",
    width: "160px",
    boxSizing: "border-box",
    color: "#fff",
    [theme.breakpoints.down("md")]: {
        margin: 0,
        padding: "10px",
        width: "100%",
    },
}))

const StyledLinksH1 = styled("h1")({
    fontSize: "14px",
    marginBottom: "16px",
})

const StyledCustomRouterLink = styled(RouterLink)({
    color: "#fff",
    textDecoration: "none",
    marginBottom: "0.5rem",
    fontSize: "14px",
    "&:hover": {
        color: "#01bf71",
        transition: "0.3s ease-out",
    },
})

const StyledAdditionalInfoContainer = styled("section")({
    maxWidth: "1000px",
    width: "100%",
})

const StyledAdditionalInfoWrapper = styled("div")(({ theme }) => ({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    maxWidth: "1100px",
    margin: "40px auto 0 auto",
    [theme.breakpoints.down("lg")]: {
        flexDirection: "column",
    },
}))

const StyledAdditionalInfoLogo = styled(RouterLink)({
    color: "#fff",
    justifySelf: "start",
    cursor: "pointer",
    textDecoration: "none",
    fontSize: "1.5rem",
    display: "flex",
    alignItems: "center",
    marginBottom: "16px",
    textAlign: "center",
    fontWeight: "bold",
    "&:hover": {
        color: "#01bf71",
        transition: "0.3s ease-out",
    },
})

const StyledAdditionalInfoWebsiteRights = styled("small")({
    color: "#fff",
    marginBottom: "16px",
})

const StyledAdditionalInfoIconWrapper = styled("div")({
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "240px",
})

const StyledAdditionalInfoIconLink = styled("a")({
    color: "#fff",
    fontSize: "24px",
    "&:hover": {
        color: "#01bf71",
        transition: "0.3s ease-out",
    },
})

const Footer = () => {
    const [, setScrollNav] = useState(false)

    // Add listener for when the user scrolls the page.
    useEffect(() => {
        window.addEventListener("scroll", toggleScroll)
    }, [])

    // If user's y-position is greater than the specified offset, allow the page to send the user back to the top of the page.
    const toggleScroll = () => {
        if (window.pageYOffset > 300) {
            setScrollNav(true)
        } else {
            setScrollNav(false)
        }
    }

    // Send the user back to the top of the page.
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <StyledRoot id="footer">
            <StyledLinksContainer>
                <StyledLinksWrapper>
                    <StyledLinksItem>
                        <StyledLinksH1>About</StyledLinksH1>
                        <StyledCustomRouterLink to="/about">How it works</StyledCustomRouterLink>
                    </StyledLinksItem>
                </StyledLinksWrapper>
                <StyledLinksWrapper>
                    <StyledLinksItem>
                        <StyledLinksH1>Services</StyledLinksH1>
                        <StyledCustomRouterLink to="/gateway">Get Started</StyledCustomRouterLink>
                        <StyledCustomRouterLink to="/dashboard">Dashboard</StyledCustomRouterLink>
                    </StyledLinksItem>
                </StyledLinksWrapper>
                <StyledLinksWrapper>
                    <StyledLinksItem>
                        <StyledLinksH1>Supported Apps</StyledLinksH1>
                        <a href="https://github.com/steve1316/granblue-automation-pyautogui" target="_blank" rel="noreferrer" aria-label="Granblue Automation @ GitHub">
                            Granblue Automation
                        </a>
                        <a href="https://github.com/steve1316/granblue-automation-android" target="_blank" rel="noreferrer" aria-label="Granblue Automation Android @ GitHub">
                            Granblue Automation Android
                        </a>
                    </StyledLinksItem>
                </StyledLinksWrapper>
            </StyledLinksContainer>
            <StyledAdditionalInfoContainer>
                <StyledAdditionalInfoWrapper>
                    <StyledAdditionalInfoLogo to="/" onClick={scrollToTop}>
                        Granblue Automation Statistics
                    </StyledAdditionalInfoLogo>
                    <StyledAdditionalInfoWebsiteRights>steve1316 © {new Date().getFullYear()} All rights reserved.</StyledAdditionalInfoWebsiteRights>
                    <StyledAdditionalInfoIconWrapper>
                        <StyledAdditionalInfoIconLink href="https://github.com/steve1316" target="_blank" rel="noreferrer" aria-label="GitHub">
                            <FaGithub />
                        </StyledAdditionalInfoIconLink>
                        <StyledAdditionalInfoIconLink href="https://www.linkedin.com/in/steve-tu-370ba219b/" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                            <FaLinkedin />
                        </StyledAdditionalInfoIconLink>
                    </StyledAdditionalInfoIconWrapper>
                </StyledAdditionalInfoWrapper>
            </StyledAdditionalInfoContainer>
        </StyledRoot>
    )
}

export default Footer
