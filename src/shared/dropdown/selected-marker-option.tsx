import CheckIcon from '@mui/icons-material/Check'
import type { HTMLAttributes, Key } from 'react'

/** Width reserved for the check so selected and unselected labels stay aligned. */
const MARKER_SLOT_WIDTH = 24

type SelectedMarkerOptionProps = {
  /** MUI Autocomplete props for the option row, including its React key. */
  liProps: HTMLAttributes<HTMLLIElement> & { key: Key }
  /** True when this option is already in the multiple value. */
  selected: boolean
  /** Text shown next to the optional check. */
  label: string
}

/**
 * Open-list row for a multiple dropdown with the selected marker on.
 * A selected option shows a check; an unselected option leaves the slot empty.
 * @param props - Row props from Autocomplete plus selection and label.
 * @returns The list item to render in the open dropdown.
 */
export function SelectedMarkerOption(props: SelectedMarkerOptionProps) {
  const { liProps, selected, label } = props
  // React key must stay on the element; the rest are Autocomplete option props.
  const { key, ...optionProps } = liProps

  return (
    <li key={key} {...optionProps}>
      <span
        aria-hidden
        style={{
          display: 'inline-flex',
          width: MARKER_SLOT_WIDTH,
          flexShrink: 0,
          marginRight: 8,
          justifyContent: 'center',
        }}
      >
        {selected ? <CheckIcon fontSize="small" /> : null}
      </span>
      {label}
    </li>
  )
}
