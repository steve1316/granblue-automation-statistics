import randomColor from "randomcolor"
import { Chart as ChartJS } from "chart.js"

// One fixed color per bot, so GA and GAA read the same in every chart.
export const PLATFORM_COLORS = {
    GA: { fill: "rgba(100, 181, 246, 0.35)", border: "#64b5f6" },
    GAA: { fill: "rgba(255, 183, 77, 0.35)", border: "#ffb74d" },
}

// The charts sit on the Dashboard's dark background, so their text and grid lines are light.
ChartJS.defaults.color = "rgba(255, 255, 255, 0.7)"
ChartJS.defaults.borderColor = "rgba(255, 255, 255, 0.12)"

/**
 * Picks a chart color for a name. The same name always gets the same color, so a chart keeps its colors between renders and
 * between visits.
 *
 * @param name What the color is for, e.g. a mission name.
 * @returns The color as a hex string.
 */
export const colorFor = (name: string): string => {
    // randomColor only adds up the character codes of a text seed, so "Jan 12" and "Jan 21" would share a color. Hash the name instead.
    let hash = 2166136261
    for (let index = 0; index < name.length; index++) {
        hash = Math.imul(hash ^ name.charCodeAt(index), 16777619)
    }

    return randomColor({ seed: hash >>> 0 })
}

/**
 * Builds the options every chart on the site shares: a title above the chart, the legend on top, and a size that follows its container.
 *
 * @param title The title shown above the chart.
 * @returns The Chart.js options.
 */
export const chartOptions = (title: string) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const }, title: { display: true, text: title } },
})
