import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSessionStore } from '@/features/auth/session-store'
import {
  CreateUserEntry,
  listUsersByRole,
  useUsersQuery,
  usersKeys,
  type User,
} from '@/features/users'
import { defaultUsersFilters } from '@/pages/users/default-users-filters'
import { toUsersListParams } from '@/pages/users/to-users-list-params'
import { UserViewDialog } from '@/pages/users/user-view-dialog'
import { usersColumns } from '@/pages/users/users-columns'
import { usersFilterFields } from '@/pages/users/users-filters'
import { DataView } from '@/shared/data-view'
import { DEFAULT_PAGE_SIZE } from '@/shared/data-view/components/pagination-config'
import type { DataViewFilterState, DataViewSort } from '@/shared/data-view'

/**
 * Builds an id → name map from a list of users.
 * @param users - Managers or PDPs loaded for labels and filters.
 * @returns Map used by column and view dialog name resolution.
 */
function toNameMap(users: readonly User[] | undefined): Map<string, string> {
  // Empty until the options query resolves.
  const names = new Map<string, string>()
  for (const user of users ?? []) {
    names.set(user.id, user.name)
  }
  return names
}

/**
 * Signed-in users list with server filters, sort, and paging.
 * `SUPER` and `MANAGER` can create a user. Create stays outside DataView so the
 * temporary password can block dismiss until it has been read.
 * @returns The `/users` screen.
 */
export function UsersPage() {
  // Signed-in user. The page is behind RequireAuth, so this is always set.
  const sessionUser = useSessionStore((state) => state.user)
  // Role used for filter defaults, the active column, and the active filter.
  const viewerRole = sessionUser?.role ?? 'USER'

  // Zero-based page the pager is showing.
  const [page, setPage] = useState(0)
  // How many rows one API page asks for.
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  // Column sort sent to the API, or null when unsorted.
  const [sorting, setSorting] = useState<DataViewSort | null>(null)
  // Toolbar values. Starts from role defaults when the session user is known.
  const [filters, setFilters] = useState<DataViewFilterState>(() =>
    sessionUser ? defaultUsersFilters(sessionUser) : {},
  )
  // Row opened in the view dialog. Null means the dialog is closed.
  const [viewedUser, setViewedUser] = useState<User | null>(null)

  // List request built from the controlled view state.
  const listParams = toUsersListParams(
    page,
    pageSize,
    sorting,
    filters,
    viewerRole,
  )
  // Current page of users from the API.
  const usersQuery = useUsersQuery(listParams)

  // Managers for the Manager column and view dialog labels.
  const managersQuery = useQuery({
    queryKey: usersKeys.options('MANAGER'),
    queryFn: () => listUsersByRole('MANAGER').then((result) => result.data),
    staleTime: Infinity,
  })
  // PDPs for the PDP column and view dialog labels.
  const pdpsQuery = useQuery({
    queryKey: usersKeys.options('PDP'),
    queryFn: () => listUsersByRole('PDP').then((result) => result.data),
    staleTime: Infinity,
  })

  // Manager id → name for cells and the view dialog.
  const managerNames = toNameMap(managersQuery.data)
  // PDP id → name for cells and the view dialog.
  const pdpNames = toNameMap(pdpsQuery.data)
  // Columns for this role, with related names filled in.
  const columns = usersColumns(viewerRole, managerNames, pdpNames)
  // Toolbar filters for this role.
  const filterFields = usersFilterFields(viewerRole)
  // Rows for the current page. Empty while loading or on error.
  const rows = usersQuery.data?.data ?? []
  // Total matching users across all pages.
  const totalCount = usersQuery.data?.total ?? 0

  return (
    <div className="flex flex-col gap-4">
      <Typography variant="h4" component="h1">
        Users
      </Typography>
      <CreateUserEntry />
      {usersQuery.isError ? (
        <Typography component="p" color="error">
          {usersQuery.error instanceof Error
            ? usersQuery.error.message
            : 'Failed to load users'}
        </Typography>
      ) : null}
      {usersQuery.isLoading ? (
        <div className="flex justify-center py-8">
          <CircularProgress />
        </div>
      ) : (
        <DataView
          columns={columns}
          data={rows}
          getRowId={(user) => user.id}
          getRowLabel={(user) => user.name}
          sortingMode="server"
          sorting={sorting}
          onSortingChange={setSorting}
          paginationMode="server"
          page={page}
          pageSize={pageSize}
          totalCount={totalCount}
          onPageChange={setPage}
          onPageSizeChange={(nextSize) => {
            setPageSize(nextSize)
            setPage(0)
          }}
          filteringMode="server"
          filterFields={filterFields}
          filters={filters}
          onFiltersChange={(next) => {
            setFilters(next)
            setPage(0)
          }}
          actions={{
            view: {
              permission: true,
              onClick: (user) => setViewedUser(user),
            },
          }}
          create={{
            canCreate: false,
            presentation: 'modal',
            renderForm: () => null,
          }}
        />
      )}
      <UserViewDialog
        user={viewedUser}
        viewerRole={viewerRole}
        managerNames={managerNames}
        pdpNames={pdpNames}
        onClose={() => setViewedUser(null)}
      />
    </div>
  )
}
