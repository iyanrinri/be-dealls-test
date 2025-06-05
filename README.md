# NestJS Backend with PostgreSQL and Docker

This is a sample NestJS backend project using PostgreSQL as the database, containerized with Docker and managed via Docker Compose.

## Prerequisites

- Docker & Docker Compose installed
- Node.js & npm (for local development, optional)

## Setup and Run

### Development mode (with hot reload)

```bash
docker-compose up --build
```
### Production mode

```bash
NODE_ENV=production docker-compose up -d --build
```

Backend will run on http://localhost:3000

PostgreSQL listens on port 5432

Uses .env file in payroll_app/ for config

