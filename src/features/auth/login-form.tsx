import { zodResolver } from '@hookform/resolvers/zod'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { ApiError } from '@/shared/api/errors'
import { login } from '@/features/auth/auth-api'
import { useSessionStore } from '@/features/auth/session-store'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const setSession = useSessionStore((state) => state.setSession)
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      setSession(data)
      navigate('/', { replace: true })
    },
    onError: (error) => {
      if (error instanceof ApiError) {
        setFormError(error.message)
        return
      }
      setFormError('Unable to sign in')
    },
  })

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={handleSubmit((values) => {
        setFormError(null)
        mutation.mutate(values)
      })}
      noValidate
    >
      {formError ? <Alert severity="error">{formError}</Alert> : null}
      <TextField
        label="Username"
        autoComplete="username"
        error={Boolean(errors.username)}
        helperText={errors.username?.message}
        slotProps={{ htmlInput: register('username') }}
      />
      <TextField
        label="Password"
        type="password"
        autoComplete="current-password"
        error={Boolean(errors.password)}
        helperText={errors.password?.message}
        slotProps={{ htmlInput: register('password') }}
      />
      <Button type="submit" variant="contained" disabled={mutation.isPending}>
        {mutation.isPending ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  )
}
