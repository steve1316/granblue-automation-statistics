import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { ResultInterface } from "../../interfaces/ResultInterface"
import randomColor from "randomcolor"

// Register elements to be used by chartjs.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const CustomChart = ({ type, chartTitle, data, dateFilter }: { type: string; chartTitle: string; data: ResultInterface[]; dateFilter: string }) => {
    const labels: string[] = []
    const dataValuesGA: number[] = []
    const dataValuesGAA: number[] = []
    const barGABackgroundColors: string[] = []
    const barGAABackgroundColors: string[] = []
    let newResults: { [key: string]: any } = {}

    let firstTimeSetup = true

    // Contains the Month names.
    const months: { [key: string]: string } = {
        "1": "January",
        "2": "February",
        "3": "March",
        "4": "April",
        "5": "May",
        "6": "June",
        "7": "July",
        "8": "August",
        "9": "September",
        "10": "October",
        "11": "November",
        "12": "December",
    }

    // Process each result in the data and set up the values and labels for the chart.
    data.forEach((result) => {
        // Destructure the date.
        let date = new Date(result.date)
        let month = date.getMonth() + 1
        let day = date.getDate()
        let year = date.getFullYear()

        // TODO: Add a year selector in preparation for 2023 and to allow viewing of the previous year's data.
        if (year === 2022) {
            if (dateFilter === "month") {
                if (firstTimeSetup) {
                    Object.keys(months).forEach((monthKey) => {
                        // Set up the initial contents of the object for each month.
                        const newKey = `${year}-${monthKey}`
                        newResults[newKey] = { amountGA: 0, amountGAA: 0 }

                        // Setup the labels object for the chart.
                        labels.push(months[monthKey])
                        barGABackgroundColors.push(randomColor())
                        barGAABackgroundColors.push(randomColor())

                        dataValuesGA.push(newResults[newKey].amountGA)
                        dataValuesGAA.push(newResults[newKey].amountGAA)
                    })

                    firstTimeSetup = false
                }

                // Now add the amount value to the month's sum.
                const newKey = `${year}-${month}`
                if (result.platform === "GA") newResults[newKey]["amountGA"] += result.amount
                else if (result.platform === "GAA") newResults[newKey]["amountGAA"] += result.amount

                // Finally, set the summed value amount as the data value for the chart.
                dataValuesGA[month - 1] = newResults[newKey].amountGA
                dataValuesGAA[month - 1] = newResults[newKey].amountGAA
            }
        }
    })

    // Sort the arrays by date.
    const allMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    if (dateFilter === "month") {
        labels.sort((a, b) => {
            return allMonths.indexOf(a) - allMonths.indexOf(b)
        })
    } else if (dateFilter === "day") {
        labels.sort((a, b) => {
            return new Date(a).valueOf() - new Date(b).valueOf()
        })
    } else if (dateFilter === "year") {
        labels.sort()
    }

    // Configuration options for customizing the chart.
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "top" as const,
            },
            title: {
                display: true,
                text: chartTitle,
            },
        },
        scales: { y: { min: 0 } },
        maintainAspectRatio: false,
    }

    // Data set with the labels and values to display on the chart.
    const barData = {
        labels: labels,
        datasets: [
            {
                label: "GA",
                data: dataValuesGA,
                backgroundColor: barGABackgroundColors,
            },
            {
                label: "GAA",
                data: dataValuesGAA,
                backgroundColor: barGAABackgroundColors,
            },
        ],
    }
    const lineData = {
        labels: labels,
        datasets: [
            {
                label: "GA",
                data: dataValuesGA,
                backgroundColor: randomColor(),
                fill: true,
                borderColor: randomColor(),
            },
            {
                label: "GAA",
                data: dataValuesGAA,
                backgroundColor: randomColor(),
                fill: true,
                borderColor: randomColor(),
            },
        ],
    }

    // Conditional rendering of different chart types.
    if (type === "bar") {
        return <Bar options={options} data={barData} />
    } else if (type === "line") {
        return <Line options={options} data={lineData} />
    } else {
        return null
    }
}

export default CustomChart
