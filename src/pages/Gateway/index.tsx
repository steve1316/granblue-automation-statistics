import React, { useState } from "react"
import { Paper, Tabs, Tab, AppBar, Theme } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import svgGatewayBackground1 from "../../assets/images/svgGatewayBackground1.svg"
import svgGatewayBackground2 from "../../assets/images/svgGatewayBackground2.svg"
import CreateAccount from "../CreateAccount"
import Login from "../Login"
import { Link } from "react-router-dom"

const Gateway = () => {
    const [tabValue, setTabValue] = useState(1)

    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            // Background image from svgbackgrounds.com
            backgroundColor: "#000",
            backgroundAttachment: "fill",
            backgroundPosition: "center",
            backgroundImage: tabValue === 1 ? `url(${svgGatewayBackground1})` : `url(${svgGatewayBackground2})`,
            overflow: "hidden",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        paper: {
            position: "relative",
            background: "#fff",
            borderRadius: 50,
            height: 600,
            width: 600,
            margin: 16,
            [theme.breakpoints.down("md")]: {
                height: 650,
                width: "80%",
            },
            [theme.breakpoints.down("sm")]: {
                marginTop: "30%",
            },
        },
        tabBar: {
            borderTopLeftRadius: 25,
            borderTopRightRadius: 25,
            backgroundColor: "#01bf71",
        },
        tab: {
            color: "#000",
        },
        bottomBar: {
            position: "absolute",
            bottom: 0,
            backgroundColor: "#01bf71",
            width: "100%",
            borderBottomLeftRadius: 25,
            borderBottomRightRadius: 25,
        },
        bottomDiv: {
            display: "flex",
            marginRight: "32px",
            justifyContent: "flex-end",

            [theme.breakpoints.down("md")]: {
                marginRight: 0,
                justifyContent: "center",
            },
        },
    }))

    const classes = useStyles()

    return (
        <section id="gateway" className={classes.root}>
            <Paper className={classes.paper}>
                <AppBar position="static" color="default" className={classes.tabBar}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, value) => {
                            setTabValue(value)
                        }}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                    >
                        <Tab label="Login" value={1} className={classes.tab} />
                        <Tab label="Create Account" value={2} className={classes.tab} />
                    </Tabs>
                </AppBar>

                <div style={{ height: "80%", overflowY: "auto" }}>{tabValue === 1 ? <Login /> : <CreateAccount />}</div>

                <AppBar position="static" color="default" className={classes.bottomBar}>
                    <p className={classes.bottomDiv}>
                        Forgot password?&nbsp;<Link to="/forgot-password">Click here</Link>
                    </p>
                </AppBar>
            </Paper>
        </section>
    )
}

export default Gateway
