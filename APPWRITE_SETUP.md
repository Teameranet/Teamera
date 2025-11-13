# Appwrite API Integration Roadmap

## Overview
This roadmap mirrors the Supabase plan but implements Appwrite as the backend for authentication, database, permissions, and realtime. It outlines environment variables, backend and frontend setup, collections, permissions, security, and testing for Teamera Net.

---

## Phase 1: Appwrite Project Setup & Configuration ✅

### 1.1 Create Appwrite Project
- [ ] Sign up/Login to Appwrite Cloud (https://cloud.appwrite.io) or set up self-hosted Appwrite
- [ ] Create a new Project: "teamera"
- [ ] Note the Project ID
- [ ] Get Endpoint URL (e.g., https://cloud.appwrite.io/v1 or your self-hosted endpoint)
- [ ] Create an API Key with necessary scopes (Databases, Users, Teams, Functions, Account)

### 1.2 Get Credentials
- [ ] Appwrite Endpoint (Endpoint URL)
- [ ] Project ID
- [ ] API Key (server-side only; never expose to client)

### 1.3 Environment Variables Setup
**Root `.env` file (frontend):**
```env
VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=your-project-id
VITE_API_URL=http://localhost:5000
```

**Backend `backend/.env` file:**
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-appwrite-api-key
PORT=5000
JWT_SECRET=generate-random-secret-key
NODE_ENV=development
```
Notes:
- Generate a random JWT secret: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Do not commit `.env` files. Provide `.env.example` templates.

### 1.4 Install Appwrite SDK
```bash
# Root directory (frontend)
npm install appwrite

# Backend directory (if separate package.json)
cd backend
npm install appwrite
```

---

## Phase 2: Database & Collections 📊
Appwrite uses Databases and Collections instead of SQL schemas. We will create a single database and multiple collections analogous to your Supabase tables.

### 2.1 Database
- Database ID: `teamera_db`
- Database Name: `Teamera Database`

### 2.2 Collections & Attributes
Create the following collections in `teamera_db`. Attribute types: string, integer, boolean, float, array; use `required` flags and default values where appropriate. Store relationships by saving related document IDs.

1) `profiles`
- Fields:
  - `userId` (string, required)
  - `email` (string, required)
  - `fullName` (string)
  - `avatarUrl` (string)
  - `bio` (string)
  - `skills` (array<string>)
  - `projects_created` (integer, default 0)
  - `connections_helped` (integer, default 0)
  - `createdAt` (string ISO date)
  - `updatedAt` (string ISO date)
- Indexes: `userId` unique
- Permissions:
  - Read: user:`userId`
  - Update: user:`userId`
  - Admin: team:`admins`

2) `user_onboarding`
- Fields:
  - `userId` (string, required)
  - `interests` (array<string>)
  - `rolePreferences` (array<string>)
  - `experienceLevel` (string)
  - `goals` (string)
  - `createdAt` (string ISO date)
- Permissions:
  - Read/Write: user:`userId`

3) `projects`
- Fields:
  - `ownerId` (string, required)
  - `title` (string, required)
  - `description` (string)
  - `tags` (array<string>)
  - `status` (string: draft|active|archived)
  - `createdAt` (string ISO date)
  - `updatedAt` (string ISO date)
- Indexes: `ownerId`
- Permissions:
  - Read: any (optional, or restrict to members)
  - Write/Update/Delete: user:`ownerId`, team:`admins`

4) `project_applications`
- Fields:
  - `projectId` (string, required)
  - `applicantId` (string, required)
  - `message` (string)
  - `status` (string: pending|accepted|rejected)
  - `createdAt` (string ISO date)
- Indexes: `projectId`, `applicantId`
- Permissions:
  - Read: user:`ownerId` of project, user:`applicantId`
  - Write: user:`applicantId`
  - Update: project owner or team:`admins`

5) `project_members`
- Fields:
  - `projectId` (string, required)
  - `userId` (string, required)
  - `role` (string: Founder|Member)
  - `joinedAt` (string ISO date)
- Indexes: `projectId`, `userId`
- Permissions:
  - Read: members of project
  - Write/Update/Delete: project owner, team:`admins`

6) `hackathons`
- Fields:
  - `title` (string, required)
  - `description` (string)
  - `startDate` (string ISO date)
  - `endDate` (string ISO date)
  - `public` (boolean, default true)
- Permissions:
  - Read: any
  - Write/Update/Delete: team:`admins`

7) `hackathon_registrations`
- Fields:
  - `hackathonId` (string, required)
  - `userId` (string, required)
  - `createdAt` (string ISO date)
- Permissions:
  - Read: user:`userId`, team:`admins`
  - Write: user:`userId`

8) `notifications`
- Fields:
  - `userId` (string, required)
  - `type` (string)
  - `content` (string)
  - `read` (boolean, default false)
  - `createdAt` (string ISO date)
- Permissions:
  - Read/Write: user:`userId`

9) `messages`
- Fields:
  - `roomId` (string, required) // can be projectId or chat room
  - `senderId` (string, required)
  - `content` (string)
  - `createdAt` (string ISO date)
- Permissions:
  - Read: room members
  - Write: room members

10) `contacts`
- Fields:
  - `name` (string)
  - `email` (string)
  - `subject` (string)
  - `message` (string)
  - `createdAt` (string ISO date)
- Permissions:
  - Read: team:`admins`
  - Write: any

### 2.3 Permission Model (RLS Equivalent)
- Each document uses Appwrite permissions: `read`, `update`, `delete`, `write`.
- Ownership: set permissions to `user:<userId>` for personal data.
- Project data: owner gets full permissions; members get `read` (and optionally `write`) via dynamic role checks.
- Public collections (e.g., hackathons) grant `read:any`.

### 2.4 Functions & Event Triggers
Use Appwrite Functions for automation:
- On `projects` document create: auto-create `project_members` record with `role=Founder` for `ownerId`.
- On `project_applications` update to `accepted`: increment `connections_helped` in `profiles` and add member to `project_members`.
- On `projects` create: increment `projects_created` in owner profile.
- Maintain `updatedAt` timestamps on writes.
Triggers: subscribe to `databases.*.collections.*.documents.*` events for create/update/delete.

---

## Phase 3: Backend API Setup 🔧

### 3.1 Appwrite Client Configuration
**File: `backend/config/appwrite.js`**
- Initialize server client with API key (admin context) for administrative tasks.
- Provide helper to build a user-scoped client via `Client.setJWT(token)` using the JWT from `Authorization: Bearer <jwt>`.
- Export services: `databases`, `users`, `teams`, and a `testConnection()`.
- On server start, run `testConnection()` and log "✅ Appwrite Connected" or handle errors.

### 3.2 Authentication Controller
**File: `backend/api/controllers/authController.js`**
Endpoints:
- `POST /api/auth/signup` (optional proxy): Create user via Admin `Users.create(email, password, name)`. Prefer frontend Account for actual signup.
- `POST /api/auth/signin` (optional proxy): Prefer frontend `Account.createEmailSession`. Backend can be a passthrough if needed.
- `POST /api/auth/signout`: Frontend `Account.deleteSession('current')`. Backend can invalidate session if proxied.
- `GET /api/auth/session`: Validate Appwrite JWT and return user profile summary.
- `POST /api/auth/refresh`: Frontend `Account.createJWT` to obtain a fresh JWT; backend accepts updated JWT for user-scoped operations.

### 3.3 User Profile Controller
**File: `backend/api/controllers/profileController.js`**
Endpoints:
- `GET /api/profile/:id` - Fetch `profiles` document by `userId`.
- `PUT /api/profile/:id` - Update profile fields with user-scoped client (respect permissions).
- `POST /api/profile/onboarding` - Create or update `user_onboarding` document.
- `GET /api/profile/onboarding/:id` - Fetch onboarding data.

### 3.4 Project Controller
**File: `backend/api/controllers/projectController.js`**
Endpoints:
- `POST /api/projects` - Create project (owner is requester). Also update stats and create founder member (or rely on Function trigger).
- `GET /api/projects` - List projects (public or user-specific).
- `GET /api/projects/:id` - Get project by ID.
- `PUT /api/projects/:id` - Update project.
- `DELETE /api/projects/:id` - Delete project.
- `POST /api/projects/:id/apply` - Create application for user.
- `POST /api/projects/:id/accept/:userId` - Accept application; add to members; update stats.
- `POST /api/projects/:id/reject/:userId` - Reject application.
- `GET /api/projects/user/:userId` - Get projects owned by user.

### 3.5 Update Existing Controllers
- Replace any in-memory storage with Appwrite Databases operations.
- Update `userController.js` to read/write `profiles` and `user_onboarding` collections.
- Update `contactController.js` to store contact messages in `contacts`.

### 3.6 Middleware Updates
**File: `backend/middleware/auth.js`**
- Extract `Authorization: Bearer <jwt>` from requests.
- Build a user-scoped Appwrite client via `Client.setJWT`.
- Verify user via `Account.get()` (on frontend) or `Users.get` with server context when appropriate; in backend, use JWT client to validate by calling a simple databases read with user permissions.
- Attach `req.user` with `{ id, email, name, teams }` using `Teams.list()`.
- Implement role-based access control using Appwrite Teams (e.g., `admins` team).

### 3.7 Update Server.js
- Import `testConnection()` and run on startup.
- Log "✅ Appwrite Connected" on success.
- Gracefully handle and log connection errors.

---

## Phase 4: Frontend Integration 🎨

### 4.1 Appwrite Client Setup
**File: `frontend/config/appwrite.js`**
- Initialize client using `VITE_APPWRITE_ENDPOINT` and `VITE_APPWRITE_PROJECT_ID`.
- Export instances: `client`, `account`, `databases`, `avatars`, `realtime`.
- Provide helpers: `getSession`, `getUser`, `createJWT`, and database utilities.

### 4.2 Update AuthContext
**File: `frontend/context/AuthContext.jsx`**
- Replace localStorage-only auth with Appwrite `Account` session.
- On app load: check `Account.get()`; if valid, set user and fetch profile.
- Implement session persistence using Appwrite cookies/session.
- Handle JWT creation via `Account.createJWT` for backend user-scoped calls when needed.

### 4.3 Update AuthModal
**File: `frontend/components/AuthModal.jsx`**
- Integrate signup via `Account.create(email, password, fullName)`.
- Integrate signin via `Account.createEmailSession(email, password)`.
- Capture full name and create a `profiles` document.
- After signup, show onboarding modal.

### 4.4 Update OnboardingModal
**File: `frontend/components/OnboardingModal.jsx`**
- Save onboarding selections to `user_onboarding` collection.
- Link onboarding data to profile (`userId`).
- Update profile with derived fields as needed.

### 4.5 Update ProfileModal
**File: `frontend/components/ProfileModal.jsx`**
- Fetch and display profile data from Appwrite.
- Update profile fields and reflect real-time changes.
- Display full name rather than email.

### 4.6 Update Profile Page
**File: `frontend/pages/Profile.jsx`**
- Fetch user profile from Appwrite.
- Display full name in user info.
- Show real-time stats (`projects_created`, `connections_helped`).
- React to updates when projects/applications change.

### 4.7 Update Navbar
**File: `frontend/components/Navbar.jsx`**
- Show full name and avatar from profile.
- Handle logout via `Account.deleteSession('current')`.

### 4.8 Update Project Components
- `CreateProjectModal.jsx` - Create documents in `projects` collection.
- `ProjectCard.jsx` - List and show projects from Appwrite.
- `ProjectModal.jsx` - Real-time updates on project and members.
- `CollaborationSpace.jsx` - Load members and messages from Appwrite; enable chat.

---

## Phase 5: Realtime Features ⚡

### 5.1 Appwrite Realtime Subscriptions
- Subscribe to channels:
  - `databases.teamera_db.collections.profiles.documents`
  - `databases.teamera_db.collections.projects.documents`
  - `databases.teamera_db.collections.project_applications.documents`
  - `databases.teamera_db.collections.project_members.documents`
  - `databases.teamera_db.collections.messages.documents`
- Listen to `create`, `update`, `delete` events.

### 5.2 Update Components with Realtime
- ProfileModal: subscribe to profile changes.
- Profile Page: update stats in real-time.
- ProjectModal: auto-update member list.
- CollaborationSpace: live chat updates via `messages` collection.

---

## Phase 6: Security & Performance 🔒

### 6.1 Security Enhancements
- Strict document permissions (RLS-equivalent).
- Use Appwrite Teams for admin and project roles.
- Validate and sanitize all inputs on backend.
- Rate limit API endpoints.
- Ensure API Key is server-only; never expose to client.
- Implement password strength checks on signup (client-side), optionally integrate HaveIBeenPwned via backend function.

### 6.2 Performance Optimization
- Create indexes on frequently queried fields (e.g., `userId`, `projectId`).
- Optimize queries and pagination.
- Cache reads where appropriate (in-memory or CDN for public data).
- Address performance/security advisor warnings in Appwrite console.

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

### 7.4 Browser Console & Network Testing
- [ ] Check for errors
- [ ] Verify API calls
- [ ] Validate Appwrite connections
- [ ] Confirm data flow and permissions

---

## Phase 8: Cleanup & Documentation 🧹

### 8.1 Remove Test Files
- Delete temporary/test documents
- Clean console.log statements
- Remove commented code

### 8.2 Final Verification
- [ ] Server shows "✅ Appwrite Connected" on start
- [ ] All functions work as per requirements
- [ ] No console errors
- [ ] Data persists correctly
- [ ] Realtime updates work

---

## Implementation Priority

### High Priority (Must Have)
1. Phase 1: Appwrite Setup
2. Phase 2: Database & Collections
3. Phase 3.1-3.2: Backend Config & Auth
4. Phase 4.1-4.3: Frontend Config & Auth
5. Phase 7.1: Authentication Testing

### Medium Priority (Should Have)
6. Phase 3.3-3.5: Profile & Project Controllers
7. Phase 4.4-4.7: Profile & Navbar Updates
8. Phase 7.2-7.3: Profile & Project Testing

### Low Priority (Nice to Have)
9. Phase 5: Realtime Features
10. Phase 6: Security Enhancements
11. Phase 8: Cleanup

---

## Key Requirements Summary

✅ Authentication
- Sign Up with full name → Onboarding → Profile
- Sign In → Immediate login
- Session persistence on page refresh

✅ Profile Management
- Display full name (not email) in Profile page & Navbar
- Real-time updates after profile edit
- Store onboarding data in profile

✅ Project Management
- Create/Edit/Delete projects → Store in Appwrite
- Apply to projects → Update status
- Accept applications → Add to CollaborationSpace
- Auto-update stats (`projects_created`, `connections_helped`)

✅ Database
- Single Appwrite database with multiple collections
- Strict permissions per document
- Functions for auto-updates

✅ Server
- Show "Appwrite Connected" on startup
- Handle connection errors gracefully

---

## Next Steps
1. Complete Appwrite project setup and environment variables
2. Create `teamera_db` and all collections with attributes and permissions
3. Implement `backend/config/appwrite.js` and connectivity test
4. Implement frontend Appwrite client and AuthContext session management
5. Implement controllers and middleware using Appwrite clients
6. Test authentication flow end-to-end
7. Wire up realtime subscriptions and verify UI updates

---

## Notes
- Always test in browser after each function implementation
- Check browser console and network requests for errors
- Verify data persistence and permissions after each change
- Keep API Key server-only and rotate secrets periodically
- Follow the system flow as specified in requirements