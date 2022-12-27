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

    const initialSetup = (resultYear: number = -1) => {
        let now = new Date()
        if (dateFilter === "month") {
            if (firstTimeSetup) {
                Object.keys(months).forEach((monthKey) => {
                    // Set up the initial contents of the object for each month.
                    const newKey = `${resultYear !== -1 ? resultYear : now.getFullYear()}-${monthKey}`
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
        } else if (dateFilter === "day") {
            if (firstTimeSetup) {
                let currentDate = new Date()
                let currentMonth = currentDate.getMonth() + 1

                // Iterate through the days of the current month until the last day is reached.
                let iterativeDate = new Date()
                const totalDaysInCurrentMonth: number = new Date(iterativeDate.getFullYear(), currentMonth, 0).getDate()
                let days: number[] = []
                var i = 1
                while (i <= totalDaysInCurrentMonth) {
                    days.push(i)
                    i++
                }

                // Set up the initial contents of the object for the current month of each day.
                days.forEach((dayElement) => {
                    const newKey = `${resultYear !== -1 ? resultYear : now.getFullYear()}-${currentMonth}-${dayElement - 1}`
                    newResults[newKey] = { amountGA: 0, amountGAA: 0 }

                    // Setup the labels object for the chart.
                    labels.push(currentMonth + "-" + dayElement)
                    barGABackgroundColors.push(randomColor())
                    barGAABackgroundColors.push(randomColor())

                    dataValuesGA.push(newResults[newKey].amountGA)
                    dataValuesGAA.push(newResults[newKey].amountGAA)
                })

                firstTimeSetup = false
            }
        }
    }

    if (data.length === 0) {
        initialSetup()
    }

    // Process each result in the data and set up the values and labels for the chart.
    data.forEach((result) => {
        // Destructure the date.
        let resultDate = new Date(result.date)
        let resultMonth = resultDate.getMonth() + 1
        let resultDay = resultDate.getDate() - 1
        let resultYear = resultDate.getFullYear()

        // TODO: Add a year selector in preparation for 2023 and to allow viewing of the previous year's data.
        if (resultYear === 2022) {
            if (dateFilter === "month") {
                initialSetup(resultYear)

                // Now add the amount value to the month's sum.
                const newKey = `${resultYear}-${resultMonth}`
                if (result.platform === "GA") newResults[newKey]["amountGA"] += result.amount
                else if (result.platform === "GAA") newResults[newKey]["amountGAA"] += result.amount

                // Finally, set the summed value amount as the data value for the chart.
                dataValuesGA[resultMonth - 1] = newResults[newKey].amountGA
                dataValuesGAA[resultMonth - 1] = newResults[newKey].amountGAA
            } else if (dateFilter === "day") {
                let currentDate = new Date()
                let currentMonth = currentDate.getMonth() + 1

                initialSetup(resultYear)

                const newKey = `${resultYear}-${currentMonth}-${resultDay}`
                if (result.platform === "GA" && currentMonth === resultMonth) newResults[newKey]["amountGA"] += result.amount
                else if (result.platform === "GAA" && currentMonth === resultMonth) newResults[newKey]["amountGAA"] += result.amount

                // Finally, set the summed value amount as the data value for the chart.
                dataValuesGA[resultDay] = newResults[newKey].amountGA
                dataValuesGAA[resultDay] = newResults[newKey].amountGAA
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
