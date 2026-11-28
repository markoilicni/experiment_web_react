import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'

/**
 * Turns TanStack's sort flag into a phrase for the accessible name.
 * @param sort - Current sort on this column, or false when unsorted.
 * @returns A short English direction label.
 */
function sortDirectionLabel(sort: false | 'asc' | 'desc') {
  if (sort === 'asc') {
    return 'ascending'
  }
  if (sort === 'desc') {
    return 'descending'
  }
  return 'not sorted'
}

/**
 * Picks the arrow that matches the current sort direction.
 * @param props.sort - Current sort on this column, or false when unsorted.
 * @returns The MUI icon for that direction.
 */
function SortIcon({ sort }: { sort: false | 'asc' | 'desc' }) {
  if (sort === 'asc') {
    return <ArrowUpwardIcon fontSize="small" aria-hidden />
  }
  if (sort === 'desc') {
    return <ArrowDownwardIcon fontSize="small" aria-hidden />
  }
  return <UnfoldMoreIcon fontSize="small" aria-hidden />
}

/**
 * Header label plus sort arrows. Looks like plain header text; only the icon
 * marks the column as sortable (no default button chrome).
 * @param props.label - Column title shown next to the icon.
 * @param props.sort - Current sort on this column, or false when unsorted.
 * @param props.onToggle - Cycles sort when the control is activated.
 * @returns An unstyled button that matches neighboring header cells.
 */
export function SortButton({
  label,
  sort,
  onToggle,
}: {
  label: string
  sort: false | 'asc' | 'desc'
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent p-0 text-sm font-medium text-slate-700"
      aria-label={`${label}, ${sortDirectionLabel(sort)}`}
      onClick={onToggle}
    >
      {label}
      <SortIcon sort={sort} />
    </button>
  )
}
