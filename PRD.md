# BookMe -- Product Requirements Document

## Overview

BookMe is an appointment booking platform for solo service providers (barbers, tutors, photographers, clinics) in the Philippines. Providers get a shareable booking link. Clients pick a service, choose an available time slot, and confirm -- no app download, no account required.

---

## Problem

Solo service providers manage bookings through text messages and DMs. This leads to:
- Double bookings
- Missed appointments
- Time wasted on back-and-forth scheduling
- No record of past bookings

Clients hate the process too -- messaging, waiting for a reply, going back and forth on availability.

---

## Solution

A simple web app where:
1. Providers set up a booking page with their services and available hours
2. Clients visit the provider's link, pick a service, date, time, and confirm
3. Providers see all bookings in a dashboard and can confirm or cancel

---

## Target Users

**Primary:** Solo service providers in the Philippines
- Barbers / salons
- Tutors / music teachers
- Photographers / videographers
- Small clinics / dental offices
- Freelancers offering hourly services

**Secondary:** Their clients (the people booking appointments)

---

## Tech Stack

| Layer       | Technology               |
|-------------|--------------------------|
| Frontend    | Next.js (App Router)     |
| Backend     | Next.js API routes       |
| Database    | PostgreSQL               |
| ORM         | Prisma                   |
| Auth        | NextAuth.js (credentials + Google) |
| Styling     | Tailwind CSS             |
| Deployment  | Single Docker container  |

### Architecture: Single Docker Container

Everything runs in one container:
- Next.js server (handles frontend + API)
- PostgreSQL database
- Supervised by a process manager (supervisord)

```
┌─────────────────────────────────┐
│         Docker Container        │
│                                 │
│  ┌───────────────────────────┐  │
│  │      supervisord          │  │
│  │                           │  │
│  │  ┌─────────┐ ┌─────────┐ │  │
│  │  │ Next.js │ │ Postgres│ │  │
│  │  │ :3000   │ │ :5432   │ │  │
│  │  └─────────┘ └─────────┘ │  │
│  └───────────────────────────┘  │
│                                 │
│  Volume: /var/lib/postgresql    │
└─────────────────────────────────┘
```

**Why single container:**
- Simple to deploy on any VPS (DigitalOcean, Railway, etc.)
- No docker-compose needed
- Low cost -- runs on a $5-6/mo droplet
- Easy to back up (one volume)

---

## Features

### MVP (v1.0)

#### Provider Features

**P1 - Auth & Onboarding**
- Sign up with email/password or Google
- Onboarding flow: business name, slug (booking URL), bio
- Slug validation (unique, URL-safe)

**P2 - Service Management**
- Add services with: name, duration (minutes), price (PHP)
- Edit and delete services
- Reorder services (drag or up/down)

**P3 - Availability**
- Set weekly schedule: which days are open, start time, end time per day
- Time slots auto-generated in 30-minute intervals based on service duration

**P4 - Booking Management**
- View all bookings (upcoming, past)
- Filter by status: pending, confirmed, cancelled
- Confirm or cancel a booking
- See client name and phone number

**P5 - Dashboard**
- Today's bookings at a glance
- Upcoming bookings count
- Quick link to share booking page

#### Client Features

**C1 - Booking Page**
- View provider profile: business name, bio
- Browse available services with price and duration
- No login or account required

**C2 - Booking Flow**
- Step 1: Select a service
- Step 2: Pick a date (next 14 available days shown)
- Step 3: Pick a time slot (only open slots shown)
- Step 4: Enter name and phone number
- Step 5: Confirmation screen with booking summary

**C3 - Booking Confirmation**
- Confirmation page with all details
- Unique booking reference number

### Post-MVP (v1.1+)

These are NOT built in v1.0. Listed here for future direction only.

- SMS notifications (via Semaphore API -- PH SMS gateway)
- Email confirmations
- Google Calendar sync for providers
- Block-off specific dates (holidays, leave)
- Custom booking page colors/branding
- Analytics (bookings per week, popular services, peak hours)
- Client booking history (by phone number)
- Online payment via GCash/Maya integration
- Multi-staff support
- Recurring appointments
- Waitlist for fully booked slots
- QR code generation for booking link
- Embed widget for existing websites

---

## Database Schema

