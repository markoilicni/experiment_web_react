import TextField from '@mui/material/TextField'

type TextFilterFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Free-text filter control. Each change is reported immediately.
 * An empty field means this filter is off.
 * @param props - Label, current text, and the change handler.
 * @returns The text field for one text filter.
 */
export function TextFilterField({
  id,
  label,
  value,
  onChange,
}: TextFilterFieldProps) {
  return (
    <TextField
      id={id}
      label={label}
      value={value}
      placeholder="Any"
      fullWidth
      autoComplete="off"
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
