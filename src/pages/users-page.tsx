import Typography from '@mui/material/Typography'
import { CreateUserEntry } from '@/features/users'

/**
 * Users screen.
 * `SUPER` and `MANAGER` can create a user. `PDP` and `USER` do not see create.
 * @returns The users page.
 */
export function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4" component="h1">
        Users
      </Typography>
      <CreateUserEntry />
    </div>
  )
}
