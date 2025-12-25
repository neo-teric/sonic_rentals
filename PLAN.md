---
name: Audio Rental Portal
overview: Build a full-stack Professional Audio Rental Portal using Next.js, TypeScript, and SQLite, featuring a dark mode UI, package-based inventory system, 6-step booking flow, admin dashboard, and revenue optimization through strategic upsells.
todos:
  - id: setup
    content: Initialize Next.js project with TypeScript, Tailwind CSS, and Prisma. Set up project structure, Docker configuration (Dockerfile, docker-compose.yml), and configuration files.
    status: pending
  - id: database
    content: Create Prisma schema with all tables (Packages, Equipment, AddOns, Bookings, BookingItems, MaintenanceLog, Users). Run migrations and seed initial data.
    status: pending
    dependencies:
      - setup
  - id: theme
    content: Implement dark mode theme with custom color palette (Charcoal/Deep Slate backgrounds, Neon Electric Blue accents). Create theme provider and base UI components.
    status: pending
    dependencies:
      - setup
  - id: packages
    content: Build package system with 4 starter packages. Create PackageCard component and package selection interface on homepage.
    status: pending
    dependencies:
      - database
      - theme
  - id: product-cards
    content: Create high-conversion ProductCard component with images, badges, specs, pricing, and Quick-Add functionality.
    status: pending
    dependencies:
      - theme
  - id: booking-flow
    content: "Implement 6-step booking flow: Selection → Scheduling → Upsell → Logistics → Verification → Checkout. Create booking API endpoints."
    status: pending
    dependencies:
      - packages
      - product-cards
      - file-upload
  - id: calendar
    content: Build interactive calendar component with real-time availability checking for equipment and packages. Implement availability calculation logic to prevent double-booking.
    status: pending
    dependencies:
      - database
      - booking-flow
  - id: upsell
    content: Create 'Finish Your Rig' upsell modal with smart suggestions based on selected items. Build AddOnMenu component with categorized add-ons.
    status: pending
    dependencies:
      - booking-flow
      - calendar
  - id: admin-dashboard
    content: Build admin dashboard with Inventory Manager, Maintenance Log, Post-Rental Inspection, and Master Calendar views.
    status: pending
    dependencies:
      - database
      - theme
      - authentication
  - id: payment
    content: Integrate Stripe for rental fees and refundable security deposits. Handle payment processing and deposit refunds.
    status: pending
    dependencies:
      - booking-flow
  - id: documentation
    content: Create Setup Guide and User Agreement pages with all safety rules, legal terms, and operational guidelines.
    status: pending
    dependencies:
      - theme
  - id: polish
    content: Add email notifications, availability logic, late fee calculations, responsive design refinements, and performance optimizations.
    status: pending
    dependencies:
      - admin-dashboard
      - payment
  - id: file-upload
    content: Implement file upload system for ID verification. Create FileUpload component, upload API endpoint, file validation (size, type), and secure storage in Docker volume.
    status: pending
    dependencies:
      - setup
  - id: authentication
    content: Set up NextAuth.js with credentials provider for admin authentication. Create protected admin routes and session management.
    status: pending
    dependencies:
      - database
      - setup
---

# Professional Audio Rental Portal - Implementation Plan

## Architecture Overview

A Next.js 14+ full-stack application with:

- **Frontend**: Next.js App Router, TypeScript, Tailwind CSS (Dark Mode)
- **Backend**: Next.js API Routes
- **Database**: SQLite with Prisma ORM
- **Styling**: Tailwind CSS with custom dark theme (Charcoal/Deep Slate + Neon Electric Blue accents)
- **Authentication**: NextAuth.js (for admin dashboard)
- **File Upload**: For ID verification and documentation
- **Payment**: Stripe integration (rental fees + security deposits)
- **Containerization**: Docker with docker-compose for local development and deployment

## Project Structure

