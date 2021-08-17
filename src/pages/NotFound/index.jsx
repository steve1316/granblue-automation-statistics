import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
    root: {
        background: "#000",
    },
}));

const NotFound = () => {
    const classes = useStyles();
    return (
        <section className={classes.root}>
            <h2>Sorry</h2>
            <p>404 - Page cannot be found</p>
            <Link to="/">Head back to the Home page...</Link>
        </section>
    );
};

export default NotFound;
