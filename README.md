# NestJS Backend with PostgreSQL and Docker

This project is a payroll backend built with NestJS, PostgreSQL, and Docker. It supports robust API documentation (Swagger), automated testing, and a modular architecture for scalability.

---

## Table of Contents
- [Prerequisites](#prerequisites)
- [How to Run](#how-to-run)
 - [With Docker](#with-docker)
 - [With Node.js](#with-nodejs)
- [Database Migrations & Seed](#database-migrations--seed)
- [Testing](#testing)
- [API Documentation (Swagger)](#api-documentation-swagger)
- [Project Structure & Architecture](#project-structure--architecture)
- [Environment Variables](#environment-variables)

---

## Prerequisites
- Docker & Docker Compose
- Node.js v20+ & npm/yarn (for local dev)

---

## How to Run

### With Docker
#### Development (hot reload)
```bash
docker-compose up --build
```
#### Production
```bash
NODE_ENV=production docker-compose up -d --build
```

### With Node.js
#### Install dependencies
```bash
npm install # or yarn install
```
#### Start app
```bash
npm run start:dev # for development
npm run start:prod # for production
```

---

## Database Migrations & Seed

### Run Migrations
- **Docker:**
  ```bash
  docker exec be-dealls-test-payroll_app-1 npm run migration:run
  ```
- **Node.js:**
  ```bash
  npm run migration:run
  ```

### Seed Data
- **Docker:**
  ```bash
  docker exec be-dealls-test-payroll_app-1 npm run seed
  ```
- **Node.js:**
  ```bash
  npm run seed
  ```

---

## Testing
- **Docker:**
  ```bash
  docker exec be-dealls-test-payroll_app-1 npm test
  ```
- **Node.js:**
  ```bash
  npm test
  ```

---

## API Documentation (Swagger)
- After running the app, access the Swagger UI at: [http://localhost:3000/api](http://localhost:3000/api)
- Use the "Authorize" button to input your JWT token for protected endpoints.
- The API is self-documented with request/response schemas and authentication info.

---

## Project Structure & Architecture

- **src/**: Main source code
 - `app.module.ts`: Root module, imports all features
 - `auth/`: Authentication (JWT, guards, login)
 - `attendances/`: Attendance period & submission
 - `audit-logs/`: Audit logging
 - `overtime/`: Overtime submission & listing
 - `payroll/`: Payroll calculation, payslips
 - `reimbursements/`: Reimbursement requests
 - `users/`: User management
 - `common/`: Shared decorators, interceptors
 - `config/`: Logger & Swagger config
- **test/**: End-to-end and integration tests (see `test/` for e2e specs and integration coverage)
- **migrations/**: TypeORM migration scripts
- **docker-compose.yml**: Multi-container orchestration
- **Dockerfile**: Multi-stage build for dev/prod

**Tech Stack:**
- NestJS (Node.js v20+)
- PostgreSQL
- TypeORM
- Docker
- Swagger (OpenAPI)
- Jest (unit & e2e testing)

---

## Environment Variables
Copy `.env.example` to `.env` and adjust as needed:
```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=dealls
DB_PASSWORD=d3alls
DB_DATABASE=be_dealls
JWT_SECRET=33444afb-492c-4a96-935f-7f0c828d9b89
NODE_ENV=development
```

---

## Access
- Backend: [http://localhost:3000](http://localhost:3000)
- Swagger UI: [http://localhost:3000/api](http://localhost:3000/api)
- PostgreSQL: port 5432 (see `docker-compose.yml`)

---

For further details, see code comments and Swagger UI for API usage.