```
sonic_rentals/
├── app/
│   ├── (public)/              # Public routes
│   │   ├── page.tsx           # Homepage with package selection
│   │   ├── packages/          # Package detail pages
│   │   ├── booking/           # 6-step booking flow
│   │   ├── setup-guide/       # Setup guide document
│   │   └── agreement/         # User agreement document
│   ├── (admin)/               # Admin routes (protected)
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── inventory/         # Inventory manager
│   │   ├── calendar/          # Master calendar view
│   │   └── rentals/           # Rental management
│   ├── api/
│   │   ├── packages/          # Package CRUD
│   │   ├── inventory/         # Equipment CRUD
│   │   ├── bookings/         # Booking operations
│   │   ├── addons/           # Add-on suggestions
│   │   ├── availability/     # Availability checking
│   │   ├── upload/           # File upload (ID verification)
│   │   ├── inspections/      # Post-rental inspection
│   │   ├── refunds/          # Deposit refund processing
│   │   └── auth/             # Authentication
│   └── layout.tsx             # Root layout with dark theme
├── components/
│   ├── ui/                    # Reusable UI components
│   │   ├── ProductCard.tsx    # High-conversion product card
│   │   ├── PackageCard.tsx    # Package selection card
│   │   ├── BookingCalendar.tsx # Interactive calendar
│   │   ├── UpsellModal.tsx    # "Finish Your Rig" popup
│   │   └── AddOnMenu.tsx      # Add-on selection menu
│   ├── booking/               # Booking flow components
│   │   ├── SignaturePad.tsx  # Digital signature capture
│   │   └── FileUpload.tsx    # ID upload component
│   ├── admin/                 # Admin dashboard components
│   │   ├── InspectionChecklist.tsx # Post-rental inspection
│   │   └── GanttChart.tsx    # Master calendar Gantt view
│   └── layout/                # Layout components
├── lib/
│   ├── db.ts                  # Prisma client
│   ├── utils.ts               # Utility functions
│   ├── stripe.ts              # Stripe integration
│   ├── availability.ts        # Availability calculation logic
│   ├── upload.ts              # File upload utilities
│   └── auth.ts                # NextAuth configuration
├── prisma/
│   └── schema.prisma          # Database schema
├── public/
│   ├── images/                # Product images
│   └── documents/             # Setup guide & agreement PDFs
├── types/
│   └── index.ts               # TypeScript types
├── Dockerfile                 # Docker image for Next.js app
├── docker-compose.yml         # Docker Compose configuration
├── .dockerignore              # Docker ignore file
└── .env.example               # Environment variables template
```

## Database Schema

### Tables with Relationships

**Packages Table**:

- id (String, @id, @default(uuid()))
- name (String)
- idealFor (String)
- crowdSize (String)
- keyEquipment (Json) - Array of equipment IDs
- setupTime (Int) - Minutes
- basePrice (Float)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- bookings (Booking[]) - One-to-many relationship

**Equipment Table**:

- id (String, @id, @default(uuid()))
- name (String)
- category (String)
- specs (Json) - {watts, audienceCapacity, connectionTypes, etc.}
- dayRate (Float)
- serialNumber (String?) - Optional: for tracking individual units
- status (String) - Active/InRepair/Retired
- imageUrl (String?)
- quantity (Int, @default(1)) - Total available units (for aggregate tracking)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- bookingItems (BookingItem[]) - Many-to-many through BookingItems
- maintenanceLogs (MaintenanceLog[]) - One-to-many relationship
- @@index([status])
- @@index([category])
- Note: Use quantity for aggregate tracking. If serialNumber is provided, it's for reference only.

**AddOns Table**:

- id (String, @id, @default(uuid()))
- name (String)
- category (String) - Atmosphere/Technical/Premium
- price (Float)
- description (String)
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- bookingItems (BookingItem[]) - One-to-many relationship
- @@index([category])

**Bookings Table**:

- id (String, @id, @default(uuid()))
- userId (String)
- packageId (String?)
- pickupDate (DateTime)
- returnDate (DateTime)
- totalPrice (Float)
- deposit (Float)
- status (String) - Pending/Confirmed/Active/Completed/Cancelled
- deliveryOption (String) - WarehousePickup/ProfessionalDelivery
- signature (String?) - Base64 encoded signature
- idUploadUrl (String?) - Path to uploaded ID file
- stripePaymentIntentId (String?) - Stripe payment intent
- stripeDepositIntentId (String?) - Stripe deposit intent
- inspectionCompleted (Boolean, @default(false))
- depositRefunded (Boolean, @default(false))
- lateFee (Float, @default(0)) - Calculated late fee if returned late
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- package (Package?, @relation(fields: [packageId], references: [id]))
- bookingItems (BookingItem[]) - One-to-many relationship
- @@index([userId])
- @@index([status])
- @@index([pickupDate, returnDate])
- Status Flow: Pending → Confirmed (after payment) → Active (on pickup) → Completed (on return) | Cancelled (anytime)

