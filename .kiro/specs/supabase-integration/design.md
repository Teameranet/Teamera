# Design Document: Supabase Integration for Teamera.net

## Overview

This document outlines the technical design for integrating Supabase as the primary data storage and authentication solution for Teamera.net. The integration will replace the current in-memory data storage with a persistent PostgreSQL database, implement secure authentication with OAuth support, enable real-time collaboration features, and establish proper API connectivity between the React frontend and Express backend.

The design follows a three-tier architecture:
- **Frontend Layer**: React application with Supabase client for authentication and real-time subscriptions
- **Backend Layer**: Express.js API server with Supabase client for database operations
- **Data Layer**: Supabase (PostgreSQL database, Authentication, Storage, Real-time)

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Context    │  │  Components  │  │   Services   │      │
│  │  Providers   │  │              │  │              │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                  │              │
│         └─────────────────┴──────────────────┘              │
│                           │                                 │
│                  ┌────────▼────────┐                        │
│                  │ Supabase Client │                        │
│                  │   (anon key)    │                        │
│                  └────────┬────────┘                        │
└───────────────────────────┼─────────────────────────────────┘
                            │
                    ┌───────▼────────┐
                    │   HTTP/WSS     │
                    └───────┬────────┘
                            │
┌───────────────────────────┼─────────────────────────────────┐
│                  Backend (Express.js)                        │
│                  ┌────────▼────────┐                        │
│                  │  API Routes     │                        │
│                  └────────┬────────┘                        │
│                           │                                 │
│         ┌─────────────────┼─────────────────┐              │
│         │                 │                 │              │
│  ┌──────▼───────┐  ┌──────▼──────┐  ┌──────▼──────┐       │
│  │ Controllers  │  │ Middleware  │  │  Services   │       │
│  └──────┬───────┘  └─────────────┘  └──────┬──────┘       │
│         │                                   │              │
│         └───────────────┬───────────────────┘              │
│                         │                                  │
│                ┌────────▼────────┐                         │
│                │ Supabase Client │                         │
│                │ (service key)   │                         │
│                └────────┬────────┘                         │
└─────────────────────────┼───────────────────────────────────┘
                          │
                  ┌───────▼────────┐
                  │    Supabase    │
                  │   Platform     │
                  ├────────────────┤
                  │  PostgreSQL    │
                  │  Auth Service  │
                  │  Storage       │
                  │  Real-time     │
                  └────────────────┘
```

### Data Flow

1. **Authentication Flow**:
   - User initiates login/signup from frontend
   - Frontend sends credentials to Supabase Auth directly
   - Supabase returns JWT token
   - Frontend stores token and includes in API requests
   - Backend validates token for protected routes

2. **Data Operations Flow**:
   - Frontend makes API request to backend with auth token
   - Backend validates token and extracts user ID
   - Backend performs database operation via Supabase client
   - Backend returns response to frontend
   - Frontend updates UI and context state

3. **Real-time Updates Flow**:
   - Frontend subscribes to Supabase real-time channel
   - Database changes trigger real-time events
   - Supabase pushes updates to subscribed clients
   - Frontend updates UI automatically

## Components and Interfaces

### 1. Environment Configuration

**Frontend (.env)**:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:5000
```

**Backend (.env)**:
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
SUPABASE_ANON_KEY=your-anon-key
PORT=5000
JWT_SECRET=your-jwt-secret
NODE_ENV=development
```

### 2. Supabase Client Initialization

**Frontend (src/lib/supabaseClient.js)**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
```

**Backend (config/supabase.js)**:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
```

### 3. Database Schema

**Users Table**:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  skills TEXT[], -- Array of skill names
  location TEXT,
  github TEXT,
  linkedin TEXT,
  twitter TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Projects Table**:
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  stage TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  team_size INTEGER DEFAULT 1,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Project Positions Table**:
```sql
CREATE TABLE project_positions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  required_skills TEXT[],
  is_paid BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Project Members Table**:
```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  role TEXT NOT NULL, -- 'Founder', 'Member'
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);
```

**Applications Table**:
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  position TEXT NOT NULL,
  message TEXT,
  document_url TEXT,
  status TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACCEPTED', 'REJECTED'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Messages Table**:
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Tasks Table**:
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  assignee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
  status TEXT DEFAULT 'todo', -- 'todo', 'in-progress', 'done'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Files Table**:
