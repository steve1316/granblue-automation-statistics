import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { ResultInterface } from "../../interfaces/ResultInterface"
import randomColor from "randomcolor"

// Register elements to be used by chartjs.
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const CustomChart = ({ type, chartTitle, data, dateFilter, startDate, endDate }: { type: string; chartTitle: string; data: ResultInterface[]; dateFilter: string; startDate: Date; endDate: Date }) => {
    interface Element {
        date: Date
        valueGA: number
        valueGAA: number
    }

    const chartElements: Element[] = []
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

    const initialSetup = () => {
        let tempStartDate = new Date(startDate)
        let tempEndDate = new Date(endDate)
        if (dateFilter === "month") {
            if (firstTimeSetup) {
                while (tempStartDate <= tempEndDate) {
                    let startMonth = tempStartDate.getMonth() + 1
                    const newKey = `${tempStartDate.getFullYear()}-${startMonth}`
                    newResults[newKey] = { amountGA: 0, amountGAA: 0 }

                    chartElements.push({ date: new Date(tempStartDate), valueGA: newResults[newKey].amountGA, valueGAA: newResults[newKey].amountGAA })
                    barGABackgroundColors.push(randomColor())
                    barGAABackgroundColors.push(randomColor())

                    tempStartDate.setMonth(tempStartDate.getMonth() + 1)
                }
            }
        } else if (dateFilter === "day") {
            if (firstTimeSetup) {
                while (tempStartDate <= tempEndDate) {
                    let startMonth = tempStartDate.getMonth() + 1
                    let startDay = tempStartDate.getDate()
                    const newKey = `${tempStartDate.getFullYear()}-${startMonth}-${startDay}`
                    newResults[newKey] = { amountGA: 0, amountGAA: 0 }

                    chartElements.push({ date: new Date(tempStartDate), valueGA: newResults[newKey].amountGA, valueGAA: newResults[newKey].amountGAA })
                    barGABackgroundColors.push(randomColor())
                    barGAABackgroundColors.push(randomColor())

                    tempStartDate.setDate(tempStartDate.getDate() + 1)
                }
            }
        } else {
            if (firstTimeSetup) {
                while (tempStartDate.getFullYear() <= tempEndDate.getFullYear()) {
                    const newKey = `${tempStartDate.getFullYear()}`
                    newResults[newKey] = { amountGA: 0, amountGAA: 0 }

                    chartElements.push({ date: new Date(tempStartDate), valueGA: newResults[newKey].amountGA, valueGAA: newResults[newKey].amountGAA })
                    barGABackgroundColors.push(randomColor())
                    barGAABackgroundColors.push(randomColor())

                    tempStartDate.setFullYear(tempStartDate.getFullYear() + 1)
                }
            }
        }

        firstTimeSetup = false
    }

    if (data.length === 0) {
        initialSetup()
    }

    // Process each result in the data and set up the values and labels for the chart.
    data.forEach((result) => {
        // Destructure the date.
        let resultDate = new Date(result.date)
        let resultMonth = resultDate.getMonth() + 1
        let resultDay = resultDate.getDate()
        let resultYear = resultDate.getFullYear()

        if (resultDate < startDate) return

        if (dateFilter === "month") {
            initialSetup()

            // Now add the amount value to the month's sum.
            const newKey = `${resultYear}-${resultMonth}`
            if (result.platform === "GA") newResults[newKey]["amountGA"] += result.amount
            else if (result.platform === "GAA") newResults[newKey]["amountGAA"] += result.amount

            let index = chartElements.findIndex((element) => element.date.getMonth() === resultDate.getMonth() && element.date.getFullYear() === resultDate.getFullYear())
            chartElements[index].valueGA = newResults[newKey].amountGA
            chartElements[index].valueGAA = newResults[newKey].amountGAA
        } else if (dateFilter === "day") {
            initialSetup()

            // Now add the amount value to the day's sum.
            const newKey = `${resultYear}-${resultMonth}-${resultDay}`
            if (result.platform === "GA") newResults[newKey]["amountGA"] += result.amount
            else if (result.platform === "GAA") newResults[newKey]["amountGAA"] += result.amount

            let index = chartElements.findIndex(
                (element) => element.date.getMonth() === resultDate.getMonth() && element.date.getDate() === resultDate.getDate() && element.date.getFullYear() === resultDate.getFullYear()
            )
            chartElements[index].valueGA = newResults[newKey].amountGA
            chartElements[index].valueGAA = newResults[newKey].amountGAA
        } else if (dateFilter === "year") {
            initialSetup()

            const newKey = `${resultYear}`
            if (result.platform === "GA") newResults[newKey]["amountGA"] += result.amount
            else if (result.platform === "GAA") newResults[newKey]["amountGAA"] += result.amount

            let index = chartElements.findIndex((element) => element.date.getFullYear() === resultDate.getFullYear())
            chartElements[index].valueGA = newResults[newKey].amountGA
            chartElements[index].valueGAA = newResults[newKey].amountGAA
        }
    })

    // Sort the arrays by date.
    if (dateFilter === "month") {
        chartElements.sort((ele1, ele2) => {
            return ele1.date.getTime() - ele2.date.getTime()
        })
    } else if (dateFilter === "day") {
        chartElements.sort((ele1, ele2) => {
            return ele1.date.getTime() - ele2.date.getTime()
        })
    } else if (dateFilter === "year") {
        chartElements.sort((ele1, ele2) => {
            return ele1.date.getFullYear() - ele2.date.getFullYear()
        })
    }

    // Create the labels and values arrays to display now that everything is all sorted.
    const labels: string[] = []
    const dataValuesGA: number[] = []
    const dataValuesGAA: number[] = []
    chartElements.forEach((ele) => {
        let month = months[ele.date.getMonth() + 1]
        if (dateFilter === "month") {
            labels.push(`${month[0]}${month[1]}${month[2]} '${ele.date.getFullYear().toString()[2]}${ele.date.getFullYear().toString()[3]}`)
        } else if (dateFilter === "day") {
            labels.push(`${month[0]}${month[1]}${month[2]} ${ele.date.getDate()} '${ele.date.getFullYear().toString()[2]}${ele.date.getFullYear().toString()[3]}`)
        } else {
            labels.push(`${ele.date.getFullYear()}`)
        }
        dataValuesGA.push(ele.valueGA)
        dataValuesGAA.push(ele.valueGAA)
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
