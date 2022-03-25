import React from "react"
import { makeStyles } from "@material-ui/core/styles"
import svgInfoSectionBackground from "../../assets/images/svgInfoSectionBackground.svg"
import { Section } from "../../pages/Home/data"

const InfoSection = ({ id, lightBg, topLine, headLine, description, img, imgStart, imgWidth, imgHeight, alt, svgPattern }: Section) => {
    const useStyles = makeStyles((theme) => ({
        root: {
            background: "#000",
            [theme.breakpoints.down("md")]: {
                padding: "100px 0",
            },
        },
        rootSVG: {
            backgroundColor: "#fff",
            backgroundImage: `url(${svgInfoSectionBackground})`,
            backgroundAttachment: "fixed",
            backgroundSize: "100%",
            [theme.breakpoints.down("md")]: {
                padding: "100px 0",
            },
        },
        container: {
            display: "grid",
            zIndex: 1,
            height: "860px",
            width: "100%",
            maxWidth: "1100px",
            marginRight: "auto",
            marginLeft: "auto",
            padding: "0 24px",
            justifyContent: "center",
        },
        infoContainerStartLeft: {
            display: "grid",
            gridAutoColumns: "minmax(auto, 1fr)",
            alignItems: "center",
            gridTemplateAreas: `'col2 col1'`,
            [theme.breakpoints.down("md")]: {
                gridTemplateAreas: `'col1' 'col2'`,
            },
        },
        infoContainerStartRight: {
            display: "grid",
            gridAutoColumns: "minmax(auto, 1fr)",
            alignItems: "center",
            gridTemplateAreas: `'col1 col2'`,
            [theme.breakpoints.down("md")]: {
                gridTemplateAreas: `'col1 col1' 'col2 col2'`,
            },
        },
        col1: {
            padding: "0 15px",
            gridArea: "col1",
        },
        col2: {
            padding: "0 15px",
            gridArea: "col2",
        },
        textWrapper: {
            maxWidth: "540px",
            padding: "0 0 60px 0",
        },
        subtitle: {
            color: "#01bf71",
            fontSize: "16px",
            lineHeight: "16px",
            fontWeight: 700,
            letterSpacing: "1.4px",
            textTransform: "uppercase",
            marginBottom: "16px",
        },
        title: {
            marginBottom: "24px",
            fontSize: "48px",
            lineHeight: 1.1,
            fontWeight: 600,
            [theme.breakpoints.down("sm")]: {
                fontSize: "32px",
            },
        },
        body: {
            maxWidth: "440px",
            marginBottom: "35px",
            fontSize: "18px",
            lineHeight: "24px",
        },
        imageWrapper: {
            maxWidth: "555px",
            height: "100%",
        },
        image: {
            width: "100%",
            margin: "0 0 10px 0",
        },
    }))

    const classes = useStyles()

    if (svgPattern) {
        return (
            <section className={classes.rootSVG} id={id}>
                <div className={classes.container}>
                    <div className={imgStart ? classes.infoContainerStartLeft : classes.infoContainerStartRight}>
                        <div className={classes.col1}>
                            <div className={classes.textWrapper}>
                                <p className={classes.subtitle}>{topLine}</p>
                                <p className={classes.title} style={{ color: lightBg ? "#010606" : "#fff" }}>
                                    {headLine}
                                </p>
                                <p className={classes.body} style={{ color: lightBg ? "#010606" : "#fff" }}>
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className={classes.col2}>
                            <div className={classes.imageWrapper}>
                                <img className={classes.image} src={img} width={imgWidth} height={imgHeight} alt={alt} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    } else {
        return (
            <section className={classes.root} style={{ background: lightBg ? "#b3b6b7" : "#010606" }} id={id}>
                <div className={classes.container}>
                    <div className={imgStart ? classes.infoContainerStartLeft : classes.infoContainerStartRight}>
                        <div className={classes.col1}>
                            <div className={classes.textWrapper}>
                                <p className={classes.subtitle}>{topLine}</p>
                                <p className={classes.title} style={{ color: lightBg ? "#010606" : "#fff" }}>
                                    {headLine}
                                </p>
                                <p className={classes.body} style={{ color: lightBg ? "#010606" : "#fff" }}>
                                    {description}
                                </p>
                            </div>
                        </div>

                        <div className={classes.col2}>
                            <div className={classes.imageWrapper}>
                                <img className={classes.image} src={img} width={imgWidth} height={imgHeight} alt={alt} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        )
    }
}

export default InfoSection
