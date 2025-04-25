# 🅿️ Parking Management API

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5%2B-blue)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13%2B-blue)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-✓-blue)](https://www.docker.com/)
[![JWT Auth](https://img.shields.io/badge/JWT-Auth-orange)](https://jwt.io/)

A complete parking management solution with REST API, authentication, and business rule enforcement.

## ✨ Features

### Parking Management
- ✅ Create/Read/Update parking lots
- 🔢 Spots validation (50-1500 spots)
- 🏷️ Unique name enforcement
- 📊 Paginated listings with sorting

### Intelligent Check-in System
- 🏭 Factory Pattern implementation
- 🕒 Time-based access control
- 🚗 User type validation:
  - Public: Open access
  - Private: Corporate only (weekdays)
  - Courtesy: Visitors only (weekends)

### Security
- 🔐 JWT Authentication
- 🛡️ Input validation with Joi
- ⚙️ Environment-based configuration

## 🚀 Quick Start

### Prerequisites
- Docker 20.10+
- Docker Compose 2.0+
- Node.js 18+

### Installation
```bash
# Clone repository
git clone https://github.com/Zabdi0819/parking-api.git
cd parking-api

# Copy environment file
cp .env.example .env

# Build and start containers
docker-compose up --build
```

## 📚 API Documentation

### Endpoints

| Endpoint                | Method | Description                         | Auth Required |
|-------------------------|--------|-------------------------------------|---------------|
| /auth/login             | POST   | Get JWT token                       | No            |
| /parkings               | GET    | List parkings (paginated)           | Yes           |
| /parkings               | POST   | Create new parking                  | Yes           |
| /parkings/:id           | PATCH  | Update parking (contact/spots only) | Yes           |
| /check-in               | POST   | Validate parking access             | Yes           |

# Tests
### Run tests one by one or with the test command

```bash
npm run test

npm run test auth.test

npm run test parkings.test

npm run test integration/allparkings.test

npm run test integration/corporate.test

npm run test integration/provider.test

npm run test integration/visitor.test

npm run test unit/corporate.test

npm run test unit/provider.test

npm run test unit/visitor.test
```

### Developed by Zabdi Ramírez

