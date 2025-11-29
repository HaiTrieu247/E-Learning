# E-Learning Application

## Project Structure

```
elearning-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── users/               # User endpoints
│   │   └── posts/               # Legacy endpoint
│   ├── quizzes/                 # Quiz pages
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Home page
│
├── backend/                      # Backend Logic
│   ├── config/                  # Configuration files
│   │   └── db.js               # Database connection
│   ├── controllers/             # Request handlers
│   │   └── userController.js   # User controller
│   └── services/                # Business logic
│       └── userService.js      # User service
│
├── src/                         # Frontend Source
│   ├── components/              # React components
│   │   └── UserTable.tsx       # User table component
│   ├── services/                # Frontend API services
│   │   └── userService.ts      # User API calls
│   └── types/                   # TypeScript types
│       └── user.ts             # User type definitions
│
├── lib/                         # Legacy library (deprecated)
├── public/                      # Static assets
└── ...config files
```

## Architecture

### Backend (MVC Pattern)
- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Config**: Database and application configuration

### Frontend
- **Components**: Reusable React components
- **Services**: API communication layer
- **Types**: TypeScript type definitions

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/posts` - (Deprecated) Legacy endpoint, redirects to users

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env`:
   ```
   DATABASE_HOST=localhost
   DATABASE_USER=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=elearning
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)
