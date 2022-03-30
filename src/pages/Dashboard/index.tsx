import React, { useContext, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Chip, Stack, Theme } from "@mui/material"
import { UserContext } from "../../context/UserContext"
import axios from "axios"
import { ResultInterface } from "../../interfaces/ResultInterface"
import CustomChart from "../../components/CustomChart"
import CustomTable from "../../components/CustomTable"
import { Done } from "@mui/icons-material"

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
            marginTop: "10%",
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
            height: "500px",
            width: "80%",
            marginTop: "16px",
            marginBottom: "16px",
        },
        buttonWrapper: {
            marginTop: "32px",
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
        },
        tableContainer: {
            position: "relative",
            height: "60%",
            width: "80%",
            marginTop: "16px",
            marginBottom: "16px",
            [theme.breakpoints.down("sm")]: {
                height: "100%",
            },
        },
    }))

    const classes = useStyles()

    const user = useContext(UserContext)

    const [results, setResults] = useState<ResultInterface[]>([])
    const [chartType, setChartType] = useState("line")
    const [dateFilter, setDateFilter] = useState("month")

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

                <Stack direction="row" spacing={1} sx={{ marginBottom: "16px" }}>
                    <Chip label="Line" color="primary" onClick={() => setChartType("line")} icon={chartType === "line" ? <Done /> : undefined} variant={chartType === "line" ? "filled" : "outlined"} />
                    <Chip label="Bar" color="primary" onClick={() => setChartType("bar")} icon={chartType === "bar" ? <Done /> : undefined} variant={chartType === "bar" ? "filled" : "outlined"} />
                </Stack>

                <Stack direction="row" spacing={1}>
                    <Chip
                        label="Month"
                        color="primary"
                        onClick={() => setDateFilter("month")}
                        icon={dateFilter === "month" ? <Done /> : undefined}
                        variant={dateFilter === "month" ? "filled" : "outlined"}
                    />
                    <Chip label="Day" color="primary" onClick={() => setDateFilter("day")} icon={dateFilter === "day" ? <Done /> : undefined} variant={dateFilter === "day" ? "filled" : "outlined"} />
                    <Chip
                        label="Year"
                        color="primary"
                        onClick={() => setDateFilter("year")}
                        icon={dateFilter === "year" ? <Done /> : undefined}
                        variant={dateFilter === "year" ? "filled" : "outlined"}
                    />
                </Stack>
            </div>

            <div className={classes.chartContainer}>
                <CustomChart type={chartType} chartTitle={`Chart by ${dateFilter}`} data={results} dateFilter={dateFilter} />
            </div>

            <div className={classes.tableContainer}>
                <CustomTable rows={results} />
            </div>
        </section>
    )
}

export default Dashboard
