import type { SxProps, Theme } from '@mui/material/styles'

/** `medium` is the form field. `small` is the shorter field used in a filter bar. */
export type ControlSize = 'medium' | 'small'

/** Left and right padding inside a small field. A form field keeps MUI's wider inset. */
const SMALL_PADDING_X = '10px'

/** Top and bottom padding inside a small field. Shorter than a form field. */
const SMALL_PADDING_Y = '6px'

/**
 * MUI size and padding for a text field or dropdown.
 * Medium leaves the form-field padding alone.
 * @param size - Which height the caller asked for. Defaults to the form field.
 * @returns The MUI `size` prop, and `sx` when the field should be short.
 */
export function controlSizeProps(size: ControlSize = 'medium'): {
  size: ControlSize
  sx?: SxProps<Theme>
} {
  if (size === 'medium') {
    return { size: 'medium' }
  }

  return {
    size: 'small',
    sx: {
      '& .MuiOutlinedInput-input:not(.MuiAutocomplete-input)': {
        padding: `${SMALL_PADDING_Y} ${SMALL_PADDING_X}`,
      },
      '&& .MuiAutocomplete-inputRoot.MuiInputBase-sizeSmall': {
        paddingLeft: SMALL_PADDING_X,
        paddingTop: SMALL_PADDING_Y,
        paddingBottom: SMALL_PADDING_Y,
      },
      '&& .MuiAutocomplete-inputRoot .MuiAutocomplete-input': {
        paddingTop: '0px',
        paddingBottom: '0px',
        paddingLeft: '0px',
      },
    },
  }
}
