import React, { useEffect } from "react";
import { Avatar, Button, Container, Grid, makeStyles, Paper, TextField, Typography } from "@material-ui/core";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#000",
        overflow: "hidden",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
    },
    paper: {
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
    },
    avatar: {
        margin: theme.spacing(1),
        height: 64,
        width: 64,
        backgroundColor: "#01bf71",
    },
    form: {
        width: "100%",
        marginTop: theme.spacing(3),
    },
    formButton: {
        backgroundColor: "#01bf71",
        margin: theme.spacing(3, 0, 2),
    },
}));

const CreateAccount = () => {
    const classes = useStyles();

    useEffect(() => {
        document.title = "Create Account";
        window.scrollTo(0, 0);
    }, []);

    return (
        <section id="createaccount" className={classes.root}>
            <Container component="main" maxWidth="md">
                <Paper className={classes.paper}>
                    <Avatar className={classes.avatar}>
                        <AccountCircleIcon style={{ height: 48, width: 48 }} />
                    </Avatar>
                    <Typography component="h1" variant="h5">
                        Create Account
                    </Typography>
                    <Typography variant="caption">Please make sure to run the program for the first time to get your ID</Typography>
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
                        <Grid container justifyContent="flex-end">
                            <Link to="/login" variant="body2">
                                Already have an account? Sign in here.
                            </Link>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </section>
    );
};

export default CreateAccount;
