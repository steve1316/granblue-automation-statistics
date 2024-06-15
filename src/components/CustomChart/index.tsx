import { useMemo } from "react"
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, Filler } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { chartOptions, PLATFORM_COLORS } from "../../lib/charts"
import { SummaryDay } from "../../lib/results"

// Register elements to be used by chartjs.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

// The bots, one series each.
const PLATFORMS = ["GA", "GAA"] as const

// Short month names for the axis labels, January first.
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

// The groupings the Dashboard offers. Anything else groups by day.
const GROUPINGS: Record<string, Grouping> = {
    year: { keyLength: 4, first: (date) => new Date(date.getFullYear(), 0, 1), step: (cursor) => cursor.setFullYear(cursor.getFullYear() + 1) },
    month: { keyLength: 7, first: (date) => new Date(date.getFullYear(), date.getMonth(), 1), step: (cursor) => cursor.setMonth(cursor.getMonth() + 1) },
    day: { keyLength: 10, first: (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()), step: (cursor) => cursor.setDate(cursor.getDate() + 1) },
}

/** How one grouping of the axis works. */
interface Grouping {
    /** How much of a "YYYY-MM-DD" day makes up the group's key. */
    keyLength: number
    /** Returns the start of the group a date falls in. */
    first: (date: Date) => Date
    /** Moves a date on to the start of the next group. */
    step: (cursor: Date) => void
}

/** Props for CustomChart. */
interface Props {
    /** Which chart to draw, "line" or "bar". */
    type: string
    /** The title shown above the chart. */
    chartTitle: string
    /** Totals per day for the current search. Days without runs can be left out. */
    days: SummaryDay[]
    /** How the days are grouped on the axis: "day", "month" or "year". */
    dateFilter: string
    /** First day of the range the axis covers. */
    startDate: Date
    /** Last day of the range the axis covers. */
    endDate: Date
}

/**
 * Formats a date as the "YYYY-MM-DD" key the day totals use, in the browser's time zone.
 *
 * @param date The date to format.
 * @returns The key.
 */
const dayKey = (date: Date): string => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

/**
 * Turns a grouping key into its axis label.
 *
 * @param key The key: "YYYY", "YYYY-MM" or "YYYY-MM-DD".
 * @returns The label, e.g. "2024", "Jan '24" or "Jan 5 '24".
 */
const labelFor = (key: string): string => {
    const [year, month, day] = key.split("-")
    if (!month) return year

    const monthLabel = MONTH_LABELS[Number(month) - 1]
    return day ? `${monthLabel} ${Number(day)} '${year.slice(2)}` : `${monthLabel} '${year.slice(2)}`
}

/**
 * Draws the amounts per day, month or year as a line or bar chart, with one series per bot.
 *
 * @param props The chart's type, title, totals and range.
 * @returns The chart, or null for an unknown chart type.
 */
const CustomChart = ({ type, chartTitle, days, dateFilter, startDate, endDate }: Props) => {
    const startTime = startDate.getTime()
    const endTime = endDate.getTime()

    // Roll the days up into the chosen grouping. This only reruns when the search or the grouping changes.
    const groups = useMemo(() => {
        const grouping = GROUPINGS[dateFilter] ?? GROUPINGS.day
        const totals = new Map<string, { amountGA: number; amountGAA: number }>()

        // Start with an empty group for every step of the range, so quiet periods still show on the axis.
        for (const cursor = grouping.first(new Date(startTime)); cursor.getTime() <= endTime; grouping.step(cursor)) {
            totals.set(dayKey(cursor).slice(0, grouping.keyLength), { amountGA: 0, amountGAA: 0 })
        }

        for (const day of days) {
            const key = day.day.slice(0, grouping.keyLength)
            const total = totals.get(key) ?? { amountGA: 0, amountGAA: 0 }
            total.amountGA += day.amountGA
            total.amountGAA += day.amountGAA
            totals.set(key, total)
        }

        // The keys are zero-padded, so sorting them as text puts them in date order.
        const keys = [...totals.keys()].sort()
        return {
            labels: keys.map(labelFor),
            valuesGA: keys.map((key) => totals.get(key)!.amountGA),
            valuesGAA: keys.map((key) => totals.get(key)!.amountGAA),
        }
    }, [days, dateFilter, startTime, endTime])

    // Configuration options for customizing the chart.
    const options = useMemo(() => ({ ...chartOptions(chartTitle), scales: { y: { min: 0 } } }), [chartTitle])

    // Data sets with the labels and values to display on the chart. Both chart types use the same series, one color per bot.
    const chartData = useMemo(
        () => ({
            labels: groups.labels,
            datasets: PLATFORMS.map((platform) => ({
                label: platform,
                data: platform === "GA" ? groups.valuesGA : groups.valuesGAA,
                // Bars are drawn solid. Lines get a see-through fill, so the two areas can overlap.
                backgroundColor: type === "bar" ? PLATFORM_COLORS[platform].border : PLATFORM_COLORS[platform].fill,
                borderColor: PLATFORM_COLORS[platform].border,
                fill: type === "line",
            })),
        }),
        [groups, type]
    )

    // Conditional rendering of different chart types.
    if (type === "bar") return <Bar options={options} data={chartData} />
    if (type === "line") return <Line options={options} data={chartData} />
    return null
}

export default CustomChart
