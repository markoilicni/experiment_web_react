import { z } from 'zod'
import { managerIsRequired } from '@/features/users/create-user/role-choices'
import type { Role } from '@/shared/auth/types'

// Every role the API accepts on update. Only SUPER sees this control.
const roleSchema = z.enum(['SUPER', 'MANAGER', 'PDP', 'USER'])

/**
 * Checks the edit form for the signed-in editor.
 * A manager or PDP may change only profile fields. Structural fields stay on
 * the values object so the form can keep one shape, but SUPER alone is checked
 * for username, role, and manager rules.
 * @param callerRole - Role of the person filling the form.
 * @returns The schema used on submit.
 */
export function editUserSchema(callerRole: Role) {
  return z
    .object({
      username: z.string(),
      name: z.string().trim().min(1, 'Name is required'),
      email: z
        .string()
        .trim()
        .refine(
          (value) =>
            value.length === 0 || z.string().email().safeParse(value).success,
          'Enter a valid email',
        ),
      phone: z.string(),
      address: z.string(),
      role: roleSchema,
      managerId: z.string(),
      pdpId: z.string(),
    })
    .superRefine((values, ctx) => {
      if (callerRole !== 'SUPER') {
        return
      }
      // SUPER must keep a valid username length, matching create.
      if (values.username.trim().length < 3) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['username'],
          message: 'Username must be at least 3 characters',
        })
      }
      // USER and PDP need a manager. MANAGER and SUPER may leave it empty.
      if (
        managerIsRequired(values.role) &&
        values.managerId.trim().length === 0
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['managerId'],
          message: 'Manager is required',
        })
      }
    })
}

/** Values the edit form holds. Empty strings mean an optional field was cleared. */
export type EditUserFormValues = z.infer<ReturnType<typeof editUserSchema>>