**BookingItems Table**:

- id (String, @id, @default(uuid()))
- bookingId (String)
- equipmentId (String?)
- addOnId (String?)
- quantity (Int, @default(1))
- booking (Booking, @relation(fields: [bookingId], references: [id], onDelete: Cascade))
- equipment (Equipment?, @relation(fields: [equipmentId], references: [id]))
- addOn (AddOn?, @relation(fields: [addOnId], references: [id]))
- @@index([bookingId])
- @@index([equipmentId])
- @@index([addOnId])

**MaintenanceLog Table**:

- id (String, @id, @default(uuid()))
- equipmentId (String)
- status (String) - Active/InRepair/Retired
- notes (String)
- date (DateTime, @default(now()))
- repairedBy (String?)
- equipment (Equipment, @relation(fields: [equipmentId], references: [id]))
- @@index([equipmentId])
- @@index([date])

**InspectionChecklist Table**:

- id (String, @id, @default(uuid()))
- bookingId (String, @unique)
- physicalCondition (String) - Excellent/Good/Fair/Damaged
- audioTest (Boolean) - Audio sweep passed
- accessoryCount (Int) - Number of accessories verified
- notes (String?)
- completedBy (String?) - Admin user ID
- completedAt (DateTime?)
- createdAt (DateTime, @default(now()))
- booking (Booking, @relation(fields: [bookingId], references: [id], onDelete: Cascade))

**Users Table**:

- id (String, @id, @default(uuid()))
- email (String, @unique)
- name (String)
- phone (String?)
- passwordHash (String?) - Hashed password for admin users (bcrypt)
- role (String, @default("customer")) - customer/admin
- createdAt (DateTime, @default(now()))
- updatedAt (DateTime, @updatedAt)
- @@index([email])

## Implementation Phases

### Phase 1: Project Setup & Foundation

- Initialize Next.js 14+ with TypeScript
- Configure Tailwind CSS with dark mode and custom color palette
- Set up Prisma with SQLite
- Create database schema
- Set up project structure and folder organization
- Create Dockerfile for Next.js application
- Create docker-compose.yml with app service and volume mounts
- Configure environment variables and .env.example
- Set up .dockerignore for optimized builds

### Phase 2: Brand Identity & UI Foundation

