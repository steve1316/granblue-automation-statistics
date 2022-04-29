import React, { useEffect, useState, useContext } from "react"
import { Avatar, Container, Grid, TextField, Typography, Theme, Alert, Snackbar, Paper, Stack } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import axios from "axios"
import svgGatewayBackground2 from "../../assets/images/svgGatewayBackground2.svg"
import { useParams } from "react-router-dom"
import LoadingButton from "@mui/lab/LoadingButton"
import { UserContext } from "../../context/UserContext"

const ResetPassword = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            // Background image from bgjar.com
            backgroundColor: "#000",
            backgroundAttachment: "fill",
            backgroundPosition: "center",
            backgroundImage: `url(${svgGatewayBackground2})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: "cover",
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
        },
        paperContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            width: "100%",
        },
        avatar: {
            margin: theme.spacing(1),
            height: 64,
            width: 64,
            backgroundColor: "#1565C0",
        },
        form: {
            marginTop: theme.spacing(3),
        },
    }))

    const classes = useStyles()

    const entryPoint: string = useContext(UserContext).entryPoint

    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [open, setOpen] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [failed, setFailed] = useState(false)
    const [expired, setExpired] = useState(false)

    // Grab the jwt token from the url params.
    const { username, token }: { username: string; token: string } = useParams()

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Password Reset"
        window.scrollTo(0, 0)

        // Verify the jwt token from the url params.
        verifyToken()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

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

    // Verify the jwt token.
    const verifyToken = () => {
        axios
            .get(`${entryPoint}/api/verify-token/${username}/${token}`)
            .then(() => {})
            .catch(() => {
                setExpired(true)
            })
    }

    // Send the request to the API.
    const sendPasswordResetRequest = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setInProgress(true)
        axios
            .post(`${entryPoint}/api/reset-password`, {
                username: username,
                newPassword: newPassword,
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
        <section id="password-reset" className={classes.root}>
            <Paper className={classes.paper}>
                <Container className={classes.paperContainer} sx={{ height: "100%" }}>
                    <Avatar className={classes.avatar}>
                        <LockOpenIcon style={{ height: 48, width: 48 }} />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Password Reset
                    </Typography>

                    {requestSent || expired ? (
                        <Stack sx={{ height: "100%" }} justifyContent={"center"}>
                            <Typography component="p" variant="body1">
                                {expired ? "Password reset link expired." : "Password successfully reset."}
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={3} sx={{ height: "100%" }} justifyContent={"center"}>
                            <form className={classes.form}>
                                <Grid container spacing={3} flexDirection={"column"}>
                                    <Grid item xs={12}>
                                        <TextField label="New Password" placeholder="Enter your new password" required fullWidth onChange={(e) => setNewPassword(e.target.value)} />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            label="Confirm Password"
                                            placeholder="Confirm password"
                                            required
                                            fullWidth
                                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                                            error={newPassword !== confirmNewPassword}
                                            helperText={newPassword !== confirmNewPassword ? "Passwords do not match." : ""}
                                        />
                                    </Grid>
                                    <Grid item xs={12}>
                                        <LoadingButton
                                            loading={inProgress}
                                            type="submit"
                                            variant="contained"
                                            color="primary"
                                            disabled={newPassword === "" && confirmNewPassword === "" && newPassword !== confirmNewPassword}
                                            onClick={(e) => sendPasswordResetRequest(e)}
                                            sx={{ width: "100%" }}
                                        >
                                            Reset Password
                                        </LoadingButton>
                                    </Grid>
                                </Grid>
                            </form>
                        </Stack>
                    )}
                </Container>
            </Paper>

            {requestSent ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="success">
                        Password successfully reset.
                    </Alert>
                </Snackbar>
            ) : null}

            {failed ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="error">
                        Password was not able to be updated.
                    </Alert>
                </Snackbar>
            ) : null}
        </section>
    )
}

export default ResetPassword
