import React from "react"
import makeStyles from "@mui/styles/makeStyles"
import ReactPlayer from "react-player"
import heroVideo from "../../assets/hero_video.mp4"
import { Box, Button, Theme, Typography } from "@mui/material"
import { Link as RouterLink, useHistory } from "react-router-dom"

const Hero = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            width: "100%",
            height: "800px",
            "& video": {
                objectFit: "cover",
            },
            position: "relative",
        },
        heroOverlay: {
            position: "absolute",
            top: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.3)",
        },
        heroContainer: {
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "#fff",
        },
        heroH1: {
            color: "fff",
            fontSize: "48px",
            maxWidth: "1200px",
            textAlign: "center",
            fontFamily: "Segoe UI",
            fontWeight: "bold",
            [theme.breakpoints.down("md")]: {
                fontSize: "32px",
            },
        },
        heroP: {
            color: "fff",
            fontSize: "24px",
            maxWidth: "600px",
            marginTop: theme.spacing(6),
            padding: "0 12px 0 12px",
            textAlign: "center",
            fontWeight: "normal",
            [theme.breakpoints.down("lg")]: {
                fontSize: "24px",
            },
            [theme.breakpoints.down("md")]: {
                fontSize: "18px",
            },
        },
        heroButtonWrapper: {
            marginTop: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        },
        heroButton: {
            borderRadius: "50px",
            background: "#01bf71",
            padding: "16px 32px",
            fontSize: "16px",
            margin: "0 50px",
            [theme.breakpoints.down("md")]: {
                padding: "16px 24px",
                fontSize: "12px",
                margin: "0 25px",
            },
        },
        heroButtonLink: {
            color: "#fff",
            textDecoration: "none",
            fontWeight: "bold",
        },
    }))

    const classes = useStyles()
    const history = useHistory()

    return (
        <section className={classes.root}>
            <ReactPlayer playing loop muted url={heroVideo} width="100%" height="100%" />

            <div className={classes.heroOverlay}>
                <Box className={classes.heroContainer}>
                    <Typography variant="h3" component="h1" className={classes.heroH1}>
                        Granblue Automation Statistics
                    </Typography>

                    <Typography variant="h6" component="p" className={classes.heroP}>
                        View and analyze runs and item drops from the various Farming Modes supported by Granblue Automation.
                    </Typography>

                    <Box className={classes.heroButtonWrapper}>
                        <Button color="primary" variant="contained" className={classes.heroButton} onClick={() => history.push("/gateway")}>
                            Get Started
                        </Button>
                        <Button
                            color="primary"
                            variant="contained"
                            className={classes.heroButton}
                            onClick={() => window.open("https://github.com/steve1316/granblue-automation-aws-statistics", "_blank")}
                        >
                            View on GitHub
                        </Button>
                    </Box>
                </Box>
            </div>
        </section>
    )
}

export default Hero
