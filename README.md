# Drift Desk

A full-stack internal web application for bug/issue tracking built with FastAPI and React.

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **ORM**: SQLAlchemy
- **Database**: SQLite (stored at `/data/driftdesk.db`)
- **Authentication**: HTTP Basic Auth with bcrypt password hashing
- **API**: JSON REST

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **State Management**: Context API + LocalStorage
- **Routing**: React Router

## Features

- User authentication and role-based access control
- Drift (bug/issue) creation, tracking, and management
- Comment system with audit trail
- Event tracking for all drift activities
- Notification system for assignments and updates
- Real-time unread count
- Dark/light theme toggle
- Responsive design
- Admin user management

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. **Initialize database**
   ```bash
   # Create data directory if it doesn't exist
   mkdir -p ../data

   # Run database migrations (using Alembic)
   alembic upgrade head
   ```

4. **Start development server**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

   The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Setup environment variables**
   ```bash
   cp .env.example .env
   # Edit .env if needed (default should work)
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`

### Initial Setup

1. **Create admin account**
   - Navigate to `http://localhost:3000/login`
   - The first user to register becomes the administrator
   - Fill in the form to create your admin account

2. **Create additional users** (admin only)
   - Go to `/admin/users` after logging in as admin
   - Add new user accounts as needed

## API Endpoints

### Authentication
- `POST /api/auth/bootstrap` - Create first admin user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### User Management (Admin only)
- `POST /api/users/` - Create user
- `GET /api/users/` - List users
- `GET /api/users/{id}` - Get user

### Drift Management
- `POST /api/drifts/` - Create drift
- `GET /api/drifts/` - List drifts (with filters)
- `GET /api/drifts/{id}` - Get drift details
- `PATCH /api/drifts/{id}` - Update drift

### Comments
- `POST /api/comments/{drift_id}` - Add comment
- `GET /api/comments/{drift_id}` - List comments
- `DELETE /api/comments/comment/{comment_id}` - Delete comment

### Notifications
- `GET /api/notifications/` - List notifications
- `POST /api/notifications/read/{id}` - Mark notification as read
- `POST /api/notifications/read-all` - Mark all as read

## Development

### Database Migrations

Create new migration:
```bash
alembic revision --autogenerate -m "Description of changes"
```

Apply migrations:
```bash
alembic upgrade head
```

### Project Structure

```
driftdesk/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application
│   │   ├── database.py          # SQLAlchemy setup
│   │   ├── models/              # Database models
│   │   ├── schemas/             # Pydantic schemas
│   │   ├── api/                 # API routes
│   │   ├── services/            # Business logic
│   │   └── utils/               # Utilities (auth, etc.)
│   ├── requirements.txt
│   └── alembic/                 # Database migrations
├── frontend/
│   ├── src/
│   │   ├── components/          # React components
│   │   ├── context/             # Context providers
│   │   ├── hooks/               # Custom hooks
│   │   ├── services/            # API client
│   │   └── styles/              # CSS/Tailwind
│   ├── package.json
│   └── tailwind.config.js
├── data/                        # SQLite database
└── README.md
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=sqlite:///./data/driftdesk.db
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

### Frontend (.env)
```
VITE_API_BASE_URL=http://localhost:8000
```

## Production Deployment

### Backend
1. Set production environment variables
2. Use a production database (PostgreSQL recommended)
3. Set up proper secret keys
4. Run with a production ASGI server (Gunicorn + Uvicorn)

### Frontend
1. Build the application: `npm run build`
2. Serve with a web server (Nginx recommended)
3. Configure reverse proxy to backend API

## Security Notes

- Change default secret keys in production
- Use HTTPS in production
- Regularly update dependencies
- Implement rate limiting
- Use environment variables for sensitive data

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

Internal use only.