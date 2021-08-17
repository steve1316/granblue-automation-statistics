import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import ReactPlayer from "react-player";
import heroVideo from "../assets/hero_video.mp4";
import { Box, Button, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100%",
        height: "800px",
        "& video": {
            objectFit: "cover",
        },
        position: "relative",
    },
    overlay: {
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

        [theme.breakpoints.down("sm")]: {
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

        [theme.breakpoints.down("md")]: {
            fontSize: "24px",
        },

        [theme.breakpoints.down("sm")]: {
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
        color: "#000",
        padding: "16px 32px",
        fontSize: "16px",
        fontWeight: "normal",
        margin: "0 50px",

        [theme.breakpoints.down("sm")]: {
            padding: "16px 24px",
            fontSize: "12px",
            margin: "0 25px",
        },
    },
}));

const HeroButton = ({ color, variant, text }) => {
    const classes = useStyles();
    return (
        <Button color={color} variant={variant} className={classes.heroButton}>
            {text}
        </Button>
    );
};

const HeroContent = () => {
    const classes = useStyles();
    return (
        <Box className={classes.heroContainer}>
            <Typography variant="h3" component="h1" className={classes.heroH1}>
                Granblue Automation Statistics
            </Typography>
            <Typography variant="h6" component="p" className={classes.heroP}>
                View and analyze runs and item drops from the various Farming Modes supported by Granblue Automation.
            </Typography>
            <Box className={classes.heroButtonWrapper}>
                <HeroButton color={"primary"} variant={"contained"} text={"Get Started"} />
                <HeroButton color={"primary"} variant={"contained"} text={"View on GitHub"} />
            </Box>
        </Box>
    );
};

const Overlay = () => {
    const classes = useStyles();
    return (
        <div className={classes.overlay}>
            <HeroContent />
        </div>
    );
};

const Hero = () => {
    const classes = useStyles();
    return (
        <section className={classes.root}>
            <ReactPlayer playing loop muted url={heroVideo} width="100%" height="100%" />

            <Overlay />
        </section>
    );
};

export default Hero;
