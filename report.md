# Revora Frontend Backend Progress Report

Generated: 2026-05-15

This report describes the current frontend implementation state against the latest backend handoff. It focuses on what is already covered in the React client, what is partially covered, what is still missing, and what should be evolved next.

## Summary

The frontend has moved from a static Stitch-inspired prototype into a backend-aware React application. The app now uses real API service layers, bearer-token auth, role-based routing, React Query data fetching, Zustand session persistence, React Hook Form and Zod validation, and route-level code splitting.

The core shells for `customer`, `admin`, `mechanic`, and `owner` exist. The strongest coverage right now is auth, customer dashboard basics, customer booking entry, customer service tracking, admin service-order list, mechanic assigned jobs, and owner oversight dashboard. The largest remaining gap is deep operational CRUD/detail flows: admin booking detail, admin service order detail, mechanic detail page, staff create/edit forms, vehicle CRUD forms, and richer tracking/estimate item rendering.

## Frontend Architecture

- [x] Vite React app cleaned from starter template
- [x] `main.tsx` kept minimal
- [x] Routing moved to `src/app/AppRouter.tsx`
- [x] Shared provider wrapper in `src/providers/AppProviders.tsx`
- [x] Axios API client in `src/lib/api.ts`
- [x] Zustand auth persistence in `src/stores/authStore.ts`
- [x] React Query hooks for backend data
- [x] Route guards by role
- [x] Route-level lazy loading/code splitting
- [x] Shared UI components

Covered components:
- `Brand`
- `StatusBadge`
- `StatCard`
- `ServiceTimeline`
- `WorkOrderTable`
- `AsyncState`
- `LoadingBlock`
- `MotionPage`
- `ProtectedRoute`

Issue: none blocking.

Gap: shared form controls, modal/slide-over primitives, pagination controls, toast notifications, and detail panel abstractions are not yet standardized.

## Environment

- [x] `.env.example`
- [x] `VITE_API_BASE_URL=http://localhost:8000/api`
- [x] Axios default `Accept: application/json`
- [x] Bearer token request interceptor
- [x] 401 response clears session

Issue: local backend was not reachable during the last check from this environment.

Expected:
- Backend runs at `http://localhost:8000/api`
- Frontend can login and fetch protected endpoints

Actual:
- Frontend is ready for that base URL
- Local test request to `/api/services` could not connect

Gap:
- Live integration should be tested after backend server is running.

## Auth

- [x] `POST /login`
- [x] `POST /register`
- [x] `GET /user`
- [x] `POST /logout`
- [x] Bearer token storage
- [x] Role-based redirect after login
- [x] Role-based route guard
- [x] Customer register page
- [x] Login validation with Zod
- [x] Register validation with Zod

Expected:
- Login/register returns `user`, `token`, `token_type`
- User shape includes a clear role
- `GET /user` returns the same role consistently

Actual:
- Frontend supports role fields in several possible shapes:
  - `user.role`
  - `user.role.name`
  - `user.role.slug`
  - `user.role_name`
  - `user.roleName`
  - `user.user_role`
  - `user.userRole`
  - `user.type`
  - `user.roles[]`
  - root response `data.role`
  - root response `data.roles[0]`

Gap:
- Best backend shape should be standardized as `user.role: "customer" | "admin" | "mechanic" | "owner"`.
- Forgot password UI is present as a link only; no endpoint integration yet.

Issue:
- Previously all accounts redirected to customer because the role resolver was too narrow. This has been fixed.

## Route Guards

- [x] Customer-only routes
- [x] Admin routes
- [x] Mechanic-only routes
- [x] Owner-only routes
- [x] Unauthorized users redirect to login
- [x] Wrong-role users redirect to their own role dashboard

Expected:
- `customer` can access `/customer`
- `admin` can access `/admin`
- `mechanic` can access `/mechanic`
- `owner` can access `/owner`

Actual:
- Route guards are implemented using persisted auth role.
- `/admin` currently allows `admin` and `owner`.

Gap:
- If owner should never access admin UI, remove `owner` from the `/admin` allowed roles.
- Need permission-level guards for specific actions, not only page-level role guards.

