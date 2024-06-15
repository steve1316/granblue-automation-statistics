import React, { useEffect, useState, useContext } from "react"
import { Avatar, Button, Container, Grid, Typography, Alert, Snackbar, Paper, Stack } from "@mui/material"
import { styled } from "@mui/system"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import axios from "axios"
import { useSearchParams } from "react-router-dom"
import svgGatewayBackground2 from "../../assets/images/svgGatewayBackground2.svg"
import { UserContext } from "../../context/UserContext"
import PasswordField from "../../components/PasswordField"

const Root = styled("section")({
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

const PaperContainer = styled(Container)({
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

const Form = styled("form")(({ theme }) => ({
    marginTop: theme.spacing(3),
}))

const ResetPassword = () => {
    const { entryPoint } = useContext(UserContext)
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token") ?? ""

    const [newPassword, setNewPassword] = useState("")
    const [confirmNewPassword, setConfirmNewPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [open, setOpen] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [requestSent, setRequestSent] = useState(false)
    const [failed, setFailed] = useState(false)
    // Null while the link is still being checked.
    const [linkValid, setLinkValid] = useState<boolean | null>(null)

    const expired = linkValid === false && !requestSent

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Password Reset"
        window.scrollTo(0, 0)
    }, [])

    // Check the link up front, so an expired one says so before the user types a new password.
    useEffect(() => {
        if (token === "") {
            setLinkValid(false)
            return
        }

        axios
            .get<{ valid: boolean }>(`${entryPoint}/api/reset-password/${encodeURIComponent(token)}`)
            .then((res) => setLinkValid(res.data.valid))
            .catch(() => setLinkValid(false))
    }, [entryPoint, token])

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

    // Set the new password using the one-time token from the emailed link.
    const sendPasswordResetRequest = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setInProgress(true)

        try {
            await axios.post(`${entryPoint}/api/reset-password`, { token: token, password: newPassword })
            setFailed(false)
            setRequestSent(true)
        } catch (err) {
            console.error("[GAS] Failed to reset the password: ", err)
            setFailed(true)
        } finally {
            setInProgress(false)
        }
    }

    return (
        <Root id="password-reset">
            <StyledPaper>
                <PaperContainer sx={{ height: "100%" }}>
                    <StyledAvatar>
                        <LockOpenIcon style={{ height: 48, width: 48 }} />
                    </StyledAvatar>
                    <Typography component="h1" variant="h5">
                        Password Reset
                    </Typography>

                    {requestSent || expired ? (
                        <Stack sx={{ height: "100%", justifyContent: "center" }}>
                            <Typography component="p" variant="body1">
                                {expired ? "Password reset link is invalid or has expired." : "Password successfully reset."}
                            </Typography>
                        </Stack>
                    ) : (
                        <Stack spacing={3} sx={{ height: "100%", justifyContent: "center" }}>
                            <Form>
                                <Grid container spacing={3}>
                                    <Grid size={12}>
                                        <PasswordField label="New Password" placeholder="Enter your new password" required fullWidth onChange={(e) => setNewPassword(e.target.value)} showPassword={showPassword} setShowPassword={setShowPassword} />
                                    </Grid>
                                    <Grid size={12}>
                                        <PasswordField label="Confirm Password" placeholder="Confirm password" required fullWidth onChange={(e) => setConfirmNewPassword(e.target.value)} error={newPassword !== confirmNewPassword} helperText={newPassword !== confirmNewPassword ? "Passwords do not match." : ""} showPassword={showPassword} setShowPassword={setShowPassword} />
                                    </Grid>
                                    <Grid size={12}>
                                        <Button loading={inProgress} type="submit" variant="contained" color="primary" disabled={newPassword === "" || confirmNewPassword === "" || newPassword !== confirmNewPassword} onClick={(e) => sendPasswordResetRequest(e)} sx={{ width: "100%" }}>
                                            Reset Password
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Form>
                        </Stack>
                    )}
                </PaperContainer>
            </StyledPaper>

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
        </Root>
    )
}

export default ResetPassword
