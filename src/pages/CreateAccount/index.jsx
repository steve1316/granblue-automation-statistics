import React, { useEffect } from "react"
import { Avatar, Button, Container, Grid, makeStyles, TextField, Typography } from "@material-ui/core"
import AccountCircleIcon from "@material-ui/icons/AccountCircle"

const useStyles = makeStyles((theme) => ({
    paperContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
    },
    avatar: {
        margin: theme.spacing(1),
        height: 64,
        width: 64,
        backgroundColor: "#01bf71",
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

const CreateAccount = () => {
    const classes = useStyles()

    useEffect(() => {
        document.title = "Create Account"
        window.scrollTo(0, 0)
    }, [])

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
                    Please make sure to run GA/GAA for the first time to get your ID
                </Typography>
                <form className={classes.form}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField label="ID" placeholder="Enter your uniquely generated ID" required fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Password" placeholder="Enter your password" required fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Confirm Password" placeholder="Enter your password again" required fullWidth />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField label="Email (optional)" placeholder="Enter your email address (used for account recovery)" fullWidth />
                        </Grid>
                    </Grid>
                    <Button type="submit" variant="contained" color="primary" className={classes.formButton}>
                        Create Account
                    </Button>
                </form>
            </Container>
        </section>
    )
}

export default CreateAccount
