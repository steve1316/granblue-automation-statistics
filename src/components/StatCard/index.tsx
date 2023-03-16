import { Paper, Typography } from "@mui/material"

/** Props for StatCard. */
interface Props {
    /** The short name of the number, shown above it. */
    label: string
    /** The number, already formatted for display. */
    value: string
    /** An optional line of detail shown under the number. */
    detail?: string
}

/**
 * Shows one headline number of the current search.
 *
 * @param props The card's label, value and detail.
 * @returns The card.
 */
const StatCard = ({ label, value, detail }: Props) => {
    return (
        <Paper variant="outlined" sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="overline" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
            {detail ? (
                <Typography variant="caption" color="text.secondary">
                    {detail}
                </Typography>
            ) : null}
        </Paper>
    )
}

export default StatCard
