import React, { useContext, useEffect, useState } from "react"
import { Avatar, Container, Grid, Snackbar, TextField, Typography } from "@mui/material"
import MuiAlert, { AlertProps } from "@mui/material/Alert"
import { styled } from "@mui/system"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import axios, { AxiosError } from "axios"
import { UserContext } from "../../context/UserContext"
import PasswordChecklist from "react-password-checklist"
import PasswordField from "../../components/PasswordField"
import { StyledFormButton } from "../../components/StyledFormButton"

/** A single piece of feedback shown to the user after a sign-up attempt. */
interface Notice {
    /** Which colour the Snackbar takes. */
    severity: "success" | "error"
    /** The message to show. */
    text: string
}

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

const StyledSubtitle = styled(Typography)({
    textAlign: "center",
})

const StyledForm = styled("form")(({ theme }) => ({
    marginTop: theme.spacing(3),
}))

const CreateAccount = () => {
    const entryPoint: string = useContext(UserContext).entryPoint

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [email, setEmail] = useState("")
    const [inProgress, setInProgress] = useState(false)
    const [notice, setNotice] = useState<Notice | null>(null)

    // Derived, not stored. The button's enabled state is a pure function of the fields.
    const ready = username !== "" && email !== "" && password !== "" && password === confirmPassword

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
    })

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Create Account"
        window.scrollTo(0, 0)
    }, [])

    // Create the account through the API server. It does not sign the visitor in, so they stay on this page to see the result.
    const createAccount = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setInProgress(true)

        try {
            await axios.post(`${entryPoint}/api/register`, { username: username, password: password, email: email })
            setNotice({ severity: "success", text: "Success! You can now log in." })
        } catch (err) {
            const message = (err as AxiosError<{ message?: string }>).response?.data?.message
            if (message === "Username already exists." || message === "Email already registered.") {
                setNotice({ severity: "error", text: message === "Username already exists." ? "The username already exists." : "That email is already registered to an account." })
            } else {
                console.error("[GAS] Failed to create account: ", message ?? err)
                setNotice({ severity: "error", text: "Could not create the account. Please try again." })
            }
        } finally {
            setInProgress(false)
        }
    }

    // Close the Snackbar.
    const handleClose = () => {
        setNotice(null)
    }

    return (
        <section id="createaccount">
            <StyledPaperContainer>
                <StyledAvatar>
                    <AccountCircleIcon style={{ height: 48, width: 48 }} />
                </StyledAvatar>
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>
                <StyledSubtitle variant="caption">You can use the username and password for GA/GAA after you create your account.</StyledSubtitle>
                <StyledForm>
                    <Grid container spacing={2}>
                        <Grid size={12}>
                            <TextField label="Username" placeholder="Enter your username" required fullWidth onChange={(e) => setUsername(e.target.value)} />
                        </Grid>
                        <Grid size={12}>
                            <PasswordField
                                label="Password"
                                placeholder="Enter your password"
                                required
                                fullWidth
                                onChange={(e) => setPassword(e.target.value)}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                            <PasswordChecklist rules={["minLength", "number", "match"]} minLength={5} value={password} valueAgain={confirmPassword} style={{ marginTop: "12px" }} />
                        </Grid>
                        <Grid size={12}>
                            <PasswordField
                                label="Confirm Password"
                                placeholder="Enter your password again"
                                required
                                fullWidth
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                showPassword={showPassword}
                                setShowPassword={setShowPassword}
                            />
                        </Grid>
                        <Grid size={12}>
                            <TextField label="Email" placeholder="Enter your email address" type="email" required fullWidth onChange={(e) => setEmail(e.target.value)} helperText="Used to recover your account if you forget your password." />
                        </Grid>
                    </Grid>

                    <StyledFormButton loading={inProgress} type="submit" variant="contained" color="primary" disabled={!ready} onClick={(e) => createAccount(e)}>
                        Create Account
                    </StyledFormButton>
                </StyledForm>
            </StyledPaperContainer>

            {notice !== null ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity={notice.severity}>
                        {notice.text}
                    </Alert>
                </Snackbar>
            ) : null}
        </section>
    )
}

export default CreateAccount
