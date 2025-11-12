# Supabase API Integration Roadmap

## Overview
This roadmap outlines the complete setup and integration of Supabase as the backend database and authentication system for Teamera Net.

---

## Phase 1: Supabase Project Setup & Configuration ✅

### 1.1 Create Supabase Project
- [ ] Sign up/Login to [supabase.com](https://supabase.com)
- [ ] Create new project: "teamera"
- [ ] Choose region closest to users
- [ ] Save database password securely

### 1.2 Get API Credentials
- [ ] Copy Project URL from Settings → API
- [ ] Copy `anon` public key
- [ ] Copy `service_role` secret key (keep secure!)

### 1.3 Environment Variables Setup
**Root `.env` file:**
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key
VITE_API_URL=http://localhost:5000
```

**Backend `backend/.env` file:**
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_KEY=your-actual-service-role-key
SUPABASE_ANON_KEY=your-actual-anon-key
PORT=5000
JWT_SECRET=generate-random-secret-key
NODE_ENV=development
```

### 1.4 Install Supabase Client
```bash
# Root directory
npm install @supabase/supabase-js

# Backend directory (if separate package.json)
cd backend
npm install @supabase/supabase-js
```
**Important**: 
- The `JWT_SECRET` should be a random string. You can generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Never commit your `.env` files to version control
- The `.env.example` files are templates for other developers
---

## Phase 2: Database Schema Creation 📊

### 2.1 Authentication & Profile Tables
**File: `database/authentication_profile_schema.sql`**

Create tables:
- `profiles` - Extended user profile data
- `user_onboarding` - Onboarding form data
- `projects` - User-created projects
- `project_applications` - Project applications
- `project_members` - Project team members
- `hackathons` - Hackathon events
- `hackathon_registrations` - User hackathon registrations
- `notifications` - User notifications
- `messages` - Chat messages
- `contacts` - Contact form submissions

### 2.2 Row Level Security (RLS) Policies
- Enable RLS on all tables
- Create policies for:
  - Users can read their own data
  - Users can update their own profile
  - Project owners can manage their projects
  - Members can view project data
  - Public read for hackathons

### 2.3 Database Functions & Triggers
- Auto-increment `projects_created` on project creation
- Auto-increment `connections_helped` on application acceptance
- Auto-add project owner as "Founder" member
- Auto-update timestamps

---

## Phase 3: Backend API Setup 🔧

### 3.1 Supabase Client Configuration
**File: `backend/config/supabase.js`**
- Initialize Supabase client with service role key
- Export client for use in controllers
- Add connection test function
- Show "Supabase Connected" on server start

### 3.2 Authentication Controller
**File: `backend/api/controllers/authController.js`**
Endpoints:
- `POST /api/auth/signup` - Register new user with Supabase Auth
- `POST /api/auth/signin` - Login user
- `POST /api/auth/signout` - Logout user
- `GET /api/auth/session` - Get current session
- `POST /api/auth/refresh` - Refresh session token

### 3.3 User Profile Controller
**File: `backend/api/controllers/profileController.js`**
Endpoints:
- `GET /api/profile/:id` - Get user profile
- `PUT /api/profile/:id` - Update user profile
- `POST /api/profile/onboarding` - Save onboarding data
- `GET /api/profile/onboarding/:id` - Get onboarding data

### 3.4 Project Controller
**File: `backend/api/controllers/projectController.js`**
Endpoints:
- `POST /api/projects` - Create new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/apply` - Apply to project
- `POST /api/projects/:id/accept/:userId` - Accept application
- `POST /api/projects/:id/reject/:userId` - Reject application
- `GET /api/projects/user/:userId` - Get user's projects

### 3.5 Update Existing Controllers
- Replace in-memory storage with Supabase queries
- Update `userController.js` to use Supabase
- Update `contactController.js` to store in Supabase

### 3.6 Middleware Updates
**File: `backend/middleware/auth.js`**
- Add Supabase JWT verification
- Add user authentication middleware
- Add role-based access control

### 3.7 Update Server.js
- Add Supabase connection test on startup
- Display "✅ Supabase Connected" message
- Handle connection errors gracefully

---

## Phase 4: Frontend Integration 🎨

### 4.1 Supabase Client Setup
**File: `frontend/config/supabase.js`**
- Initialize Supabase client with anon key
- Export client for React components
- Add session management helpers

### 4.2 Update AuthContext
**File: `frontend/context/AuthContext.jsx`**
- Replace localStorage with Supabase session
- Implement session persistence
- Handle session refresh on page load
- Auto-login on page refresh if session exists

### 4.3 Update AuthModal
**File: `frontend/components/AuthModal.jsx`**
- Integrate Supabase signup
- Integrate Supabase signin
- Handle full name field
- Show onboarding modal after signup
- Store full name in database

### 4.4 Update OnboardingModal
**File: `frontend/components/OnboardingModal.jsx`**
- Save onboarding data to Supabase
- Link to user profile
- Update profile with onboarding selections

### 4.5 Update ProfileModal
**File: `frontend/components/ProfileModal.jsx`**
- Fetch profile from Supabase
- Update profile in Supabase
- Real-time updates after edit
- Display full name instead of email

### 4.6 Update Profile Page
**File: `frontend/pages/Profile.jsx`**
- Fetch user data from Supabase
- Display full name in user-info
- Show real-time stats (projects_created, connections_helped)
- Update stats when projects/applications change

### 4.7 Update Navbar
**File: `frontend/components/Navbar.jsx`**
- Display full name in user-info
- Show user avatar from Supabase
- Handle logout with Supabase

### 4.8 Update Project Components
- `CreateProjectModal.jsx` - Save to Supabase
- `ProjectCard.jsx` - Fetch from Supabase
- `ProjectModal.jsx` - Real-time updates
- `CollaborationSpace.jsx` - Load members from Supabase

---

## Phase 5: Real-time Features ⚡

### 5.1 Supabase Realtime Subscriptions
- Subscribe to profile changes
- Subscribe to project updates
- Subscribe to application status changes
- Subscribe to new messages

### 5.2 Update Components with Realtime
- ProfileModal - Auto-update on changes
- Profile Page - Live stats updates
- ProjectModal - Live member updates
- CollaborationSpace - Live chat

---

## Phase 6: Security & Performance 🔒

### 6.1 Security Enhancements
- Fix Supabase Auth password check (HaveIBeenPwned)
- Implement proper RLS policies
- Add rate limiting on API endpoints
- Validate all inputs
- Sanitize user data

### 6.2 Performance Optimization
- Add database indexes
- Optimize queries
- Implement caching where appropriate
- Fix performance warnings
- Fix security advisor warnings

---

## Phase 7: Testing & Validation ✅

### 7.1 Authentication Flow Testing
- [ ] Sign up → Onboarding → Profile display
- [ ] Sign in → Immediate login
- [ ] Page refresh → Session persistence
- [ ] Logout → Clear session

### 7.2 Profile Testing
- [ ] Create profile → Display full name
- [ ] Edit profile → Real-time update
- [ ] Onboarding data → Profile page display

### 7.3 Project Flow Testing
- [ ] Create project → Store in DB
- [ ] Apply to project → Update status
- [ ] Accept application → Add member
- [ ] Stats update → Real-time display

### 7.4 Browser Console Testing
- [ ] Check for errors
- [ ] Verify API calls
- [ ] Check Supabase connections
- [ ] Validate data flow

---

## Phase 8: Cleanup & Documentation 🧹

### 8.1 Remove Test Files
- Delete any test files created during development
- Clean up console.log statements
- Remove commented code

### 8.2 Final Verification
- [ ] Server shows "Supabase Connected" on start
- [ ] All functions work as per requirements
- [ ] No console errors
- [ ] All data persists correctly
- [ ] Real-time updates work

---

## Implementation Priority

### High Priority (Must Have)
1. Phase 1: Supabase Setup
2. Phase 2: Database Schema
3. Phase 3.1-3.2: Backend Config & Auth
4. Phase 4.1-4.3: Frontend Config & Auth
5. Phase 7.1: Authentication Testing

### Medium Priority (Should Have)
6. Phase 3.3-3.5: Profile & Project Controllers
7. Phase 4.4-4.7: Profile & Navbar Updates
8. Phase 7.2-7.3: Profile & Project Testing

### Low Priority (Nice to Have)
9. Phase 5: Real-time Features
10. Phase 6: Security Enhancements
11. Phase 8: Cleanup

---

## Key Requirements Summary

✅ **Authentication**
- Sign Up with full name → Onboarding → Profile
- Sign In → Immediate login
- Session persistence on page refresh

✅ **Profile Management**
- Display full name (not email) in Profile page & Navbar
- Real-time updates after profile edit
- Store onboarding data in profile

✅ **Project Management**
- Create/Edit/Delete projects → Store in DB
- Apply to projects → Update status
- Accept applications → Add to CollaborationSpace
- Auto-update stats (projects_created, connections_helped)

✅ **Database**
- Single SQL file for all schemas
- Proper RLS policies
- Triggers for auto-updates

✅ **Server**
- Show "Supabase Connected" on startup
- Handle connection errors

---

## Estimated Timeline

- **Phase 1-2**: 2-3 hours (Setup & Schema)
- **Phase 3**: 4-6 hours (Backend API)
- **Phase 4**: 4-6 hours (Frontend Integration)
- **Phase 5-6**: 2-3 hours (Real-time & Security)
- **Phase 7-8**: 2-3 hours (Testing & Cleanup)

**Total**: ~14-21 hours

---

## Next Steps

1. Start with Phase 1: Complete Supabase project setup
2. Create database schema (Phase 2)
3. Set up backend configuration (Phase 3.1)
4. Implement authentication (Phase 3.2 & 4.1-4.3)
5. Test authentication flow (Phase 7.1)
6. Continue with remaining phases

---

## Notes

- Always test in browser after each function implementation
- Check browser console for errors
- Verify data persistence after each change
- Delete test files after successful implementation
- Follow the system flow as specified in requirements

