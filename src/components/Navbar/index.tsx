import React, { useState, useEffect, useContext } from "react"
import { styled } from "@mui/system"
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemIcon, Box, Theme } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { Link as RouterLink, useNavigate } from "react-router-dom"
import { AssignmentInd, Home, Logout, InsertChart } from "@mui/icons-material"
import { UserContext } from "../../context/UserContext"
import axios, { AxiosResponse } from "axios"
import { UserInterface } from "../../interfaces/UserInterface"

const StyledAppBar = styled(AppBar)({
    background: "transparent",
    boxShadow: "none",
    transition: "0.5s all ease",
    "&.scrollNav": {
        background: "#101522",
        boxShadow: "5px",
    },
})

const StyledEmptyDivider = styled("div")({
    flexGrow: 1,
})

const StyledIconButton = styled(IconButton)(({ theme }) => ({
    marginRight: theme.spacing(2),
    transition: "0.3s all ease",
    "&:hover": {
        color: "#01bf71",
    },
}))

const StyledTypography = styled(Typography)({
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
})

const StyledLoginButton = styled(Button)({
    color: "#fff",
    fontSize: "16px",
    transition: "0.3s all ease",
    "&:hover": {
        color: "#01bf71",
    },
})

const StyledRouterLink = styled(RouterLink)({
    color: "#000",
    textDecoration: "none",
    "&:hover": {
        color: "#01bf71",
    },
})

const StyledBox = styled(Box)({
    height: "100%",
    width: "250px",
})

const NavBar = () => {
    const navigate = useNavigate()
    const uc = useContext(UserContext)
    const user: UserInterface = uc.user
    const entryPoint: string = uc.entryPoint

    const [scrollNav, setScrollNav] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Add listener for when the user scrolls the page.
    useEffect(() => {
        window.addEventListener("scroll", toggleScroll)
    }, [])

    // Open or close the Drawer.
    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    // Log out the user.
    const logout = () => {
        axios
            .get(`${entryPoint}/api/logout`, { withCredentials: true })
            .then((res: AxiosResponse) => {
                if (res.status === 200) {
                    // This will forcibly reload the page so that conditional rendering can occur for the Navbar.
                    window.location.href = "/"
                } else {
                    console.error("[GAS] Failed to log user out: ", res.data)
                }
            })
            .finally(() => {
                localStorage.removeItem("user")
            })
    }

    // If user's y-position is greater than the specified offset, allow the page to send the user back to the top of the page.
    const toggleScroll = () => {
        if ((window.screenY < 1000 && window.pageYOffset > 25) || (window.screenY >= 1000 && window.pageYOffset > 200)) {
            setScrollNav(true)
        } else {
            setScrollNav(false)
        }
    }

    // Send the user back to the top of the page.
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <StyledAppBar id="header" style={{ background: scrollNav ? "#101522" : "transparent", boxShadow: scrollNav ? "5px" : "none" }}>
            <Toolbar>
                <StyledIconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer} size="large">
                    <MenuIcon />
                </StyledIconButton>

                <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
                    <StyledBox>
                        <List>
                            <StyledRouterLink to="/">
                                <ListItem button key="home">
                                    <ListItemIcon>
                                        <Home />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItem>
                            </StyledRouterLink>

                            {user ? (
                                <>
                                    <StyledRouterLink to="/dashboard">
                                        <ListItem button key="dashboard">
                                            <ListItemIcon>
                                                <InsertChart />
                                            </ListItemIcon>
                                            <ListItemText primary="Dashboard" />
                                        </ListItem>
                                    </StyledRouterLink>
                                    <Divider />
                                    <StyledRouterLink to="/logout" onClick={() => logout()}>
                                        <ListItem button key="logout">
                                            <ListItemIcon>
                                                <Logout />
                                            </ListItemIcon>
                                            <ListItemText primary="Logout" />
                                        </ListItem>
                                    </StyledRouterLink>
                                </>
                            ) : (
                                <StyledRouterLink to="/gateway">
                                    <ListItem button key="getstarted">
                                        <ListItemIcon>
                                            <AssignmentInd />
                                        </ListItemIcon>
                                        <ListItemText primary="Get Started" />
                                    </ListItem>
                                </StyledRouterLink>
                            )}
                        </List>
                    </StyledBox>
                </Drawer>

                <StyledTypography
                    variant="h6"
                    onClick={() => {
                        navigate("/")
                        scrollToTop()
                    }}
                >
                    GA Statistics
                </StyledTypography>

                <StyledEmptyDivider />

                {user ? (
                    <StyledLoginButton color="inherit" onClick={() => logout()}>
                        Log Out
                    </StyledLoginButton>
                ) : (
                    <StyledLoginButton
                        color="inherit"
                        onClick={() => {
                            navigate("/gateway")
                        }}
                    >
                        Log In
                    </StyledLoginButton>
                )}
            </Toolbar>
        </StyledAppBar>
    )
}

export default NavBar
