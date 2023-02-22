import React, { useContext, useEffect, useState } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { Autocomplete, Box, Button, Chip, CircularProgress, Grid, Stack, Tab, Tabs, TextField, Theme } from "@mui/material"
import { UserContext } from "../../context/UserContext"
import axios from "axios"
import { ResultInterface } from "../../interfaces/ResultInterface"
import CustomChart from "../../components/CustomChart"
import CustomTable from "../../components/CustomTable"
import { Done, RefreshOutlined } from "@mui/icons-material"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { UserInterface } from "../../interfaces/UserInterface"
import data from "../../data/data.json"
import CustomPie from "../../components/CustomPie"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"

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
            // backgroundColor: "#222020",
            padding: 15,
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
        chartContainer: {
            height: "500px",
            width: "100%",
            marginTop: "16px",
            marginBottom: "16px",
        },
        tableContainer: {
            position: "relative",
            height: "60%",
            width: "100%",
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

    type Order = "asc" | "desc"

    const classes = useStyles()

    const uc = useContext(UserContext)
    const user: UserInterface = uc.user

    const [search, setSearch] = useState("")
    const [availableSearchTerms, setAvailableSearchTerms] = useState<string[]>([])
    const [searchSubmission, setSearchSubmission] = useState(false)
    const [rawResults, setRawResults] = useState<ResultInterface[]>([])
    const [results, setResults] = useState<ResultInterface[]>([])
    const [userResults, setUserResults] = useState<ResultInterface[]>([])
    const [chartType, setChartType] = useState("line")
    const [dateFilter, setDateFilter] = useState("month")
    const [showOnlyUserResults, setShowOnlyUserResults] = useState(false)

    const [loading, setLoading] = useState(false)
    const [showDistributionOfRuns, setShowDistributionOfRuns] = useState(false)
    const [tabValue, setTabValue] = useState(0)
    const [startDate, setStartDate] = useState<Date>(new Date(new Date().getFullYear(), 0, 1))
    const [endDate, setEndDate] = useState<Date>(new Date())

    // Reset the screen position back to the top of the page and update the title of the page.
    useEffect(() => {
        document.title = "Dashboard"
        window.scrollTo(0, 0)

        // Now construct the available search terms by reading the data json file.
        var searchTerms: string[] = [" "]
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
                    searchTerms = searchTerms.concat("[Mission] " + missionObj[0])
                    missionObj[1].items.forEach((item) => {
                        searchTerms = searchTerms.concat("[Item] " + item)
                    })
                })

            // Save the Farming Mode as a search term as well.
            searchTerms.push("[Farming Mode] " + key)
        })

        // Remove any duplicate items and save it to state.
        setAvailableSearchTerms(Array.from(new Set(searchTerms)))

        // Finally, fetch search term from localStorage if possible and any other flag.
        let tempSearch = localStorage.getItem("search")
        if (tempSearch) {
            setSearch(JSON.parse(tempSearch))
            setSearchSubmission(true)
        }

        let flag: string | null = localStorage.getItem("showDistributionOfRuns")
        if (flag !== null) {
            setShowDistributionOfRuns(Boolean(flag))
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        // Save search term to localStorage to persist across refreshes.
        localStorage.setItem("search", JSON.stringify(search))
    }, [search])

    useEffect(() => {
        if (search.indexOf("[Farming Mode]") !== -1) {
            const newSearch = search.replace("[Farming Mode] ", "").trim()
            console.log("Searching results for the Farming Mode after changing the date filter: ", newSearch)
            getFarmingModeResults(newSearch)
        } else if (search.indexOf("[Mission]") !== -1) {
            const newSearch = search.replace("[Mission] ", "").trim()
            console.log("Searching results for the Mission after changing the date filter: ", newSearch)
            getMissionResults(newSearch)
        } else if (search === "" || search === " ") {
            getAllResults()
        } else {
            const newSearch = search.replace("[Item] ", "").trim()
            console.log("Searching results for the Item after changing the date filter: ", newSearch)
            getItemResults(newSearch)
        }
    }, [dateFilter]) // eslint-disable-line react-hooks/exhaustive-deps

    // Only send the search request after the user's query matches a searchable term.
    useEffect(() => {
        if (searchSubmission) {
            if (search.indexOf("[Farming Mode]") !== -1) {
                const newSearch = search.replace("[Farming Mode] ", "").trim()
                console.log("Searching results for the Farming Mode: ", newSearch)
                getFarmingModeResults(newSearch)
            } else if (search.indexOf("[Mission]") !== -1) {
                const newSearch = search.replace("[Mission] ", "").trim()
                console.log("Searching results for the Mission: ", newSearch)
                getMissionResults(newSearch)
            } else if (search === "" || search === " ") {
                getAllResults()
            } else {
                const newSearch = search.replace("[Item] ", "").trim()
                console.log("Searching results for the Item: ", newSearch)
                getItemResults(newSearch)
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
                setRawResults(data.data)
                setResults(filterData(data.data))
            })
            .catch(() => {
                setRawResults([])
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
                setLoading(false)
            })
    }

    const getMissionResults = (mission: string) => {
        axios
            .get(`${uc.entryPoint}/api/get-result/mission/${mission}`, { withCredentials: true })
            .then((data) => {
                setRawResults(data.data)
                setResults(filterData(data.data))
            })
            .catch(() => {
                setRawResults([])
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
                setLoading(false)
            })
    }

    // Get all results for this item from the search term.
    const getItemResults = (itemName: string) => {
        let queryLink = `${uc.entryPoint}/api/get-result/item/${itemName}?sort=asc`
        if (dateFilter === "day") queryLink += `&dateFilter=${dateFilter}`
        axios
            .get(queryLink, { withCredentials: true })
            .then((data) => {
                setRawResults(data.data)
                setResults(filterData(data.data))
            })
            .catch(() => {
                setRawResults([])
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
                setLoading(false)
            })
    }

    const getAllResults = () => {
        // Get all results for this item from the search term.
        // Set the values for the order and number of rows shown for search queries involving searching X number of all results.
        let newOrder = localStorage.getItem("order") as Order
        if (newOrder !== null) {
            newOrder = "desc"
        }

        axios
            .get(`${uc.entryPoint}/api/get-result?sort=${newOrder}`, { withCredentials: true })
            .then((data) => {
                setRawResults(data.data)
                setResults(filterData(data.data))
            })
            .catch(() => {
                setRawResults([])
                setResults([])
            })
            .finally(() => {
                setSearchSubmission(false)
                setSearch("")
                setLoading(false)
            })
    }

    // Filter the data received from the API using the given start and end dates.
    const filterData = (tempData: ResultInterface[]) => {
        let processedData: ResultInterface[] = tempData.filter((record) => {
            let tempDate = new Date(record.date)
            return tempDate >= startDate && tempDate <= endDate
        })

        console.log(`[DEBUG] After filtering, there are ${processedData.length} / ${tempData.length} records left.`)
        return processedData
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
                        label="Show distribution of runs"
                        color="primary"
                        onClick={() => {
                            localStorage.setItem("showDistributionOfRuns", String(!showDistributionOfRuns))
                            setShowDistributionOfRuns(!showDistributionOfRuns)
                        }}
                        icon={showDistributionOfRuns ? <Done /> : undefined}
                        variant={showDistributionOfRuns ? "filled" : "outlined"}
                    />

                    <Chip
                        label="Show only my results"
                        color="primary"
                        onClick={() => setShowOnlyUserResults(!showOnlyUserResults)}
                        icon={showOnlyUserResults ? <Done /> : undefined}
                        variant={showOnlyUserResults ? "filled" : "outlined"}
                    />
                </Stack>
            </div>

            <div className={classes.chartContainer}>
                <CustomChart
                    type={chartType}
                    chartTitle={search !== "" ? `${search} by ${dateFilter}` : `Showing All Results`}
                    data={showOnlyUserResults ? userResults : results}
                    dateFilter={dateFilter}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>

            {showDistributionOfRuns ? (
                <div className={classes.chartContainer}>
                    <CustomPie chartTitle={"Distribution of runs"} data={showOnlyUserResults ? userResults : results} startDate={startDate} />
                </div>
            ) : null}

            <div className={classes.tableContainer}>
                <Grid container spacing={2} columns={{ xs: 4, md: 12 }} sx={{ marginBottom: "16px" }} justifyContent="space-between" alignItems="center">
                    <Grid item xs={3}>
                        <Tabs value={tabValue} onChange={(_, value) => setTabValue(value)} sx={{ color: "white" }} textColor="inherit">
                            <Tab value={0} label="All" disableRipple />
                            <Tab value={1} label="GA" disableRipple />
                            <Tab value={2} label="GAA" disableRipple />
                        </Tabs>
                    </Grid>
                    <Grid item xs={3}>
                        <Box sx={{ width: "160px" }}>
                            <Button
                                variant="contained"
                                startIcon={loading ? null : <RefreshOutlined />}
                                onClick={() => {
                                    setLoading(true)
                                    setSearchSubmission(true)
                                }}
                                disabled={loading}
                                sx={{
                                    width: "100%",
                                    justifyContent: "center",
                                    "&.Mui-disabled": {
                                        background: "#1976d2",
                                    },
                                }}
                            >
                                {loading ? <CircularProgress size={24} sx={{ color: "white" }} /> : "Refresh Data"}
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={3}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DatePicker
                                label="Select Start Date"
                                value={startDate}
                                onChange={(e: Date | null) => {
                                    if (e !== null) setStartDate(e)
                                }}
                                minDate={new Date(2021, 12, 1)}
                                maxDate={new Date()}
                                renderInput={(params) => <TextField {...params} variant="filled" sx={{ backgroundColor: "white", borderRadius: "5px" }} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                    <Grid item xs={3}>
                        <LocalizationProvider dateAdapter={AdapterMoment}>
                            <DatePicker
                                label="Select End Date"
                                value={endDate}
                                onChange={(e: Date | null) => {
                                    if (e !== null) setEndDate(e)
                                }}
                                minDate={startDate}
                                maxDate={new Date()}
                                renderInput={(params) => <TextField {...params} variant="filled" sx={{ backgroundColor: "white", borderRadius: "5px" }} fullWidth />}
                            />
                        </LocalizationProvider>
                    </Grid>
                </Grid>
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
