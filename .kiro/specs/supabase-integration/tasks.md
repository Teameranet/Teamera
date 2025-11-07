# Implementation Plan

- [x] 1. Set up Supabase project and configuration ✅ COMPLETED
  - Create a new Supabase project at supabase.com
  - Copy the project URL and API keys (anon key and service role key)
  - Create `.env` file in the backend directory with `SUPABASE_URL`, `SUPABASE_SERVICE_KEY`, `SUPABASE_ANON_KEY`, `PORT`, `JWT_SECRET`, and `NODE_ENV`
  - Create `.env` file in the root directory with `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_URL`
  - Install Supabase dependencies: `npm install @supabase/supabase-js` in both root and backend directories
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 2. Create profiles table schema with onboarding fields





  - Create `backend/config/profiles-schema.sql` file with profiles table definition
  - Include fields: id, email, name, title, bio, role, skills (text array), experience, location, github_url, linkedin_url, portfolio_url, education (JSONB), work_experience (JSONB), avatar_url, created_at, updated_at
  - Add foreign key constraint to auth.users(id) with CASCADE delete
  - Create trigger to auto-update updated_at timestamp
  - Enable Row Level Security on profiles table
  - Create RLS policy: "Users can view all profiles" (SELECT for all)
  - Create RLS policy: "Users can update own profile" (UPDATE where auth.uid() = id)
  - Create RLS policy: "Users can insert own profile" (INSERT where auth.uid() = id)
  - Execute SQL in Supabase SQL Editor to create the table
  - _Requirements: 2.1, 10.1, 10.2, 10.3_

- [x] 3. Initialize Supabase clients ✅ COMPLETED
  - Create `src/lib/supabaseClient.js` in frontend with Supabase client initialization using anon key
  - Configure auth options (autoRefreshToken, persistSession, detectSessionInUrl)
  - Create `backend/config/supabase.js` with Supabase client initialization using service role key
  - Create `backend/config/database.js` to validate Supabase connection on server startup
  - Update `backend/server.js` to validate database connection on startup
  - _Requirements: 1.2, 1.3, 1.5_

- [x] 4. Implement authentication system ✅ COMPLETED
- [x] 4.1 Create backend authentication endpoints (SKIPPED - Using Supabase Auth directly)
  - Supabase Auth handles all authentication server-side
  - No custom backend endpoints needed for auth
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 4.2 Update frontend AuthContext ✅ COMPLETED
  - Update `frontend/context/AuthContext.jsx` to use Supabase Auth instead of localStorage
  - Implement signup method using Supabase Auth
  - Implement login method with email/password using Supabase Auth
  - Implement OAuth login methods for Google and Microsoft
  - Implement logout method to clear Supabase session
  - Implement session persistence and auto-refresh
  - Update profile method to sync with Supabase profiles table
  - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8_

- [x] 5. Integrate OnboardingModal with Supabase profiles





  - Update `frontend/components/OnboardingModal.jsx` to save data to Supabase
  - Modify handleComplete function to call updateProfile with all onboarding data
  - Map role to display title (founder → "The Founder", etc.)
  - Ensure skills array is properly formatted for database
  - Add error handling and loading state during profile creation
  - Show success message or redirect after successful profile creation
  - Test complete onboarding flow: signup → onboarding → profile saved → dashboard
  - _Requirements: 3.2_

- [x] 6. Verify and enhance Profile Page save functionality




  - Review existing handleSave function in `frontend/pages/Profile.jsx`
  - Ensure all form fields are properly mapped to database schema
  - Verify camelCase to snake_case conversion in updateProfile
  - Test saving bio, location, title, social links
  - Test adding/editing/removing experience entries
  - Test adding/editing/removing education entries
  - Test adding/editing/removing skills with levels
  - Test adding/editing/removing URL Link
  - Verify real-time updates trigger after save
  - _Requirements: 7.1_

- [ ] 7. Test real-time profile updates
  - Verify `useRealtimeProfile` hook is working correctly
  - Test ProfileModal real-time updates: open modal, edit profile in another tab, verify modal updates
  - Test Profile Page real-time updates: open profile, edit in another tab, verify page updates
  - Test with multiple browser tabs/windows simultaneously
  - Verify subscription cleanup on component unmount
  - Check for memory leaks or duplicate subscriptions
  - _Requirements: 7.1, 7.2_