```sql
CREATE TABLE files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Notifications Table**:
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'application', 'acceptance', 'rejection', 'message'
  title TEXT NOT NULL,
  message TEXT,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Saved Projects Table**:
```sql
CREATE TABLE saved_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, project_id)
);
```

### 4. Row Level Security Policies

**Users Table Policies**:
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Users can view all profiles"
  ON users FOR SELECT
  USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  WITH CHECK (auth.uid() = id);
```

**Projects Table Policies**:
```sql
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Anyone can view active projects
CREATE POLICY "Anyone can view active projects"
  ON projects FOR SELECT
  USING (status = 'active');

-- Authenticated users can create projects
CREATE POLICY "Authenticated users can create projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Project owners can update their projects
CREATE POLICY "Owners can update their projects"
  ON projects FOR UPDATE
  USING (auth.uid() = owner_id);

-- Project owners can delete their projects
CREATE POLICY "Owners can delete their projects"
  ON projects FOR DELETE
  USING (auth.uid() = owner_id);
```

**Messages Table Policies**:
```sql
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Project members can view messages
CREATE POLICY "Project members can view messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = messages.project_id
      AND project_members.user_id = auth.uid()
    )
  );

-- Project members can create messages
CREATE POLICY "Project members can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM project_members
      WHERE project_members.project_id = messages.project_id
      AND project_members.user_id = auth.uid()
    )
  );
```

**Notifications Table Policies**:
```sql
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

### 5. Backend API Structure

**Directory Structure**:
```
backend/
├── config/
│   ├── supabase.js          # Supabase client initialization
│   └── database.js          # Database connection validation
├── middleware/
│   ├── auth.js              # JWT validation middleware
│   └── errorHandler.js      # Error handling middleware
├── api/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── projectController.js
│   │   ├── applicationController.js
│   │   ├── messageController.js
│   │   ├── taskController.js
│   │   ├── fileController.js
│   │   └── notificationController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── projects.js
│   │   ├── applications.js
│   │   ├── messages.js
│   │   ├── tasks.js
│   │   ├── files.js
│   │   └── notifications.js
│   └── services/
│       ├── authService.js
│       ├── userService.js
│       ├── projectService.js
│       └── storageService.js
└── server.js
```

**API Endpoints**:

*Authentication*:
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/oauth/google` - Google OAuth
- `POST /api/auth/oauth/microsoft` - Microsoft OAuth
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

*Users*:
- `GET /api/users` - List users (paginated)
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `GET /api/users/:id/projects` - Get user's projects

*Projects*:
- `GET /api/projects` - List projects (with filters)
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member
- `DELETE /api/projects/:id/members/:userId` - Remove team member

*Applications*:
- `POST /api/applications` - Submit application
- `GET /api/applications` - Get applications (filtered by user/project)
- `PUT /api/applications/:id` - Update application status
- `GET /api/applications/:id` - Get application details

*Messages*:
- `POST /api/messages` - Create message
- `GET /api/messages` - Get messages for project
- `PUT /api/messages/:id/like` - Like message
- `DELETE /api/messages/:id` - Delete message

*Tasks*:
- `POST /api/tasks` - Create task
- `GET /api/tasks` - Get tasks for project
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

*Files*:
- `POST /api/files` - Upload file
- `GET /api/files` - Get files for project
- `DELETE /api/files/:id` - Delete file
- `GET /api/files/:id/download` - Download file

*Notifications*:
- `GET /api/notifications` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification

### 6. Frontend Service Layer

