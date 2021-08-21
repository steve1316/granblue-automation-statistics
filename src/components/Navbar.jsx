import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Divider } from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import { Link as RouterLink, useHistory } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    emptyDivider: {
        flexGrow: 1,
    },
    menuButton: {
        marginRight: theme.spacing(2),
        transition: "0.3s all ease",
        "&:hover": {
            color: "#01bf71",
        },
    },
    title: {
        cursor: "pointer",
        fontSize: "1.5rem",
        marginLeft: "24px",
        fontWeight: "bold",
        textDecoration: "none",
        color: "#fff",
        transition: "0.3s all ease",
        "&:hover": {
            color: "#01bf71",
        },
    },
    body: {
        transition: "0.5s all ease",
    },
    loginButton: {
        color: "#fff",
        fontSize: "16px",
        transition: "0.3s all ease",
        "&:hover": {
            color: "#01bf71",
        },
    },
    drawer: {
        backgroundColor: "#01bf71",
    },
    link: {
        color: "#000",
        textDecoration: "none",
    },
}));

const NavBar = () => {
    const classes = useStyles();
    const history = useHistory();

    const [scrollNav, setScrollNav] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        window.addEventListener("scroll", toggleScroll);
    }, []);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleScroll = () => {
        if (window.pageYOffset > 100) {
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
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer}>
                    <MenuIcon />
                </IconButton>
                <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
                    <List>
                        <RouterLink to="/" className={classes.link}>
                            <ListItem button key="home">
                                <ListItemText primary="Home" />
                            </ListItem>
                        </RouterLink>
                        <Divider />
                        <RouterLink to="/gateway" className={classes.link}>
                            <ListItem button key="getstarted">
                                <ListItemText primary="Get Started" />
                            </ListItem>
                        </RouterLink>
                        <Divider />
                        <RouterLink to="/dashboard" className={classes.link}>
                            <ListItem button key="dashboard">
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                        </RouterLink>
                        <Divider />
                    </List>
                </Drawer>
                <Typography
                    variant="h6"
                    className={classes.title}
                    onClick={() => {
                        history.push("/");
                        scrollToTop();
                    }}
                >
                    GA Statistics
                </Typography>
                <div className={classes.emptyDivider} />
                <Button
                    color="inherit"
                    className={classes.loginButton}
                    onClick={() => {
                        history.push("/gateway");
                    }}
                >
                    Log In
                </Button>
            </Toolbar>
        </AppBar>
    );
};

export default NavBar;
