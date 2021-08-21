import React, { useState } from "react";
import { makeStyles, Paper, Tabs, Tab, AppBar } from "@material-ui/core";
import svgGatewayBackground1 from "../../assets/images/svgGatewayBackground1.svg";
import svgGatewayBackground2 from "../../assets/images/svgGatewayBackground2.svg";
import CreateAccount from "../CreateAccount";
import Login from "../Login";

const useStyles = makeStyles((theme) => ({
    root: {
        // Background image from svgbackgrounds.com
        backgroundColor: "#000",
        backgroundAttachment: "fill",
        backgroundSize: "cover",
        backgroundPosition: "center",
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
        height: 650,
        maxWidth: 500,
        margin: 16,
    },
    tabBar: {
        borderTopLeftRadius: 50,
        borderTopRightRadius: 50,
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
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
    },
    bottomDiv: {
        display: "flex",
        marginRight: "32px",
        justifyContent: "flex-end",

        [theme.breakpoints.down("sm")]: {
            marginRight: 0,
            justifyContent: "center",
        },
    },
}));

const Gateway = () => {
    const classes = useStyles();

    const [tabValue, setTabValue] = useState(1);

    return (
        <section id="gateway" className={classes.root} style={{ backgroundImage: tabValue === 1 ? `url(${svgGatewayBackground1})` : `url(${svgGatewayBackground2})` }}>
            <Paper className={classes.paper}>
                <AppBar position="static" color="default" className={classes.tabBar}>
                    <Tabs
                        value={tabValue}
                        onChange={(e, value) => {
                            setTabValue(value);
                        }}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                    >
                        <Tab label="Login" value={1} className={classes.tab} />
                        <Tab label="Create Account" value={2} className={classes.tab} />
                    </Tabs>
                </AppBar>

                {tabValue === 1 ? <Login /> : <CreateAccount />}

                <AppBar position="static" color="default" className={classes.bottomBar}>
                    {/* TODO: Create Forgot Password functionality here. */}
                    <p className={classes.bottomDiv}>Forgot password? Click here</p>
                </AppBar>
            </Paper>
        </section>
    );
};

export default Gateway;