- [ ] 8. Add profile validation and error handling
  - Add validation for required fields (name, email)
  - Add validation for URL formats (GitHub, LinkedIn, Portfolio)
  - Add validation for skills array (non-empty strings)
  - Show inline error messages for invalid fields
  - Prevent save if validation fails
  - Handle network errors gracefully
  - Add retry mechanism for failed saves
  - _Requirements: 3.2, 7.1_

- [ ] 9. Implement user management API (FUTURE - Not in current scope)
- [ ] 9.1 Create user service and controller
  - Create `backend/api/services/userService.js` with methods for creating, retrieving, updating user profiles
  - Create `backend/api/controllers/userController.js` with handlers for GET /users, GET /users/:id, PUT /users/:id, GET /users/:id/projects
  - Implement pagination for user listing
  - Implement user search functionality
  - _Requirements: 4.1, 4.2, 4.3_

- [ ] 9.2 Create user routes and integrate with frontend
  - Create `backend/api/routes/users.js` with all user endpoints
  - Create `frontend/services/api.js` with ApiService class and user methods (getUser, updateUser, getUsers)
  - Update frontend components to use API service instead of mock data
  - Add authentication token to all API requests
  - _Requirements: 4.1, 4.2, 4.3, 5.7, 5.8_

---

## FUTURE TASKS (Not in current scope)

The following tasks are part of the full Supabase integration but are not required for the current focus on user authentication and profile management:

- [ ] 10. Implement project management API
- [ ] 10.1 Create project service and controller
  - Create `backend/api/services/projectService.js` with methods for CRUD operations on projects, positions, and members
  - Create `backend/api/controllers/projectController.js` with handlers for all project endpoints
  - Implement project filtering by category, stage, and owner
  - Implement pagination for project listing
  - Implement project view counter increment
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 6.2 Create project routes and integrate with frontend
  - Create `backend/api/routes/projects.js` with routes: GET /projects, GET /projects/:id, POST /projects, PUT /projects/:id, DELETE /projects/:id, POST /projects/:id/members, DELETE /projects/:id/members/:userId
  - Add project methods to `frontend/services/api.js` (getProjects, getProject, createProject, updateProject, deleteProject, addMember, removeMember)
  - Update `frontend/context/ProjectContext.jsx` to use API service instead of mock data
  - Implement optimistic updates for better UX
  - Add error handling and loading states
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8, 5.1, 5.2, 5.8, 5.9_

- [ ] 7. Implement application management system
- [ ] 7.1 Create application service and controller
  - Create `backend/api/services/applicationService.js` with methods for creating, retrieving, and updating applications
  - Create `backend/api/controllers/applicationController.js` with handlers for application endpoints
  - Implement application filtering by user, project, and status
  - Implement application status updates (accept/reject)
  - Create notification when application is submitted
  - Create notification when application is accepted/rejected
  - _Requirements: 4.9, 4.10, 4.11_

- [ ] 7.2 Create application routes and integrate with frontend
  - Create `backend/api/routes/applications.js` with routes: POST /applications, GET /applications, PUT /applications/:id, GET /applications/:id
  - Add application methods to `frontend/services/api.js` (submitApplication, getApplications, updateApplicationStatus)
  - Update `frontend/context/ProjectContext.jsx` to use API for applications
  - Update application submission flow in `ProjectModal.jsx`
  - Update application management in `Dashboard.jsx`
  - _Requirements: 4.9, 4.10, 4.11, 5.3, 5.8, 5.9_

- [ ] 8. Implement collaboration features
- [ ] 8.1 Create message API
  - Create `backend/api/services/messageService.js` with methods for creating, retrieving, and liking messages
  - Create `backend/api/controllers/messageController.js` with handlers for message endpoints
  - Create `backend/api/routes/messages.js` with routes: POST /messages, GET /messages, PUT /messages/:id/like, DELETE /messages/:id
  - Add message methods to `frontend/services/api.js`
  - _Requirements: 4.12, 4.13_

- [ ] 8.2 Implement real-time chat with Supabase subscriptions
  - Update `frontend/components/ChatTab.jsx` to fetch messages from API on mount
  - Implement Supabase real-time subscription for new messages in ChatTab
  - Update message creation to use API instead of localStorage
  - Handle subscription cleanup on component unmount
  - Add loading and error states
  - _Requirements: 4.12, 4.13, 5.4, 7.1, 7.6_

