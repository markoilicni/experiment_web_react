import { z } from 'zod'
import { managerIsRequired } from '@/features/users/create-user/role-choices'
import type { Role } from '@/shared/auth/types'

// Every role the API accepts. The dropdown only offers the ones this caller may assign.
const roleSchema = z.enum(['SUPER', 'MANAGER', 'PDP', 'USER'])

/**
 * Checks the create form for the signed-in creator.
 * A manager may only choose `USER` or `PDP`. A super user must pick a manager for those roles.
 * @param callerRole - Role of the person filling the form.
 * @returns The schema used on submit.
 */
export function createUserSchema(callerRole: Role) {
  return z
    .object({
      username: z
        .string()
        .trim()
        .min(3, 'Username must be at least 3 characters'),
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
      // A manager cannot assign SUPER or MANAGER, even if the control is changed.
      if (
        callerRole === 'MANAGER' &&
        values.role !== 'USER' &&
        values.role !== 'PDP'
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['role'],
          message: 'Choose USER or PDP',
        })
      }
      // SUPER must name a manager for USER and PDP. The manager caller is filled in for them.
      if (
        callerRole === 'SUPER' &&
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

/** Values the create form edits. Empty strings mean the optional field was left blank. */
export type CreateUserFormValues = z.infer<ReturnType<typeof createUserSchema>>