**API Service (frontend/services/api.js)**:
```javascript
const API_URL = import.meta.env.VITE_API_URL

class ApiService {
  async request(endpoint, options = {}) {
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Request failed')
    }

    return response.json()
  }

  // User methods
  async getUser(id) {
    return this.request(`/api/users/${id}`)
  }

  async updateUser(id, data) {
    return this.request(`/api/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  // Project methods
  async getProjects(filters = {}) {
    const params = new URLSearchParams(filters)
    return this.request(`/api/projects?${params}`)
  }

  async createProject(data) {
    return this.request('/api/projects', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  // ... other methods
}

export const api = new ApiService()
```

### 7. Context Provider Updates

**AuthContext Updates**:
- Replace localStorage-based auth with Supabase Auth ✅ (Already implemented)
- Implement OAuth flows for Google and Microsoft ✅ (Already implemented)
- Handle session management and token refresh ✅ (Already implemented)
- **Enhanced**: Save onboarding data directly to profiles table after signup
- **Enhanced**: Ensure updateProfile creates profile if it doesn't exist (upsert pattern)
- **Enhanced**: Fetch complete profile data including all fields from onboarding

**ProjectContext Updates**:
- Replace in-memory state with API calls
- Implement optimistic updates for better UX
- Add error handling and retry logic
- Maintain local cache for performance

**NotificationContext Updates**:
- Fetch notifications from backend API
- Subscribe to real-time notification updates
- Implement notification badge count
- Handle notification actions (read, delete)

### 8. Real-time Subscriptions

**Profile Real-time (frontend/hooks/useRealtimeProfile.js)** ✅ (Already exists):
```javascript
import { useEffect } from 'react';
import { supabase } from '../../src/lib/supabase';

export const useRealtimeProfile = (userId, onUpdate) => {
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          onUpdate(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
};
```

**Usage in ProfileModal**:
```javascript
// Subscribe to real-time updates for this profile
useRealtimeProfile(user?.id, (updatedProfile) => {
  setProfileData(updatedProfile);
});
```

**Usage in Profile Page**:
```javascript
// Refresh user profile when it's updated
const handleProfileUpdate = useCallback((updatedProfile) => {
  if (user?.id) {
    fetchUserProfile(user.id);
  }
}, [user?.id, fetchUserProfile]);

useRealtimeProfile(user?.id, handleProfileUpdate);
```

**Chat Real-time (frontend/components/ChatTab.jsx)**:
```javascript
useEffect(() => {
  if (!projectId) return

  const channel = supabase
    .channel(`project:${projectId}:messages`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        setMessages(prev => [...prev, payload.new])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [projectId])
```

**Tasks Real-time**:
```javascript
useEffect(() => {
  if (!projectId) return

  const channel = supabase
    .channel(`project:${projectId}:tasks`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        if (payload.eventType === 'INSERT') {
          setTasks(prev => [...prev, payload.new])
        } else if (payload.eventType === 'UPDATE') {
          setTasks(prev => prev.map(t => 
            t.id === payload.new.id ? payload.new : t
          ))
        } else if (payload.eventType === 'DELETE') {
          setTasks(prev => prev.filter(t => t.id !== payload.old.id))
        }
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [projectId])
```

### 9. OnboardingModal Integration

**Current Implementation**:
The OnboardingModal collects user data in 4 steps:
1. Role selection (founder, professional, investor, student)
2. Skills selection (multiple skills from predefined list)
3. Experience level and location
4. Bio and profile summary

**Required Changes**:
```javascript
// In OnboardingModal.jsx
const handleComplete = async () => {
  // Prepare data for Supabase (convert to snake_case)
  const profileData = {
    role: formData.role,
    skills: formData.skills,
    experience: formData.experience,
    bio: formData.bio,
    location: formData.location,
    title: getRoleDisplayTitle(formData.role) // Map role to display title
  };

  // Call updateProfile which will upsert to Supabase
  const result = await updateProfile(profileData);
  
  if (result.success) {
    onClose();
  } else {
    // Show error message
    console.error('Failed to save profile:', result.error);
  }
};
```

**Database Schema for Profiles Table**:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  title TEXT,
  bio TEXT,
  role TEXT, -- 'founder', 'professional', 'investor', 'student'
  skills TEXT[], -- Array of skill names
  experience TEXT, -- '0-1', '2-3', '4-6', '7+'
  location TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  education JSONB DEFAULT '[]'::jsonb,
  work_experience JSONB DEFAULT '[]'::jsonb,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

**AuthContext updateProfile Enhancement**:
The existing updateProfile function already handles upsert logic:
1. Checks if profile exists
2. Updates if exists, inserts if not
3. Converts camelCase to snake_case for database
4. Returns updated profile data

**Flow**:
1. User signs up → Basic auth user created
2. OnboardingModal appears → User fills in details
3. User clicks "Complete" → updateProfile called
4. Profile upserted to Supabase → Real-time updates triggered
5. User redirected to dashboard with complete profile

### 10. Profile Page Save Functionality

**Current Implementation** ✅:
The Profile page already has a comprehensive edit mode with save functionality:
- Edit button toggles edit mode
- Form fields for all profile data (bio, location, title, social links, skills, experience, education)
- Save button calls `updateProfile` from AuthContext
- Cancel button resets form data

**Key Features**:
1. **Inline Editing**: All fields editable in place
2. **Add/Remove Items**: Dynamic addition/removal of experience and education entries
3. **Skills Management**: Add/edit/remove skills with level and years
4. **Social Links**: GitHub, LinkedIn, Portfolio URLs
5. **Real-time Sync**: Changes saved to Supabase and reflected immediately

**Save Flow**:
```javascript
const handleSave = async () => {
  const result = await updateProfile(formData);
  if (result.success) {
    setIsEditing(false);
    // Profile automatically updates via real-time subscription
  } else {
    console.error('Failed to update profile:', result.error);
    // Show error message to user
  }
};
```

**Data Transformation**:
The updateProfile function in AuthContext handles:
- Converting camelCase (frontend) to snake_case (database)
- Upserting profile (insert if not exists, update if exists)
- Returning updated profile data
- Triggering real-time updates to all subscribers

### 11. File Storage Implementation

**Storage Bucket Configuration**:
```javascript
// Create bucket (run once during setup)
await supabase.storage.createBucket('project-files', {
  public: false,
  fileSizeLimit: 52428800, // 50MB
  allowedMimeTypes: [
    'application/pdf',
    'image/*',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.*',
    'application/zip'
  ]
})
```

**File Upload Service**:
```javascript
export async function uploadFile(projectId, file) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${projectId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from('project-files')
    .upload(fileName, file)

  if (error) throw error

  const { data: { publicUrl } } = supabase.storage
    .from('project-files')
    .getPublicUrl(fileName)

  return {
    fileName: file.name,
    fileUrl: publicUrl,
    fileSize: file.size,
    fileType: file.type
  }
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string
  email: string
  name: string
  title?: string
  bio?: string
  skills: string[]
  location?: string
  github?: string
  linkedin?: string
  twitter?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
```

### Project Model
```typescript
interface Project {
  id: string
  title: string
  description: string
  category: string
  stage: string
  status: string
  owner_id: string
  team_size: number
  views: number
  created_at: string
  updated_at: string
  positions: ProjectPosition[]
  members: ProjectMember[]
}

interface ProjectPosition {
  id: string
  project_id: string
  title: string
  required_skills: string[]
  is_paid: boolean
  created_at: string
}

interface ProjectMember {
  id: string
  project_id: string
  user_id: string
  position: string
  role: string
  joined_at: string
  user: User
}
```

### Application Model
```typescript
interface Application {
  id: string
  project_id: string
  user_id: string
  position: string
  message?: string
  document_url?: string
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED'
  created_at: string
  updated_at: string
  user: User
  project: Project
}
```

## Error Handling

### Backend Error Handling

**Error Response Format**:
```javascript
{
  success: false,
  error: {
    code: 'ERROR_CODE',
    message: 'Human-readable error message',
    details: {} // Optional additional details
  }
}
```

**Error Codes**:
- `AUTH_REQUIRED` - Authentication required
- `AUTH_INVALID` - Invalid authentication token
- `FORBIDDEN` - User lacks permission
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `DATABASE_ERROR` - Database operation failed
- `STORAGE_ERROR` - File storage operation failed

**Error Handler Middleware**:
```javascript
export function errorHandler(err, req, res, next) {
  console.error('Error:', err)

  if (err.code === 'PGRST116') {
    return res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Resource not found'
      }
    })
  }

  if (err.code === '23505') {
    return res.status(409).json({
      success: false,
      error: {
        code: 'DUPLICATE_ENTRY',
        message: 'Resource already exists'
      }
    })
  }

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  })
}
```

### Frontend Error Handling

**Error Display Component**:
```javascript
function ErrorMessage({ error, onRetry }) {
  return (
    <div className="error-message">
      <p>{error.message}</p>
      {onRetry && (
        <button onClick={onRetry}>Retry</button>
      )}
    </div>
  )
}
```

**API Error Handling**:
```javascript
try {
  const result = await api.createProject(projectData)
  // Handle success
} catch (error) {
  if (error.code === 'AUTH_REQUIRED') {
    // Redirect to login
  } else if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors
  } else {
    // Show generic error
    toast.error(error.message)
  }
}
```

## Testing Strategy

### Unit Tests

**Backend Controller Tests**:
- Test each controller method with valid inputs
- Test error handling for invalid inputs
- Test authentication and authorization logic
- Mock Supabase client responses

**Frontend Service Tests**:
- Test API service methods
- Test request/response handling
- Test error scenarios
- Mock fetch responses

### Integration Tests

**API Integration Tests**:
- Test complete request/response cycles
- Test database operations
- Test file upload/download
- Test real-time subscriptions

**Frontend Integration Tests**:
- Test user flows (signup, login, create project)
- Test context provider interactions
- Test component data fetching
- Test real-time updates

### End-to-End Tests

**Critical User Flows**:
- User registration and login
- Project creation and management
- Application submission and acceptance
- Chat and collaboration features
- File upload and download

### Performance Tests

**Load Testing**:
- Test API endpoints under load
- Test database query performance
- Test real-time subscription scalability
- Test file upload/download performance

**Optimization Targets**:
- API response time < 200ms (p95)
- Database queries < 100ms (p95)
- Real-time message delivery < 500ms
- File upload/download throughput > 1MB/s

## Migration Strategy

### Phase 1: Setup and Configuration
1. Create Supabase project
2. Set up environment variables
3. Install dependencies
4. Initialize Supabase clients

### Phase 2: Database Schema
1. Create all tables with proper relationships
2. Set up Row Level Security policies
3. Create indexes for performance
4. Set up storage buckets

### Phase 3: Backend Implementation
1. Implement authentication endpoints
2. Implement CRUD endpoints for all entities
3. Add middleware for auth and error handling
4. Implement file upload/download

### Phase 4: Frontend Integration
1. Update AuthContext with Supabase Auth
2. Update context providers to use API
3. Implement real-time subscriptions
4. Update components to use new data flow

### Phase 5: Data Migration
1. Export existing mock data
2. Transform data to match new schema
3. Import data into Supabase
4. Verify data integrity

### Phase 6: Testing and Deployment
1. Run all tests
2. Fix any issues
3. Deploy backend to production
4. Deploy frontend to production
5. Monitor for errors

## Security Considerations

### Authentication Security
- Use secure JWT tokens with expiration
- Implement token refresh mechanism
- Store tokens securely (httpOnly cookies or secure storage)
- Implement rate limiting on auth endpoints

### Data Security
- Use Row Level Security for all tables
- Validate all user inputs
- Sanitize data before storage
- Use parameterized queries to prevent SQL injection

### API Security
- Implement CORS properly
- Use HTTPS in production
- Validate authentication tokens on all protected routes
- Implement rate limiting
- Log security events

### File Security
- Validate file types and sizes
- Scan uploaded files for malware
- Use signed URLs for file access
- Implement access control for files
- Set appropriate storage bucket policies

## Performance Optimization

### Database Optimization
- Create indexes on frequently queried columns
- Use database views for complex queries
- Implement pagination for large result sets
- Use connection pooling

### API Optimization
- Implement response caching
- Use compression for responses
- Optimize query patterns
- Implement request batching

### Frontend Optimization
- Implement optimistic updates
- Use local caching
- Lazy load components
- Debounce API calls
- Use virtual scrolling for large lists

### Real-time Optimization
- Limit subscription scope
- Implement message batching
- Use presence tracking efficiently
- Clean up subscriptions properly

## Monitoring and Logging

### Backend Monitoring
- Log all API requests
- Track error rates
- Monitor response times
- Track database query performance
- Monitor authentication events

### Frontend Monitoring
- Track API errors
- Monitor page load times
- Track user interactions
- Monitor real-time connection status

### Alerting
- Set up alerts for high error rates
- Alert on slow API responses
- Alert on authentication failures
- Alert on storage quota limits

## Deployment Configuration

### Backend Deployment
- Use environment variables for all secrets
- Enable CORS for frontend domain
- Set up SSL/TLS certificates
- Configure rate limiting
- Set up logging and monitoring

### Frontend Deployment
- Build optimized production bundle
- Configure environment variables
- Set up CDN for static assets
- Enable gzip compression
- Configure caching headers

### Database Deployment
- Enable automatic backups
- Set up replication for high availability
- Configure connection pooling
- Monitor database performance
- Set up alerts for issues
