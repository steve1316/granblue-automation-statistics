import React, { useEffect } from "react"
import { styled } from "@mui/system"
import Hero from "../../components/Hero"
import InfoSection from "../../components/InfoSection"
import Tiles from "../../components/Tiles"
import { section1, section2 } from "./data"
import { Theme } from "@mui/material"

const StyledRoot = styled("div")({
    overflow: "hidden",
})

const Home = () => {
    useEffect(() => {
        document.title = "Granblue Automation Statistics"
        window.scrollTo(0, 0)
    }, [])

    return (
        <StyledRoot id="home">
            <Hero />
            <InfoSection {...section1} />
            <InfoSection {...section2} />
            <Tiles />
        </StyledRoot>
    )
}

export default Home
