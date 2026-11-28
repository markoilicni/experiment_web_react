import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import TextField from '@mui/material/TextField'
import { useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { ManagerField } from '@/features/users/create-user/manager-field'
import { PdpField } from '@/features/users/create-user/pdp-field'
import { creatableRoles } from '@/features/users/create-user/role-choices'
import {
  editUserSchema,
  type EditUserFormValues,
} from '@/features/users/edit-user/edit-user-schema'
import { canEditStructuralFields } from '@/features/users/edit-user/user-write-permissions'
import { toUpdateUserInput } from '@/features/users/edit-user/to-update-user-input'
import { useSessionStore } from '@/features/auth/session-store'
import {
  applyManagerChange,
  applyRoleChange,
  UserFormActions,
  UserProfileFields,
} from '@/features/users/user-form'
import { useUpdateUser } from '@/features/users/use-user-mutations'
import type { User } from '@/features/users/users-types'
import type { Role } from '@/shared/auth/types'
import { ApiError } from '@/shared/api/errors'
import { Dropdown } from '@/shared/dropdown'

type EditUserFormProps = {
  /** User whose fields fill the form. */
  user: User
  /** Closes the dialog without saving. */
  onClose: () => void
  /** Called after a successful save so the dialog can close. */
  onSaved: () => void
}

/**
 * Form for editing a user under the caller's field rules.
 * SUPER may change username, role, manager, and PDP. MANAGER and PDP change
 * only name, email, phone, and address.
 * @param props - The user being edited and dialog callbacks.
 * @returns The edit form, or nothing when this person cannot edit.
 */
export function EditUserForm({ user, onClose, onSaved }: EditUserFormProps) {
  const caller = useSessionStore((state) => state.user)
  // Role used for the schema and which fields render.
  const callerRole: Role = caller?.role ?? 'USER'
  // True when username, role, manager, and PDP are editable.
  const structural = canEditStructuralFields(callerRole)
  // Rebuilt only when the signed-in role changes, so submit keeps the same rules.
  const schema = useMemo(() => editUserSchema(callerRole), [callerRole])
  // Message from the API, such as a username that is already taken.
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useUpdateUser()
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditUserFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: user.username,
      name: user.name,
      email: user.email ?? '',
      phone: user.phone ?? '',
      address: user.address ?? '',
      role: user.role,
      managerId: user.managerId ?? '',
      pdpId: user.pdpId ?? '',
    },
  })
  // Role and manager decide which of the lower fields are required or hidden.
  const role = useWatch({ control, name: 'role' })
  const managerId = useWatch({ control, name: 'managerId' })
  const pdpId = useWatch({ control, name: 'pdpId' })
  // Roles SUPER may assign on edit. Same full list as create for SUPER.
  const roleOptions = creatableRoles('SUPER')

  if (
    !caller ||
    (caller.role !== 'SUPER' &&
      caller.role !== 'MANAGER' &&
      caller.role !== 'PDP')
  ) {
    return null
  }

  return (
    <form
      className="flex flex-col gap-3 pt-1"
      noValidate
      onSubmit={handleSubmit((values) => {
        setFormError(null)
        mutation.mutate(
          {
            id: user.id,
            input: toUpdateUserInput(values, callerRole),
          },
          {
            onSuccess: () => onSaved(),
            onError: (error) => {
              setFormError(
                error instanceof ApiError
                  ? error.message
                  : 'Unable to save the user',
              )
            },
          },
        )
      })}
    >
      {formError ? <Alert severity="error">{formError}</Alert> : null}
      {structural ? (
        <TextField
          label="Username"
          autoComplete="off"
          error={Boolean(errors.username)}
          helperText={errors.username?.message ?? ' '}
          slotProps={{ htmlInput: register('username') }}
        />
      ) : (
        <TextField
          label="Username"
          value={user.username}
          disabled
          helperText=" "
        />
      )}
      <UserProfileFields register={register} errors={errors} />
      {structural ? (
        <>
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
            caller={caller}
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
        </>
      ) : (
        <TextField label="Role" value={user.role} disabled helperText=" " />
      )}
      <UserFormActions onClose={onClose} pending={mutation.isPending} />
    </form>
  )
}
