import React, { useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import Hero from "../../components/Hero"
import InfoSection from "../../components/InfoSection"
import Tiles from "../../components/Tiles"
import { section1, section2 } from "./data.ts"

const Home = () => {
    const useStyles = makeStyles((theme) => ({
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
