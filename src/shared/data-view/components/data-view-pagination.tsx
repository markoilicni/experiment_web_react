import TablePagination from '@mui/material/TablePagination'
import { PAGE_SIZE_OPTIONS } from '@/shared/data-view/components/pagination-config'

type DataViewPaginationProps = {
  /** Zero-based page currently shown. */
  page: number
  /** How many top-level rows one page holds. */
  pageSize: number
  /** How many rows exist across all pages. */
  totalCount: number
  /** Called with the next zero-based page. */
  onPageChange: (page: number) => void
  /** Called with the next page size. The parent resets to page 0. */
  onPageSizeChange: (pageSize: number) => void
}

/**
 * Page controls for the data view. Lives beside the table and cards, not inside a row.
 * @param props - Current page state and the callbacks that update it.
 * @returns The MUI pager under the current page of rows.
 */
export function DataViewPagination({
  page,
  pageSize,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: DataViewPaginationProps) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white shadow-sm">
      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={(_event, nextPage) => onPageChange(nextPage)}
        rowsPerPage={pageSize}
        onRowsPerPageChange={(event) => {
          onPageSizeChange(Number(event.target.value))
        }}
        rowsPerPageOptions={PAGE_SIZE_OPTIONS}
      />
    </div>
  )
}
