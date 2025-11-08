# Teamera Net Backend

A complete Node.js + Express + MongoDB backend for the Teamera Net collaborative platform.

## Features

- **Authentication & Authorization**: JWT-based auth with bcrypt password hashing
- **Database**: MongoDB with Mongoose ODM
- **Real-time Communication**: Socket.io for live updates
- **API**: RESTful API with comprehensive endpoints
- **Security**: Helmet, CORS, rate limiting, input validation
- **Models**: User, Project, Hackathon, Message with relationships

## Tech Stack

- Node.js + Express
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- bcryptjs
- Express Validator
- Helmet
- CORS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/Teamera-net
# For MongoDB Atlas, use: mongodb+srv://username:password@cluster.mongodb.net/Teamera-net

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 3. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service
3. Use `mongodb://localhost:27017/Teamera-net` as MONGODB_URI

#### Option B: MongoDB Atlas (Recommended)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get your connection string
4. Replace the connection string in your `.env` file

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev:server

# Production mode
npm run server
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `DELETE /api/auth/account` - Delete user account

### Users
- `GET /api/users` - Get all users (paginated)
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user by ID
- `GET /api/users/:id/projects` - Get user's projects

### Projects
- `GET /api/projects` - Get all projects (paginated)
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/join` - Join project
- `POST /api/projects/:id/leave` - Leave project
- `POST /api/projects/:id/members` - Add project member
- `DELETE /api/projects/:id/members/:userId` - Remove project member
- `PUT /api/projects/:id/members/:userId` - Update member role

### Hackathons
- `GET /api/hackathons` - Get all hackathons (paginated)
- `GET /api/hackathons/upcoming` - Get upcoming hackathons
- `GET /api/hackathons/:id` - Get hackathon by ID
- `POST /api/hackathons` - Create hackathon
- `PUT /api/hackathons/:id` - Update hackathon
- `DELETE /api/hackathons/:id` - Delete hackathon
- `POST /api/hackathons/:id/register` - Register for hackathon
- `POST /api/hackathons/:id/unregister` - Unregister from hackathon

### Messages
- `POST /api/projects/:projectId/messages` - Send message
- `GET /api/projects/:projectId/messages` - Get project messages
- `PUT /api/messages/:messageId` - Update message
- `DELETE /api/messages/:messageId` - Delete message
- `POST /api/messages/:messageId/reactions` - Add reaction
- `DELETE /api/messages/:messageId/reactions` - Remove reaction

### Contact
- `POST /api/contact` - Submit contact form

## Real-time Features

The backend includes Socket.io for real-time communication:

- **Project Rooms**: Join/leave project-specific rooms
- **Live Messaging**: Real-time message delivery
- **Typing Indicators**: Show when users are typing
- **Project Updates**: Live project change notifications

## Database Models

### User
- Basic profile information
- Skills and bio
- Authentication data
- Project relationships

### Project
- Project details and metadata
- Member management
- Status and visibility settings
- Technology stack

### Hackathon
- Event information
- Registration management
- Participant tracking
- Prize information

### Message
- Project-based messaging
- Reply functionality
- Reactions system
- Soft deletion

## Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcrypt with salt rounds
- **Input Validation**: Express-validator middleware
- **Rate Limiting**: Prevent abuse
- **CORS**: Configured for frontend
- **Helmet**: Security headers
- **Data Sanitization**: Clean user inputs

## Error Handling

- Comprehensive error responses
- Validation error messages
- Database error handling
- Authentication error handling
- Rate limiting responses

## Development

### Project Structure
```
backend/
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Project.js
│   ├── Hackathon.js
│   └── Message.js
├── middleware/
│   ├── auth.js
│   └── validation.js
├── api/
│   ├── controllers/
│   ├── routes/
│   └── services/
├── utils/
│   └── helpers.js
├── server.js
└── config.env
```

### Scripts
- `npm run server` - Start production server
- `npm run dev:server` - Start development server with nodemon

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a strong JWT_SECRET
3. Configure MongoDB Atlas
4. Set up proper CORS origins
5. Configure rate limiting
6. Use environment variables for all secrets

## Health Check

Visit `http://localhost:5000/health` to check server status.

## API Documentation

Visit `http://localhost:5000/api` for complete API endpoint documentation.
