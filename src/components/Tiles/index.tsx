import React from "react"
import { styled } from "@mui/system"
import Icon1 from "../../assets/images/svgNumber.svg"
import Icon2 from "../../assets/images/svgItem.svg"
import Icon3 from "../../assets/images/svgTime.svg"
import { Theme } from "@mui/material"

const StyledRoot = styled("div")(({ theme }) => ({
    height: "800px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#010606",
    [theme.breakpoints.down("lg")]: {
        height: "1100px",
    },
    [theme.breakpoints.down("md")]: {
        height: "1300px",
    },
}))

const StyledTilesWrapper = styled("div")(({ theme }) => ({
    maxWidth: "1000px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    alignItems: "center",
    gridGap: "16px",
    padding: "0 50px",
    [theme.breakpoints.down("xl")]: {
        gridTemplateColumns: "1fr 1fr",
    },
    [theme.breakpoints.down("lg")]: {
        gridTemplateColumns: "1fr",
        padding: "0 20px",
    },
}))

const StyledTilesCard = styled("div")(({ theme }) => ({
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
    [theme.breakpoints.down("xl")]: {
        padding: "15px",
    },
    [theme.breakpoints.down("lg")]: {
        padding: "5px",
    },
    "&:hover": {
        transform: "scale(1.12)",
        transition: "all 0.2s ease-in-out",
        cursor: "pointer",
    },
}))

const StyledTilesCardIcon = styled("img")({
    height: "160px",
    width: "160px",
    marginBottom: "10px",
})

const StyledTilesCardH1 = styled("h1")(({ theme }) => ({
    fontSize: "2.5rem",
    color: "#fff",
    marginBottom: "64px",
    [theme.breakpoints.down("md")]: {
        fontSize: "2rem",
    },
}))

const StyledTilesCardH2 = styled("h2")({
    fontSize: "1rem",
    marginBottom: "10px",
})

const StyledTilesCardP = styled("p")({
    fontSize: "1rem",
    textAlign: "center",
})

const Tiles = () => {
    return (
        <StyledRoot id="tiles">
            <StyledTilesCardH1>What this Website offers</StyledTilesCardH1>
            <StyledTilesWrapper>
                <StyledTilesCard>
                    <StyledTilesCardIcon src={Icon1} alt="# of Runs" />
                    <StyledTilesCardH2># of Runs</StyledTilesCardH2>
                    <StyledTilesCardP>How many runs has users completed for each Mission.</StyledTilesCardP>
                </StyledTilesCard>
                <StyledTilesCard>
                    <StyledTilesCardIcon src={Icon2} alt="Item Drops" />
                    <StyledTilesCardH2>Item Drops</StyledTilesCardH2>
                    <StyledTilesCardP>What and how many items were farmed per Mission.</StyledTilesCardP>
                </StyledTilesCard>
                <StyledTilesCard>
                    <StyledTilesCardIcon src={Icon3} alt="Time" />
                    <StyledTilesCardH2>Time</StyledTilesCardH2>
                    <StyledTilesCardP>How much time was needed to complete a run.</StyledTilesCardP>
                </StyledTilesCard>
            </StyledTilesWrapper>
        </StyledRoot>
    )
}

export default Tiles
