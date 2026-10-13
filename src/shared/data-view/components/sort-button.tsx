import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore'

function sortDirectionLabel(sort: false | 'asc' | 'desc') {
  if (sort === 'asc') {
    return 'ascending'
  }
  if (sort === 'desc') {
    return 'descending'
  }
  return 'not sorted'
}

function SortIcon({ sort }: { sort: false | 'asc' | 'desc' }) {
  if (sort === 'asc') {
    return <ArrowUpwardIcon fontSize="small" aria-hidden />
  }
  if (sort === 'desc') {
    return <ArrowDownwardIcon fontSize="small" aria-hidden />
  }
  return <UnfoldMoreIcon fontSize="small" aria-hidden />
}

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
      className="inline-flex items-center gap-1 text-sm font-medium text-slate-800"
      aria-label={`${label}, ${sortDirectionLabel(sort)}`}
      onClick={onToggle}
    >
      {label}
      <SortIcon sort={sort} />
    </button>
  )
}