## Customer Dashboard

- [x] `GET /dashboard`
- [x] `GET /vehicles`
- [x] `GET /services`
- [x] `GET /booking-slots?date=YYYY-MM-DD`
- [x] `POST /bookings`
- [x] `GET /bookings`
- [x] `GET /service-orders`
- [x] Active service summary from `/service-orders`
- [x] Recent completed service history from `/service-orders`
- [x] Vehicle list from `/vehicles`
- [x] Booking form UI
- [x] Service selector
- [x] Date picker
- [x] Slot selector with disabled state
- [x] Upcoming bookings list

Expected:
- Customer dashboard should show active service, vehicles, upcoming bookings, recent service history, summary stats, and allow service booking.
- Booking slot selector should disable unavailable slots.

Actual:
- Dashboard uses `/dashboard` for top-level summary cards and composes operational details from granular endpoints.
- Booking form submits `vehicle_id`, `service_ids`, `booking_date`, `booking_time`, and empty `complaint_note`.

Gap:
- Vehicle create/update/delete UI does not exist yet.
- Complaint note field should be added to booking form.
- Booking cancel action is not implemented.
- Service filtering/search is not implemented in the UI.
- No dedicated booking detail page yet.

Recommended frontend evolution:
- Add vehicle CRUD forms.
- Add complaint note textarea to booking form.
- Add booking detail and cancel flow.
- Add service search/category filter.

## Customer Service Tracking

- [x] `GET /service-orders/{id}/tracking`
- [x] `PATCH /service-orders/{id}/approve`
- [x] `PATCH /service-orders/{id}/reject`
- [x] Route: `/customer/service-orders/:serviceOrderId`
- [x] Timeline rendering
- [x] Inspection summary rendering
- [x] Inspection item rendering
- [x] Cost summary rendering
- [x] Estimate item rendering
- [x] Vehicle header rendering
- [x] Technical notes rendering
- [x] Approval/reject form with note
- [x] Approval buttons only active when backend status is `waiting_approval` and approval status is `pending`

Expected:
- Tracking page should prefer `/service-orders/{id}/tracking`.
- Approval buttons should only appear or be enabled when backend status is `waiting_approval` and approval status is `pending`.

Actual:
- Tracking page uses the tracking endpoint.
- Buttons are disabled unless `current_status = waiting_approval` and `customer_approval_status = pending`.
- Basic note submission is supported.
- Vehicle, estimate items, inspection items, timeline notes, and technical notes render from the tracking resource.

Gap:
- The old `/customer/tracking` route exists but has no id, so it shows a choose-service-order empty state.

Recommended frontend evolution:
- Improve table density and mobile layout for long estimate/inspection lists.
- Add success/error toast after approve/reject.

## Customer Vehicles

- [x] `GET /vehicles`
- [ ] `POST /vehicles`
- [ ] `GET /vehicles/{vehicle}`
- [ ] `PUT /vehicles/{vehicle}`
- [ ] `DELETE /vehicles/{vehicle}`

Expected:
- Customer can manage their own vehicles.

Actual:
- Vehicles are listed on customer dashboard.

Gap:
- No vehicle management page yet.
- No create/edit/delete forms yet.
- Delete guard for vehicles with booking history is not represented in UI.

Recommended frontend evolution:
- Add `/customer/vehicles` route.
- Add create vehicle form with transmission/fuel enums.
- Add edit/delete actions and backend validation display.

## Public Service Catalog

- [x] `GET /services`
- [x] `GET /service-categories` service layer and hook
- [ ] `GET /services/{service}`

Expected:
- Customer can browse active services and select them for booking.

Actual:
- Booking form fetches services and lets customer select services.
- Categories hook exists but category filter UI is not wired yet.

Gap:
- No dedicated services page.
- No service detail page.
- No category filter/search UI yet.

Recommended frontend evolution:
- Add `/customer/services`
- Add service category tabs/filter.
- Add service detail drawer/page.

## Customer Bookings

- [x] `GET /bookings`
- [x] `POST /bookings`
- [x] `GET /booking-slots`
- [ ] `GET /bookings/{booking}`
- [ ] `DELETE /bookings/{booking}`

