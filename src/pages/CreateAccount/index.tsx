import React, { useEffect, useState } from "react"
import { Avatar, Button, Container, Grid, Snackbar, TextField, Theme, Typography } from "@mui/material"
import MuiAlert, { AlertProps } from "@mui/material/Alert"
import makeStyles from "@mui/styles/makeStyles"
import AccountCircleIcon from "@mui/icons-material/AccountCircle"
import axios, { AxiosError, AxiosResponse } from "axios"

const CreateAccount = () => {
    const useStyles = makeStyles((theme: Theme) => ({
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
        subtitle: {
            textAlign: "center",
        },
        form: {
            marginTop: theme.spacing(3),
        },
        formButton: {
            backgroundColor: "#01bf71",
            margin: "32px 32px 0 0",
            color: "#000",
        },
    }))

    const classes = useStyles()

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [optionalEmail, setOptionalEmail] = useState("")
    const [ready, setReady] = useState(false)
    const [creationSuccess, setCreationSuccess] = useState(false)
    const [usernameExists, setUsernameExists] = useState(false)
    const [open, setOpen] = useState(false)

    const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(props, ref) {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />
    })

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Create Account"
        window.scrollTo(0, 0)
    }, [])

    // Enable the Create Account button if the required fields have been filled in.
    useEffect(() => {
        setReady(username !== "" && password !== "" && password === confirmPassword)
    }, [username, password, confirmPassword])

    // Show the Snackbar for success or failure.
    useEffect(() => {
        if (creationSuccess) {
            setOpen(true)
        } else if (usernameExists) {
            setOpen(true)
        }
    }, [creationSuccess, usernameExists])

    // Create the account via POST request and receive the result whether success or failure.
    const createAccount = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        axios
            .post("https://granblue-automation-statistics.com/api/register", { username: username, password: password, email: optionalEmail })
            .then((res: AxiosResponse) => {
                console.log("[GAS] Received success response.")
                if (res.status === 201) {
                    setCreationSuccess(true)
                    setUsernameExists(false)
                }
            })
            .catch((err: AxiosError) => {
                console.warn("[GAS] Failed to create account: ", err.response?.data)
                if (err.response?.status === 409) {
                    setCreationSuccess(false)
                    setUsernameExists(true)
                }
            })
    }

    // Close the Snackbar.
    const handleClose = () => {
        setOpen(false)
        setCreationSuccess(false)
        setUsernameExists(false)
    }

    return (
        <section id="createaccount">
            <Container className={classes.paperContainer}>
                <Avatar className={classes.avatar}>
                    <AccountCircleIcon style={{ height: 48, width: 48 }} />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Create Account
                </Typography>
                <Typography variant="caption" className={classes.subtitle}>
                    You can use the username and password for GA/GAA after you create your account.
                </Typography>
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="ID" placeholder="Enter your username" required fullWidth onChange={(e) => setUsername(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Password" placeholder="Enter your password" required fullWidth onChange={(e) => setPassword(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Confirm Password" placeholder="Enter your password again" required fullWidth onChange={(e) => setConfirmPassword(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Email (optional)" placeholder="Enter your email address (used for account recovery)" fullWidth onChange={(e) => setOptionalEmail(e.target.value)} />
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" color="primary" disabled={!ready} className={classes.formButton} onClick={(e) => createAccount(e)}>
                        Create Account
                    </Button>
                </form>
            </Container>

            {creationSuccess ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="success">
                        Success! You can now log in.
                    </Alert>
                </Snackbar>
            ) : null}

            {usernameExists ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="error">
                        The username already exists.
                    </Alert>
                </Snackbar>
            ) : null}
        </section>
    )
}

export default CreateAccount
