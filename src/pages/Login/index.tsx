import React, { useEffect, useState } from "react"
import { Avatar, Button, Container, Grid, TextField, Typography, FormControlLabel, Checkbox, Theme } from "@mui/material"
import makeStyles from "@mui/styles/makeStyles"
import LockOpenIcon from "@mui/icons-material/LockOpen"
import axios from "axios"

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

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [ready, setReady] = useState(false)

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Login"
        window.scrollTo(0, 0)
    }, [])

    // Enable the Login button if the fields have been filled in.
    useEffect(() => {
        setReady(username !== "" && password !== "")
    })

    // Send a POST request to the Express server to login.
    const login = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault()
        axios
            .post(
                "http://localhost:4000/login",
                {
                    username,
                    password,
                },
                {
                    withCredentials: true,
                }
            )
            .then((res) => {
                window.location.href = "/dashboard"
            })
            .catch((err) => {
                console.error("Login details are invalid.")
            })
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
                            <TextField label="ID" placeholder="Enter your uniquely generated ID" required fullWidth onChange={(e) => setUsername(e.target.value)} />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Password" placeholder="Enter your password" required fullWidth onChange={(e) => setPassword(e.target.value)} />
                        </Grid>
                    </Grid>
                    <div className={classes.flexDiv}>
                        <Button type="submit" variant="contained" color="primary" className={classes.formButton} disabled={!ready} onClick={(e) => login(e)}>
                            Login
                        </Button>
                        <FormControlLabel className={classes.checkbox} control={<Checkbox />} label="Remember Me" />
                    </div>
                </form>
            </Container>
        </section>
    )
}

export default Login
