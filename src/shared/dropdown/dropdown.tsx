import Autocomplete, {
  type AutocompleteRenderInputParams,
} from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import TextField from '@mui/material/TextField'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { controlSizeProps } from '@/shared/control-size'
import type { DropdownProps } from './types'

type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'loaded'; options: readonly T[] }

export function Dropdown<T, V extends string | number>(
  props: DropdownProps<T, V>,
) {
  const {
    mode,
    label,
    placeholder,
    getValue,
    getLabel,
    disabled = false,
    error = false,
    helperText,
    multiple = false,
    value,
    onChange,
    size = 'medium',
  } = props
  // MUI size and the padding for a form field or the shorter filter field.
  const sized = controlSizeProps(size)
  // Spinner diameter. The short field cannot fit the form-field spinner.
  const spinnerSize = size === 'small' ? 16 : 20

  const loadOptions = mode === 'api' ? props.loadOptions : null
  const frontendOptions = mode === 'frontend' ? props.options : null

  const [loadState, setLoadState] = useState<LoadState<T>>(() =>
    mode === 'api' ? { status: 'loading' } : { status: 'idle' },
  )

  const options = useMemo(() => {
    if (frontendOptions !== null) {
      return frontendOptions
    }
    if (loadState.status === 'loaded') {
      return loadState.options
    }
    return []
  }, [frontendOptions, loadState])

  useEffect(() => {
    if (!loadOptions) return

    let cancelled = false

    loadOptions()
      .then((loaded) => {
        if (!cancelled) {
          setLoadState({ status: 'loaded', options: loaded })
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load options'
          setLoadState({ status: 'error', message })
        }
      })

    return () => {
      cancelled = true
    }
  }, [loadOptions])

  const resolveLabel = useCallback(
    (option: T): string => {
      if (getLabel) {
        return getLabel(option)
      }
      return String(getValue(option))
    },
    [getLabel, getValue],
  )

  const selectedOptions = useMemo(() => {
    if (multiple) {
      const valueArray = value as readonly V[]
      return options.filter((opt) => valueArray.includes(getValue(opt)))
    } else {
      const singleValue = value as V | null
      if (singleValue === null) return null
      return options.find((opt) => getValue(opt) === singleValue) ?? null
    }
  }, [multiple, value, options, getValue])

  const filterOptions = useCallback(
    (opts: T[], { inputValue }: { inputValue: string }) => {
      if (!inputValue) return opts
      const search = inputValue.toLowerCase()
      return opts.filter((opt) =>
        resolveLabel(opt).toLowerCase().includes(search),
      )
    },
    [resolveLabel],
  )

  const isLoading = loadState.status === 'loading'
  const loadError = loadState.status === 'error' ? loadState.message : null

  function renderInput(params: AutocompleteRenderInputParams) {
    return (
      <TextField
        {...params}
        label={label}
        placeholder={placeholder}
        size={sized.size}
        sx={sized.sx}
        error={error || Boolean(loadError)}
        helperText={loadError ?? helperText}
        slotProps={{
          ...params.slotProps,
          input: {
            ...params.slotProps.input,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress color="inherit" size={spinnerSize} />
                ) : null}
                {params.slotProps.input.endAdornment}
              </>
            ),
          },
        }}
      />
    )
  }

  if (multiple) {
    const multiValue = (selectedOptions ?? []) as T[]
    return (
      <Autocomplete<T, true, false, false>
        multiple
        size={sized.size}
        options={[...options]}
        value={multiValue}
        onChange={(_event, newValue) => {
          const newKeys = newValue.map((opt) => getValue(opt))
          ;(onChange as (value: readonly V[]) => void)(newKeys)
        }}
        getOptionLabel={resolveLabel}
        getOptionKey={(option) => String(getValue(option))}
        isOptionEqualToValue={(option, val) =>
          getValue(option) === getValue(val)
        }
        filterOptions={filterOptions}
        disabled={disabled || isLoading}
        loading={isLoading}
        renderInput={renderInput}
      />
    )
  }

  const singleValue = selectedOptions as T | null
  return (
    <Autocomplete<T, false, false, false>
      size={sized.size}
      options={[...options]}
      value={singleValue}
      onChange={(_event, newValue) => {
        const newKey = newValue ? getValue(newValue) : null
        ;(onChange as (value: V | null) => void)(newKey)
      }}
      getOptionLabel={resolveLabel}
      getOptionKey={(option) => String(getValue(option))}
      isOptionEqualToValue={(option, val) => getValue(option) === getValue(val)}
      filterOptions={filterOptions}
      disabled={disabled || isLoading}
      loading={isLoading}
      renderInput={renderInput}
    />
  )
}
