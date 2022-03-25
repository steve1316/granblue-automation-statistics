import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import Icon1 from "../../assets/images/svgNumber.svg"
import Icon2 from "../../assets/images/svgItem.svg"
import Icon3 from "../../assets/images/svgTime.svg"

const useStyles = makeStyles((theme) => ({
    root: {
        height: "800px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        background: "#010606",
        [theme.breakpoints.down("md")]: {
            height: "1100px",
        },
        [theme.breakpoints.down("sm")]: {
            height: "1300px",
        },
    },
    tilesWrapper: {
        maxWidth: "1000px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr",
        alignItems: "center",
        gridGap: "16px",
        padding: "0 50px",
        [theme.breakpoints.down("lg")]: {
            gridTemplateColumns: "1fr 1fr",
        },
        [theme.breakpoints.down("md")]: {
            gridTemplateColumns: "1fr",
            padding: "0 20px",
        },
    },
    tilesCard: {
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        alignItems: "center",
        borderRadius: "10px",
        maxHeight: "340px",
        padding: "30px",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        transition: "all 0.2s ease-in-out",
        [theme.breakpoints.down("lg")]: {
            padding: "15px",
        },
        [theme.breakpoints.down("md")]: {
            padding: "5px",
        },
        "&:hover": {
            transform: "scale(1.12)",
            transition: "all 0.2s ease-in-out",
            cursor: "pointer",
        },
    },
    tilesCardIcon: {
        height: "160px",
        width: "160px",
        marginBottom: "10px",
    },
    tilesCardH1: {
        fontSize: "2.5rem",
        color: "#fff",
        marginBottom: "64px",
        [theme.breakpoints.down("sm")]: {
            fontSize: "2rem",
        },
    },
    tilesCardH2: {
        fontSize: "1rem",
        marginBottom: "10px",
    },
    tilesCardP: {
        fontSize: "1rem",
        textAlign: "center",
    },
}))

const Tiles = () => {
    const classes = useStyles()
    return (
        <div className={classes.root} id="tiles">
            <h1 className={classes.tilesCardH1}>What this Website offers</h1>
            <div className={classes.tilesWrapper}>
                <div className={classes.tilesCard}>
                    <img src={Icon1} className={classes.tilesCardIcon} alt="# of Runs" />
                    <h2 className={classes.tilesCardH2}># of Runs</h2>
                    <p className={classes.tilesCardP}>How many runs has users completed for each Mission.</p>
                </div>
                <div className={classes.tilesCard}>
                    <img src={Icon2} className={classes.tilesCardIcon} alt="Item Drops" />
                    <h2 className={classes.tilesCardH2}>Item Drops</h2>
                    <p className={classes.tilesCardP}>What and how many items were farmed per Mission.</p>
                </div>
                <div className={classes.tilesCard}>
                    <img src={Icon3} className={classes.tilesCardIcon} alt="Time" />
                    <h2 className={classes.tilesCardH2}>Time</h2>
                    <p className={classes.tilesCardP}>How much time was needed to complete a run.</p>
                </div>
            </div>
        </div>
    )
}

export default Tiles
