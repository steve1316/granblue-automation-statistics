import React, { useEffect } from "react"
import { Avatar, Button, Container, Grid, makeStyles, TextField, Typography, FormControlLabel, Checkbox } from "@material-ui/core"
import LockOpenIcon from "@material-ui/icons/LockOpen"

const Login = () => {
    const useStyles = makeStyles((theme) => ({
        paperContainer: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "32px",
            width: "500px",
        },
        avatar: {
            margin: theme.spacing(1),
            height: 64,
            width: 64,
            backgroundColor: "#01bf71",
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
            alignItems: "center",
        },
        checkbox: {
            margin: "32px 32px 0 0",
            color: "#000",
        },
    }))

    const classes = useStyles()

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Login"
        window.scrollTo(0, 0)
    }, [])

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
                            <TextField label="ID" placeholder="Enter your uniquely generated ID" required fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Password" placeholder="Enter your password" required fullWidth />
                        </Grid>
                    </Grid>
                    <div className={classes.flexDiv}>
                        <Button type="submit" variant="contained" color="primary" className={classes.formButton}>
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
