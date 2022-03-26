import React, { useContext, useEffect } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Button, Theme } from "@mui/material"
import { UserContext } from "../../context/UserContext"

const Dashboard = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            background: "#000",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minHeight: "100vh",
        },
        container: {
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: "40px",
            margin: "16px auto",
        },
        subtitle: {
            fontSize: "16px",
            margin: "16px auto",
        },
        button: {
            borderRadius: "50px",
            background: "#01bf71",
            color: "#000",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "normal",
            margin: "16px auto",
            [theme.breakpoints.down("md")]: {
                fontSize: "12px",
            },
            "&:hover": {
                "& $link": {
                    color: "white",
                },
            },
        },
        link: {
            textDecoration: "none",
        },
    }))

    const classes = useStyles()

    const user = useContext(UserContext)

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Dashboard"
        window.scrollTo(0, 0)
    }, [])

    return (
        <section className={classes.root}>
            <div className={classes.container}>
                <h2 className={classes.title}>Dashboard</h2>
                <p className={classes.subtitle}>User is logged in</p>
            </div>
        </section>
    )
}

export default Dashboard