Expected:
- Customer can create, view, and cancel allowed bookings.

Actual:
- Customer can create a booking from dashboard.
- Upcoming pending/confirmed bookings are displayed.

Gap:
- No booking detail page.
- No cancel booking flow.
- No status logs rendering.
- No related service order link if booking has a service order.

Recommended frontend evolution:
- Add booking detail route.
- Add cancel button for `pending` and `confirmed`.
- Link booking to service tracking when `service_order` exists.

## Admin Dashboard

- [x] `GET /admin/service-orders`
- [x] Admin operations hub
- [x] Admin service order queue
- [x] Mechanic workload derived from service orders
- [x] Alerts derived from unassigned/waiting approval service orders
- [ ] `GET /admin`
- [ ] `GET /admin/bookings`

Expected:
- Admin dashboard should show operational queue, bookings requiring confirmation, assignments, and bottlenecks.

Actual:
- Admin dashboard currently focuses on service orders.
- It does not yet use `/admin` dashboard summary or `/admin/bookings`.

Gap:
- Admin booking confirmation workflow is not shown yet.
- Admin dashboard summary endpoint is not used.
- Today appointments/bookings panel is not wired.

Recommended backend shape:
- `GET /admin` should return summary stats and recent/urgent bookings.

Recommended frontend evolution:
- Add admin booking list panel.
- Add confirm/cancel/in-progress booking actions.
- Add create service order flow from confirmed booking.

## Admin Bookings

- [x] Service layer for `GET /admin/bookings`
- [x] Hook for `GET /admin/bookings`
- [x] Service layer for `PATCH /admin/bookings/{id}/status`
- [x] Hook for update booking status
- [x] Service layer for `POST /admin/bookings/{id}/service-order`
- [x] Hook for create service order
- [ ] UI page for booking list
- [ ] UI page for booking detail
- [ ] UI controls for booking status transitions
- [ ] UI form for creating service order

Expected:
- Admin can confirm/cancel bookings and create service orders.

Actual:
- API hooks exist but no admin booking UI is built yet.

Gap:
- This is one of the highest priority missing workflows.

Recommended frontend evolution:
- Add `/admin/bookings`.
- Add booking table and detail panel.
- Add status transition controls.
- Add create service order modal with mechanic selector.

## Admin Service Orders

- [x] `GET /admin/service-orders`
- [x] Service order management page
- [x] Service order table
- [x] Selected order panel
- [ ] `GET /admin/service-orders/{id}`
- [ ] `PATCH /admin/service-orders/{id}/assign-mechanic`
- [ ] `PUT /admin/service-orders/{id}/inspection-items`
- [ ] `POST /admin/service-orders/{id}/items`
- [ ] `PATCH /admin/service-orders/{id}/status`
- [ ] `GET /admin/mechanics`

Expected:
- Admin can inspect details, assign mechanic, manage inspection, add estimate items, and move status.

Actual:
- Admin can view service-order list and selected order summary.
- Action buttons are visual placeholders.

Gap:
- No detail endpoint integration.
- No mechanic assignment modal.
- No estimate item editor.
- No inspection item editor.
- No status controls.
- No rule-based disabling for `in_progress` after approval.

Recommended backend addition:
- Include `allowed_actions` in service order detail.

Recommended frontend evolution:
- Add `/admin/service-orders/:id`.
- Add assignment, inspection, estimate, notes, and status sections.
- Use `allowed_actions` to enable/disable controls.

## Mechanic Workspace

- [x] `GET /mechanic/service-orders`
- [x] Assigned jobs list
- [x] Current job focus panel
- [x] Service timeline
- [x] Status update to `in_progress`
- [x] Status update to `quality_check`
- [ ] `GET /mechanic/service-orders/{id}`
- [ ] `PATCH /mechanic/service-orders/{id}/notes`
- [ ] `PUT /mechanic/service-orders/{id}/inspection-items`

Expected:
- Mechanic sees only assigned service orders and can update inspection/progress.

Actual:
- Mechanic workspace shows assigned orders from list endpoint.
- Basic status update buttons exist.

