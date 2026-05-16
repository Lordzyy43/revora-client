# Revora Backend Evolution Report

Generated: 2026-05-16

## Context

Frontend now supports a fuller Revora product flow:

- Public home
- Public service catalog
- Public service detail
- Customer onboarding dashboard state
- Customer booking intent from service detail
- Admin service order table and kanban overview
- Admin/mechanic inspection templates in the UI
- Owner dashboard tabs for overview, operations, customers/services, and team

Most current backend primitives are enough for the usable baseline. The items below are recommended backend additions so the frontend can stop relying on fallback copy, hardcoded templates, or local-only UI assumptions.

## 1. Public Service Catalog Enrichment

Current frontend uses:

- `GET /services`
- `GET /services/{service}`
- `GET /service-categories`

Current gap:

- Service cards and detail pages need richer content than `name`, `description`, `estimated_duration`, and `base_price`.

Recommended fields on service resource:

```json
{
  "id": 1,
  "service_category_id": 1,
  "name": "Oil Change",
  "slug": "oil-change",
  "short_description": "Fast engine oil replacement for daily-use vehicles.",
  "description": "Engine oil replacement service to maintain engine performance.",
  "image_url": "https://...",
  "estimated_duration": 45,
  "base_price": "250000.00",
  "benefits": [
    "Maintains engine performance",
    "Reduces long-term wear",
    "Includes basic fluid check"
  ],
  "included_items": [
    "Oil level check",
    "Oil replacement",
    "Basic leak inspection"
  ],
  "is_featured": true,
  "is_active": true,
  "category": {}
}
```

Frontend benefit:

- Public catalog becomes a real customer-facing service page, not just a list of operational service records.

## 2. Workshop Profile Resource

Current gap:

- Public home needs workshop identity, address, hours, contact, and brand copy.
- Frontend currently uses static copy.

Recommended endpoint:

```txt
GET /workshop-profile
```

Recommended response:

```json
{
  "name": "Revora Auto Care",
  "tagline": "Transparent vehicle service from booking to completion.",
  "description": "Modern workshop service with digital tracking and estimate approval.",
  "phone": "081234567890",
  "email": "hello@revora.test",
  "address": "Jl. Revora No. 1, Jakarta",
  "opening_hours": [
    { "day": "monday", "open": "08:00", "close": "17:00" }
  ],
  "hero_image_url": "https://..."
}
```

Frontend benefit:

- Public home becomes backend-driven and ready for branding.

## 3. Booking Slots With Service Context

Current frontend uses:

```txt
GET /booking-slots?date=YYYY-MM-DD
```

Current gap:

- Slot capacity does not consider selected services, duration, or estimated workload.

Recommended endpoint behavior:

```txt
GET /booking-slots?date=YYYY-MM-DD&service_ids[]=1&service_ids[]=2
```

Recommended response additions:

```json
{
  "date": "2026-05-22",
  "estimated_duration": 90,
  "slots": [
    {
      "time": "10:00",
      "booked_count": 1,
      "capacity": 3,
      "remaining": 2,
      "available": true,
      "reason": null
    }
  ]
}
```

Frontend benefit:

- Booking availability feels accurate when customer selects multiple services.

## 4. Inspection Templates

Current frontend status:

- Admin/mechanic inspection forms now have frontend fallback templates:
  - Engine Oil
  - Brake System
  - Battery
  - Tires
  - AC System

Current gap:

- Templates should come from backend so workshop owner/admin can maintain them.

Recommended endpoints:

```txt
GET /inspection-templates
GET /admin/inspection-templates
POST /admin/inspection-templates
PUT /admin/inspection-templates/{template}
DELETE /admin/inspection-templates/{template}
```

Recommended item shape:

```json
{
  "id": 1,
  "component_name": "Engine Oil",
  "default_condition": "attention",
  "default_note": "Check level, color, and leak signs.",
  "is_active": true,
  "sort_order": 1
}
```

Frontend benefit:

- Inspection checklist becomes configurable and workshop-specific.

## 5. Kanban/Workflow Resource

Current frontend status:

- Admin Work Orders has a frontend-generated kanban based on service order list status.

Current gap:

- Frontend has to group and count manually.
- No server-provided stage counts or workload metadata.

Recommended endpoint:

```txt
GET /admin/service-orders/kanban
```

Recommended response:

```json
{
  "columns": [
    {
      "status": "vehicle_received",
      "label": "Vehicle Received",
      "count": 3,
      "orders": []
    }
  ],
  "summary": {
    "total": 12,
    "waiting_approval": 2,
    "unassigned": 1,
    "overdue": 0
  }
}
```

Frontend benefit:

- Admin operations page can load faster and display more accurate operational metrics.

## 6. Attachments / Evidence

Current gap:

- Mechanic detail has an entry point concept for evidence, but no backend resource yet.

Recommended endpoints:

```txt
GET /service-orders/{serviceOrder}/attachments
POST /mechanic/service-orders/{serviceOrder}/attachments
DELETE /mechanic/service-orders/{serviceOrder}/attachments/{attachment}
```

Recommended shape:

```json
{
  "id": 1,
  "type": "inspection_photo",
  "url": "https://...",
  "caption": "Brake pad wear",
  "uploaded_by": {
    "id": 4,
    "name": "Mechanic Demo"
  },
  "created_at": "2026-05-16T03:00:00.000000Z"
}
```

Frontend benefit:

- Customer approval page can show real inspection proof.

## 7. Notifications

Current gap:

- Header has notification affordance but no unread notification resource.

Recommended endpoints:

```txt
GET /notifications
PATCH /notifications/{notification}/read
PATCH /notifications/read-all
```

Recommended triggers:

- Booking confirmed/cancelled
- Service order waiting approval
- Estimate approved/rejected
- Service completed
- Mechanic assigned

Frontend benefit:

- Customer/admin/mechanic/owner dashboards can show actionable alerts.

## 8. Invoice / Payment Placeholder

Current gap:

- Service order has cost summary but no invoice/payment resource.

Recommended endpoints:

```txt
GET /service-orders/{serviceOrder}/invoice
GET /invoices/{invoice}
POST /admin/service-orders/{serviceOrder}/invoice
PATCH /admin/invoices/{invoice}/status
```

Recommended statuses:

```txt
draft
issued
paid
void
```

Frontend benefit:

- Customer flow can continue naturally after service completion.

## Priority Recommendation

Implement backend additions in this order:

1. Service catalog enrichment fields
2. Inspection templates
3. Attachments/evidence
4. Notifications
5. Kanban summary endpoint
6. Workshop profile
7. Booking slots with `service_ids`
8. Invoice/payment resource

## Current Frontend Fallbacks To Replace Later

- Public service detail included items and benefits are currently fallback arrays.
- Admin/mechanic inspection templates are currently frontend constants.
- Admin kanban is currently grouped from `/admin/service-orders`.
- Public home workshop profile is currently static copy.
- Notifications and evidence are UI affordances only.
