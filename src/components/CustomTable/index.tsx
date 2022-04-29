import React, { useState } from "react"
import Box from "@mui/material/Box"
import Table from "@mui/material/Table"
import TableBody from "@mui/material/TableBody"
import TableCell from "@mui/material/TableCell"
import TableContainer from "@mui/material/TableContainer"
import TableHead from "@mui/material/TableHead"
import TablePagination from "@mui/material/TablePagination"
import TableRow from "@mui/material/TableRow"
import TableSortLabel from "@mui/material/TableSortLabel"
import Paper from "@mui/material/Paper"
import FormControlLabel from "@mui/material/FormControlLabel"
import Switch from "@mui/material/Switch"
import { ResultInterface } from "../../interfaces/ResultInterface"
import makeStyles from "@mui/styles/makeStyles"
import { Theme } from "@mui/material"

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1
    }
    if (b[orderBy] > a[orderBy]) {
        return 1
    }
    return 0
}

type Order = "asc" | "desc"

function getComparator<Key extends keyof any>(order: Order, orderBy: Key): (a: { [key in Key]: number | string }, b: { [key in Key]: number | string }) => number {
    return order === "desc" ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy)
}

interface HeadCell {
    id: keyof ResultInterface
    numeric: boolean
    disablePadding: boolean
    label: string
}

const headCells: readonly HeadCell[] = [
    {
        id: "date",
        numeric: false,
        disablePadding: true,
        label: "Date",
    },
    {
        id: "itemName",
        numeric: true,
        disablePadding: false,
        label: "Item",
    },
    {
        id: "amount",
        numeric: true,
        disablePadding: false,
        label: "#",
    },
    {
        id: "farmingMode",
        numeric: true,
        disablePadding: false,
        label: "Farming Mode",
    },
    {
        id: "mission",
        numeric: true,
        disablePadding: false,
        label: "Mission",
    },
    {
        id: "platform",
        numeric: true,
        disablePadding: false,
        label: "Platform",
    },
]

interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ResultInterface) => void
    order: Order
    orderBy: string
}

// Custom header component to facilitate sorting.
function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } = props

    const createSortHandler = (property: keyof ResultInterface) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property)
    }

    return (
        <TableHead>
            <TableRow>
                <TableCell sx={{ backgroundColor: "gray" }} />
                {headCells.map((headCell) => (
                    <TableCell
                        sx={{ backgroundColor: "gray", color: "white" }}
                        key={headCell.id}
                        padding={headCell.disablePadding ? "none" : "normal"}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel active={orderBy === headCell.id} direction={orderBy === headCell.id ? order : "asc"} onClick={createSortHandler(headCell.id)}>
                            {headCell.label}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    )
}

const CustomTable = ({ rows }: { rows: ResultInterface[] }) => {
    const useStyles = makeStyles((theme: Theme) => ({
        tableFooter: {
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingLeft: "12px",
            [theme.breakpoints.down("sm")]: {
                flexDirection: "column",
            },
        },
    }))

    const classes = useStyles()

    const [order, setOrder] = useState<Order>("asc")
    const [orderBy, setOrderBy] = useState<keyof ResultInterface>("date")
    const [page, setPage] = useState(0)
    const [dense, setDense] = useState(false)
    const [rowsPerPage, setRowsPerPage] = useState(5)

    // Adjust the ordering of the column according to the provided property key.
    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ResultInterface) => {
        const isAsc = orderBy === property && order === "asc"
        setOrder(isAsc ? "desc" : "asc")
        setOrderBy(property)
    }

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0

    return (
        <Box>
            <Paper sx={{ width: "100%" }}>
                <TableContainer>
                    <Table size={dense ? "small" : "medium"}>
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                        <TableBody>
                            {rows
                                .sort(getComparator(order, orderBy))
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((row, index) => {
                                    const labelId = `enhanced-table-checkbox-${index}`
                                    const date = new Date(row.date).toLocaleString()
                                    return (
                                        <TableRow hover tabIndex={-1} key={row.itemName + "-" + index}>
                                            <TableCell />
                                            <TableCell component="th" id={labelId} scope="row" padding="none">
                                                {date}
                                            </TableCell>
                                            <TableCell>{row.itemName}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>{row.farmingMode}</TableCell>
                                            <TableCell>{row.mission}</TableCell>
                                            <TableCell>{row.platform}</TableCell>
                                        </TableRow>
                                    )
                                })}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: (dense ? 33 : 53) * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className={classes.tableFooter}>
                    <FormControlLabel control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />} label="Dense padding" />
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={rows.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                            setRowsPerPage(parseInt(e.target.value, 10))
                            setPage(0)
                        }}
                    />
                </div>
            </Paper>
        </Box>
    )
}

export default CustomTable
