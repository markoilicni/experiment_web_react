import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { userOptionLabel } from '@/features/users/create-user/user-option-label'
import {
  CLEAR_PDP_LABEL,
  CLEAR_PDP_VALUE,
  type ReplacementPdpOption,
} from '@/features/users/deactivate-user/clear-pdp-option'
import {
  countDirectReports,
  countPdpAssignees,
  loadReplacementManagers,
  loadReplacementPdps,
} from '@/features/users/deactivate-user/replacement-options'
import {
  toDeactivateUserInput,
  transferFormIsReady,
  transferRequirement,
} from '@/features/users/deactivate-user/transfer-needed'
import { useDeactivateUser } from '@/features/users/use-user-mutations'
import type { User } from '@/features/users/users-types'
import { ApiError } from '@/shared/api/errors'
import { Dropdown } from '@/shared/dropdown'

type DeactivateUserFormProps = {
  /** User being marked inactive. */
  user: User
  /** Closes the dialog without saving. */
  onClose: () => void
  /** Called after a successful deactivate so the dialog can close. */
  onDeactivated: () => void
}

/**
 * Confirms deactivate and collects a replacement when the API requires one.
 * @param props - The user being deactivated and dialog callbacks.
 * @returns The deactivate form.
 */
export function DeactivateUserForm({
  user,
  onClose,
  onDeactivated,
}: DeactivateUserFormProps) {
  // Message from the API when the transfer is rejected.
  const [formError, setFormError] = useState<string | null>(null)
  // Chosen replacement manager id when the closed user is a manager with reports.
  const [replacementManagerId, setReplacementManagerId] = useState('')
  // Chosen PDP option id, or the clear sentinel. Empty means no choice yet.
  const [replacementPdpChoice, setReplacementPdpChoice] = useState('')
  const mutation = useDeactivateUser()

  // How many people report directly to this user. Only meaningful for MANAGER.
  const reportsQuery = useQuery({
    queryKey: ['users', 'direct-reports-count', user.id],
    queryFn: () => countDirectReports(user.id),
    enabled: user.role === 'MANAGER',
  })
  // How many people are assigned to this PDP. Only meaningful for PDP.
  const assigneesQuery = useQuery({
    queryKey: ['users', 'pdp-assignees-count', user.id],
    queryFn: () => countPdpAssignees(user.id),
    enabled: user.role === 'PDP',
  })

  // Counts stay at zero until the matching query resolves.
  const directReportCount =
    user.role === 'MANAGER' ? (reportsQuery.data ?? 0) : 0
  const assigneeCount = user.role === 'PDP' ? (assigneesQuery.data ?? 0) : 0
  // True while we still need a count that decides the transfer step.
  const countsLoading =
    (user.role === 'MANAGER' && reportsQuery.isLoading) ||
    (user.role === 'PDP' && assigneesQuery.isLoading)
  // What the form must collect before calling deactivate.
  const requirement = transferRequirement(
    user,
    directReportCount,
    assigneeCount,
  )

  // Managers outside the closed tree. Loaded only when a replacement is required.
  const managersQuery = useQuery({
    queryKey: ['users', 'replacement-managers', user.id],
    queryFn: () => loadReplacementManagers(user.id),
    enabled: requirement.kind === 'manager',
  })
  // Peer PDPs plus the clear choice. Loaded only when a PDP transfer is required.
  const pdpsQuery = useQuery({
    queryKey: ['users', 'replacement-pdps', user.id, user.managerId],
    queryFn: () => loadReplacementPdps(user.id, user.managerId),
    enabled: requirement.kind === 'pdp',
  })

  // Dropdown options for clearing PDP or moving to a peer.
  const pdpOptions = useMemo<readonly ReplacementPdpOption[]>(() => {
    // Clear is always available when a PDP transfer is required.
    const clearOption: ReplacementPdpOption = {
      id: CLEAR_PDP_VALUE,
      name: CLEAR_PDP_LABEL,
      username: '',
    }
    const peers = (pdpsQuery.data ?? []).map((pdp) => ({
      id: pdp.id,
      name: pdp.name,
      username: pdp.username,
    }))
    return [clearOption, ...peers]
  }, [pdpsQuery.data])

  // True after the person picked a PDP or chose to clear.
  const pdpChoiceMade = replacementPdpChoice.length > 0
  // Whether the confirm button may fire.
  const ready =
    !countsLoading &&
    transferFormIsReady(requirement, replacementManagerId, pdpChoiceMade)

  /**
   * Label for a PDP replacement option. The clear sentinel has no username.
   * @param option - Clear choice or a real PDP.
   * @returns Text shown in the list.
   */
  function pdpOptionLabel(option: ReplacementPdpOption) {
    if (option.id === CLEAR_PDP_VALUE) {
      return CLEAR_PDP_LABEL
    }
    // Name plus username, matching the create-form option label.
    const name = option.name.trim() || option.username
    return `${name} (${option.username})`
  }

  return (
    <form
      className="flex flex-col gap-3 pt-1"
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready) {
          return
        }
        setFormError(null)
        // Null clears PDP assignments. A real id moves everyone to that PDP.
        const replacementPdpId =
          replacementPdpChoice === CLEAR_PDP_VALUE
            ? null
            : replacementPdpChoice || null
        mutation.mutate(
          {
            id: user.id,
            input: toDeactivateUserInput(
              requirement,
              replacementManagerId,
              replacementPdpId,
            ),
          },
          {
            onSuccess: () => onDeactivated(),
            onError: (error) => {
              setFormError(
                error instanceof ApiError
                  ? error.message
                  : 'Unable to mark the user inactive',
              )
            },
          },
        )
      }}
    >
      {formError ? <Alert severity="error">{formError}</Alert> : null}
      <Typography component="p">
        Mark <strong>{user.name}</strong> ({user.username}) inactive?
      </Typography>
      {countsLoading ? (
        <div className="flex justify-center py-4">
          <CircularProgress size={28} />
        </div>
      ) : null}
      {requirement.kind === 'manager' ? (
        <Dropdown
          mode="frontend"
          label="Replacement manager"
          options={managersQuery.data ?? []}
          getValue={(option: User) => option.id}
          getLabel={userOptionLabel}
          value={replacementManagerId || null}
          helperText="Direct reports move to this manager"
          onChange={(next) => setReplacementManagerId(next ?? '')}
        />
      ) : null}
      {requirement.kind === 'pdp' ? (
        <Dropdown
          mode="frontend"
          label="Replacement PDP"
          options={pdpOptions}
          getValue={(option: ReplacementPdpOption) => option.id}
          getLabel={pdpOptionLabel}
          value={replacementPdpChoice || null}
          helperText="Assigned users move to this PDP, or lose their PDP"
          onChange={(next) => setReplacementPdpChoice(next ?? '')}
        />
      ) : null}
      <div className="flex justify-end gap-2">
        <Button type="button" onClick={onClose} disabled={mutation.isPending}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="warning"
          disabled={!ready || mutation.isPending}
        >
          {mutation.isPending ? 'Saving…' : 'Mark inactive'}
        </Button>
      </div>
    </form>
  )
}
