# Kanban Task Manager

A full-stack task management application with a Kanban board interface, built with Next.js, Express, and PostgreSQL.

## Features

- Task management with CRUD operations
- Kanban board interface with drag-and-drop functionality
- Column management
- Task completion status
- Task duplication
- RESTful API
- TypeScript support

## Tech Stack

### Backend
- Node.js with Express
- TypeScript
- PostgreSQL
- Docker
- CORS
- Helmet for security

### Frontend
- Next.js
- TypeScript
- TailwindCSS
- React DnD for drag and drop
- React Icons

## Prerequisites

- Docker and Docker Compose
- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Doincode/kanban-task-manager.git
cd kanban-task-manager
```

2. Create a `.env` file:
```bash
cp .env.example .env
```

3. Start the application using Docker Compose:
```bash
docker compose up --build -d
```

This will start three containers:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- PostgreSQL: localhost:5432

## Development

### Backend Development

1. Navigate to the backend directory:
```bash
cd src
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

### Frontend Development

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Tasks
- POST /api/tasks - Create a new task
- GET /api/tasks - Get all tasks
- GET /api/tasks/:id - Get a specific task
- PUT /api/tasks/:id - Update a task
- DELETE /api/tasks/:id - Delete a task
- PUT /api/tasks/:id/position - Update task position

### Columns
- POST /api/columns - Create a new column
- GET /api/columns - Get all columns
- GET /api/columns/:id - Get a specific column
- PUT /api/columns/:id - Update a column
- DELETE /api/columns/:id - Delete a column
- PUT /api/columns/:id/position - Update column position

## Project Structure

```
kanban-task-manager/
├── frontend/              # Next.js frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/      # API services
│   │   └── types/         # TypeScript types
│   └── package.json
├── src/                   # Express backend application
│   ├── controllers/       # API controllers
│   ├── models/           # Database models
│   ├── routes/           # API routes
│   ├── types/            # TypeScript types
│   └── server.ts         # Express server
├── db/                   # Database configuration
│   ├── Dockerfile        # PostgreSQL Dockerfile
│   └── init.sql         # Database initialization script
├── docker-compose.yml    # Docker Compose configuration
└── package.json          # Backend dependencies
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License. 