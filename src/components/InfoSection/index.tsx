import React from "react"
import { styled } from "@mui/system"
import svgInfoSectionBackground from "../../assets/images/svgInfoSectionBackground.svg"
import { Section } from "../../pages/Home/data"
import { Theme } from "@mui/material"

const StyledRoot = styled("section")(({ theme }) => ({
    background: "#000",
    [theme.breakpoints.down("lg")]: {
        padding: "100px 0",
    },
}))

const StyledRootSVG = styled("section")({
    backgroundColor: "#fff",
    backgroundImage: `url(${svgInfoSectionBackground})`,
    backgroundAttachment: "fixed",
    backgroundSize: "100%",
})

const StyledContainer = styled("div")({
    display: "grid",
    zIndex: 1,
    height: "860px",
    width: "100%",
    maxWidth: "1100px",
    marginRight: "auto",
    marginLeft: "auto",
    justifyContent: "center",
})

const StyledInfoContainerStartLeft = styled("div")(({ theme }) => ({
    display: "grid",
    gridAutoColumns: "minmax(auto, 1fr)",
    alignItems: "center",
    gridTemplateAreas: `'col2 col1'`,
    [theme.breakpoints.down("lg")]: {
        gridTemplateAreas: `'col1' 'col2'`,
    },
}))

const StyledInfoContainerStartRight = styled("div")(({ theme }) => ({
    display: "grid",
    gridAutoColumns: "minmax(auto, 1fr)",
    alignItems: "center",
    gridTemplateAreas: `'col1 col2'`,
    [theme.breakpoints.down("lg")]: {
        gridTemplateAreas: `'col1 col1' 'col2 col2'`,
    },
}))

const StyledCol1 = styled("div")({
    padding: "0 15px",
    gridArea: "col1",
})

const StyledCol2 = styled("div")({
    padding: "0 15px",
    gridArea: "col2",
})

const StyledTextWrapper = styled("div")({
    maxWidth: "540px",
    padding: "0 0 60px 0",
})

const StyledSubtitle = styled("p")({
    color: "#01bf71",
    fontSize: "16px",
    lineHeight: "16px",
    fontWeight: 700,
    letterSpacing: "1.4px",
    textTransform: "uppercase",
    marginBottom: "16px",
})

const StyledTitle = styled("p")(({ theme }) => ({
    marginBottom: "24px",
    fontSize: "48px",
    lineHeight: 1.1,
    fontWeight: 600,
    [theme.breakpoints.down("md")]: {
        fontSize: "32px",
    },
}))

const StyledBody = styled("p")({
    maxWidth: "440px",
    marginBottom: "35px",
    fontSize: "18px",
    lineHeight: "24px",
})

const StyledImageWrapper = styled("div")({
    maxWidth: "555px",
    height: "100%",
})

const StyledImage = styled("img")({
    width: "100%",
    margin: "0 0 10px 0",
})

// Data and interface is from the data file in the Home page's folder.
const InfoSection = ({ id, lightBg, topLine, headLine, description, img, imgStart, imgWidth, imgHeight, alt, svgPattern }: Section) => {
    // Alternate rendering the component with a provided SVG background or none at all.
    if (svgPattern) {
        return (
            <StyledRootSVG id={id}>
                <StyledContainer>
                    {imgStart ? (
                        <StyledInfoContainerStartLeft>
                            <StyledCol1>
                                <StyledTextWrapper>
                                    <StyledSubtitle>{topLine}</StyledSubtitle>
                                    <StyledTitle style={{ color: lightBg ? "#010606" : "#fff" }}>{headLine}</StyledTitle>
                                    <StyledBody style={{ color: lightBg ? "#010606" : "#fff" }}>{description}</StyledBody>
                                </StyledTextWrapper>
                            </StyledCol1>

                            <StyledCol2>
                                <StyledImageWrapper>
                                    <StyledImage src={img} width={imgWidth} height={imgHeight} alt={alt} />
                                </StyledImageWrapper>
                            </StyledCol2>
                        </StyledInfoContainerStartLeft>
                    ) : (
                        <StyledInfoContainerStartRight>
                            <StyledCol1>
                                <StyledTextWrapper>
                                    <StyledSubtitle>{topLine}</StyledSubtitle>
                                    <StyledTitle style={{ color: lightBg ? "#010606" : "#fff" }}>{headLine}</StyledTitle>
                                    <StyledBody style={{ color: lightBg ? "#010606" : "#fff" }}>{description}</StyledBody>
                                </StyledTextWrapper>
                            </StyledCol1>

                            <StyledCol2>
                                <StyledImageWrapper>
                                    <StyledImage src={img} width={imgWidth} height={imgHeight} alt={alt} />
                                </StyledImageWrapper>
                            </StyledCol2>
                        </StyledInfoContainerStartRight>
                    )}
                </StyledContainer>
            </StyledRootSVG>
        )
    } else {
        return (
            <StyledRoot style={{ background: lightBg ? "#b3b6b7" : "#010606" }} id={id}>
                <StyledContainer>
                    {imgStart ? (
                        <StyledInfoContainerStartLeft>
                            <StyledCol1>
                                <StyledTextWrapper>
                                    <StyledSubtitle>{topLine}</StyledSubtitle>
                                    <StyledTitle style={{ color: lightBg ? "#010606" : "#fff" }}>{headLine}</StyledTitle>
                                    <StyledBody style={{ color: lightBg ? "#010606" : "#fff" }}>{description}</StyledBody>
                                </StyledTextWrapper>
                            </StyledCol1>

                            <StyledCol2>
                                <StyledImageWrapper>
                                    <StyledImage src={img} width={imgWidth} height={imgHeight} alt={alt} />
                                </StyledImageWrapper>
                            </StyledCol2>
                        </StyledInfoContainerStartLeft>
                    ) : (
                        <StyledInfoContainerStartRight>
                            <StyledCol1>
                                <StyledTextWrapper>
                                    <StyledSubtitle>{topLine}</StyledSubtitle>
                                    <StyledTitle style={{ color: lightBg ? "#010606" : "#fff" }}>{headLine}</StyledTitle>
                                    <StyledBody style={{ color: lightBg ? "#010606" : "#fff" }}>{description}</StyledBody>
                                </StyledTextWrapper>{" "}
                            </StyledCol1>

                            <StyledCol2>
                                <StyledImageWrapper>
                                    <StyledImage src={img} width={imgWidth} height={imgHeight} alt={alt} />
                                </StyledImageWrapper>
                            </StyledCol2>
                        </StyledInfoContainerStartRight>
                    )}
                </StyledContainer>
            </StyledRoot>
        )
    }
}

export default InfoSection
