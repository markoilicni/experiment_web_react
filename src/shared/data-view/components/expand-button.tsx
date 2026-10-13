import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import IconButton from '@mui/material/IconButton'

export function ExpandButton({
  expanded,
  label,
  onToggle,
}: {
  expanded: boolean
  label: string
  onToggle: () => void
}) {
  return (
    <IconButton
      size="small"
      aria-expanded={expanded}
      aria-label={expanded ? `Collapse ${label}` : `Expand ${label}`}
      onClick={onToggle}
    >
      {expanded ? (
        <ExpandMoreIcon fontSize="small" aria-hidden />
      ) : (
        <KeyboardArrowRightIcon fontSize="small" aria-hidden />
      )}
    </IconButton>
  )
}
