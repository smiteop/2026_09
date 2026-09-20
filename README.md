# Production Doctor Booking Engine

A high-concurrency, timezone-safe Doctor Booking System built with **Node.js**, **Express.js**, **PostgreSQL**, **Sequelize ORM**, and **JWT Authentication**.

---

## Features  

- **JWT Authentication & Role Authorization**: Decoupled `authenticateJWT` and `authorizeRoles('ADMIN', 'USER')` middlewares.
- **Timezone Safety**:
  - Store all appointment timestamps and unavailable periods as absolute UTC (`TIMESTAMPTZ` in PostgreSQL).
  - Configure clinic timezone as IANA identifier (e.g. `Asia/Kolkata`, `America/New_York`).
  - Interpret date queries in local clinic wall-clock time and return ISO-8601 UTC strings.
- **Doctor Availability & Schedule Engine**:
  - Multi-interval weekly recurring working hours per day.
  - Doctor unavailability management (breaks, leave, meetings, holidays, custom blocks).
  - Dynamic slot generation algorithm respecting doctor appointment duration.
- **Guaranteed Concurrency Control & Double-Booking Protection**:
  - Application-level `SELECT ... FOR UPDATE` row locks in managed Sequelize transactions.
  - PostgreSQL database-level exclusion range constraint:
    ```sql
    EXCLUDE USING gist (
      doctor_id WITH =,
      tstzrange(start_time, end_time, '[)') WITH &&
    ) WHERE (status IN ('SCHEDULED', 'COMPLETED'));
    ```
  - Graceful mapping of PostgreSQL constraint violation codes (`23P01` / `23505`) to `HTTP 409 Conflict`.

---

## Prerequisites

- **Node.js**: v18+
- **PostgreSQL**: v12+ with `btree_gist` extension support.

---

## Setup & Environment Configuration

1. **Clone & Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

   Ensure your PostgreSQL credentials in `.env` match your local PostgreSQL server:
   ```env
   PORT=3000
   NODE_ENV=development

   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=doctor_booking_db
   DB_USER=postgres
   DB_PASS=postgres

   JWT_SECRET=super_secret_jwt_key_doctor_booking_system_2026
   JWT_EXPIRES_IN=1d
   ```

3. **Create PostgreSQL Database**:
   Create the database in PostgreSQL:
   ```sql
   CREATE DATABASE doctor_booking_db;
   ```

4. **Run Database Migrations & Seeds**:
   ```bash
   npm run migrate
   npm run seed
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## Seeded Default Credentials

- **Admin Account**:
  - Email: `admin@clinic.com`
  - Password: `Password123!`
  - Role: `ADMIN`
- **Patient Account**:
  - Email: `user@clinic.com`
  - Password: `Password123!`
  - Role: `USER`

---

## Key API Endpoints Summary

### Authentication
- `POST /api/v1/auth/register` - Register a user (`{ name, email, password, role }`)
- `POST /api/v1/auth/login` - Authenticate & retrieve JWT (`{ email, password }`)

### Clinic Management (Admin)
- `GET /api/v1/clinic/settings` - Get clinic configuration (including timezone)
- `PUT /api/v1/clinic/settings` - Update clinic timezone (validates IANA string)

### Doctor Management
- `POST /api/v1/doctors` - Create doctor profile (`ADMIN`)
- `GET /api/v1/doctors` - List doctors (`USER` / `ADMIN`)
- `PUT /api/v1/doctors/:id` - Update doctor profile (`ADMIN`)
- `PATCH /api/v1/doctors/:id/status` - Activate/Deactivate doctor (`ADMIN`)
- `POST /api/v1/doctors/:id/working-hours` - Set weekly recurring working hours (`ADMIN`)
- `POST /api/v1/doctors/:id/unavailabilities` - Add leave/break/meeting (`ADMIN`)

### Slots & Booking
- `GET /api/v1/doctors/:id/slots?date=YYYY-MM-DD` - Query available slots for a date in clinic local time
- `POST /api/v1/appointments` - Book slot (`{ doctorId, startTime, endTime, notes }`)
- `GET /api/v1/appointments/my` - List user's appointments
- `PATCH /api/v1/appointments/:id/cancel` - Cancel appointment

---

## Running Unit Tests

```bash
npm test
```

---

## License

ISC
