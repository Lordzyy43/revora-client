import { lazy, Suspense } from 'react'
import type { ReactNode } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ProtectedRoute } from '../components/ProtectedRoute'
import { RoleLayout } from '../layouts/RoleLayout'

const AdminHub = lazy(() => import('../pages/AdminHub').then((module) => ({ default: module.AdminHub })))
const AdminBookings = lazy(() =>
  import('../pages/AdminBookings').then((module) => ({ default: module.AdminBookings })),
)
const AdminServiceOrderDetail = lazy(() =>
  import('../pages/AdminServiceOrderDetail').then((module) => ({
    default: module.AdminServiceOrderDetail,
  })),
)
const AdminWorkOrders = lazy(() =>
  import('../pages/AdminWorkOrders').then((module) => ({ default: module.AdminWorkOrders })),
)
const ComponentLibrary = lazy(() =>
  import('../pages/ComponentLibrary').then((module) => ({ default: module.ComponentLibrary })),
)
const CustomerDashboard = lazy(() =>
  import('../pages/CustomerDashboard').then((module) => ({ default: module.CustomerDashboard })),
)
const CustomerBookings = lazy(() =>
  import('../pages/CustomerBookings').then((module) => ({ default: module.CustomerBookings })),
)
const CustomerVehicles = lazy(() =>
  import('../pages/CustomerVehicles').then((module) => ({ default: module.CustomerVehicles })),
)
const CustomerBookingDetail = lazy(() =>
  import('../pages/CustomerBookingDetail').then((module) => ({
    default: module.CustomerBookingDetail,
  })),
)
const LoginPage = lazy(() => import('../pages/LoginPage').then((module) => ({ default: module.LoginPage })))
const RegisterPage = lazy(() =>
  import('../pages/RegisterPage').then((module) => ({ default: module.RegisterPage })),
)
const MechanicWorkspace = lazy(() =>
  import('../pages/MechanicWorkspace').then((module) => ({ default: module.MechanicWorkspace })),
)
const MechanicServiceOrderDetail = lazy(() =>
  import('../pages/MechanicServiceOrderDetail').then((module) => ({
    default: module.MechanicServiceOrderDetail,
  })),
)
const NotFoundPage = lazy(() =>
  import('../pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })),
)
const OwnerDashboard = lazy(() =>
  import('../pages/OwnerDashboard').then((module) => ({ default: module.OwnerDashboard })),
)
const PublicHome = lazy(() =>
  import('../pages/PublicHome').then((module) => ({ default: module.PublicHome })),
)
const PublicServiceDetail = lazy(() =>
  import('../pages/PublicServiceDetail').then((module) => ({ default: module.PublicServiceDetail })),
)
const PublicServices = lazy(() =>
  import('../pages/PublicServices').then((module) => ({ default: module.PublicServices })),
)
const ServiceTrackingPage = lazy(() =>
  import('../pages/ServiceTrackingPage').then((module) => ({ default: module.ServiceTrackingPage })),
)

const router = createBrowserRouter([
  { path: '/', element: withSuspense(<PublicHome />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/register', element: withSuspense(<RegisterPage />) },
  { path: '/services', element: withSuspense(<PublicServices />) },
  { path: '/services/:serviceId', element: withSuspense(<PublicServiceDetail />) },
  {
    element: <ProtectedRoute allowedRoles={['customer']} />,
    children: [
      {
        path: '/customer',
        element: (
          <RoleLayout
            role="customer"
            title="Customer Dashboard"
            subtitle="Track active service, approvals, vehicles, and payments."
          />
        ),
        children: [
          { index: true, element: withSuspense(<CustomerDashboard />) },
          { path: 'vehicles', element: withSuspense(<CustomerVehicles />) },
          { path: 'bookings', element: withSuspense(<CustomerBookings />) },
          { path: 'bookings/:bookingId', element: withSuspense(<CustomerBookingDetail />) },
          { path: 'tracking', element: withSuspense(<ServiceTrackingPage />) },
          { path: 'service-orders/:serviceOrderId', element: withSuspense(<ServiceTrackingPage />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin', 'owner']} />,
    children: [
      {
        path: '/admin',
        element: (
          <RoleLayout
            role="admin"
            title="Operations Hub"
            subtitle="Control service flow, assignments, approvals, and handoffs."
          />
        ),
        children: [
          { index: true, element: withSuspense(<AdminHub />) },
          { path: 'bookings', element: withSuspense(<AdminBookings />) },
          { path: 'work-orders', element: withSuspense(<AdminWorkOrders />) },
          { path: 'service-orders/:serviceOrderId', element: withSuspense(<AdminServiceOrderDetail />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['mechanic']} />,
    children: [
      {
        path: '/mechanic',
        element: (
          <RoleLayout
            role="mechanic"
            title="Mechanic Workspace"
            subtitle="Execute assigned jobs with checklists, parts requests, and notes."
          />
        ),
        children: [
          { index: true, element: withSuspense(<MechanicWorkspace />) },
          { path: 'service-orders/:serviceOrderId', element: withSuspense(<MechanicServiceOrderDetail />) },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['owner']} />,
    children: [
      {
        path: '/owner',
        element: (
          <RoleLayout
            role="owner"
            title="Executive Dashboard"
            subtitle="Monitor revenue, throughput, team utilization, and business risk."
          />
        ),
        children: [{ index: true, element: withSuspense(<OwnerDashboard />) }],
      },
    ],
  },
  {
    path: '/components',
    element: (
      <RoleLayout
        role="admin"
        title="Component Library"
        subtitle="Reusable Revora interface patterns for implementation."
      />
    ),
    children: [{ index: true, element: withSuspense(<ComponentLibrary />) }],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<div className="route-loader">Loading Revora workspace...</div>}>{element}</Suspense>
}
