import { useEffect } from "react"
import { styled } from "@mui/system"
import { Button } from "@mui/material"
import { useNavigate } from "react-router-dom"

const GA_REPO = "https://github.com/steve1316/granblue-automation-pyautogui"
const GAA_REPO = "https://github.com/steve1316/granblue-automation-android"

const steps = [
    {
        title: "Create an account",
        description: "Sign up here with a username and password. That becomes your submission identity.",
    },
    {
        title: "Add it to the app",
        description: "Enter those same credentials in the GA (Windows) or GAA (Android) app settings and turn on opt-in.",
    },
    {
        title: "Farm as usual",
        description: "Completed runs automatically submit their item drops here, feeding the Dashboard.",
    },
]

const StyledRoot = styled("section")({
    background: "#000",
    color: "#fff",
    fontFamily: "Segoe UI, system-ui, sans-serif",
    overflow: "hidden",
})

const StyledHeader = styled("div")(({ theme }) => ({
    textAlign: "center",
    padding: "80px 24px 48px",
    [theme.breakpoints.down("md")]: {
        padding: "56px 20px 36px",
    },
}))

const StyledEyebrow = styled("div")({
    textTransform: "uppercase",
    letterSpacing: "2px",
    fontSize: "12px",
    fontWeight: 600,
    color: "#01bf71",
})

const StyledTitle = styled("h1")(({ theme }) => ({
    fontSize: "44px",
    fontWeight: 800,
    margin: "14px 0 12px",
    [theme.breakpoints.down("md")]: {
        fontSize: "32px",
    },
}))

const StyledLead = styled("p")({
    maxWidth: "640px",
    margin: "0 auto",
    color: "#b8b8b8",
    fontSize: "18px",
    lineHeight: 1.55,
})

const StyledSection = styled("div")({
    maxWidth: "960px",
    margin: "0 auto",
    padding: "0 24px",
})

const StyledSectionLabel = styled("div")({
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    fontSize: "12px",
    color: "#777",
    marginBottom: "24px",
})

const StyledStepGrid = styled("div")(({ theme }) => ({
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "18px",
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
    },
}))

const StyledCard = styled("div")({
    background: "#141414",
    border: "1px solid #232323",
    borderRadius: "14px",
    padding: "26px",
})

const StyledStepNumber = styled("div")({
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    background: "#01bf71",
    color: "#000",
    fontWeight: 800,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
})

const StyledCardTitle = styled("h3")({
    fontSize: "17px",
    margin: "16px 0 8px",
})

const StyledCardText = styled("p")({
    color: "#9a9a9a",
    fontSize: "14px",
    lineHeight: 1.55,
    margin: 0,
})

const StyledDetailBand = styled("div")({
    background: "#111",
    borderTop: "1px solid #1c1c1c",
    borderBottom: "1px solid #1c1c1c",
    padding: "48px 24px",
    margin: "48px 0 0",
})

const StyledDetailGrid = styled("div")(({ theme }) => ({
    maxWidth: "960px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px",
    [theme.breakpoints.down("sm")]: {
        gridTemplateColumns: "1fr",
    },
}))

const StyledExplore = styled("div")({
    textAlign: "center",
    padding: "48px 24px 72px",
})

const StyledExploreLead = styled("div")({
    fontSize: "16px",
    color: "#b8b8b8",
    marginBottom: "22px",
})

const StyledButtonRow = styled("div")({
    display: "flex",
    flexWrap: "wrap",
    gap: "14px",
    justifyContent: "center",
})

const StyledPrimaryButton = styled(Button)({
    borderRadius: "50px",
    background: "#01bf71",
    color: "#000",
    fontWeight: 700,
    padding: "13px 30px",
    fontSize: "15px",
    textTransform: "none",
    "&:hover": {
        background: "#01a862",
    },
})

const StyledOutlineButton = styled(Button)({
    borderRadius: "50px",
    border: "1px solid #333",
    color: "#ddd",
    padding: "12px 26px",
    fontSize: "15px",
    textTransform: "none",
    "&:hover": {
        border: "1px solid #01bf71",
        background: "transparent",
    },
})

const About = () => {
    const navigate = useNavigate()

    // Reset scroll position and set the page title on mount.
    useEffect(() => {
        document.title = "About"
        window.scrollTo(0, 0)
    }, [])

    return (
        <StyledRoot id="about">
            <StyledHeader>
                <StyledEyebrow>How opt-in works</StyledEyebrow>
                <StyledTitle>How It Works</StyledTitle>
                <StyledLead>
                    This site aggregates Granblue Fantasy farming statistics that GA and GAA users choose to submit &mdash; item drops, farming modes, and run timings &mdash; all completely anonymous.
                </StyledLead>
            </StyledHeader>

            <StyledSection>
                <StyledSectionLabel>Opt in in three steps</StyledSectionLabel>
                <StyledStepGrid>
                    {steps.map((step, index) => (
                        <StyledCard key={step.title}>
                            <StyledStepNumber>{index + 1}</StyledStepNumber>
                            <StyledCardTitle>{step.title}</StyledCardTitle>
                            <StyledCardText>{step.description}</StyledCardText>
                        </StyledCard>
                    ))}
                </StyledStepGrid>
            </StyledSection>

            <StyledDetailBand>
                <StyledDetailGrid>
                    <StyledCard>
                        <StyledCardTitle>What&apos;s collected</StyledCardTitle>
                        <StyledCardText>Per run: item name, farming mode, mission, amount dropped, and elapsed time. Nothing more.</StyledCardText>
                    </StyledCard>
                    <StyledCard>
                        <StyledCardTitle>Your privacy</StyledCardTitle>
                        <StyledCardText>No identifiable information is ever stored, and submitting is completely optional &mdash; you can farm without opting in.</StyledCardText>
                    </StyledCard>
                </StyledDetailGrid>
            </StyledDetailBand>

            <StyledExplore>
                <StyledExploreLead>Explore the data or grab the apps:</StyledExploreLead>
                <StyledButtonRow>
                    <StyledPrimaryButton onClick={() => navigate("/dashboard")}>View Dashboard</StyledPrimaryButton>
                    <StyledOutlineButton onClick={() => window.open(GA_REPO, "_blank")} aria-label="Granblue Automation on GitHub">
                        Granblue Automation
                    </StyledOutlineButton>
                    <StyledOutlineButton onClick={() => window.open(GAA_REPO, "_blank")} aria-label="Granblue Automation Android on GitHub">
                        Granblue Automation Android
                    </StyledOutlineButton>
                </StyledButtonRow>
            </StyledExplore>
        </StyledRoot>
    )
}

export default About
