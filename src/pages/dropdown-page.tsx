import Typography from '@mui/material/Typography'
import { useLayoutEffect, useState } from 'react'
import { Dropdown } from '@/shared/dropdown'

type StatusOption = {
  code: string
  display: string
}

const statusOptions: StatusOption[] = [
  { code: 'ACTIVE', display: 'Active' },
  { code: 'INACTIVE', display: 'Inactive' },
  { code: 'PENDING', display: 'Pending Review' },
  { code: 'ARCHIVED', display: 'Archived' },
]

type User = {
  id: number
  firstName: string
  lastName: string
  email: string
  department: string
}

const sampleUsers: User[] = [
  {
    id: 1,
    firstName: 'Nora',
    lastName: 'Patel',
    email: 'nora.patel@example.com',
    department: 'Engineering',
  },
  {
    id: 2,
    firstName: 'Amir',
    lastName: 'Hassan',
    email: 'amir.hassan@example.com',
    department: 'Product',
  },
  {
    id: 3,
    firstName: 'Lina',
    lastName: 'Chen',
    email: 'lina.chen@example.com',
    department: 'Design',
  },
  {
    id: 4,
    firstName: 'Evan',
    lastName: 'Miller',
    email: 'evan.miller@example.com',
    department: 'Engineering',
  },
  {
    id: 5,
    firstName: 'Maya',
    lastName: 'Johnson',
    email: 'maya.johnson@example.com',
    department: 'Marketing',
  },
  {
    id: 6,
    firstName: 'Sam',
    lastName: 'Williams',
    email: 'sam.williams@example.com',
    department: 'Engineering',
  },
  {
    id: 7,
    firstName: 'Dana',
    lastName: 'Brown',
    email: 'dana.brown@example.com',
    department: 'HR',
  },
]

let loadCallCount = 0
const loadCountListeners = new Set<(count: number) => void>()

function loadUsers(): Promise<User[]> {
  loadCallCount += 1
  for (const listener of loadCountListeners) {
    listener(loadCallCount)
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleUsers)
    }, 800)
  })
}

function useLoadCallCount() {
  const [count, setCount] = useState(loadCallCount)
  useLayoutEffect(() => {
    loadCountListeners.add(setCount)
    return () => {
      loadCountListeners.delete(setCount)
    }
  }, [])
  return count
}

function loadUsersWithError(): Promise<User[]> {
  return new Promise((_resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Network error: unable to fetch users'))
    }, 600)
  })
}

function formatValue(value: unknown): string {
  if (value === null) return 'null (nothing selected)'
  if (Array.isArray(value)) {
    if (value.length === 0) return '[] (empty)'
    return `[${value.join(', ')}]`
  }
  return String(value)
}

export function DropdownPage() {
  const [singleStatus, setSingleStatus] = useState<string | null>(null)
  const [multiStatus, setMultiStatus] = useState<readonly string[]>([])

  const [singleUser, setSingleUser] = useState<number | null>(null)
  const [multiUser, setMultiUser] = useState<readonly number[]>([])

  const [errorDemoValue, setErrorDemoValue] = useState<number | null>(null)
  const [department, setDepartment] = useState<string | null>(null)
  const loadCalls = useLoadCallCount()

  return (
    <div className="flex flex-col gap-8">
      <Typography variant="h4" component="h1">
        Dropdown
      </Typography>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Frontend list (single select)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Label differs from value: the code (value) is ACTIVE, INACTIVE, etc.
          but the label is a human-friendly display name.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="frontend"
            options={statusOptions}
            label="Status"
            placeholder="Select a status"
            getValue={(opt) => opt.code}
            getLabel={(opt) => opt.display}
            value={singleStatus}
            onChange={setSingleStatus}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatValue(singleStatus)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Frontend list (multiple select)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select multiple statuses. Clear individual chips or all at once.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="frontend"
            options={statusOptions}
            label="Statuses"
            placeholder="Select statuses"
            getValue={(opt) => opt.code}
            getLabel={(opt) => opt.display}
            multiple
            value={multiStatus}
            onChange={setMultiStatus}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected values:</strong> {formatValue(multiStatus)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          API list (single select)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Value is a numeric id. Label is composed from firstName, lastName, and
          department. Options are loaded once; typing filters locally without
          re-calling the API. The load count below stays the same while typing.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="api"
            loadOptions={loadUsers}
            label="User"
            placeholder="Search for a user"
            getValue={(user) => user.id}
            getLabel={(user) =>
              `${user.firstName} ${user.lastName} (${user.department})`
            }
            value={singleUser}
            onChange={setSingleUser}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatValue(singleUser)}
        </Typography>
        <Typography variant="body2" component="p">
          <strong>loadOptions calls:</strong> {loadCalls}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          API list (multiple select)
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Select multiple users. Typing narrows the list locally.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="api"
            loadOptions={loadUsers}
            label="Users"
            placeholder="Search for users"
            getValue={(user) => user.id}
            getLabel={(user) =>
              `${user.firstName} ${user.lastName} (${user.department})`
            }
            multiple
            value={multiUser}
            onChange={setMultiUser}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected values:</strong> {formatValue(multiUser)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          API list with error
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Demonstrates the error state when loadOptions fails.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="api"
            loadOptions={loadUsersWithError}
            label="User (error demo)"
            placeholder="Select a user"
            getValue={(user) => user.id}
            getLabel={(user) => `${user.firstName} ${user.lastName}`}
            value={errorDemoValue}
            onChange={setErrorDemoValue}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatValue(errorDemoValue)}
        </Typography>
      </section>

      <section className="flex flex-col gap-4">
        <Typography variant="h6" component="h2">
          Label equals value
        </Typography>
        <Typography variant="body2" color="text.secondary">
          When getLabel is omitted, the value is used as the label.
        </Typography>
        <div className="max-w-md">
          <Dropdown
            mode="frontend"
            options={['Engineering', 'Product', 'Design', 'Marketing', 'HR']}
            label="Department"
            placeholder="Select a department"
            getValue={(opt) => opt}
            value={department}
            onChange={setDepartment}
          />
        </div>
        <Typography variant="body2" component="p">
          <strong>Selected value:</strong> {formatValue(department)}
        </Typography>
      </section>
    </div>
  )
}
