# Expense-Ease Backend

This package contains the Express + TypeScript API that powers Expense-Ease. It exposes authentication, friend management, personal expense tracking, and shared bill splitting backed by PostgreSQL via Prisma.

## Key Capabilities

- JWT-secured authentication and route protection via a reusable middleware.
- Friend discovery, invitations, acceptance/rejection, blocking, and pagination of pending requests.
- Personal expense CRUD with category filters, pagination, and month-level totals.
- Shared bill creation with participant validation, settlement tracking, and outstanding balance reporting.
- Rate limiting, structured logging (Morgan → Winston), and consistent response helpers.

## Local Development

Refer to the [repository README](../README.md) for:

- Environment setup and required `.env` variables.
- Prisma client generation and database migration commands.
- npm scripts for development, build, linting, and production runs.
- Detailed API reference covering every route and expected payload.

## Project Layout

```
src/
├── app.ts          # Express app composition and middleware registration
├── index.ts        # Server bootstrap
├── config/         # Prisma client and logging configuration
├── controllers/    # Route handlers for auth, users, friends, expenses, bills
├── middlewares/    # Auth guard and Joi validation helper
├── routes/         # Feature routers mounted in app.ts
├── utils/          # JWT helpers, password hashing, logger, response helper
└── validators/     # Joi schemas validating incoming payloads
```

The `prisma/` directory stores the schema and migrations used to keep the PostgreSQL database in sync.
