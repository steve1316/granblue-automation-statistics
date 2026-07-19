import { useMemo } from "react"
import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { chartOptions, colorFor } from "../../lib/charts"
import { SummaryMission } from "../../lib/results"

// Register elements to be used by chartjs.
ChartJS.register(ArcElement, Title, Tooltip, Legend)

// The single slice shown when a search matched nothing.
const EMPTY_LABEL = "None"

// How many missions get their own slice. The rest are added up into one "Other" slice, so the pie stays readable.
const SLICE_LIMIT = 8
const OTHER_LABEL = "Other"

// The empty and "Other" slices are not one mission, so they get a quiet gray instead of a mission color.
const NEUTRAL_COLOR = "#616161"

/** Props for CustomPie. */
interface Props {
    /** The title shown above the chart. */
    chartTitle: string
    /** Totals per mission for the current search, largest first. */
    missions: SummaryMission[]
}

/**
 * Draws how the amounts of a search are spread over its missions as a pie chart.
 *
 * @param props The chart's title and totals.
 * @returns The pie chart.
 */
const CustomPie = ({ chartTitle, missions }: Props) => {
    // Configuration options for customizing the chart.
    const options = useMemo(() => chartOptions(chartTitle), [chartTitle])

    // Data set with the labels and values to display on the chart. Each mission keeps its own color from one search to the next.
    const pieData = useMemo(() => {
        const slices = missions.slice(0, SLICE_LIMIT).map((mission) => ({ label: mission.mission, amount: mission.amount, color: colorFor(mission.mission) }))
        const other = missions.slice(SLICE_LIMIT).reduce((total, mission) => total + mission.amount, 0)
        if (other > 0) slices.push({ label: OTHER_LABEL, amount: other, color: NEUTRAL_COLOR })
        if (slices.length === 0) slices.push({ label: EMPTY_LABEL, amount: 0, color: NEUTRAL_COLOR })

        return {
            labels: slices.map((slice) => slice.label),
            datasets: [
                {
                    label: "Distribution of runs",
                    data: slices.map((slice) => slice.amount),
                    backgroundColor: slices.map((slice) => slice.color),
                    borderWidth: 1,
                },
            ],
        }
    }, [missions])

    return <Pie options={options} data={pieData} />
}

export default CustomPie
