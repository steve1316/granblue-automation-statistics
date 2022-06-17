import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { ResultInterface } from "../../interfaces/ResultInterface"
import randomColor from "randomcolor"

// Register elements to be used by chartjs.
ChartJS.register(ArcElement, Title, Tooltip, Legend)

const CustomPie = ({ chartTitle, data, dateFilter, showOnlyMissions }: { chartTitle: string; data: ResultInterface[]; dateFilter: string; showOnlyMissions: boolean | null }) => {
    const labels: string[] = []
    const values: number[] = []
    const backgroundColors: string[] = []
    var dataValuesIndex = 0
    let newResults: { [key: string]: any } = {}

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
                    newResults[year]["amount"] += result.amount
                    newResults[year][month]["amount"] += result.amount
                    newResults[year][month][day]["amount"] += result.amount
                } else {
                    // Day does not exist in object so create it and increment the year and month totals.
                    newResults[year][month][day] = {
                        amount: result.amount,
                    }

                    newResults[year]["amount"] += result.amount
                    newResults[year][month]["amount"] += result.amount
                }
            } else {
                // Month does not exist in object so create it.
                newResults[year][month] = {
                    amount: result.amount,
                }

                // Create the day in object as well.
                newResults[year][month][day] = {
                    amount: result.amount,
                }

                // Now increment the existing total for the year.
                newResults[year]["amount"] += newResults[year][month][day]["amount"]
            }
        } else {
            // Year does not exist in object so create it.
            newResults[year] = {
                amount: result.amount,
            }

            // Create the month in object as well.
            newResults[year][month] = {
                amount: result.amount,
            }

            // Create the day in object as well.
            newResults[year][month][day] = {
                amount: result.amount,
            }
        }

        // Now populate the values based on the date filter. If an existing date exists, then replace the value as the sums for that same date were already calculated above.
        if (dateFilter === "year") {
            if (labels.indexOf(showOnlyMissions ? result.mission : result.itemName) === -1) {
                labels.push(showOnlyMissions ? result.mission : result.itemName)
                backgroundColors.push(randomColor())
                values.push(newResults[year].amount)
                dataValuesIndex += 1
            } else {
                values[dataValuesIndex - 1] = newResults[year].amount
            }
        } else if (dateFilter === "month") {
            if (labels.indexOf(showOnlyMissions ? result.mission : result.itemName) === -1) {
                labels.push(showOnlyMissions ? result.mission : result.itemName)
                backgroundColors.push(randomColor())
                values.push(newResults[year][month].amount)
                dataValuesIndex += 1
            } else {
                values[dataValuesIndex - 1] = newResults[year][month].amount
            }
        } else if (dateFilter === "day") {
            if (labels.indexOf(showOnlyMissions ? result.mission : result.itemName) === -1) {
                labels.push(showOnlyMissions ? result.mission : result.itemName)
                backgroundColors.push(randomColor())
                values.push(newResults[year][month][day].amount)
                dataValuesIndex += 1
            } else {
                values[dataValuesIndex - 1] = newResults[year][month][day].amount
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
        maintainAspectRatio: false,
    }

    // Data set with the labels and values to display on the chart.
    const pieData = {
        labels: labels,
        datasets: [
            {
                label: "Distribution of runs",
                data: values,
                backgroundColor: backgroundColors,
                borderWidth: 1,
            },
        ],
    }

    return <Pie options={options} data={pieData} />
}

export default CustomPie