Gap:
- No mechanic detail page.
- No inspection item editor.
- No notes editor.
- No assigned service order detail endpoint integration.
- No allowed transition rendering.

Recommended backend addition:
- `GET /mechanic/service-orders/{id}` should include `inspection_items`, notes, booking complaint, and `allowed_transitions`.

Recommended frontend evolution:
- Add mechanic service order detail.
- Add inspection item sync form.
- Add mechanic notes form.
- Render allowed transitions from backend.

## Owner Dashboard

- [x] `GET /owner`
- [x] `GET /owner/activity`
- [x] `GET /owner/bookings`
- [x] `GET /owner/service-orders`
- [x] `GET /owner/customers`
- [x] `GET /owner/services`
- [x] `GET /owner/staff`
- [x] Owner business stats cards
- [x] Owner activity feed
- [x] Owner service health panel
- [x] Owner recent bookings panel
- [x] Owner customer/service visibility
- [x] Owner staff list
- [x] `DELETE /owner/staff/{id}` hook and UI button
- [ ] `POST /owner/staff` UI
- [ ] `PUT /owner/staff/{id}` UI

Expected:
- Owner should feel like strategic business oversight.
- Owner should not perform daily service workflow directly.

Actual:
- Owner dashboard now uses owner-specific endpoints instead of derived admin data.
- Activity, bookings, service health, customers/services, and staff are represented.

Gap:
- Staff create/edit forms are not implemented.
- Owner overview tables are compact and not paginated.
- No owner-specific detail pages yet.
- No chart library is used; status/activity visualizations are simple CSS.

Recommended backend shape:
- `GET /owner` should consistently return `business_stats`, `recent_bookings`, and `recent_service_orders`.
- `GET /owner/activity` should return normalized `title`, `description`, `type`, `status`, and `timestamp`.
- `GET /owner/staff` should include `role` and `assigned_service_orders_count`.

Recommended frontend evolution:
- Add staff management modal.
- Add owner tabs/routes: bookings, service orders, customers, services, staff.
- Add pagination and filters.

## Owner Staff Management

- [x] `GET /owner/staff`
- [x] `DELETE /owner/staff/{id}`
- [x] Service/hook for `POST /owner/staff`
- [x] Service/hook for `PUT /owner/staff/{id}`
- [ ] Create staff form UI
- [ ] Edit staff form UI
- [ ] Delete confirmation modal

Expected:
- Owner can create, edit, and remove admin/mechanic staff.

Actual:
- Staff list and delete button exist.
- Create/update hooks exist but UI is not built.

Gap:
- Create/update forms still need implementation.
- Delete currently has no confirmation layer.

Recommended frontend evolution:
- Add staff modal with role select: `admin`, `mechanic`.
- Add confirmation dialog before delete.

## Status Mapping

Booking:
- [x] `pending = Pending`
- [x] `confirmed = Confirmed`
- [x] `in_progress = In Progress`
- [x] `completed = Completed`
- [x] `cancelled = Cancelled`

Service order:
- [x] `vehicle_received = Vehicle Received`
- [x] `inspection = Inspection`
- [x] `waiting_approval = Waiting Approval`
- [x] `approved = Estimate Approved`
- [x] `in_progress = In Progress`
- [x] `quality_check = Quality Check`
- [x] `completed = Completed`
- [x] `cancelled = Cancelled`

Inspection:
- [x] `good = Good`
- [x] `attention = Needs Attention`
- [x] `critical = Critical`

Expected:
- All backend statuses should map to clear frontend labels and badge tones.

Actual:
- Booking, service order, and customer tracking inspection statuses are covered.

Gap:
- Admin/mechanic inspection editor is still missing.

## Data Shape Expectations

The frontend works best if list endpoints include nested entities directly.

Expected service order list item:

