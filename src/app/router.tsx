import { createBrowserRouter, Navigate } from 'react-router'
import { AppShell } from '@/app/app-shell'
import { AuthLayout } from '@/app/auth-layout'
import { GuestOnly, RequireAuth } from '@/app/route-guards'
import { DataViewPage } from '@/pages/data-view-page'
import { DropdownPage } from '@/pages/dropdown-page'
import { HomePage } from '@/pages/home-page'
import { LoginPage } from '@/pages/login-page'

export const router = createBrowserRouter([
  {
    element: <GuestOnly />,
    children: [
      {
        element: <AuthLayout />,
        children: [{ path: '/login', element: <LoginPage /> }],
      },
    ],
  },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/dev/data-view', element: <DataViewPage /> },
          { path: '/dev/dropdown', element: <DropdownPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
