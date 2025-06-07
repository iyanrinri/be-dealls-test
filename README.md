# NestJS Backend with PostgreSQL and Docker

This is a sample NestJS backend project using PostgreSQL as the database, containerized with Docker and managed via Docker Compose.

## Prerequisites

- Docker & Docker Compose installed
- Node.js & npm or yarn
 (for local development, optional)

## Setup and Run (Docker)

### Development mode (with hot reload)

```bash
docker-compose up --build
```
### Production mode

```bash
NODE_ENV=production docker-compose up -d --build
```

### Run Migrations Tables
```bash
 docker exec be-dealls-test-payroll_app-1 npm run migration:run
```
### Run Seed Data
```bash
 docker exec be-dealls-test-payroll_app-1 npm run seed
```

### Run Unit Tests
```bash
 docker exec be-dealls-test-payroll_app-1 npm test
```

## Setup and Run (Node.js)

### Install Dependencies

```bash
npm install ## or yarn install
```

### Configure Environment Variables
Copy the `.env.example` file to `.env` and update the values as needed.

```dotenv
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=dealls
DB_PASSWORD=d3alls
DB_DATABASE=be_dealls

JWT_SECRET=33444afb-492c-4a96-935f-7f0c828d9b89
NODE_ENV=development
```

### Run Migrations Tables
```bash
 npm run migration:run
```
### Run Seed Data
```bash
 npm run seed
```

### Run Unit Tests
```bash
 npm test
```

## Accessing the Application
Backend will run on http://localhost:3000

Swagger UI will be available at http://localhost:3000/api

PostgreSQL listens on port 5432

Uses `.env` file for config development