```json
{
  "id": 1,
  "booking_code": "RV-20260515-0001",
  "status": "waiting_approval",
  "customer_approval_status": "pending",
  "total_estimated_price": "600000.00",
  "final_total": null,
  "updated_at": "2026-05-15T03:00:00.000000Z",
  "due_at": null,
  "customer": {
    "id": 1,
    "name": "Customer Demo"
  },
  "vehicle": {
    "id": 1,
    "brand": "Toyota",
    "model": "Avanza",
    "year": 2022,
    "plate_number": "B 1234 RV"
  },
  "mechanic": {
    "id": 3,
    "name": "Mechanic Demo"
  }
}
```

Actual:
- Frontend supports this shape and has some fallbacks for `booking.vehicle` and `booking.customer`.

Gap:
- If backend omits nested `vehicle`, `customer`, or `mechanic`, some table fields become generic placeholders.

## Validation And Errors

- [x] Login validation
- [x] Register validation
- [x] API error message helper
- [x] Empty state component
- [x] Error state component
- [x] Loading skeleton component
- [ ] Backend validation errors per field
- [ ] Toast notification system
- [ ] Global error boundary

Expected:
- Validation errors should be readable and field-specific.

Actual:
- Auth forms have frontend validation.
- API errors show general message.

Gap:
- Backend `errors.field[]` are not mapped into individual fields yet.

Recommended frontend evolution:
- Add field error mapper for Laravel validation errors.
- Add toast system for mutation success/failure.

## Current Verification

- [x] `npm run build`
- [x] `npm run lint`
- [x] Browser smoke test for login/register/guard
- [ ] Live backend end-to-end test

Issue:
- Backend was not reachable from the frontend environment during the last test:
  - `Unable to connect to the remote server`

Needed:
- Start backend on `http://localhost:8000/api`
- Test seeded role accounts:
  - `customer@revora.test`
  - `admin@revora.test`
  - `mechanic@revora.test`
  - `owner@revora.test`

## High Priority Next Evolution

1. Add admin booking page.
   - Use `GET /admin/bookings`
   - Confirm/cancel bookings
   - Create service order from confirmed booking

2. Add admin service order detail page.
   - Use `GET /admin/service-orders/{id}`
   - Assign mechanic
   - Edit inspection items
   - Add estimate items
   - Update notes/status

3. Add mechanic service order detail page.
   - Use `GET /mechanic/service-orders/{id}`
   - Update notes
   - Sync inspection items
   - Move status based on allowed transitions

4. Improve customer tracking.
   - Render estimate items
   - Render vehicle info
   - Render timeline notes
   - Render inspection item details

5. Add owner staff management forms.
   - Create staff
   - Edit staff
   - Delete confirmation

6. Add vehicle management.
   - Create/edit/delete customer vehicles
   - Respect backend delete restrictions

7. Add pagination and filters.
   - Admin bookings
   - Admin service orders
   - Owner overview lists
   - Customer bookings/service history

## Backend Recommendations For Frontend Maximum Polish

1. Keep role response consistent:

```json
{
  "user": {
    "id": 1,
    "name": "Owner Demo",
    "email": "owner@revora.test",
    "role": "owner"
  }
}
```

2. Add `allowed_actions` or `allowed_transitions` to detail endpoints.

Example:

```json
{
  "allowed_actions": {
    "can_assign_mechanic": true,
    "can_update_inspection": true,
    "can_edit_estimate": true,
    "can_move_to_in_progress": false,
    "can_complete": false
  }
}
```

3. Enrich tracking endpoint.

Add:
- `vehicle`
- `estimate_items`
- `notes`
- `inspection_items`

4. Normalize owner activity feed.

Each item should include:
- `id`
- `type`
- `title`
- `description`
- `status`
- `actor`
- `timestamp`

5. Use pagination consistently for table endpoints.

Preferred:

```json
{
  "success": true,
  "message": "Data loaded",
  "data": {
    "data": [],
    "meta": {
      "current_page": 1,
      "per_page": 10,
      "total": 100,
      "last_page": 10
    }
  }
}
```

## Final Current State

Frontend is now backend-first and role-aware. The application is no longer a static mock. It has real API integration layers for the major handoff endpoints and is ready for live backend testing.

The next major step is not visual polish. The next step is workflow depth: admin booking operations, admin service order detail, mechanic detail execution, owner staff CRUD, and customer vehicle/booking management.
