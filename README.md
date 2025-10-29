# Expense-Ease

Expense-Ease is a TypeScript Express backend that combines personal expense tracking with shared bill splitting. It lets users capture day-to-day spending, manage friendships, split group costs, and reconcile outstanding balances—all backed by PostgreSQL via Prisma ORM.

## Features
- **Secure authentication & profiles** – Register, log in, and protect every route with JWT-based auth and Joi validation for incoming payloads.
- **Friend management** – Search by username, send requests, accept, reject, or block users, and view a consolidated friend list with pagination support.
- **Personal expense tracking** – Record categorized expenses, edit or delete entries, filter by category, and view monthly summaries.
- **Shared bill splitting** – Create bills with multiple participants, enforce duplicate checks, ensure everyone is a confirmed friend, and track unsettled amounts until each participant settles their share.
- **Robust platform guardrails** – Built-in rate limiting, centralized error responses, structured logging with Winston + Morgan, and Prisma-powered data integrity.

## Tech Stack
- **Runtime:** Node.js, Express, TypeScript
- **Database:** PostgreSQL with Prisma Client
- **Auth & Security:** JWT, bcrypt, express-rate-limit, CORS
- **Validation & Tooling:** Joi, ESLint, Prettier, Nodemon, Winston/Morgan logging

## Project Structure
```
Backend/
├── src/
│   ├── app.ts              # Express app wiring, middleware, and route registration
│   ├── index.ts            # Server bootstrap
│   ├── config/             # Prisma client and logging middleware
│   ├── controllers/        # Business logic for auth, users, friends, expenses, bills
│   ├── middlewares/        # Auth guard and request validation helpers
│   ├── routes/             # Route definitions per feature domain
│   ├── utils/              # JWT, hashing, response helpers, logger
│   └── validators/         # Joi schemas for request validation
├── prisma/                 # Prisma schema and migrations
├── package.json            # Scripts and dependencies
└── tsconfig.json           # TypeScript configuration
```

## Getting Started
### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm (bundled with Node.js)

### Installation
```bash
cd Backend
npm install
```

### Environment Variables
Create a `.env` file inside `Backend/` with the following variables:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
JWT_SECRET="super-secret-key"
PORT=5000
```

### Database Setup
Generate the Prisma client and apply migrations:
```bash
npx prisma generate
npx prisma migrate dev
```

### Run the Development Server
```bash
npm run dev
```
The server runs on `http://localhost:5000` by default. Update the `PORT` variable to change it.

### Additional Scripts
- `npm run build` – Compile TypeScript to JavaScript in `dist/`.
- `npm start` – Run the compiled server.
- `npm run lint` – Lint the codebase with ESLint.

## API Overview
> All endpoints (except `/auth/*`) require the `Authorization: Bearer <token>` header.

### Auth
- `POST /auth/register` – Register a new user.
- `POST /auth/login` – Log in and receive a JWT.

### Users & Friends
- `GET /users/search?username=<query>` – Search for users by username with pagination.
- `POST /friend/request/:receiverId` – Send a friend request.
- `POST /friend/accept/:requesterId` – Accept a friend request.
- `POST /friend/reject` – Reject a request without blocking the sender.
- `POST /friend/block` – Block a sender.
- `GET /friend/requests` – List pending friend requests.
- `GET /friend/all` – List confirmed friends.
- `GET /friend/pending/count` – Count pending requests.

### Personal Expenses
- `POST /u/expense/createExpense` – Create a new expense.
- `PATCH /u/expense/updateExpense` – Update an existing expense.
- `DELETE /u/expense/deleteExpense/:id` – Delete an expense.
- `GET /u/expense` – Fetch paginated expenses sorted by date.
- `GET /u/expense/expnenseBycategory?category=<CATEGORY>` – Filter expenses by category.
- `GET /u/expense/monthExpense?month=YYYY-MM` – Sum expenses for a specific month (defaults to current month).

### Bills
- `POST /u/bills/create` – Create a shared bill for friends with custom splits.
- `GET /u/bills/created` – Bills created by the authenticated user.
- `GET /u/bills` – Bills the user participates in (unsettled).
- `PATCH /u/bills/settle/:id` – Settle a specific bill for the current user.
- `DELETE /u/bills/:id` – Delete a bill created by the user.
- `GET /u/bills/unsettled-total` – Total outstanding amount across created bills.
- `GET /u/bills/:id` – View details for a single bill.

## Logging & Monitoring
- `express-rate-limit` caps incoming requests to mitigate abuse.
- Morgan streams HTTP logs into a Winston logger with timestamped metadata.

## Future Improvements
- Add automated test coverage (Jest/Supertest).
- Introduce refresh tokens for longer sessions.
- Build a companion React or mobile client for the API.

## License
This project is released under the MIT License.
