import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material"

/** One column of a TopTable. */
export interface TopColumn<T> {
    /** The column heading. */
    label: string
    /** Turns a row into the text shown in this column. */
    value: (row: T) => string
    /** Whether the column holds numbers, which are right-aligned. */
    numeric?: boolean
}

/** Props for TopTable. */
interface Props<T> {
    /** The heading shown above the table. */
    title: string
    /** The columns, left to right. */
    columns: TopColumn<T>[]
    /** The rows, already sorted and cut to length. */
    rows: T[]
    /** Turns a row into its React key. */
    rowKey: (row: T) => string
}

/**
 * Shows a short ranked list, such as the top missions or items of a search.
 *
 * @param props The table's title, columns and rows.
 * @returns The table.
 */
const TopTable = <T,>({ title, columns, rows, rowKey }: Props<T>) => {
    return (
        <Paper variant="outlined" sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="subtitle1" gutterBottom>
                {title}
            </Typography>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            {columns.map((column) => (
                                <TableCell key={column.label} align={column.numeric ? "right" : "left"}>
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length}>
                                    <Typography variant="body2" color="text.secondary">
                                        No runs match this search.
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            rows.map((row) => (
                                <TableRow key={rowKey(row)} hover>
                                    {columns.map((column) => (
                                        <TableCell key={column.label} align={column.numeric ? "right" : "left"}>
                                            {column.value(row)}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    )
}

export default TopTable
