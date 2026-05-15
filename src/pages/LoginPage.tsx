import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, LockKeyhole, ShieldCheck } from 'lucide-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Brand } from '../components/Brand'
import { MotionPage } from '../components/MotionPage'
import { getAuthError, useLogin } from '../hooks/useAuth'
import { useAuthStore } from '../stores/authStore'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const token = useAuthStore((state) => state.token)
  const role = useAuthStore((state) => state.role)
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (token && role) {
      navigate(`/${role}`, { replace: true })
    }
  }, [navigate, role, token])

  return (
    <MotionPage className="login-page">
      <section className="login-panel">
        <Brand />
        <div>
          <p className="eyebrow">Secure workspace</p>
          <h1>Sign in to Revora</h1>
          <p>Operational clarity for every vehicle, technician, and service order.</p>
        </div>
        <form className="form-stack" onSubmit={handleSubmit((values) => loginMutation.mutate(values))}>
          <label>
            Email
            <input {...register('email')} autoComplete="email" placeholder="you@revora.id" type="email" />
            {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
          </label>
          <label>
            Password
            <input
              {...register('password')}
              autoComplete="current-password"
              placeholder="Enter password"
              type="password"
            />
            {errors.password ? <small className="field-error">{errors.password.message}</small> : null}
          </label>
          <button className="button button-primary" disabled={loginMutation.isPending} type="submit">
            {loginMutation.isPending ? 'Signing in' : 'Sign in'}
            <ArrowRight size={16} />
          </button>
          {loginMutation.isError ? (
            <p className="form-error">{getAuthError(loginMutation.error)}</p>
          ) : null}
        </form>
        <a className="subtle-link" href="#forgot">
          Forgot password?
        </a>
        <Link className="subtle-link" to="/register">
          Create customer account
        </Link>
      </section>

      <section className="workspace-panel login-hero-panel">
        <div>
          <div className="security-chip">
            <ShieldCheck size={16} />
            Backend-authenticated access
          </div>
          <h2>One sign-in, role-aware workspace.</h2>
          <p>
            Revora routes customers, admins, mechanics, and owners from the authenticated user
            returned by the API.
          </p>
        </div>
        <div className="login-assurance-grid">
          <div>
            <LockKeyhole size={18} />
            <strong>Bearer token session</strong>
            <p>Requests automatically include Authorization headers after login.</p>
          </div>
          <div>
            <ShieldCheck size={18} />
            <strong>Protected routes</strong>
            <p>Users can only enter screens allowed by their backend role.</p>
          </div>
        </div>
      </section>
    </MotionPage>
  )
}
