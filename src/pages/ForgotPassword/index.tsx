import React, { useEffect, useState, useContext } from "react"
import { Avatar, Container, Grid, TextField, Typography, Theme, Alert, Snackbar, Paper, Stack } from "@mui/material"
import { styled } from "@mui/system"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import axios from "axios"
import svgGatewayBackground1 from "../../assets/images/svgGatewayBackground1.svg"
import LoadingButton from "@mui/lab/LoadingButton"
import { UserContext } from "../../context/UserContext"

const StyledRoot = styled("section")({
    // Background image from bgjar.com
    backgroundColor: "#000",
    backgroundAttachment: "fill",
    backgroundPosition: "center",
    backgroundImage: `url(${svgGatewayBackground1})`,
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
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
}))

const StyledPaperContainer = styled(Container)({
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "32px",
    width: "100%",
})

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    margin: theme.spacing(1),
    height: 64,
    width: 64,
    backgroundColor: "#1565C0",
}))

const StyledForm = styled("form")(({ theme }) => ({
    marginTop: theme.spacing(3),
}))

const ForgotPassword = () => {
    const entryPoint: string = useContext(UserContext).entryPoint

    const [recoveryEntryPoint, setRecoveryEntryPoint] = useState("")
    const [ready, setReady] = useState(false)
    const [open, setOpen] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [failed, setFailed] = useState(false)

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Forgot Password"
        window.scrollTo(0, 0)
    }, [])

    // Enable the Login button if the fields have been filled in.
    useEffect(() => {
        setReady(recoveryEntryPoint !== "")
    }, [recoveryEntryPoint])

    // Show the Snackbar for success or failure.
    useEffect(() => {
        if (requestSent || failed) {
            setOpen(true)
        }
    }, [requestSent, failed])

    // Close the Snackbar.
    const handleClose = () => {
        setOpen(false)
        setFailed(false)
    }

    const sendPasswordRecoveryRequest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()

        setInProgress(true)

        axios
            .post(`${entryPoint}/api/forgot-password`, {
                recoveryEntryPoint: recoveryEntryPoint,
            })
            .then(() => {
                setFailed(false)
                setRequestSent(true)
            })
            .catch(() => {
                setFailed(true)
            })
            .finally(() => {
                setInProgress(false)
            })
    }

    return (
        <StyledRoot id="forgot-password">
            <StyledPaper>
                <StyledPaperContainer sx={{ height: "100%" }}>
                    <StyledAvatar>
                        <LockOpenIcon style={{ height: 48, width: 48 }} />
                    </StyledAvatar>
                    <Typography component="h1" variant="h5">
                        Forgot Password
                    </Typography>

                    {requestSent ? (
                        <Stack sx={{ height: "100%" }} justifyContent={"center"}>
                            <Typography component="p" variant="body1" sx={{ textAlign: "center" }}>
                                An email with a password reset link has been sent. Please check your spam folder if it did not arrive in your inbox.
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack sx={{ height: "100%" }} justifyContent={"center"}>
                            <StyledForm>
                                <Grid container spacing={3} flexDirection={"column"}>
                                    <Grid item xs={12}>
                                        <TextField label="Username/Email" placeholder="Enter your username/email" required fullWidth onChange={(e) => setRecoveryEntryPoint(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12}></Grid>
                                </Grid>
                            </StyledForm>

                            <LoadingButton loading={inProgress} type="submit" variant="contained" color="primary" disabled={!ready} onClick={(e) => sendPasswordRecoveryRequest(e)} sx={{ width: "100%" }}>
                                Request a password reset
                            </LoadingButton>
                        </Stack>
                    )}
                </StyledPaperContainer>
            </StyledPaper>

            {requestSent ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="success">
                        Email successfully sent.
                    </Alert>
                </Snackbar>
            ) : null}

            {failed ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="error">
                        Username/Email does not exist.
                    </Alert>
                </Snackbar>
            ) : null}
        </StyledRoot>
    )
}

export default ForgotPassword
