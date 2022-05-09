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
    var dataValuesIndex = 0
    let newResults: { [key: string]: any } = {}

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
        let month = (date.getMonth() + 1).toString()
        let day = date.getDate().toString()
        let year = date.getFullYear().toString()

        if (newResults[year]) {
            if (newResults[year][month]) {
                if (newResults[year][month][day]) {
                    // Increment the year, month and day amounts.
                    if (result.platform === "GA") {
                        newResults[year]["amountGA"] += result.amount
                        newResults[year][month]["amountGA"] += result.amount
                        newResults[year][month][day]["amountGA"] += result.amount
                    } else if (result.platform === "GAA") {
                        newResults[year]["amountGAA"] += result.amount
                        newResults[year][month]["amountGAA"] += result.amount
                        newResults[year][month][day]["amountGAA"] += result.amount
                    }
                } else {
                    // Day does not exist in object so create it and increment the year and month totals.
                    if (result.platform === "GA") {
                        newResults[year][month][day] = {
                            amountGA: result.amount,
                            amountGAA: 0,
                        }

                        newResults[year]["amountGA"] += result.amount
                        newResults[year][month]["amountGA"] += result.amount
                    } else if (result.platform === "GAA") {
                        newResults[year][month][day] = {
                            amountGA: 0,
                            amountGAA: result.amount,
                        }

                        newResults[year]["amountGAA"] += result.amount
                        newResults[year][month]["amountGAA"] += result.amount
                    }
                }
            } else {
                // Month does not exist in object so create it.
                newResults[year][month] = {
                    amountGA: result.platform === "GA" ? result.amount : 0,
                    amountGAA: result.platform === "GAA" ? result.amount : 0,
                }

                // Create the day in object as well.
                newResults[year][month][day] = {
                    amountGA: result.platform === "GA" ? result.amount : 0,
                    amountGAA: result.platform === "GAA" ? result.amount : 0,
                }

                // Now increment the existing total for the year.
                newResults[year]["amountGA"] += newResults[year][month][day]["amountGA"]
                newResults[year]["amountGAA"] += newResults[year][month][day]["amountGAA"]
            }
        } else {
            // Year does not exist in object so create it.
            newResults[year] = {
                amountGA: result.platform === "GA" ? result.amount : 0,
                amountGAA: result.platform === "GAA" ? result.amount : 0,
            }

            // Create the month in object as well.
            newResults[year][month] = {
                amountGA: result.platform === "GA" ? result.amount : 0,
                amountGAA: result.platform === "GAA" ? result.amount : 0,
            }

            // Create the day in object as well.
            newResults[year][month][day] = {
                amountGA: result.platform === "GA" ? result.amount : 0,
                amountGAA: result.platform === "GAA" ? result.amount : 0,
            }
        }

        // Now populate the values based on the date filter. If an existing date exists, then replace the value as the sums for that same date were already calculated above.
        if (dateFilter === "year") {
            if (labels.indexOf(year) === -1) {
                labels.push(year)
                barGABackgroundColors.push(randomColor())
                barGAABackgroundColors.push(randomColor())
                dataValuesGA.push(newResults[year].amountGA)
                dataValuesGAA.push(newResults[year].amountGAA)
                dataValuesIndex += 1
            } else {
                dataValuesGA[dataValuesIndex - 1] = newResults[year].amountGA
                dataValuesGAA[dataValuesIndex - 1] = newResults[year].amountGAA
            }
        } else if (dateFilter === "month") {
            if (labels.indexOf(months[month]) === -1) {
                labels.push(months[month])
                barGABackgroundColors.push(randomColor())
                barGAABackgroundColors.push(randomColor())
                dataValuesGA.push(newResults[year][month].amountGA)
                dataValuesGAA.push(newResults[year][month].amountGAA)
                dataValuesIndex += 1
            } else {
                dataValuesGA[dataValuesIndex - 1] = newResults[year][month].amountGA
                dataValuesGAA[dataValuesIndex - 1] = newResults[year][month].amountGAA
            }
        } else if (dateFilter === "day") {
            if (labels.indexOf(months[month] + " " + day) === -1) {
                labels.push(months[month] + " " + day)
                barGABackgroundColors.push(randomColor())
                barGAABackgroundColors.push(randomColor())
                dataValuesGA.push(newResults[year][month][day].amountGA)
                dataValuesGAA.push(newResults[year][month][day].amountGAA)
                dataValuesIndex += 1
            } else {
                dataValuesGA[dataValuesIndex - 1] = newResults[year][month][day].amountGA
                dataValuesGAA[dataValuesIndex - 1] = newResults[year][month][day].amountGAA
            }
        }
    })

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
                borderColor: randomColor(),
                backgroundColor: barGABackgroundColors,
            },
            {
                label: "GAA",
                data: dataValuesGAA,
                borderColor: randomColor(),
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
                borderColor: randomColor(),
                backgroundColor: randomColor(),
            },
            {
                label: "GAA",
                data: dataValuesGAA,
                borderColor: randomColor(),
                backgroundColor: randomColor(),
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
