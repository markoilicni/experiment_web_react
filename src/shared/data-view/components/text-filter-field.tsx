import TextField from '@mui/material/TextField'
import { controlSizeProps } from '@/shared/control-size'

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
  // Shorter than a form field, with less padding on every side.
  const sized = controlSizeProps('small')

  return (
    <TextField
      id={id}
      label={label}
      value={value}
      placeholder="Any"
      fullWidth
      autoComplete="off"
      size={sized.size}
      sx={sized.sx}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}
