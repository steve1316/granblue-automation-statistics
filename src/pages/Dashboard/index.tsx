import React, { useContext, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Theme } from "@mui/material"
import { UserContext } from "../../context/UserContext"
import axios from "axios"
import { ResultInterface } from "../../interfaces/ResultInterface"
import Chart from "../../components/Chart"

const Dashboard = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        root: {
            background: "#000",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minHeight: "100vh",
        },
        container: {
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
        },
        title: {
            fontSize: "40px",
            margin: "16px auto",
        },
        subtitle: {
            fontSize: "16px",
            margin: "16px auto",
        },
        chartContainer: {
            position: "relative",
            height: "60%",
            width: "60%",
            [theme.breakpoints.down("lg")]: {
                height: "80%",
                width: "80%",
            },
            [theme.breakpoints.down("sm")]: {
                height: "100%",
                width: "80%",
            },
        },
    }))

    const classes = useStyles()

    const user = useContext(UserContext)

    const [results, setResults] = useState<ResultInterface[]>([])

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Dashboard"
        window.scrollTo(0, 0)

        getResults("Meat")
    }, [])

    // Get results for this item.
    const getResults = (itemName: string) => {
        axios.get(`http://localhost:4000/get-result/item/${itemName}`, { withCredentials: true }).then((data) => {
            setResults(data.data)
        })
    }

    return (
        <section className={classes.root}>
            <div className={classes.container}>
                <h2 className={classes.title}>Dashboard</h2>
                <p className={classes.subtitle}>User is logged in</p>
            </div>

            <div className={classes.chartContainer}>
                <Chart type="line" chartTitle="My Chart" data={results} />
            </div>
        </section>
    )
}

export default Dashboard
