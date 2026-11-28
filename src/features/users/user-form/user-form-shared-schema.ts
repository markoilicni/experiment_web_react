import { z } from 'zod'

/** Every role the API accepts on create or update. */
export const userRoleSchema = z.enum(['SUPER', 'MANAGER', 'PDP', 'USER'])

/**
 * Profile and assignment fields shared by the create and edit forms.
 * Username stays outside this object because create and edit check it differently.
 */
export const userFormSharedSchema = z.object({
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
  role: userRoleSchema,
  managerId: z.string(),
  pdpId: z.string(),
})
