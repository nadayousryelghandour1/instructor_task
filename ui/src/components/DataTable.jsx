import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

// columns: [{ key, header, render?(row), align?, width? }]
// emptyState: element shown under the header when there are no rows.
export default function DataTable({ columns, rows, getRowKey, loading = false, emptyState }) {
  return (
    <TableContainer
      sx={{ border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align} sx={{ width: column.width }}>
                {column.header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {loading
            ? Array.from({ length: 4 }, (_, index) => (
                <TableRow key={index}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      <Skeleton />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow key={getRowKey(row)} hover>
                  {columns.map((column) => (
                    <TableCell key={column.key} align={column.align}>
                      {column.render ? column.render(row) : row[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!loading && rows.length === 0 && emptyState}
    </TableContainer>
  );
}
