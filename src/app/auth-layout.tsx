import Typography from '@mui/material/Typography'
import { Outlet } from 'react-router'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-sm">
        <Typography variant="h5" component="h1" sx={{ mb: 2 }}>
          Sign in
        </Typography>
        <Outlet />
      </div>
    </div>
  )
}