- [ ] 8.3 Create task API
  - Create `backend/api/services/taskService.js` with methods for CRUD operations on tasks
  - Create `backend/api/controllers/taskController.js` with handlers for task endpoints
  - Create `backend/api/routes/tasks.js` with routes: POST /tasks, GET /tasks, PUT /tasks/:id, DELETE /tasks/:id
  - Add task methods to `frontend/services/api.js`
  - _Requirements: 4.14, 4.15, 4.16_

- [ ] 8.4 Implement real-time tasks with Supabase subscriptions
  - Update `frontend/components/TasksTab.jsx` to fetch tasks from API on mount
  - Implement Supabase real-time subscription for task changes (INSERT, UPDATE, DELETE)
  - Update task creation and updates to use API
  - Handle subscription cleanup on component unmount
  - Add loading and error states
  - _Requirements: 4.14, 4.15, 4.16, 5.5, 7.2, 7.6_

- [ ] 9. Implement file storage system
- [ ] 9.1 Set up Supabase Storage
  - Create storage bucket named "project-files" in Supabase dashboard
  - Configure bucket settings (public: false, fileSizeLimit: 52428800, allowedMimeTypes)
  - Set up storage security policies for file access control
  - _Requirements: 6.1, 6.6_

- [ ] 9.2 Create file upload/download API
  - Create `backend/api/services/storageService.js` with methods for file upload, download, and deletion
  - Create `backend/api/controllers/fileController.js` with handlers for file endpoints
  - Create `backend/api/routes/files.js` with routes: POST /files, GET /files, DELETE /files/:id, GET /files/:id/download
  - Implement file validation (type, size) before upload
  - Generate public URLs for uploaded files
  - Store file metadata in files table
  - _Requirements: 6.2, 6.3, 6.4, 6.5, 6.6, 6.7, 4.17, 4.18, 4.19_

- [ ] 9.3 Integrate file storage with frontend
  - Add file methods to `frontend/services/api.js` (uploadFile, getFiles, deleteFile, downloadFile)
  - Update `frontend/components/FilesTab.jsx` to use API for file operations
  - Implement file upload with progress indicator
  - Implement real-time file list updates
  - Add file type icons and size display
  - Handle file download
  - _Requirements: 5.6, 7.3, 7.6_

- [ ] 10. Implement notification system
- [ ] 10.1 Create notification API
  - Create `backend/api/services/notificationService.js` with methods for creating, retrieving, and updating notifications
  - Create `backend/api/controllers/notificationController.js` with handlers for notification endpoints
  - Create `backend/api/routes/notifications.js` with routes: POST /notifications, GET /notifications, PUT /notifications/:id/read, PUT /notifications/read-all, DELETE /notifications/:id
  - _Requirements: 4.20, 4.21, 4.22_

- [ ] 10.2 Integrate notifications with frontend
  - Add notification methods to `frontend/services/api.js`
  - Update `frontend/context/NotificationContext.jsx` to fetch notifications from API
  - Implement real-time notification updates using Supabase subscriptions
  - Update notification badge count based on unread notifications
  - Update `NotificationModal.jsx` to use API for marking as read and deleting
  - _Requirements: 4.20, 4.21, 4.22, 5.8, 7.4, 7.6_

- [ ] 11. Implement saved projects feature
  - Add saved projects methods to project service and controller
  - Add routes: POST /projects/:id/save, DELETE /projects/:id/save, GET /saved-projects
  - Update `frontend/context/ProjectContext.jsx` to use API for bookmarking
  - Update bookmark toggle functionality in project cards
  - Update Dashboard to fetch saved projects from API
  - _Requirements: 4.5_

- [ ] 12. Implement team member management
  - Update project controller to handle adding team members when applications are accepted
  - Update project controller to handle removing team members
  - Implement authorization checks (only project owners can remove members)
  - Update `frontend/components/TeamTab.jsx` to use API for member operations
  - Implement real-time team member updates
  - Add confirmation dialog for member removal
  - _Requirements: 7.5, 7.6_

- [ ] 13. Update API routes index
  - Update `backend/api/routes/index.js` to import and use all route modules
  - Mount routes: /auth, /users, /projects, /applications, /messages, /tasks, /files, /notifications
  - Add error handling middleware
  - Add request logging middleware
  - _Requirements: 4.1-4.22_

