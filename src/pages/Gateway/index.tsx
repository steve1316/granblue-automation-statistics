import React, { useState } from "react"
import { Paper, Tabs, Tab, AppBar, Theme } from "@mui/material"
import { styled } from "@mui/system"
import svgGatewayBackground1 from "../../assets/images/svgGatewayBackground1.svg"
import svgGatewayBackground2 from "../../assets/images/svgGatewayBackground2.svg"
import CreateAccount from "../CreateAccount"
import Login from "../Login"
import { Link } from "react-router-dom"

const StyledRoot = styled("section")({
    // Background image from svgbackgrounds.com
    backgroundColor: "#000",
    backgroundAttachment: "fill",
    backgroundPosition: "center",
    overflow: "hidden",
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
})

const StyledPaper = styled(Paper)(({ theme }) => ({
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
}))

const StyledAppBar = styled(AppBar)({
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#01bf71",
})

const StyledTab = styled(Tab)({
    color: "#000",
})

const StyledBottomBar = styled(AppBar)({
    position: "absolute",
    bottom: 0,
    backgroundColor: "#01bf71",
    width: "100%",
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
})

const StyledBottomDiv = styled("p")(({ theme }) => ({
    display: "flex",
    marginRight: "32px",
    justifyContent: "flex-end",
    [theme.breakpoints.down("md")]: {
        marginRight: 0,
        justifyContent: "center",
    },
}))

const Gateway = () => {
    const [tabValue, setTabValue] = useState(1)

    return (
        <StyledRoot id="gateway" sx={{ backgroundImage: `url(${tabValue === 1 ? svgGatewayBackground1 : svgGatewayBackground2})` }}>
            <StyledPaper>
                <StyledAppBar position="static" color="default">
                    <Tabs
                        value={tabValue}
                        onChange={(e, value) => {
                            setTabValue(value)
                        }}
                        indicatorColor="secondary"
                        textColor="inherit"
                        variant="fullWidth"
                    >
                        <StyledTab label="Login" value={1} />
                        <StyledTab label="Create Account" value={2} />
                    </Tabs>
                </StyledAppBar>

                <div style={{ height: "80%", overflowY: "auto" }}>{tabValue === 1 ? <Login /> : <CreateAccount />}</div>

                <StyledBottomBar position="static" color="default">
                    <StyledBottomDiv>
                        Forgot password?&nbsp;<Link to="/forgot-password">Click here</Link>
                    </StyledBottomDiv>
                </StyledBottomBar>
            </StyledPaper>
        </StyledRoot>
    )
}

export default Gateway
