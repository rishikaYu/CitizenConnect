Citizen Connect:
Citizen Service Request Management System based on React, Node.js, and PostgreSQL. Citizens can report municipal problems, while administrators review and close requests through an admin dashboard. 


# Citizen Service Request Management System

A full-stack web application that enables citizens to submit municipal service requests and allows administrators to review, manage, and resolve these requests efficiently. The system improves communication between citizens and local authorities while ensuring transparency and accountability.

## Live Demo
Frontend: https://YOUR_FRONTEND_URL  
Backend API: https://YOUR_BACKEND_URL

## Features

### Citizen Portal
- User registration and login
- Submit service requests with description, category, location, and image
- Track the status of submitted requests
- View request history

### Admin Dashboard
- View and manage all citizen service requests
- Update request status (Pending, In Progress, Completed, Rejected)
- Assign and manage priority levels
- View request details with submitted images

## Tech Stack

| Layer | Technologies |
|------|--------------|
| Frontend | React.js, React Router, Bootstrap, Axios |
| Backend | Node.js, Express.js, Multer, JWT Authentication |
| Database | PostgreSQL |
| Deployment | Vercel (Frontend), Render(Backend), Neon/Supabase (Database) |

React Frontend → Express REST API → PostgreSQL Database
## Installation

### Prerequisites
- Node.js
- PostgreSQL

### Backend Setup
```bash**
cd backend
npm install

Create .env in backend:
DATABASE_URL=your_postgres_connection_string
JWT_SECRET=your_secret_key

Start frontend:
npm start
REACT_APP_API_URL=http://localhost:5001

Start backend:
npm run dev

Database Schema (Simplified)
Users
- id (PK)
- name
- email
- password_hash
- role (citizen/admin)

ServiceRequests
- id (PK)
- user_id (FK)
- category
- description
- image_path
- location
- priority
- status
- created_at

License

This project is licensed under the MIT License.
MIT License
Copyright (c) 2025 Rishika Akunuru

