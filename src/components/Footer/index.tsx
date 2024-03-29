import React, { useState, useEffect } from "react"
import { Link as RouterLink } from "react-router-dom"
import { FaGithub, FaLinkedin } from "react-icons/fa"
import makeStyles from "@mui/styles/makeStyles"
import { Theme } from "@mui/material"

const Footer = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            padding: "16px 0 16px 0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            background: "#101522",
            width: "100%",
            overflow: "hidden",
        },
        linksContainer: {
            display: "flex",
            justifyContent: "center",
        },
        linksWrapper: {
            display: "flex",
            width: "100%",
            [theme.breakpoints.down("lg")]: {
                flexDirection: "column",
            },
        },
        linksItem: {
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
        },
        linksH1: {
            fontSize: "14px",
            marginBottom: "16px",
        },
        link: {
            color: "#fff",
            textDecoration: "none",
            marginBottom: "0.5rem",
            fontSize: "14px",
            "&:hover": {
                color: "#01bf71",
                transition: "0.3s ease-out",
            },
        },
        additionalInfoContainer: {
            maxWidth: "1000px",
            width: "100%",
        },
        additionalInfoWrapper: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            maxWidth: "1100px",
            margin: "40px auto 0 auto",
            [theme.breakpoints.down("lg")]: {
                flexDirection: "column",
            },
        },
        additionalInfoLogo: {
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
        },
        additionalInfoWebsiteRights: {
            color: "#fff",
            marginBottom: "16px",
        },
        additionalInfoIconWrapper: {
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "240px",
        },
        additionalInfoIconLink: {
            color: "#fff",
            fontSize: "24px",
            "&:hover": {
                color: "#01bf71",
                transition: "0.3s ease-out",
            },
        },
    }))

    const classes = useStyles()

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
        <section className={classes.root} id="footer">
            <div className={classes.linksContainer}>
                <div className={classes.linksWrapper}>
                    <div className={classes.linksItem}>
                        <h1 className={classes.linksH1}>About</h1>
                        <RouterLink to="/about" className={classes.link}>
                            How it works
                        </RouterLink>
                    </div>
                </div>
                <div className={classes.linksWrapper}>
                    <div className={classes.linksItem}>
                        <h1 className={classes.linksH1}>Services</h1>
                        <RouterLink to="/gateway" className={classes.link}>
                            Get Started
                        </RouterLink>
                        <RouterLink to="/dashboard" className={classes.link}>
                            Dashboard
                        </RouterLink>
                    </div>
                </div>
                <div className={classes.linksWrapper}>
                    <div className={classes.linksItem}>
                        <h1 className={classes.linksH1}>Supported Apps</h1>
                        <a href="https://github.com/steve1316/granblue-automation-pyautogui" target="_blank" rel="noreferrer" className={classes.link} aria-label="Granblue Automation @ GitHub">
                            Granblue Automation
                        </a>
                        <a href="https://github.com/steve1316/granblue-automation-android" target="_blank" rel="noreferrer" className={classes.link} aria-label="Granblue Automation Android @ GitHub">
                            Granblue Automation Android
                        </a>
                    </div>
                </div>
            </div>
            <section className={classes.additionalInfoContainer}>
                <div className={classes.additionalInfoWrapper}>
                    <RouterLink to="/" onClick={scrollToTop} className={classes.additionalInfoLogo}>
                        Granblue Automation Statistics
                    </RouterLink>
                    <small className={classes.additionalInfoWebsiteRights}>steve1316 © {new Date().getFullYear()} All rights reserved.</small>
                    <div className={classes.additionalInfoIconWrapper}>
                        <a href="https://github.com/steve1316" target="_blank" rel="noreferrer" className={classes.additionalInfoIconLink} aria-label="GitHub">
                            <FaGithub />
                        </a>
                        <a href="https://www.linkedin.com/in/steve-tu-370ba219b/" target="_blank" rel="noreferrer" className={classes.additionalInfoIconLink} aria-label="LinkedIn">
                            <FaLinkedin />
                        </a>
                    </div>
                </div>
            </section>
        </section>
    )
}

export default Footer
