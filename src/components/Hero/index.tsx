import { styled } from "@mui/system"
import ReactPlayer from "react-player"
import heroVideo from "../../assets/hero_video.mp4"
import { Box, Button, Theme, Typography } from "@mui/material"
import { useNavigate } from "react-router-dom"

const StyledRoot = styled("section")({
    width: "100%",
    height: "800px",
    "& video": {
        objectFit: "cover",
    },
    position: "relative",
})

const StyledHeroOverlay = styled("div")({
    position: "absolute",
    top: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
})

const StyledHeroContainer = styled("div")({
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    color: "#fff",
})

const StyledHeroH1 = styled("h1")(({ theme }) => ({
    color: "#fff",
    fontSize: "48px",
    maxWidth: "1200px",
    textAlign: "center",
    fontFamily: "Segoe UI",
    fontWeight: "bold",
    [theme.breakpoints.down("md")]: {
        fontSize: "32px",
    },
}))

const StyledHeroP = styled("p")(({ theme }) => ({
    color: "#fff",
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
}))

const StyledHeroButtonWrapper = styled("div")({
    marginTop: "32px",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
})

const StyledHeroButton = styled(Button)(({ theme }) => ({
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
}))

const Hero = () => {
    const navigate = useNavigate()

    return (
        <StyledRoot>
            <ReactPlayer playing loop muted url={heroVideo} width="100%" height="100%" />

            <StyledHeroOverlay>
                <StyledHeroContainer>
                    <Typography variant="h3" component={StyledHeroH1}>
                        Granblue Automation Statistics
                    </Typography>

                    <Typography variant="h6" component={StyledHeroP}>
                        View and analyze runs and item drops from the various Farming Modes supported by Granblue Automation.
                    </Typography>

                    <StyledHeroButtonWrapper>
                        <StyledHeroButton color="primary" variant="contained" onClick={() => navigate("/gateway", { replace: true })}>
                            Get Started
                        </StyledHeroButton>
                        <StyledHeroButton color="primary" variant="contained" onClick={() => window.open("https://github.com/steve1316/granblue-automation-statistics", "_blank")}>
                            View on GitHub
                        </StyledHeroButton>
                    </StyledHeroButtonWrapper>
                </StyledHeroContainer>
            </StyledHeroOverlay>
        </StyledRoot>
    )
}

export default Hero
