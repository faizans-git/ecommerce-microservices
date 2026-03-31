# Ecommerce Microservices Platform (Under Development)

A scalable, production-oriented ecommerce backend built using a microservices architecture. This project focuses on high performance, modularity, and real-world distributed system design patterns.

---

## 🚧 Project Status

**Currently under active development**

Core services are being implemented with a focus on scalability, fault tolerance, and clean architecture.

---

## Architecture Overview

This system follows a **microservices architecture** where each service is independently deployable and communicates via asynchronous messaging.

### Key Principles:

- Service decoupling via message queues
- Independent databases per service
- Horizontal scalability
- Fault isolation
- Event-driven communication

---

## Tech Stack

### Backend

- **Node.js** – Core runtime for services
- **Express.js** – API layer
- **TypeScript** – Type safety and maintainability

### Database & ORM

- **PostgreSQL** – Primary relational database
- **Prisma** – ORM for type-safe database access

### Caching & Performance

- **Redis** – Caching layer, session storage, and rate limiting
- In-memory fallback for rate limiting in case Redis is unavailable

### Messaging Queue

- **RabbitMQ** – Event-driven communication between services

### Media Storage

- **Cloudinary** – Image upload and management

### Search Service

- **FastAPI (Python)** – High-performance search service

### Security

- **Argon2** – Password hashing

### Logging

- **Winston** – Centralized and structured logging

---

## Services (Planned / In Progress)

### 1. API Gateway

- Central entry point
- Request routing
- Authentication middleware

### 2. Auth Service

- OTP-based authentication
- User login/signup
- Token management (JWT)
- Secure password hashing using Argon2

### 3. Product Service

- Product CRUD operations
- Inventory management

### 4. Cart Service

- Add/remove items
- Cart state management
- Price calculations

### 5. Order Service

- Order creation and tracking
- Status updates

### 6. Media Service

- Image uploads via Cloudinary
- Image processing

### 7. Search Service

- Built with FastAPI
- Optimized search queries
- Full-text search capabilities

### 8. Notification Service (Planned)

- Email/SMS notifications

---

## Features

- Microservices-based architecture
- Centralized structured logging using Winston
- Event-driven system using RabbitMQ
- OTP authentication flow
- Secure password hashing with Argon2
- Scalable search using FastAPI
- Image upload & management via Cloudinary
- Redis caching for performance optimization
- Distributed rate limiting using Redis
- In-memory fallback rate limiting for high availability
- Type-safe backend with TypeScript + Prisma

---

## Learning Goals

This project is designed to deepen understanding of:

- Distributed systems
- Event-driven architecture
- Microservices communication patterns
- Backend scalability techniques

---

## Contributing

This is a personal project, but suggestions and feedback are welcome.

---
