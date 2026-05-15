import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Brand } from '../components/Brand'
import { MotionPage } from '../components/MotionPage'
import { getAuthError, useRegisterCustomer } from '../hooks/useAuth'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email address'),
    phone: z.string().min(8, 'Phone is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    password_confirmation: z.string().min(8, 'Confirmation is required'),
  })
  .refine((value) => value.password === value.password_confirmation, {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type RegisterForm = z.infer<typeof registerSchema>

export function RegisterPage() {
  const registerMutation = useRegisterCustomer()
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: '',
    },
  })

  return (
    <MotionPage className="login-page">
      <section className="login-panel">
        <Brand />
        <div>
          <p className="eyebrow">Customer account</p>
          <h1>Create your Revora account</h1>
          <p>Register as a customer to manage vehicles, bookings, and service tracking.</p>
        </div>
        <form
          className="form-stack"
          onSubmit={handleSubmit((values) => registerMutation.mutate(values))}
        >
          <label>
            Name
            <input {...register('name')} autoComplete="name" placeholder="Customer Demo" />
            {errors.name ? <small className="field-error">{errors.name.message}</small> : null}
          </label>
          <label>
            Email
            <input {...register('email')} autoComplete="email" placeholder="customer@example.test" />
            {errors.email ? <small className="field-error">{errors.email.message}</small> : null}
          </label>
          <label>
            Phone
            <input {...register('phone')} autoComplete="tel" placeholder="081234567890" />
            {errors.phone ? <small className="field-error">{errors.phone.message}</small> : null}
          </label>
          <label>
            Password
            <input {...register('password')} autoComplete="new-password" type="password" />
            {errors.password ? <small className="field-error">{errors.password.message}</small> : null}
          </label>
          <label>
            Confirm Password
            <input
              {...register('password_confirmation')}
              autoComplete="new-password"
              type="password"
            />
            {errors.password_confirmation ? (
              <small className="field-error">{errors.password_confirmation.message}</small>
            ) : null}
          </label>
          <button className="button button-primary" disabled={registerMutation.isPending} type="submit">
            {registerMutation.isPending ? 'Creating account' : 'Create account'}
            <ArrowRight size={16} />
          </button>
          {registerMutation.isError ? (
            <p className="form-error">{getAuthError(registerMutation.error)}</p>
          ) : null}
        </form>
        <Link className="subtle-link" to="/">
          Already have an account?
        </Link>
      </section>
      <section className="workspace-panel login-hero-panel">
        <div>
          <p className="eyebrow">Customer flow</p>
          <h2>Vehicles, bookings, and tracking from one account.</h2>
          <p>
            After registration, the backend returns a bearer token and Revora sends the customer
            straight into the customer workspace.
          </p>
        </div>
      </section>
    </MotionPage>
  )
}
