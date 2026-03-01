# minecraft-server-manager

REST API for remote Minecraft server management via RCON.

![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)
![Node.js](https://img.shields.io/badge/Node.js-20+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue)
![License](https://img.shields.io/badge/License-MIT-lightgrey)

## Overview

A typed REST API that connects to a Minecraft server via RCON to provide server status, remote command execution, and a command history log. Integrates with Discord bots, web panels, or plugins.

## Stack

- TypeScript
- Express
- Prisma (PostgreSQL)
- JWT authentication
- Zod (validation)
- Winston (logging)
- RCON client (custom, zero dependencies)

## Structure

```
src/
├── controllers/    AuthController, ServerController
├── middlewares/    auth, validate
├── repositories/   UserRepository, CommandLogRepository
├── routes/         auth, server
├── services/       AuthService, ServerService
├── types/          index.ts
├── utils/          logger, prisma, rcon
└── server.ts
```

## Setup

```bash
git clone https://github.com/m4trixdev/minecraft-server-manager.git
cd minecraft-server-manager
npm install
cp .env.example .env
# Fill in your database and RCON credentials
```

Run database migrations:

```bash
npx prisma migrate deploy
```

Start in development:

```bash
npm run dev
```

Build and run in production:

```bash
npm run build
npm start
```

## API

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/v1/auth/login` | Get JWT token | No |
| POST | `/api/v1/auth/register` | Create user | Admin |

### Server

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/server/status` | Server status and online players | User |
| POST | `/api/v1/server/command` | Execute a console command | Admin |
| GET | `/api/v1/server/logs` | Paginated command history | User |

### Example requests

```bash
# Login
POST /api/v1/auth/login
{ "username": "admin", "password": "yourpassword" }

# Get server status
GET /api/v1/server/status
Authorization: Bearer <token>

# Execute command
POST /api/v1/server/command
Authorization: Bearer <token>
{ "command": "say Hello from API" }

# List logs
GET /api/v1/server/logs?page=1&size=20
Authorization: Bearer <token>
```

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | required |
| `JWT_SECRET` | JWT signing secret | required |
| `JWT_EXPIRES_IN` | Token expiry | `8h` |
| `RCON_HOST` | Minecraft server host | `localhost` |
| `RCON_PORT` | RCON port | `25575` |
| `RCON_PASSWORD` | RCON password | required |
| `PORT` | HTTP port | `3000` |
| `RATE_LIMIT` | Max requests per minute | `100` |

## Minecraft setup

Enable RCON in `server.properties`:

```properties
enable-rcon=true
rcon.port=25575
rcon.password=your-password
broadcast-rcon-to-ops=false
```

## Author

**M4trixDev** — [github.com/m4trixdev](https://github.com/m4trixdev)

## License

MIT
