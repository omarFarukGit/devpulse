# DevPulse API

A collaborative platform for software teams to report bugs, suggest features, and coordinate resolutions.

---

# Live Links

* Live API: [https://devpulse-lac.vercel.app/](https://devpulse-lac.vercel.app/)

* GitHub Repository: [https://github.com/omarFarukGit/devpulse](https://github.com/omarFarukGit/devpulse)

---

# Features

* User Registration & Login
* JWT Authentication
* Role Based Authorization
* Create Issues
* Get All Issues
* Get Single Issue
* Update Issues
* Delete Issues
* Issue Filtering & Sorting
* PostgreSQL Database
* Raw SQL Queries
* Global Error Handling
* TypeScript Support

---

# Tech Stack

* Node.js
* Express.js
* TypeScript
* PostgreSQL
* bcrypt
* jsonwebtoken
* dotenv
* cors
* pg
* zod

---

# Project Structure

```bash
src/
│
├── app/
│
├── config/
│
├── db/
│
├── middleware/
│
├── modules/
│   ├── auth/
│   └── issues/
│
├── types/
│
├── app.ts
└── server.ts
```

---

# Installation & Setup

## Clone Repository

```bash
git clone https://github.com/yourusername/devpulse.git
```

## Move Into Project

```bash
cd devpulse
```

## Install Dependencies

```bash
npm install
```

## Create Environment File

Create a `.env` file in the root directory.

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_url
JWT_SECRET=your_secret_key
```

## Run Development Server

```bash
npm run dev
```

---

# Scripts

```json
{
  "dev": "tsc watch ./src/server.ts",
  "build": "tsc",
  "start": "node ./dist/server.js",
  "start:prod": "node ./dist/server.js"
}
```

---

# Database Schema

## Users Table

| Field      | Type                     |
| ---------- | ------------------------ |
| id         | SERIAL PRIMARY KEY       |
| name       | VARCHAR                  |
| email      | VARCHAR UNIQUE           |
| password   | TEXT                     |
| role       | contributor / maintainer |
| created_at | TIMESTAMP                |
| updated_at | TIMESTAMP                |

---

## Issues Table

| Field       | Type                          |
| ----------- | ----------------------------- |
| id          | SERIAL PRIMARY KEY            |
| title       | VARCHAR(150)                  |
| description | TEXT                          |
| type        | bug / feature_request         |
| status      | open / in_progress / resolved |
| reporter_id | INTEGER                       |
| created_at  | TIMESTAMP                     |
| updated_at  | TIMESTAMP                     |

---

# API Endpoints

## Authentication

### Register User

```http
POST /api/auth/signup
```

### Login User

```http
POST /api/auth/login
```

---

# Issues

### Create Issue

```http
POST /api/issues
```

### Get All Issues

```http
GET /api/issues
```

### Get Single Issue

```http
GET /api/issues/:id
```

### Update Issue

```http
PATCH /api/issues/:id
```

### Delete Issue

```http
DELETE /api/issues/:id
```

---

# Query Parameters

## Get All Issues

```http
GET /api/issues?sort=newest&type=bug&status=open
```

## Supported Query Params

| Query  | Values                        |
| ------ | ----------------------------- |
| sort   | newest / oldest               |
| type   | bug / feature_request         |
| status | open / in_progress / resolved |

---

# Authentication System

This project uses JWT based authentication.

## Login Flow

1. User logs in using email and password
2. Server validates credentials
3. JWT token is generated
4. Client sends token in Authorization header
5. Protected routes verify token before processing requests

Example Header:

```http
Authorization: YOUR_JWT_TOKEN
```

---

# Authorization Rules

## Contributor

* Create issues
* View issues
* Update own issue only when status is open

## Maintainer

* All contributor permissions
* Update any issue
* Delete any issue
* Change issue workflow status

---

# Error Response Format

```json
{
  "success": false,
  "message": "Error message",
  "errors": "Error details"
}
```

---

# Success Response Format

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

---

# Deployment

## Backend Hosting

* vercel

## PostgreSQL Hosting

* Neon

---

# Important Notes

* Raw SQL queries are used throughout the project
* No ORM or Query Builder used
* No SQL JOIN used
* Passwords are hashed using bcrypt
* Protected routes use JWT verification middleware

---

# Author

MD Omar Faruk

---

# License

This project is created for educational and assignment purposes.