```
providers
  id            UUID (PK)
  email         TEXT (unique)
  password_hash TEXT
  name          TEXT
  business_name TEXT
  slug          TEXT (unique)
  bio           TEXT
  created_at    TIMESTAMP
  updated_at    TIMESTAMP

services
  id            UUID (PK)
  provider_id   UUID (FK -> providers)
  name          TEXT
  duration      INT (minutes)
  price         INT (PHP, stored as cents)
  sort_order    INT
  is_active     BOOLEAN
  created_at    TIMESTAMP

availability
  id            UUID (PK)
  provider_id   UUID (FK -> providers)
  day_of_week   INT (0=Sunday, 6=Saturday)
  start_time    TIME
  end_time      TIME

bookings
  id            UUID (PK)
  provider_id   UUID (FK -> providers)
  service_id    UUID (FK -> services)
  date          DATE
  time          TIME
  client_name   TEXT
  client_phone  TEXT
  status        TEXT (pending | confirmed | cancelled)
  created_at    TIMESTAMP
  updated_at    TIMESTAMP
```

### Indexes
- `providers.slug` -- unique, used for routing
- `providers.email` -- unique, used for auth
- `bookings.provider_id + bookings.date` -- fast lookup for daily bookings
- `bookings.provider_id + bookings.status` -- filter by status

---

## API Routes

```
POST   /api/auth/signup          -- Create provider account
POST   /api/auth/login           -- Log in
POST   /api/auth/logout          -- Log out
GET    /api/auth/me              -- Get current provider

GET    /api/services             -- List provider's services
POST   /api/services             -- Add service
PATCH  /api/services/:id         -- Update service
DELETE /api/services/:id         -- Delete service

GET    /api/availability         -- Get provider's weekly schedule
PUT    /api/availability         -- Update weekly schedule (full replace)

GET    /api/bookings             -- List provider's bookings (with filters)
PATCH  /api/bookings/:id         -- Update booking status

# Public (no auth required)
GET    /api/providers/:slug      -- Get provider profile + services + availability
GET    /api/providers/:slug/slots?date=YYYY-MM-DD&service=ID  -- Get available time slots
POST   /api/providers/:slug/book -- Create a booking
```

---

## Pages

```
/                    -- Landing page (marketing)
/login               -- Provider login
/signup              -- Provider signup
/dashboard           -- Provider dashboard (protected)
/dashboard/services  -- Manage services (protected)
/dashboard/hours     -- Manage availability (protected)
/dashboard/settings  -- Account settings (protected)
/:slug               -- Public booking page (dynamic route)
```

---

## Non-Functional Requirements

**Performance**
- Booking page loads in under 2 seconds on 3G
- Time slot generation responds in under 200ms

**Security**
- Passwords hashed with bcrypt
- Auth sessions via HTTP-only cookies
- Rate limiting on booking creation (max 5 per IP per hour)
- Input sanitization on all user inputs
- CSRF protection on all mutations

**Reliability**
- PostgreSQL data persisted via Docker volume
- Graceful shutdown handling for both Next.js and PostgreSQL

**Accessibility**
- WCAG 2.2 AA on the booking page
- Keyboard navigable
- Screen reader friendly

---

## Success Metrics

1. **Can a provider set up a booking page in under 5 minutes?**
2. **Can a client complete a booking in under 60 seconds?**
3. **Zero double bookings** -- the system must never allow overlapping appointments

---

## Monetization (Future)

- Free tier: 1 provider, up to 50 bookings/month
- Pro tier: Unlimited bookings, SMS notifications, analytics -- P299/month
- Business tier: Multi-staff, custom branding -- P599/month

---

## Development Phases

**Phase 1 -- Foundation (current)**
- [x] Project scaffolding (Next.js + Tailwind)
- [x] Landing page
- [x] Client booking flow UI (mock data)
- [x] Provider dashboard UI (mock data)
- [ ] Docker setup (Next.js + PostgreSQL in single container)
- [ ] Prisma schema + migrations
- [ ] Database seed script

**Phase 2 -- Backend**
- [ ] Provider auth (signup/login/logout)
- [ ] Service CRUD API
- [ ] Availability API
- [ ] Booking creation API
- [ ] Time slot generation (server-side, prevents race conditions)

**Phase 3 -- Integration**
- [ ] Connect booking flow to real API
- [ ] Connect dashboard to real API
- [ ] Dynamic provider routes (/:slug)
- [ ] Protected routes (redirect to login if not authenticated)

**Phase 4 -- Polish**
- [ ] Form validation and error states
- [ ] Loading states and skeletons
- [ ] Empty states
- [ ] Mobile responsive fine-tuning
- [ ] SEO meta tags per provider page
- [ ] Lighthouse audit and fixes