- Implement dark theme (Charcoal #1a1a1a, Deep Slate #2d2d2d backgrounds)
- Create accent color system (Neon Electric Blue #00f0ff or Cyber Green #00ff88)
- Build reusable UI components (buttons, cards, modals)
- Create responsive layout components
- Implement "Modern Pro Audio" aesthetic with high-contrast design

### Phase 3: Product Architecture

- Create package data model and seed data (Backyard Bash, Toast & Tunes, Pop-up DJ, Grand Event)
- Build PackageCard component with crowd size and event type filtering
- Create package detail pages with equipment breakdown
- Implement package selection interface on homepage

### Phase 4: Booking Flow (6 Steps)

1. **Selection**: Package/item selection with ProductCard component
2. **Scheduling**: Interactive calendar with real-time availability checking (prevents double-booking)
3. **Upsell Modal**: "Finish Your Rig" smart suggestions based on selected items
4. **Logistics**: Pickup vs Delivery selection
5. **Verification**: Digital signature capture (SignaturePad component) and ID upload (FileUpload component)
6. **Checkout**: Stripe integration for rental + security deposit (separate payment intents)

### Phase 5: Add-On System

- Create add-on categories (Atmosphere, Technical Utilities, Premium Services)
- Build AddOnMenu component with strategic upsells
- Implement smart suggestions (e.g., "Need a mic stand for that mic?")
- Add add-ons to booking calculation

### Phase 6: Admin Dashboard

- **Authentication**: NextAuth.js with credentials provider (email/password) for admin access
- **Inventory Manager**: CRUD interface for equipment with serial number tracking
- **Maintenance Log**: Status tracker with repair history
- **Post-Rental Inspection**: Digital checklist component (InspectionChecklist) for deposit refunds
- **Master Calendar**: Gantt-style view (GanttChart component) of equipment availability
- **Rental Management**: View and manage all bookings with status updates
- **Deposit Refunds**: Interface to process refunds via Stripe API

### Phase 7: Documentation & Legal

- Create Setup Guide page/PDF with:
  - Power Rule (Source ON first, Speakers LAST)
  - "No Red" clipping prevention guide
  - Safety instructions (tripod stability, cable taping)
- Create User Agreement page with:
  - Damage liability terms
  - Weather policy
  - Late fee structure

### Phase 8: Product Cards & Optimization

- Build high-conversion ProductCard component with:
  - High-res cutout images
  - "Popular" or "Easy-Setup" badges
  - At-a-glance specs display
  - Bold daily price
  - "Quick-Add to Rental" button
- Implement individual equipment browsing

### Phase 9: Integration & Polish

- Stripe payment integration (rental + refundable deposit as separate intents)
- Email notifications:
  - Booking confirmation (after payment)
  - Booking reminder (24h before pickup)
  - Return reminder (24h before return)
  - Late return notification
  - Deposit refund confirmation
- Availability checking logic (prevents overlapping bookings, checks equipment quantity)
- Late fee calculation system:
  - First hour late: $25
  - Each additional hour: $10/hour
  - Maximum late fee: $200 (20 hours)
  - Calculated on return date vs scheduled return date
- File upload security (validation, size limits, secure storage)
- Responsive design testing
- Performance optimization

## Key Files to Create

### Docker & Configuration

- `Dockerfile` - Multi-stage Docker build for Next.js app
- `docker-compose.yml` - Docker Compose configuration with app service, volumes, and environment setup
- `.dockerignore` - Exclude unnecessary files from Docker build
- `.env.example` - Template for environment variables (see Environment Variables section)

### Database

- `prisma/schema.prisma` - Complete database schema with relationships and indexes
- `prisma/seed.ts` - Seed script for initial data (packages, sample equipment, admin user)

### Core Application

- `app/layout.tsx` - Root layout with dark theme provider
- `app/(public)/page.tsx` - Homepage with package selection
- `app/(public)/booking/[step]/page.tsx` - Multi-step booking flow

### Components

- `components/ui/ProductCard.tsx` - High-conversion product card
- `components/booking/UpsellModal.tsx` - Smart upsell popup
- `components/booking/SignaturePad.tsx` - Digital signature capture
- `components/booking/FileUpload.tsx` - ID upload component
- `components/admin/InspectionChecklist.tsx` - Post-rental inspection
- `components/admin/GanttChart.tsx` - Master calendar Gantt view

### Admin Pages

- `app/(admin)/dashboard/page.tsx` - Admin command center
- `app/(admin)/inventory/page.tsx` - Inventory manager
- `app/(admin)/calendar/page.tsx` - Master calendar view
- `app/(admin)/rentals/page.tsx` - Rental management

### API Routes

- `app/api/bookings/route.ts` - Booking CRUD operations
- `app/api/availability/route.ts` - Real-time availability checking
- `app/api/upload/route.ts` - File upload for ID verification
- `app/api/inspections/route.ts` - Inspection checklist submission
- `app/api/refunds/route.ts` - Deposit refund processing
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `app/api/webhooks/stripe/route.ts` - Stripe webhook handler

### Libraries

- `lib/stripe.ts` - Payment processing
- `lib/availability.ts` - Availability calculation logic
- `lib/upload.ts` - File upload utilities
- `lib/auth.ts` - NextAuth configuration
- `lib/email.ts` - Email notification utilities

## Design System

**Colors**:

- Background: Charcoal (#1a1a1a), Deep Slate (#2d2d2d)
- Accent: Neon Electric Blue (#00f0ff) or Cyber Green (#00ff88)
- Text: High contrast white/light gray
- Buttons: Accent colors on dark backgrounds

**Typography**: Modern sans-serif (Inter or similar), clear hierarchy

**Components**: High-contrast, minimal, professional aesthetic mirroring pro audio software

## Docker Configuration

**Dockerfile**:

- Multi-stage build (dependencies → build → production)
- Node.js 18+ base image
- Prisma client generation in build stage
- Optimized production image with minimal dependencies
- Proper handling of Next.js standalone output

**docker-compose.yml**:

- `app` service: Next.js application
- Volume mounts for:
  - SQLite database persistence (`./data:/app/data`)
  - Uploaded files (`./public/uploads:/app/public/uploads`)
  - Environment variables (`.env` file)
- Port mapping: `3000:3000` for web access
- Health checks for service monitoring
- Environment variable configuration
- Commands: `docker-compose up` to start, `docker-compose down` to stop

**Development Workflow**:

- Run `docker-compose up` to start all services
- Run `docker-compose down` to stop and remove containers
- Database and uploads persist via volumes
- Prisma migrations run automatically on container startup
- Seed script executes on first run

## Authentication Strategy

**Admin Authentication**:

- NextAuth.js with Credentials Provider
- Email/password authentication for admin dashboard
- Session-based authentication with secure cookies
- Protected routes using middleware
- Admin users stored in Users table with role="admin"

**Customer Experience**:

- Guest checkout (no account required)
- Optional user registration for returning customers
- User data collected during booking (name, email, phone)
- No authentication required for public booking flow

## File Upload Strategy

**Storage**:

- Local file storage in Docker volume (`./public/uploads`)
- Files stored with UUID filenames for security
- Organized by type: `/uploads/ids/` for ID documents

**Security**:

- File type validation (PDF, JPG, PNG only)
- File size limit (5MB max)
- Virus scanning (optional, can be added later)
- Secure file serving with authentication checks

**Components**:

- `FileUpload` component with drag-and-drop
- Progress indicator
- Preview before submission
- Error handling for invalid files

## Availability Calculation Logic

**Algorithm**:

1. For each equipment item in booking:

   - Query all active bookings that overlap with requested dates
   - Count booked quantity for each equipment
   - Check if (totalQuantity - bookedQuantity) >= requestedQuantity

2. For packages:

   - Check availability of all equipment in package
   - Package available only if all equipment available

3. Real-time updates:

   - API endpoint `/api/availability` returns availability status
   - Calendar component queries on date selection
   - Prevents booking submission if unavailable

**Optimization**:

- Database indexes on pickupDate/returnDate for fast queries
- Caching of availability results (optional)
- Batch availability checks for multiple items

## API Endpoints

### Public Endpoints

- `GET /api/packages` - List all packages
- `GET /api/packages/[id]` - Get package details
- `GET /api/inventory` - List all equipment (public view)
- `GET /api/addons` - List all add-ons
- `POST /api/availability` - Check availability for dates and equipment
- `POST /api/bookings` - Create new booking
- `POST /api/upload` - Upload ID document (multipart/form-data)
- `GET /api/bookings/[id]` - Get booking status (by booking ID)

### Admin Endpoints (Protected)

- `GET /api/admin/inventory` - List all equipment with full details
- `POST /api/admin/inventory` - Create new equipment
- `PUT /api/admin/inventory/[id]` - Update equipment
- `DELETE /api/admin/inventory/[id]` - Delete equipment
- `GET /api/admin/bookings` - List all bookings
- `PUT /api/admin/bookings/[id]` - Update booking status
- `POST /api/admin/inspections` - Submit inspection checklist
- `POST /api/admin/refunds/[bookingId]` - Process deposit refund
- `GET /api/admin/calendar` - Get calendar data for Gantt view (returns equipment availability timeline)
- `POST /api/admin/maintenance` - Add maintenance log entry
- `GET /api/admin/inspections/[bookingId]` - Get inspection checklist for booking

### Authentication Endpoints

- `POST /api/auth/signin` - Admin sign in
- `POST /api/auth/signout` - Sign out
- `GET /api/auth/session` - Get current session

## Environment Variables

**Required Variables** (`.env.example`):

```
# Database
DATABASE_URL="file:./data/dev.db"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<generate-secret-key>"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# File Upload
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES="image/jpeg,image/png,application/pdf"

# Admin (for initial setup)
ADMIN_EMAIL="admin@sonicrentals.com"
ADMIN_PASSWORD="<secure-password>"

# Email (optional, for notifications)
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASSWORD=""
```

**Docker Environment**:

- Environment variables loaded from `.env` file
- `.env` file mounted as volume (not copied into image)
- `.env.example` committed to git as template

