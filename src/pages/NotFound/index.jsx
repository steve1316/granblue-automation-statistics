import React, { useEffect } from "react"
import { makeStyles } from "@material-ui/core/styles"
import { Link } from "react-router-dom"
import { Button } from "@material-ui/core"

const NotFound = () => {
    const useStyles = makeStyles((theme) => ({
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
            [theme.breakpoints.down("sm")]: {
                fontSize: "12px",
            },
        },
        link: {
            textDecoration: "none",
            "&:hover": {
                color: "#fff",
            },
        },
    }))

    const classes = useStyles()

    useEffect(() => {
        document.title = "404 - Not Found"
        window.scrollTo(0, 0)
    }, [])

    return (
        <section className={classes.root}>
            <div className={classes.container}>
                <h2 className={classes.title}>Sorry</h2>
                <p className={classes.subtitle}>404 - Page cannot be found</p>
                <Button color="primary" variant="contained" className={classes.button}>
                    <Link to="/" className={classes.link}>
                        Head back to the Home page...
                    </Link>
                </Button>
            </div>
        </section>
    )
}

export default NotFound
