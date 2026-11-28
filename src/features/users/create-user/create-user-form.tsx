import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { createUserSchema } from '@/features/users/create-user/create-user-schema'
import type { CreateUserFormValues } from '@/features/users/create-user/create-user-schema'
import { ManagerField } from '@/features/users/create-user/manager-field'
import { PdpField } from '@/features/users/create-user/pdp-field'
import { creatableRoles } from '@/features/users/create-user/role-choices'
import { toCreateUserInput } from '@/features/users/create-user/to-create-user-input'
import { useSessionStore } from '@/features/auth/session-store'
import {
  applyManagerChange,
  applyRoleChange,
  UserFormActions,
  UserProfileFields,
} from '@/features/users/user-form'
import { useCreateUser } from '@/features/users/use-user-mutations'
import type { Role } from '@/shared/auth/types'
import { ApiError } from '@/shared/api/errors'
import { Dropdown } from '@/shared/dropdown'

type CreateUserFormProps = {
  onClose: () => void
  onCreated: (temporaryPassword: string) => void
}

/**
 * Form for creating a user. It does not ask for a password.
 * On success it hands the temporary password to the dialog, which shows it once.
 * @param props - Close handler and the callback that receives the new password.
 * @returns The create form, or nothing when this person cannot create.
 */
export function CreateUserForm({ onClose, onCreated }: CreateUserFormProps) {
  const user = useSessionStore((state) => state.user)
  // Role used for the schema. The entry hides this form for every other role.
  const callerRole: Role = user?.role ?? 'USER'
  // Rebuilt only when the signed-in role changes, so submit keeps the same rules.
  const schema = useMemo(() => createUserSchema(callerRole), [callerRole])
  // Message from the API, such as a username that is already taken.
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useCreateUser()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<CreateUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      role: 'USER',
      managerId: user?.role === 'MANAGER' ? user.id : '',
      pdpId: '',
    },
  })
  // Role and manager decide which of the lower fields are required or hidden.
  const role = useWatch({ control, name: 'role' })
  const managerId = useWatch({ control, name: 'managerId' })
  const pdpId = useWatch({ control, name: 'pdpId' })
  // Roles this caller is allowed to assign.
  const roleOptions = creatableRoles(callerRole)

  if (!user || (user.role !== 'SUPER' && user.role !== 'MANAGER')) {
    return null
  }

  return (
    <form
      className="flex flex-col gap-3 pt-1"
      noValidate
      onSubmit={handleSubmit((values) => {
        setFormError(null)
        mutation.mutate(toCreateUserInput(values, user), {
          onSuccess: (created) => onCreated(created.temporaryPassword),
          onError: (error) => {
            setFormError(
              error instanceof ApiError
                ? error.message
                : 'Unable to create the user',
            )
          },
        })
      })}
    >
      {formError ? <Alert severity="error">{formError}</Alert> : null}
      <TextField
        label="Username"
        autoComplete="off"
        error={Boolean(errors.username)}
        helperText={errors.username?.message ?? ' '}
        slotProps={{ htmlInput: register('username') }}
      />
      <UserProfileFields register={register} errors={errors} />
      <Dropdown
        mode="frontend"
        label="Role"
        options={roleOptions}
        getValue={(option: Role) => option}
        value={role}
        error={Boolean(errors.role)}
        helperText={errors.role?.message ?? ' '}
        onChange={(next) => applyRoleChange(setValue, managerId, next)}
      />
      <ManagerField
        caller={user}
        role={role}
        managerId={managerId}
        error={errors.managerId?.message}
        onChange={(next) => applyManagerChange(setValue, next)}
      />
      {role === 'USER' ? (
        <PdpField
          managerId={managerId}
          pdpId={pdpId}
          onChange={(next) => setValue('pdpId', next)}
        />
      ) : null}
      <UserFormActions onClose={onClose} pending={mutation.isPending} />
    </form>
  )
}
