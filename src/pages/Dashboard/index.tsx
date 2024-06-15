import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { styled } from "@mui/system"
import { createTheme, ThemeProvider } from "@mui/material/styles"
import { Alert, Autocomplete, Box, Button, FormControlLabel, Grid, IconButton, LinearProgress, Paper, Switch, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material"
import { RefreshOutlined } from "@mui/icons-material"
import match from "autosuggest-highlight/match"
import parse from "autosuggest-highlight/parse"
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment"
import moment, { Moment } from "moment"
import { UserContext } from "../../context/UserContext"
import { EMPTY_PAGE, EMPTY_SUMMARY, fetchLatestDate, fetchResults, fetchSummary, formatSeconds, ResultPage, ResultQuery, ResultSummary, SummaryItem, SummaryMission } from "../../lib/results"
import CustomChart from "../../components/CustomChart"
import CustomTable from "../../components/CustomTable"
import CustomPie from "../../components/CustomPie"
import StatCard from "../../components/StatCard"
import TopTable, { TopColumn } from "../../components/TopTable"
import data from "../../data/data.json"

// Changing the search, the dates or a toggle waits this long before going to the database, so typing a date fires one search.
const FILTER_DEBOUNCE_MS = 400

// The start of the first year with runs. The default range and the chart both start here.
const FIRST_DATA_YEAR = moment("2022-01-01")

// The last month with runs. No new data is submitted after this, so the date range and chart are capped here.
const LAST_DATA_MONTH = moment("2024-12-31").endOf("month")

// Where the dashboard controls are remembered between visits.
const SEARCH_STORAGE_KEY = "searchTerm"
const START_DATE_STORAGE_KEY = "dashboardStartDate"
const END_DATE_STORAGE_KEY = "dashboardEndDate"
const PLATFORM_STORAGE_KEY = "dashboardPlatform"
const USER_ONLY_STORAGE_KEY = "dashboardUserOnly"
const CHART_TYPE_STORAGE_KEY = "dashboardChartType"
const DATE_FILTER_STORAGE_KEY = "dashboardDateFilter"

// How many missions the top missions table lists.
const TOP_MISSIONS_LIMIT = 10

// The Dashboard is the one dark page. The login and reset pages keep the default theme for their white cards. Its panels use
// border-box sizing, so a full-height panel with padding stays inside its grid cell.
const DASHBOARD_THEME = createTheme({ palette: { mode: "dark" }, components: { MuiPaper: { styleOverrides: { root: { boxSizing: "border-box" } } } } })

// The kinds of search term, in the order the search box lists them.
const TERM_KINDS = ["Farming Mode", "Mission", "Item"] as const

// Every searchable term from the catalog, grouped by kind. Each name appears once per kind.
const SEARCH_TERMS: SearchTerm[] = (() => {
    const names: Record<TermKind, Set<string>> = { "Farming Mode": new Set(), Mission: new Set(), Item: new Set() }
    for (const [farmingMode, missions] of Object.entries(data as Record<string, Record<string, { items: string[] }>>)) {
        names["Farming Mode"].add(farmingMode)
        for (const [mission, { items }] of Object.entries(missions)) {
            names.Mission.add(mission)
            items.forEach((item) => names.Item.add(item))
        }
    }
    return TERM_KINDS.flatMap((kind) => [...names[kind]].map((name) => ({ kind: kind, name: name })))
})()

// The columns of the top missions table.
const MISSION_COLUMNS: TopColumn<SummaryMission>[] = [
    { label: "Mission", value: (row) => row.mission },
    { label: "Runs", value: (row) => row.runs.toLocaleString(), numeric: true },
    { label: "Items", value: (row) => row.amount.toLocaleString(), numeric: true },
    { label: "Avg time", value: (row) => formatSeconds(row.avgSeconds), numeric: true },
]

// The columns of the top items table.
const ITEM_COLUMNS: TopColumn<SummaryItem>[] = [
    { label: "Item", value: (row) => row.itemName },
    { label: "Total", value: (row) => row.amount.toLocaleString(), numeric: true },
    { label: "Runs", value: (row) => row.runs.toLocaleString(), numeric: true },
    { label: "Per run", value: (row) => (row.amount / row.runs).toFixed(2), numeric: true },
]

/**
 * Gives a top missions row its React key.
 *
 * @param row The row.
 * @returns The mission name.
 */
const missionKey = (row: SummaryMission): string => row.mission

/**
 * Gives a top items row its React key.
 *
 * @param row The row.
 * @returns The item name.
 */
const itemKey = (row: SummaryItem): string => row.itemName

/** What a search term can match on. */
type TermKind = (typeof TERM_KINDS)[number]

/** One entry of the search box. */
interface SearchTerm {
    /** Whether the term is a Farming Mode, a mission or an item. */
    kind: TermKind
    /** The name as the bots submit it. */
    name: string
}

const StyledRoot = styled("section")(({ theme }) => ({
    backgroundColor: theme.palette.background.default,
    color: theme.palette.text.primary,
    minHeight: "100vh",
    padding: "96px 16px 32px",
}))

const StyledPage = styled("div")({
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
})

const StyledStats = styled("div")({
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
    gap: "16px",
})

/**
 * Reads the remembered search term, if there is a valid one.
 *
 * @returns The term, or null.
 */
const restoreSearch = (): SearchTerm | null => {
    try {
        const saved = JSON.parse(localStorage.getItem(SEARCH_STORAGE_KEY) ?? "null")
        return SEARCH_TERMS.find((term) => term.kind === saved?.kind && term.name === saved?.name) ?? null
    } catch {
        return null
    }
}

/**
 * Reads a saved date from localStorage, clamped to the valid data range.
 *
 * @param key The localStorage key to read.
 * @param fallback The date to return when nothing is saved or the value is invalid.
 * @returns The restored date, or the fallback.
 */
const restoreDate = (key: string, fallback: Moment): Moment => {
    try {
        const saved = localStorage.getItem(key)
        if (!saved) return fallback
        const parsed = moment(saved)
        return parsed.isValid() ? moment.min(moment.max(parsed, FIRST_DATA_YEAR), LAST_DATA_MONTH).clone() : fallback
    } catch {
        return fallback
    }
}

/**
 * Reads a saved string from localStorage.
 *
 * @param key The localStorage key to read.
 * @param fallback The value to return when nothing is saved.
 * @param allowed The set of valid values. A saved value not in this set returns the fallback.
 * @returns The restored value, or the fallback.
 */
const restoreString = (key: string, fallback: string, allowed: string[]): string => {
    try {
        const saved = localStorage.getItem(key)
        return saved && allowed.includes(saved) ? saved : fallback
    } catch {
        return fallback
    }
}

/**
 * Reads a saved boolean from localStorage.
 *
 * @param key The localStorage key to read.
 * @param fallback The value to return when nothing is saved.
 * @returns The restored value, or the fallback.
 */
const restoreBoolean = (key: string, fallback: boolean): boolean => {
    try {
        const saved = localStorage.getItem(key)
        return saved !== null ? saved === "true" : fallback
    } catch {
        return fallback
    }
}

/**
 * Keeps a date inside a range.
 *
 * @param date The date to keep inside.
 * @param min The earliest date allowed.
 * @param max The latest date allowed.
 * @returns A copy of the date, moved to the nearest end of the range when it falls outside.
 */
const clampDate = (date: Moment, min: Moment, max: Moment): Moment => moment.min(moment.max(date, min), max).clone()

/**
 * The statistics page: one search over the runs, with headline numbers, charts, top lists and the matching runs.
 *
 * @returns The Dashboard page.
 */
const Dashboard = () => {
    const { user } = useContext(UserContext)

    const [search, setSearch] = useState<SearchTerm | null>(restoreSearch)
    const [page, setPage] = useState<ResultPage>(EMPTY_PAGE)
    const [summary, setSummary] = useState<ResultSummary>(EMPTY_SUMMARY)
    const [chartType, setChartType] = useState(() => restoreString(CHART_TYPE_STORAGE_KEY, "line", ["line", "bar"]))
    const [dateFilter, setDateFilter] = useState(() => restoreString(DATE_FILTER_STORAGE_KEY, "month", ["day", "week", "month"]))
    const [platform, setPlatform] = useState(() => restoreString(PLATFORM_STORAGE_KEY, "All", ["All", "GA", "GAA"]))
    const [showOnlyUserResults, setShowOnlyUserResults] = useState(() => restoreBoolean(USER_ONLY_STORAGE_KEY, false))
    const [loading, setLoading] = useState(true)
    const [failed, setFailed] = useState(false)
    const [refreshDate, setRefreshDate] = useState<Moment | null>(null)

    // Bumped by the refresh button, so the same search runs again.
    const [refreshCount, setRefreshCount] = useState(0)

    // Counts the searches, so that only the newest one updates the page when two overlap.
    const searchCount = useRef(0)

    // The range starts on the current year, then covers every month with runs once the newest one is known. Until then
    // `datesReady` is false and nothing searches.
    const [startDate, setStartDate] = useState<Moment>(() => restoreDate(START_DATE_STORAGE_KEY, FIRST_DATA_YEAR.clone()))
    const [endDate, setEndDate] = useState<Moment>(() => restoreDate(END_DATE_STORAGE_KEY, LAST_DATA_MONTH.clone()))
    const [datesReady, setDatesReady] = useState(false)

    // The end of the newest month with runs. The chart never runs past it.
    const [lastDataDate, setLastDataDate] = useState<Moment>(LAST_DATA_MONTH.clone())

    // The span the chart draws: the picked range, cut down to the first year with runs and the newest month with runs.
    const chartStart = useMemo(() => clampDate(startDate, FIRST_DATA_YEAR, lastDataDate), [startDate, lastDataDate])
    const chartEnd = useMemo(() => clampDate(endDate, chartStart, lastDataDate), [endDate, chartStart, lastDataDate])

    // Reset the screen position back to the top of the page, update the title, and find the newest month with runs.
    useEffect(() => {
        document.title = "Dashboard"
        window.scrollTo(0, 0)

        // A site with runs opens on the first year with runs through the newest month with runs. One with no runs keeps this year so far.
        const openOnDataRange = async () => {
            try {
                const latest = await fetchLatestDate()
                if (latest) {
                    const newestMonthEnd = moment(latest).endOf("month")
                    setLastDataDate(newestMonthEnd)
                    setStartDate(FIRST_DATA_YEAR.clone())
                    setEndDate(newestMonthEnd)
                }
            } catch (err) {
                console.error("[GAS] Failed to fetch the newest run date: ", err)
            }

            setDatesReady(true)
        }
        void openOnDataRange()
    }, [])

    // Remember the dashboard controls across visits.
    useEffect(() => { localStorage.setItem(SEARCH_STORAGE_KEY, JSON.stringify(search)) }, [search])
    useEffect(() => { localStorage.setItem(START_DATE_STORAGE_KEY, startDate.format("YYYY-MM-DD")) }, [startDate])
    useEffect(() => { localStorage.setItem(END_DATE_STORAGE_KEY, endDate.format("YYYY-MM-DD")) }, [endDate])
    useEffect(() => { localStorage.setItem(PLATFORM_STORAGE_KEY, platform) }, [platform])
    useEffect(() => { localStorage.setItem(USER_ONLY_STORAGE_KEY, String(showOnlyUserResults)) }, [showOnlyUserResults])
    useEffect(() => { localStorage.setItem(CHART_TYPE_STORAGE_KEY, chartType) }, [chartType])
    useEffect(() => { localStorage.setItem(DATE_FILTER_STORAGE_KEY, dateFilter) }, [dateFilter])

    // Turn the controls into the query the database understands.
    const buildQuery = useCallback((): ResultQuery => {
        const query: ResultQuery = {
            // Whole days either end, so a run submitted later today still falls inside the range.
            startDate: startDate.clone().startOf("day").toDate(),
            endDate: endDate.clone().endOf("day").toDate(),
            // Newest first, so a capped table holds the newest runs.
            ascending: false,
        }

        if (platform !== "All") query.platform = platform
        if (showOnlyUserResults && user?.username) query.username = user.username
        if (search?.kind === "Farming Mode") query.farmingMode = search.name
        if (search?.kind === "Mission") query.mission = search.name
        if (search?.kind === "Item") query.itemName = search.name

        return query
    }, [search, startDate, endDate, platform, showOnlyUserResults, user?.username])

    // Run the current search. Every filter runs in the database. The table rows and the totals behind the charts are fetched
    // together, and the totals cover every matching run, even when the rows are capped.
    const runSearch = useCallback(async () => {
        const query = buildQuery()
        const searchNumber = ++searchCount.current
        setLoading(true)

        try {
            const [newPage, newSummary] = await Promise.all([fetchResults(query), fetchSummary(query)])
            if (searchNumber !== searchCount.current) return

            setPage(newPage)
            setSummary(newSummary)
            setFailed(false)
            setRefreshDate(moment())
        } catch (err) {
            console.error("[GAS] Failed to fetch results: ", err)
            if (searchNumber !== searchCount.current) return

            setFailed(true)
        }

        setLoading(false)
    }, [buildQuery])

    // Search as soon as the dates are known, and again whenever the search, a filter or the refresh button changes.
    useEffect(() => {
        if (!datesReady) return

        const timer = setTimeout(() => void runSearch(), FILTER_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [datesReady, runSearch, refreshCount])

    // The headline numbers, worked out from the totals.
    const stats = useMemo(() => {
        const items = summary.days.reduce((total, day) => total + day.amountGA + day.amountGAA, 0)
        const timedRuns = summary.missions.reduce((total, mission) => total + mission.timedRuns, 0)
        const timedSeconds = summary.missions.reduce((total, mission) => total + mission.avgSeconds * mission.timedRuns, 0)
        const gaItems = summary.days.reduce((total, day) => total + day.amountGA, 0)
        return {
            items: items,
            avgSeconds: timedRuns > 0 ? timedSeconds / timedRuns : 0,
            perRun: summary.totalRuns > 0 ? items / summary.totalRuns : 0,
            gaShare: items > 0 ? Math.round((gaItems / items) * 100) : 0,
        }
    }, [summary])

    // Runs the current search again.
    const refresh = () => setRefreshCount((count) => count + 1)

    const searchLabel = search ? search.name : "All runs"

    return (
        <ThemeProvider theme={DASHBOARD_THEME}>
            <StyledRoot>
                <StyledPage>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                        <Typography variant="h4" component="h1">
                            Dashboard
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <Typography variant="caption" color="text.secondary">
                                {refreshDate ? `Updated ${refreshDate.format("LLL")}` : "Loading..."}
                            </Typography>
                            <Tooltip title="Refresh">
                                <span>
                                    <IconButton onClick={refresh} disabled={loading} aria-label="Refresh">
                                        <RefreshOutlined />
                                    </IconButton>
                                </span>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Paper variant="outlined" sx={{ padding: "16px", position: "relative", overflow: "hidden" }}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Autocomplete
                                    options={SEARCH_TERMS}
                                    value={search}
                                    onChange={(_e, value) => setSearch(value)}
                                    groupBy={(option) => option.kind}
                                    getOptionLabel={(option) => option.name}
                                    getOptionKey={(option) => `${option.kind}:${option.name}`}
                                    isOptionEqualToValue={(option, value) => option.kind === value.kind && option.name === value.name}
                                    renderInput={(params) => <TextField {...params} label="Search a Farming Mode, mission or item" placeholder="All runs" />}
                                    renderOption={(props, option, { inputValue }) => {
                                        // The key is passed on its own, because React warns when it is spread into the element.
                                        const { key, ...otherProps } = props as { key: React.Key } & React.HTMLAttributes<HTMLLIElement>
                                        const parts = parse(option.name, match(option.name, inputValue))

                                        return (
                                            <li key={key} {...otherProps}>
                                                <div>
                                                    {parts.map((part, index) => (
                                                        <span key={index} style={{ fontWeight: part.highlight ? 700 : 400 }}>
                                                            {part.text}
                                                        </span>
                                                    ))}
                                                </div>
                                            </li>
                                        )
                                    }}
                                />
                            </Grid>
                            <LocalizationProvider dateAdapter={AdapterMoment}>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <DatePicker
                                        label="From"
                                        value={startDate}
                                        onChange={(value: Moment | null) => value?.isValid() && setStartDate(value)}
                                        minDate={FIRST_DATA_YEAR}
                                        maxDate={endDate}
                                        disabled={!datesReady}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 6, md: 3 }}>
                                    <DatePicker
                                        label="To"
                                        value={endDate}
                                        onChange={(value: Moment | null) => value?.isValid() && setEndDate(value)}
                                        minDate={startDate}
                                        maxDate={LAST_DATA_MONTH}
                                        disabled={!datesReady}
                                        slotProps={{ textField: { fullWidth: true } }}
                                    />
                                </Grid>
                            </LocalizationProvider>
                            <Grid size={12} sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
                                <ToggleButtonGroup size="small" exclusive value={platform} onChange={(_e, value) => value && setPlatform(value)} aria-label="Bot">
                                    <ToggleButton value="All">All bots</ToggleButton>
                                    <ToggleButton value="GA">GA (Windows)</ToggleButton>
                                    <ToggleButton value="GAA">GAA (Android)</ToggleButton>
                                </ToggleButtonGroup>
                                <FormControlLabel control={<Switch checked={showOnlyUserResults} onChange={(e) => setShowOnlyUserResults(e.target.checked)} />} label="Only my runs" />
                            </Grid>
                        </Grid>
                        {loading ? <LinearProgress sx={{ position: "absolute", left: 0, right: 0, bottom: 0 }} /> : null}
                    </Paper>

                    {failed ? (
                        <Alert
                            severity="error"
                            action={
                                <Button color="inherit" size="small" onClick={refresh}>
                                    Retry
                                </Button>
                            }
                        >
                            The statistics could not be loaded.
                        </Alert>
                    ) : null}

                    <StyledStats>
                        <StatCard label="Runs" value={summary.totalRuns.toLocaleString()} />
                        <StatCard label="Items collected" value={stats.items.toLocaleString()} detail={`${stats.perRun.toFixed(2)} per run`} />
                        <StatCard label="Average run time" value={formatSeconds(stats.avgSeconds)} detail="Pending Battle drops left out" />
                        <StatCard label="Players" value={summary.players.toLocaleString()} />
                        <StatCard label="From GA" value={`${stats.gaShare}%`} detail={`${100 - stats.gaShare}% from GAA`} />
                    </StyledStats>

                    <Paper variant="outlined" sx={{ padding: "16px" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                            <Typography variant="subtitle1">Items collected over time</Typography>
                            <Box sx={{ display: "flex", gap: "8px" }}>
                                <ToggleButtonGroup size="small" exclusive value={chartType} onChange={(_e, value) => value && setChartType(value)} aria-label="Chart type">
                                    <ToggleButton value="line">Line</ToggleButton>
                                    <ToggleButton value="bar">Bar</ToggleButton>
                                </ToggleButtonGroup>
                                <ToggleButtonGroup size="small" exclusive value={dateFilter} onChange={(_e, value) => value && setDateFilter(value)} aria-label="Group by">
                                    <ToggleButton value="day">Day</ToggleButton>
                                    <ToggleButton value="month">Month</ToggleButton>
                                    <ToggleButton value="year">Year</ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        </Box>
                        <Box sx={{ height: "400px", marginTop: "8px" }}>
                            <CustomChart type={chartType} chartTitle={`${searchLabel} by ${dateFilter}`} days={summary.days} dateFilter={dateFilter} startDate={chartStart.toDate()} endDate={chartEnd.toDate()} />
                        </Box>
                    </Paper>

                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, md: 7 }}>
                            <TopTable title="Top missions" columns={MISSION_COLUMNS} rows={summary.missions.slice(0, TOP_MISSIONS_LIMIT)} rowKey={missionKey} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Paper variant="outlined" sx={{ padding: "16px", height: "100%" }}>
                                <Box sx={{ height: "360px" }}>
                                    <CustomPie chartTitle="Share of items by mission" missions={summary.missions} />
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid size={12}>
                            <TopTable title="Top items" columns={ITEM_COLUMNS} rows={summary.items} rowKey={itemKey} />
                        </Grid>
                    </Grid>

                    <Box>
                        <Typography variant="subtitle1">Runs</Typography>
                        <Typography variant="caption" color="text.secondary" component="p" sx={{ marginBottom: "8px" }}>
                            {page.truncated
                                ? `Showing the newest ${page.rows.length.toLocaleString()} of ${summary.totalRuns.toLocaleString()} runs. The numbers and charts above include all of them.`
                                : `${page.rows.length.toLocaleString()} runs`}
                        </Typography>
                        <CustomTable rows={page.rows} />
                    </Box>
                </StyledPage>
            </StyledRoot>
        </ThemeProvider>
    )
}

export default Dashboard
