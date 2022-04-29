import React, { useEffect, useState, useContext } from "react"
import { Avatar, Container, Grid, IconButton, InputAdornment, TextField, Typography, Theme, Alert, Snackbar } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import axios from "axios"
import LoadingButton from "@mui/lab/LoadingButton"
import { Visibility, VisibilityOff } from "@mui/icons-material"
import { UserContext } from "../../context/UserContext"

const Login = () => {
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
        form: {
            marginTop: theme.spacing(3),
        },
        formButton: {
            backgroundColor: "#01bf71",
            margin: "32px 32px 0 0",
            color: "#000",
        },
        flexDiv: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
        },
        checkbox: {
            margin: "32px 0 0 0",
            color: "#000",
        },
    }))

    const classes = useStyles()

    const entryPoint: string = useContext(UserContext).entryPoint

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [ready, setReady] = useState(false)
    const [inProgress, setInProgress] = useState(false)
    const [open, setOpen] = useState(false)
    const [loginFailed, setLoginFailed] = useState(false)

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Login"
        window.scrollTo(0, 0)
    }, [])

    // Enable the Login button if the fields have been filled in.
    useEffect(() => {
        setReady(username !== "" && password !== "")
    }, [username, password])

    // Show the Snackbar for success or failure.
    useEffect(() => {
        if (loginFailed) {
            setOpen(true)
        }
    }, [loginFailed])

    // Send a POST request to the Express server to login.
    const login = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        setInProgress(true)
        axios
            .post(
                `${entryPoint}/api/login`,
                {
                    username: username,
                    password: password,
                },
                {
                    withCredentials: true,
                }
            )
            .then(() => {
                // After login was authenticated, send user to the Dashboard.
                window.location.href = "/dashboard"
            })
            .catch(() => {
                setLoginFailed(true)
            })
            .finally(() => {
                setInProgress(false)
            })
    }

    // Close the Snackbar.
    const handleClose = () => {
        setOpen(false)
        setLoginFailed(false)
    }

    return (
        <section id="login">
            <Container className={classes.paperContainer}>
                <Avatar className={classes.avatar}>
                    <LockOpenIcon style={{ height: 48, width: 48 }} />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Login
                </Typography>
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="Username" placeholder="Enter your username" required fullWidth onChange={(e) => setUsername(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                label="Password"
                                placeholder="Enter your password"
                                required
                                fullWidth
                                onChange={(e) => setPassword(e.target.value)}
                                type={showPassword ? "text" : "password"}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} onMouseDown={(e) => e.preventDefault()} edge="end">
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Grid>
                    </Grid>
                    <LoadingButton loading={inProgress} type="submit" variant="contained" color="primary" disabled={!ready} onClick={(e) => login(e)} className={classes.formButton}>
                        Login
                    </LoadingButton>
                </form>
            </Container>

            {loginFailed ? (
                <Snackbar anchorOrigin={{ vertical: "bottom", horizontal: "right" }} open={open} autoHideDuration={10000} onClose={() => handleClose()} key="bottom right">
                    <Alert onClose={() => handleClose()} severity="error">
                        Username/Password was incorrect.
                    </Alert>
                </Snackbar>
            ) : null}
        </section>
    )
}

export default Login
