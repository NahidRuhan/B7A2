# Issue Tracker API

A robust, role-based Issue Tracking REST API built with Node.js, Express, TypeScript, and PostgreSQL. It allows users to authenticate, report issues, and manage them securely through Resource Ownership and Role-Based Access Control (RBAC).

**Live URL:** [\[https://issue-tracking-api.vercel.app\]](https://issue-tracking-api.vercel.app/)

## Features

- **JWT Authentication:** Secure user registration and login.
- **Role-Based Access Control (RBAC):** Differentiates permissions between `maintainer` and `contributor` roles.
- **Resource Ownership:** Contributors can only manage their own reported issues, while maintainers have system-wide access.
- **Business Logic Validation:** Contributors cannot update the status of an issue or edit issues that are no longer `open`.
- **Filtering & Sorting:** Retrieve issues dynamically by `type` (bug, feature_request), `status` (open, in_progress, resolved), and `sort` (newest, oldest).
- **Global Error Handling:** Consistent and structured JSON error responses across the entire application.
- **Relational Database:** PostgreSQL with foreign key constraints and cascading deletes.

## Tech Stack

- **Backend:** Node.js, Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL (using `pg` driver)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`)
- **Utilities:** `cors`, `http-status-codes`

## 📦 Dependencies

The backend server relies on a Node.js ecosystem configured with TypeScript and Express.

### Core Dependencies
- **Core Framework & Utils:** `express` (^5.2.1), `dotenv` (^17.4.2), `http-status-codes` (^2.3.0)
- **Database:** `pg` (^8.21.0)
- **Security & Middleware:** `cors` (^2.8.6), `bcrypt` (^6.0.0), `jsonwebtoken` (^9.0.3)
- **Build Tools:** `tsup` (^8.5.1)

### Development Dependencies
- **TypeScript & Execution:** `typescript` (^6.0.3), `tsx` (^4.22.3)
- **Type Definitions:** `@types/node` (^25.9.1), `@types/express` (^5.0.6), `@types/cors` (^2.8.19), `@types/jsonwebtoken` (^9.0.10), `@types/bcrypt` (^6.0.0), `@types/pg` (^8.20.0)

## Database Schema Summary

The application utilizes a PostgreSQL relational database with two core tables:

### `users`
Stores user credentials and roles.
- `id`: SERIAL PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password`: TEXT NOT NULL (Hashed)
- `role`: VARCHAR(20) DEFAULT 'contributor' (`maintainer` | `contributor`)
- `created_at` / `updated_at`: TIMESTAMP DEFAULT NOW()

### `issues`
Stores issue reports and references the user who reported them.
- `id`: SERIAL PRIMARY KEY
- `title`: VARCHAR(150) NOT NULL
- `description`: TEXT NOT NULL
- `type`: VARCHAR(20) NOT NULL (`bug` | `feature_request`)
- `status`: VARCHAR(20) DEFAULT 'open' (`open` | `in_progress` | `resolved`)
- `reporter_id`: INT (Foreign Key referencing `users(id)` ON DELETE CASCADE)
- `created_at` / `updated_at`: TIMESTAMP DEFAULT NOW()

## API Endpoints

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/auth/signup` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive a JWT | Public |

*(Note: Registration/login routes map to your configured auth routes).*

### Issues (`/api/issues`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/api/issues` | Create a new issue | Authenticated |
| GET | `/api/issues` | Retrieve all issues (Supports filters) | Public |
| GET | `/api/issues/:id` | Retrieve a specific issue by ID | Public |
| PUT | `/api/issues/:id` | Update an issue | Maintainer / Contributor (Own open issues) |
| DELETE | `/api/issues/:id` | Delete an issue | Maintainer |

#### Query Parameters for `GET /api/issues`
- `sort`: `newest` (default), `oldest`
- `type`: `bug`, `feature_request`
- `status`: `open`, `in_progress`, `resolved`

## Setup Steps

Follow these instructions to run the project locally.

### 1. Prerequisites
- Node.js installed
- PostgreSQL installed and running

### 2. Clone the Repository
```bash
git clone <repository-url>
cd <folder>
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Environment Variables
Create a `.env` file in the root directory and add the following keys:
```env
PORT=port
DATABASE_URL=postgres://username:password@localhost:5432/your_database
JWT_SECRET=your_super_secret_key
```

### 5. Start the Application
To start the server in development mode:
```bash
npm run dev
```

*(The database tables will initialize automatically upon successful connection).*
