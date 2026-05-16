import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AsyncState } from '../components/AsyncState'
import { LoadingBlock } from '../components/LoadingBlock'
import { MotionPage } from '../components/MotionPage'
import { StatCard } from '../components/StatCard'
import { StatusBadge } from '../components/StatusBadge'
import {
  useDeleteOwnerStaff,
  useCreateOwnerStaff,
  useOwnerActivity,
  useOwnerBookings,
  useOwnerCustomers,
  useOwnerDashboard,
  useOwnerServiceOrders,
  useOwnerServices,
  useOwnerStaff,
  useUpdateOwnerStaff,
} from '../hooks/useOwner'
import { formatCurrency, toServiceStatus } from '../lib/status'
import type { Stat } from '../types'
import type { AuthUser } from '../stores/authStore'

const staffSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Valid email is required'),
    phone: z.string().optional(),
    role: z.enum(['admin', 'mechanic']),
    password: z.string().optional(),
    password_confirmation: z.string().optional(),
  })
  .refine((values) => (values.password ?? '') === (values.password_confirmation ?? ''), {
    message: 'Passwords do not match',
    path: ['password_confirmation'],
  })

type StaffForm = z.infer<typeof staffSchema>

export function OwnerDashboard() {
  const dashboardQuery = useOwnerDashboard()
  const activityQuery = useOwnerActivity()
  const bookingsQuery = useOwnerBookings()
  const serviceOrdersQuery = useOwnerServiceOrders()
  const customersQuery = useOwnerCustomers()
  const servicesQuery = useOwnerServices()
  const staffQuery = useOwnerStaff()
  const deleteStaffMutation = useDeleteOwnerStaff()
  const [editingStaff, setEditingStaff] = useState<AuthUser | null>(null)
  const [showStaffForm, setShowStaffForm] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'operations' | 'customers' | 'team'>('overview')

  const dashboard = dashboardQuery.data
  const statsSource = dashboard?.business_stats ?? dashboard?.stats ?? {}
  const bookings = bookingsQuery.data ?? dashboard?.recent_bookings ?? []
  const serviceOrders = serviceOrdersQuery.data ?? dashboard?.recent_service_orders ?? []
  const customers = customersQuery.data ?? []
  const services = servicesQuery.data ?? []
  const staff = staffQuery.data ?? []
  const activity = activityQuery.data ?? []
  const statCards = buildOwnerStats(statsSource, {
    bookings: bookings.length,
    customers: customers.length,
    services: services.length,
    staff: staff.length,
  })

  return (
    <MotionPage className="page-stack">
      <section className="stat-grid">
        {dashboardQuery.isLoading ? <LoadingBlock rows={4} /> : null}
        {!dashboardQuery.isLoading &&
          statCards.map((stat) => <StatCard key={stat.label} {...stat} />)}
      </section>

      {dashboardQuery.isError ? (
        <AsyncState
          action="Retry"
          message="The owner dashboard endpoint could not be reached."
          onAction={() => void dashboardQuery.refetch()}
          title="Unable to load owner summary"
          variant="error"
        />
      ) : null}

      <section className="content-card">
        <div className="tabs">
          {[
            ['overview', 'Overview'],
            ['operations', 'Operations'],
            ['customers', 'Customers & Services'],
            ['team', 'Team'],
          ].map(([key, label]) => (
            <button
              className={`tab-button ${activeTab === key ? 'active' : ''}`}
              key={key}
              onClick={() => setActiveTab(key as typeof activeTab)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      {activeTab === 'overview' ? <section className="page-grid">
        <div className="content-card span-8">
          <div className="section-heading">
            <div>
              <h2>Business Activity</h2>
              <p>Merged booking and service-order activity from the owner feed.</p>
            </div>
            <StatusBadge tone="info">{`${activity.length} events`}</StatusBadge>
          </div>
          {activityQuery.isLoading ? <LoadingBlock /> : null}
          {!activityQuery.isLoading && activity.length === 0 ? (
            <AsyncState message="Booking and service order changes will appear here." title="No activity yet" />
          ) : null}
          <div className="activity-feed">
            {activity.slice(0, 8).map((item) => (
              <div className="activity-item" key={`${item.type}-${item.id}-${item.timestamp}`}>
                <span />
                <div>
                  <strong>{item.title ?? item.type ?? 'Activity'}</strong>
                  <p>{item.description ?? item.status ?? 'Operational update'}</p>
                </div>
                <small>{formatDate(item.timestamp ?? item.created_at)}</small>
              </div>
            ))}
          </div>
        </div>

        <div className="content-card span-4">
          <h2>Service Health</h2>
          {serviceOrdersQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {!serviceOrdersQuery.isLoading && serviceOrders.length === 0 ? (
            <AsyncState message="Service order monitoring will appear from /owner/service-orders." title="No service orders" />
          ) : null}
          {serviceOrders.slice(0, 5).map((order) => (
            <div className="alert-row" key={order.id}>
              <AlertTriangle size={17} />
              <span>{order.booking_code ?? `SO-${order.id}`}</span>
              <StatusBadge>{toServiceStatus(order.status)}</StatusBadge>
            </div>
          ))}
        </div>
      </section> : null}

      {activeTab === 'operations' ? <section className="page-grid">
        <div className="content-card span-4">
          <h2>Recent Bookings</h2>
          {bookingsQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {bookings.slice(0, 5).map((booking) => (
            <div className="list-row" key={booking.id}>
              <StatusBadge>{booking.status}</StatusBadge>
              <div>
                <strong>{booking.booking_code ?? `Booking #${booking.id}`}</strong>
                <p>
                  {booking.customer?.name ?? 'Customer'} | {booking.booking_date} {booking.booking_time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card span-8">
          <h2>Service Orders</h2>
          {serviceOrders.slice(0, 8).map((order) => (
            <div className="list-row" key={order.id}>
              <StatusBadge>{toServiceStatus(order.status)}</StatusBadge>
              <div>
                <strong>{order.booking_code ?? `SO-${order.id}`}</strong>
                <p>
                  {order.customer?.name ?? 'Customer'} | {order.vehicle?.brand} {order.vehicle?.model}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section> : null}

      {activeTab === 'customers' ? <section className="page-grid">
        <div className="content-card span-4">
          <h2>Customers & Services</h2>
          <div className="metric-list">
            <div>
              <span>Customers</span>
              <strong>{customers.length}</strong>
            </div>
            <div>
              <span>Services</span>
              <strong>{services.length}</strong>
            </div>
            <div>
              <span>Active Services</span>
              <strong>{services.filter((service) => service.is_active !== false).length}</strong>
            </div>
          </div>
        </div>

        <div className="content-card span-4">
          <h2>Customer Overview</h2>
          {customers.slice(0, 8).map((customer) => (
            <div className="list-row" key={customer.id}>
              <StatusBadge tone="info">Customer</StatusBadge>
              <div>
                <strong>{customer.name}</strong>
                <p>{customer.email ?? customer.phone ?? '-'}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="content-card span-4">
          <h2>Service Catalog</h2>
          {services.slice(0, 8).map((service) => (
            <div className="list-row" key={service.id}>
              <StatusBadge tone={service.is_active === false ? 'warning' : 'success'}>
                {service.is_active === false ? 'Inactive' : 'Active'}
              </StatusBadge>
              <div>
                <strong>{service.name}</strong>
                <p>{formatCurrency(service.base_price)}</p>
              </div>
            </div>
          ))}
        </div>
      </section> : null}

      {activeTab === 'team' ? <section className="page-grid">
        <div className="content-card span-4">
          <div className="section-heading">
            <h2>Staff</h2>
            <button
              className="button button-secondary"
              onClick={() => {
                setEditingStaff(null)
                setShowStaffForm((current) => !current)
              }}
              type="button"
            >
              <Plus size={15} />
              Add
            </button>
          </div>
          {staffQuery.isLoading ? <LoadingBlock rows={4} /> : null}
          {staff.map((member) => (
            <div className="list-row" key={member.id}>
              <StatusBadge tone="info">{String(member.role ?? 'staff')}</StatusBadge>
              <div>
                <strong>{member.name}</strong>
                <p>{member.email}</p>
              </div>
              <button
                className="icon-button"
                onClick={() => {
                  setEditingStaff(member)
                  setShowStaffForm(true)
                }}
                type="button"
                aria-label={`Edit ${member.name}`}
              >
                <Pencil size={15} />
              </button>
              <button
                className="icon-button"
                disabled={deleteStaffMutation.isPending}
                onClick={() => deleteStaffMutation.mutate(member.id)}
                type="button"
                aria-label={`Delete ${member.name}`}
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
          {showStaffForm ? (
            <StaffFormPanel
              editingStaff={editingStaff}
              onClose={() => {
                setEditingStaff(null)
                setShowStaffForm(false)
              }}
            />
          ) : null}
        </div>
        <div className="content-card span-8">
          <h2>Team Load</h2>
          {staff.map((member) => (
            <div className="workload-row" key={member.id}>
              <span>{member.name}</span>
              <div className="progress-track">
                <span style={{ width: `${Math.min(100, Number(member.assigned_service_orders_count ?? 0) * 16)}%` }} />
              </div>
              <strong>{Number(member.assigned_service_orders_count ?? 0)} jobs</strong>
            </div>
          ))}
        </div>
      </section> : null}
    </MotionPage>
  )
}

function StaffFormPanel({
  editingStaff,
  onClose,
}: {
  editingStaff: AuthUser | null
  onClose: () => void
}) {
  const createMutation = useCreateOwnerStaff()
  const updateMutation = useUpdateOwnerStaff(editingStaff?.id ?? '')
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<StaffForm>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      name: editingStaff?.name ?? '',
      email: editingStaff?.email ?? '',
      phone: editingStaff?.phone ?? '',
      role: editingStaff?.role === 'mechanic' ? 'mechanic' : 'admin',
      password: '',
      password_confirmation: '',
    },
  })

  function submit(values: StaffForm) {
    const payload = {
      ...values,
      password: values.password || undefined,
      password_confirmation: values.password_confirmation || undefined,
    }

    if (editingStaff) {
      updateMutation.mutate(payload, { onSuccess: onClose })
      return
    }

    createMutation.mutate(payload, { onSuccess: onClose })
  }

  return (
    <form className="form-stack compact-form" onSubmit={handleSubmit(submit)}>
      <h3>{editingStaff ? 'Edit Staff' : 'Create Staff'}</h3>
      <label>Name<input {...register('name')} />{errors.name ? <small className="field-error">{errors.name.message}</small> : null}</label>
      <label>Email<input {...register('email')} />{errors.email ? <small className="field-error">{errors.email.message}</small> : null}</label>
      <label>Phone<input {...register('phone')} /></label>
      <label>Role<select {...register('role')}><option value="admin">Admin</option><option value="mechanic">Mechanic</option></select></label>
      <label>Password<input {...register('password')} type="password" placeholder={editingStaff ? 'Leave empty to keep current' : ''} /></label>
      <label>Confirm Password<input {...register('password_confirmation')} type="password" />{errors.password_confirmation ? <small className="field-error">{errors.password_confirmation.message}</small> : null}</label>
      <div className="button-row">
        <button className="button button-primary" disabled={createMutation.isPending || updateMutation.isPending} type="submit">
          {editingStaff ? 'Save Staff' : 'Create Staff'}
        </button>
        <button className="button button-secondary" onClick={onClose} type="button">
          Cancel
        </button>
      </div>
    </form>
  )
}

function buildOwnerStats(
  rawStats: Record<string, string | number | null>,
  fallbacks: { bookings: number; customers: number; services: number; staff: number },
): Stat[] {
  const revenue = rawStats.revenue ?? rawStats.monthly_revenue ?? rawStats.total_revenue
  const activeOrders = rawStats.active_orders ?? rawStats.active_service_orders

  return [
    {
      label: 'Revenue',
      value: typeof revenue === 'number' ? formatCurrency(revenue) : String(revenue ?? '-'),
      trend: 'business summary',
      tone: 'good',
    },
    {
      label: 'Bookings',
      value: String(rawStats.bookings ?? rawStats.total_bookings ?? fallbacks.bookings),
      trend: 'owner overview',
    },
    {
      label: 'Active Orders',
      value: String(activeOrders ?? fallbacks.bookings),
      trend: 'service health',
      tone: Number(activeOrders ?? 0) > 0 ? 'warning' : 'neutral',
    },
    {
      label: 'Staff',
      value: String(rawStats.staff ?? rawStats.total_staff ?? fallbacks.staff),
      trend: `${fallbacks.customers} customers, ${fallbacks.services} services`,
    },
  ]
}

function formatDate(value?: string) {
  if (!value) return '-'

  return new Date(value).toLocaleString('id-ID')
}