- [ ] 14. Implement error handling
  - Create `backend/middleware/errorHandler.js` with comprehensive error handling
  - Define error response format with success, error code, message, and details
  - Handle common database errors (not found, duplicate entry, foreign key violation)
  - Handle authentication errors (invalid token, expired token, missing token)
  - Handle validation errors with detailed field information
  - Add error handling to all API service methods in frontend
  - Create error display components for frontend
  - Add toast notifications for errors
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 5.8_

- [ ] 15. Migrate existing data to Supabase
  - Create `backend/scripts/migrate-data.js` script
  - Export current mock data from context providers
  - Transform data to match new database schema
  - Generate UUIDs for all records
  - Maintain relationships between entities
  - Insert users into Supabase
  - Insert projects with positions and members
  - Insert applications with proper status
  - Verify data integrity after migration
  - Log migration results
  - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 16. Add loading and empty states
  - Add loading spinners to all data fetching operations
  - Create skeleton loaders for project cards, user profiles, and lists
  - Add empty state messages when no data is available
  - Add error state displays with retry buttons
  - Update all components to show appropriate states
  - _Requirements: 5.9_

- [ ] 17. Implement optimistic updates
  - Add optimistic updates for project creation in ProjectContext
  - Add optimistic updates for message sending in ChatTab
  - Add optimistic updates for task creation in TasksTab
  - Add optimistic updates for application submission
  - Implement rollback on API errors
  - _Requirements: 5.2, 5.4, 5.5_

- [ ] 18. Add request validation
  - Install express-validator in backend
  - Create validation middleware for all POST and PUT endpoints
  - Validate user input (email format, required fields, string lengths)
  - Validate file uploads (type, size)
  - Return detailed validation errors to frontend
  - Display validation errors in forms
  - _Requirements: 9.2, 9.4_

- [ ] 19. Configure CORS and security
  - Update CORS configuration in `backend/server.js` to allow frontend domain
  - Add helmet middleware for security headers
  - Implement rate limiting on authentication endpoints
  - Add request logging for debugging
  - Configure secure session handling
  - _Requirements: 9.1, 9.2, 9.3_

- [ ] 20. Update environment configuration
  - Create `.env.example` files for both frontend and backend
  - Document all required environment variables
  - Add environment variable validation on server startup
  - Update README with setup instructions
  - _Requirements: 1.1_

- [ ] 21. Test authentication flows
  - Test user signup with email/password
  - Test user login with email/password
  - Test Google OAuth login
  - Test Microsoft OAuth login
  - Test session persistence across page refreshes
  - Test logout functionality
  - Test protected route access
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [ ] 22. Test project management flows
  - Test project creation with positions
  - Test project listing with filters
  - Test project detail retrieval
  - Test project updates
  - Test project deletion
  - Test adding team members
  - Test removing team members
  - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_

- [ ] 23. Test application flows
  - Test application submission
  - Test application listing for users and projects
  - Test application acceptance
  - Test application rejection
  - Test notification creation on application events
  - Test team member addition on acceptance
  - _Requirements: 4.9, 4.10, 4.11_

- [ ] 24. Test collaboration features
  - Test message creation and retrieval
  - Test real-time message updates
  - Test message likes
  - Test task creation and updates
  - Test real-time task updates
  - Test file upload and download
  - Test real-time file list updates
  - _Requirements: 4.12, 4.13, 4.14, 4.15, 4.16, 4.17, 4.18, 4.19, 7.1, 7.2, 7.3_

- [ ] 25. Test notification system
  - Test notification creation
  - Test notification retrieval
  - Test marking notifications as read
  - Test marking all notifications as read
  - Test notification deletion
  - Test real-time notification updates
  - Test notification badge count
  - _Requirements: 4.20, 4.21, 4.22, 7.4_

- [ ] 26. Performance optimization
  - Add database indexes on frequently queried columns (user_id, project_id, created_at)
  - Implement pagination for all list endpoints
  - Add response caching for frequently accessed data
  - Optimize database queries to reduce N+1 problems
  - Implement lazy loading for large lists in frontend
  - Add debouncing to search inputs
  - _Requirements: 9.5_

- [ ] 27. Final integration testing
  - Test complete user journey from signup to project collaboration
  - Test cross-browser compatibility
  - Test responsive design on mobile devices
  - Test error scenarios and recovery
  - Test concurrent user interactions
  - Verify all real-time features work correctly
  - _Requirements: All_
