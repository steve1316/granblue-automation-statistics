import section1Img from "../../assets/images/svgMultipleDevices.svg"
import section2Img from "../../assets/images/svgChartsAndGraphs.svg"

export interface Section {
    id: string
    lightBg: boolean
    topLine: string
    headLine: string
    description: string
    img: string
    imgStart: boolean
    imgWidth: string
    imgHeight: string
    alt: string
    svgPattern: boolean
}

export const section1: Section = {
    id: "about",
    lightBg: false,
    topLine: "Currently supports 2 versions",
    headLine: "Windows and Android Devices",
    description: "View their respective repositories on GitHub for instructions on how to opt-in. Links are at the bottom of the page.",
    img: section1Img,
    imgStart: false,
    imgWidth: "400px",
    imgHeight: "500px",
    alt: "PC and Android Devices",
    svgPattern: false,
}

export const section2: Section = {
    id: "optional",
    lightBg: true,
    topLine: "Completely optional",
    headLine: "Optional submission of stats to MongoDB",
    description: "All stats collected by MongoDB does not contain any identifiable information.",
    img: section2Img,
    imgStart: true,
    imgWidth: "400px",
    imgHeight: "500px",
    alt: "Statistics",
    svgPattern: true,
}
