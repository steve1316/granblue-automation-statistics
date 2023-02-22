import { Chart as ChartJS, ArcElement, Title, Tooltip, Legend } from "chart.js"
import { Pie } from "react-chartjs-2"
import { ResultInterface } from "../../interfaces/ResultInterface"
import randomColor from "randomcolor"

// Register elements to be used by chartjs.
ChartJS.register(ArcElement, Title, Tooltip, Legend)

const CustomPie = ({ chartTitle, data }: { chartTitle: string; data: ResultInterface[] }) => {
    const labels: string[] = []
    const values: number[] = []
    const backgroundColors: string[] = []

    if (data.length === 0) {
        labels.push("None")
        values.push(0)
        backgroundColors.push(randomColor())
    } else {
        data.forEach((result) => {
            const resultYear = new Date(result.date).getFullYear()
            const itemName = result.itemName
            if (!labels.includes(itemName)) {
                labels.push(itemName)
                values.push(0)
                backgroundColors.push(randomColor())
            }

            const newKey = `${result.itemName}`
            values[labels.indexOf(newKey)] += result.amount
        })
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
