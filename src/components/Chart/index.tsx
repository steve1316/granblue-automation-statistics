import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement } from "chart.js"
import { Bar, Line } from "react-chartjs-2"
import { ResultInterface } from "../../interfaces/ResultInterface"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

const Chart = ({ type, chartTitle, data }: { type: string; chartTitle: string; data: ResultInterface[] }) => {
    const labels: string[] = []
    const dataValuesGA: number[] = []
    const dataValuesGAA: number[] = []
    const colors: { [key: string]: string[] } = {
        bar: ["rgba(255, 99, 132, 0.5)", "rgba(53, 162, 235, 0.5)"],
    }

    data.forEach((result) => {
        if (
            result.userID &&
            result.itemName &&
            result.date &&
            result.amount &&
            result.platform &&
            typeof result.userID === "string" &&
            typeof result.itemName === "string" &&
            typeof result.date === "string" &&
            typeof result.amount === "number" &&
            typeof result.platform === "string"
        ) {
            if (result.platform === "GA") {
                dataValuesGA.push(result.amount)
            } else if (result.platform === "GAA") {
                dataValuesGAA.push(result.amount)
            }

            labels.push(result.date)
        }
    })

    const dataSet = {
        labels: labels,
        datasets: [
            {
                label: "GA",
                data: dataValuesGA,
                borderColor: "green",
                backgroundColor: colors[type] ? colors[type][0] : "white",
            },
            {
                label: "GAA",
                data: dataValuesGAA,
                borderColor: "red",
                backgroundColor: colors[type] ? colors[type][1] : "white",
            },
        ],
    }

    if (type === "bar") {
        return (
            <Bar
                options={{
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
                }}
                data={dataSet}
            />
        )
    } else if (type === "line") {
        return (
            <Line
                options={{
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
                }}
                data={dataSet}
            />
        )
    } else {
        return null
    }
}

export default Chart
