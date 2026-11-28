import TextField from '@mui/material/TextField'
import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form'

/** Form values that include the shared profile text fields. */
type ProfileFormValues = FieldValues & {
  name: string
  email: string
  phone: string
  address: string
}

type UserProfileFieldsProps<T extends ProfileFormValues> = {
  /** react-hook-form register bound to the parent form. */
  register: UseFormRegister<T>
  /** Field errors from the parent form state. */
  errors: FieldErrors<T>
}

/**
 * Turns a react-hook-form error into helper text, or a fallback when valid.
 * @param message - Error message from FieldErrors, when present.
 * @param fallback - Text shown when the field has no string message.
 * @returns Helper text safe to pass to MUI.
 */
function helperMessage(
  message: unknown,
  fallback: string,
): string {
  if (typeof message === 'string') {
    return message
  }
  return fallback
}

/**
 * Name, email, phone, and address inputs shared by create and edit.
 * @param props - Register and errors from the parent form.
 * @returns The four profile text fields.
 */
export function UserProfileFields<T extends ProfileFormValues>({
  register,
  errors,
}: UserProfileFieldsProps<T>) {
  return (
    <>
      <TextField
        label="Name"
        autoComplete="off"
        error={Boolean(errors.name)}
        helperText={helperMessage(errors.name?.message, ' ')}
        slotProps={{ htmlInput: register('name' as Path<T>) }}
      />
      <TextField
        label="Email"
        type="email"
        autoComplete="off"
        error={Boolean(errors.email)}
        helperText={helperMessage(errors.email?.message, 'Optional')}
        slotProps={{ htmlInput: register('email' as Path<T>) }}
      />
      <TextField
        label="Phone"
        autoComplete="off"
        helperText="Optional"
        slotProps={{ htmlInput: register('phone' as Path<T>) }}
      />
      <TextField
        label="Address"
        autoComplete="off"
        helperText="Optional"
        slotProps={{ htmlInput: register('address' as Path<T>) }}
      />
    </>
  )
}
