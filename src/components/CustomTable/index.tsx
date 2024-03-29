import React, { useEffect, useState } from "react"
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
import { Theme, Typography } from "@mui/material"

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
        id: "elapsedTime",
        numeric: false,
        disablePadding: true,
        label: "Elapsed Time*",
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

const CustomTable = ({ rows, refreshDate }: { rows: ResultInterface[]; refreshDate: Date }) => {
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
        tableFooterNotes: {
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            paddingLeft: "12px",
            paddingBottom: "12px",
        },
    }))

    const classes = useStyles()

    const [order, setOrder] = useState<Order>("desc")
    const [orderBy, setOrderBy] = useState<keyof ResultInterface>("date")
    const [page, setPage] = useState(0)
    const [dense, setDense] = useState(localStorage.getItem("dense") !== null ? Boolean(localStorage.getItem("dense")) : false)
    const [rowsPerPage, setRowsPerPage] = useState(100)

    useEffect(() => {
        let newOrder = localStorage.getItem("order") as Order
        if (newOrder !== null) {
            setOrder(newOrder)
        }

        let newRowsPerPage = localStorage.getItem("rowsPerPage")
        if (newRowsPerPage !== null) {
            try {
                setRowsPerPage(Number.parseInt(newRowsPerPage))
            } catch {}
        }
    }, [])

    useEffect(() => {
        localStorage.setItem("dense", dense.toString())
    }, [dense])

    useEffect(() => {
        localStorage.setItem("rowsPerPage", rowsPerPage.toString())
    }, [rowsPerPage])

    useEffect(() => {
        localStorage.setItem("order", order.toString())
    }, [order])

    // Adjust the ordering of the column according to the provided property key.
    const handleRequestSort = (event: React.MouseEvent<unknown>, property: keyof ResultInterface) => {
        const isAsc = orderBy === property && order === "asc"
        setOrder(isAsc ? "desc" : "asc")
        setOrderBy(property)
    }

    return (
        <Box>
            <Paper sx={{ width: "100%" }}>
                <TableContainer sx={{ height: 500 }}>
                    <Table size={dense ? "small" : "medium"} stickyHeader>
                        <EnhancedTableHead order={order} orderBy={orderBy} onRequestSort={handleRequestSort} />
                        <TableBody sx={{ height: "max-content" }}>
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
                                            <TableCell>{row.elapsedTime}</TableCell>
                                            <TableCell>{row.itemName}</TableCell>
                                            <TableCell>{row.amount}</TableCell>
                                            <TableCell>{row.farmingMode}</TableCell>
                                            <TableCell>{row.mission}</TableCell>
                                            <TableCell>{row.platform}</TableCell>
                                        </TableRow>
                                    )
                                })}
                        </TableBody>
                    </Table>
                </TableContainer>
                <div className={classes.tableFooter}>
                    <FormControlLabel control={<Switch checked={dense} onChange={(e) => setDense(e.target.checked)} />} label="Dense padding" />
                    <TablePagination
                        rowsPerPageOptions={[5, 10, 25, 50, 100, 250]}
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
                <div className={classes.tableFooterNotes}>
                    <Typography fontSize={12}>Data last updated on: {refreshDate.toString()}</Typography>
                    <Typography fontSize={12}>
                        * Time it takes from the start of a run to when the Loot Collection process completes. A time of 0:00:00 means that the result came from a Pending Battle.
                    </Typography>
                </div>
            </Paper>
        </Box>
    )
}

export default CustomTable
