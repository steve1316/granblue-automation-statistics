import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button, IconButton } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";

const useStyles = makeStyles((theme) => ({
    emptyDivider: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
    },
    title: {
        cursor: "pointer",
        fontSize: "1.5rem",
        marginLeft: "24px",
        fontWeight: "bold",
        textDecoration: "none",
        color: "#fff",

        "&:hover": {
            color: "#01bf71",
        },

        transition: "0.3s all ease",
    },
    body: {
        transition: "0.5s all ease",
    },
}));

const NavBar = () => {
    const classes = useStyles();

    const [scrollNav, setScrollNav] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", toggleScroll);
    }, []);

    const toggleScroll = () => {
        if (window.pageYOffset > 300) {
            setScrollNav(true);
        } else {
            setScrollNav(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
    };

    return (
        <AppBar className={classes.body} id="header" style={scrollNav ? { background: "#101522", boxShadow: 5 } : { background: "transparent", boxShadow: "none" }}>
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu">
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" className={classes.title} onClick={scrollToTop}>
                    GA Statistics
                </Typography>
                <div className={classes.emptyDivider} />
                <Button color="inherit">Login</Button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
