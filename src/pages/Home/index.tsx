import React, { useEffect } from "react"
import makeStyles from "@mui/styles/makeStyles"
import Hero from "../../components/Hero"
import InfoSection from "../../components/InfoSection"
import Tiles from "../../components/Tiles"
import { section1, section2 } from "./data"
import { Theme } from "@mui/material"

const Home = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            overflow: "hidden",
        },
    }))

    const classes = useStyles()

    useEffect(() => {
        document.title = "Granblue Automation Statistics"
        window.scrollTo(0, 0)
    }, [])

    return (
        <div className={classes.root} id="home">
            <Hero />
            <InfoSection {...section1} />
            <InfoSection {...section2} />
            <Tiles />
        </div>
    )
}

export default Home
