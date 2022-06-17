import React, { useContext, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Autocomplete, Chip, Grid, Stack, TextField, Theme } from "@mui/material"
import { UserContext } from "../../context/UserContext"
import axios from "axios"
import { ResultInterface } from "../../interfaces/ResultInterface"
import CustomChart from "../../components/CustomChart"
import CustomTable from "../../components/CustomTable"
import { Done } from "@mui/icons-material"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { UserInterface } from "../../interfaces/UserInterface"
import data from "../../data/data.json"
import CustomPie from "../../components/CustomPie"

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
            width: "100%",
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
        searchBar: {
            backgroundColor: "white",
        },
    }))

    const classes = useStyles()

    const uc = useContext(UserContext)
    const user: UserInterface = uc.user

    const [search, setSearch] = useState("")
    const [availableSearchTerms, setAvailableSearchTerms] = useState<string[]>([])
    const [searchSubmission, setSearchSubmission] = useState(false)
    const [results, setResults] = useState<ResultInterface[]>([])
    const [userResults, setUserResults] = useState<ResultInterface[]>([])
    const [chartType, setChartType] = useState("line")
    const [dateFilter, setDateFilter] = useState("month")
    const [showOnlyUserResults, setShowOnlyUserResults] = useState(false)
    const [showMissionsInsteadOfItems, setShowMissionsInsteadOfItems] = useState(false)

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Dashboard"
        window.scrollTo(0, 0)

        // Now construct the available search terms by reading the data json file.
        var searchTerms: string[] = []
        Object.keys(data).forEach((key) => {
            if (
                key === "Quest" ||
                key === "Special" ||
                key === "Raid" ||
                key === "Event" ||
                key === "Event (Token Drawboxes)" ||
                key === "Rise of the Beasts" ||
                key === "Guild Wars" ||
                key === "Dread Barrage" ||
                key === "Proving Grounds" ||
                key === "Xeno Clash" ||
                key === "Arcarum" ||
                key === "Arcarum Sandbox" ||
                key === "Generic"
            )
                Object.entries(data[key]).forEach((missionObj) => {
                    searchTerms = searchTerms.concat(missionObj[1].items)
                })

            // Save the Farming Mode as a search term as well.
            searchTerms.push(key + " Farming Mode")
        })

        // Remove any duplicate items and save it to state.
        setAvailableSearchTerms(Array.from(new Set(searchTerms)))

        // Finally, fetch search term from localStorage if possible.
        let tempSearch = localStorage.getItem("search")
        if (tempSearch) {
            setSearch(JSON.parse(tempSearch))
            setSearchSubmission(true)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Save search term to localStorage to persist across refreshes.
        localStorage.setItem("search", JSON.stringify(search))
    }, [search])

    // Only send the search request after the user's query matches a searchable term.
    useEffect(() => {
        if (searchSubmission) {
            if (search.indexOf("Farming Mode") !== -1) {
                const newSearch = search.slice(0, search.indexOf("Farming Mode")).trim()
                console.log("Searching results for the Farming Mode: ", newSearch)
                getFarmingModeResults(newSearch)
            } else {
                console.log("Searching results for the item: ", search)
                getItemResults(search)
            }
        }
    }, [searchSubmission]) // eslint-disable-line react-hooks/exhaustive-deps

    // Display either all or only the user's results belonging to the search term.
    useEffect(() => {
        if (showOnlyUserResults) {
            const userResults = results.filter((result) => result.username === user.username)
            setUserResults(userResults)
        } else {
            setUserResults([])
        }
    }, [showOnlyUserResults]) // eslint-disable-line react-hooks/exhaustive-deps

    const getFarmingModeResults = (farmingMode: string) => {
        axios
            .get(`${uc.entryPoint}/api/get-result/farmingMode/${farmingMode}`, { withCredentials: true })
            .then((data) => {
                setResults(data.data)
            })
            .catch(() => {
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
            })
    }

    // Get all results for this item from the search term.
    const getItemResults = (itemName: string) => {
        axios
            .get(`${uc.entryPoint}/api/get-result/item/${itemName}`, { withCredentials: true })
            .then((data) => {
                setResults(data.data)
            })
            .catch(() => {
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
            })
    }

    return (
        <section className={classes.root}>
            <div className={classes.container}>
                <h2 className={classes.title}>Dashboard</h2>

                <Stack direction="row" spacing={1} sx={{ marginTop: "16px" }}>
                    <Chip label="Line" color="primary" onClick={() => setChartType("line")} icon={chartType === "line" ? <Done /> : undefined} variant={chartType === "line" ? "filled" : "outlined"} />
                    <Chip label="Bar" color="primary" onClick={() => setChartType("bar")} icon={chartType === "bar" ? <Done /> : undefined} variant={chartType === "bar" ? "filled" : "outlined"} />
                </Stack>

                <Stack direction="row" spacing={1} sx={{ marginTop: "16px" }}>
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

                <Stack direction="row" spacing={1} sx={{ marginTop: "16px" }}>
                    <Chip
                        label="Show only my results"
                        color="primary"
                        onClick={() => setShowOnlyUserResults(!showOnlyUserResults)}
                        icon={showOnlyUserResults ? <Done /> : undefined}
                        variant={showOnlyUserResults ? "filled" : "outlined"}
                    />

                    <Chip
                        label="Show missions instead of items"
                        color="primary"
                        onClick={() => setShowMissionsInsteadOfItems(!showMissionsInsteadOfItems)}
                        icon={showMissionsInsteadOfItems ? <Done /> : undefined}
                        variant={showMissionsInsteadOfItems ? "filled" : "outlined"}
                    />
                </Stack>
            </div>

            <Grid container spacing={2} sx={{ width: "80%", display: "flex", justifyContent: "center" }}>
                <Grid item xs={12} md={6}>
                    <div className={classes.chartContainer}>
                        <CustomChart
                            type={chartType}
                            chartTitle={search !== "" ? `${search} by ${dateFilter}` : `Missing Search Term`}
                            data={showOnlyUserResults ? userResults : results}
                            dateFilter={dateFilter}
                        />
                    </div>
                </Grid>
                <Grid item xs={12} md={6}>
                    <div className={classes.chartContainer}>
                        <CustomPie chartTitle={"Distribution of runs"} data={showOnlyUserResults ? userResults : results} dateFilter={dateFilter} showOnlyMissions={showMissionsInsteadOfItems} />
                    </div>
                </Grid>
            </Grid>

            <div className={classes.tableContainer}>
                <Autocomplete
                    options={availableSearchTerms.map((result) => result)}
                    value={search}
                    onChange={(e, value) => {
                        var newItem = ""
                        if (value !== null) {
                            newItem = value

                            if (availableSearchTerms.indexOf(value) !== -1) {
                                setSearchSubmission(true)
                            }
                        }

                        setSearch(newItem)
                    }}
                    getOptionLabel={(option) => option}
                    isOptionEqualToValue={(option) => option !== ""}
                    renderInput={(params) => (
                        <TextField
                            className={classes.searchBar}
                            {...params}
                            label="Search Farming Mode or Item"
                            variant="filled"
                            helperText="Display data belonging to a particular Farming Mode or item"
                        />
                    )}
                    renderOption={(props, option, { inputValue }) => {
                        const matches = match(option, inputValue)
                        const parts = parse(option, matches)

                        return (
                            <li {...props}>
                                <div>
                                    {parts.map((part, index) => {
                                        return (
                                            <span key={index} style={{ fontWeight: part.highlight ? 1000 : 400 }}>
                                                {part.text}
                                            </span>
                                        )
                                    })}
                                </div>
                            </li>
                        )
                    }}
                />
                <CustomTable rows={showOnlyUserResults ? userResults : results} />
            </div>
        </section>
    )
}

export default Dashboard
