# Claude Sonnet 4 Prompt Plan for Story Starter

This document provides a comprehensive, test-driven development plan for building the Story Starter application using Claude Sonnet 4 as the code generation agent. The plan emphasizes incremental progress, strong testing practices, and careful integration of features. Each prompt is designed to build upon previous work while maintaining code quality and functionality.

---

## Phase 1: Project Foundation and Infrastructure

### Chunk 1.1: Project Initialization and Core Setup

#### Prompt 1.1.1
```text
Create a new Vue 3 project using Vite with TypeScript. Install and configure TailwindCSS for styling. Set up a clean, modular project structure with folders for components, composables, types, and utilities. 

Requirements:
- Use Vue 3 Composition API exclusively
- Configure TypeScript with strict mode
- Set up TailwindCSS with proper configuration
- Create basic folder structure: src/components, src/composables, src/types, src/utils
- Write a simple test to verify the project builds and runs
- Include package.json scripts for dev, build, test, and preview

Testing Requirements:
- Set up Vitest for unit testing
- Create a basic test that verifies the app renders without errors
- Ensure all TypeScript types are properly configured

Success Criteria:
- Project starts successfully with `npm run dev`
- Tests pass with `npm run test`
- TypeScript compilation succeeds with no errors
```

#### Prompt 1.1.2
```text
Set up version control and GitHub integration. Configure deployment to GitHub Pages using GitHub Actions.

Requirements:
- Initialize Git repository with proper .gitignore
- Create GitHub repository and connect remote
- Set up GitHub Actions workflow for building and deploying to GitHub Pages
- Configure Vite for GitHub Pages deployment (handle base path)
- Test deployment pipeline

Testing Requirements:
- Verify .gitignore excludes node_modules, .env, dist
- Test GitHub Actions workflow runs successfully
- Confirm deployed site is accessible on GitHub Pages

Success Criteria:
- Repository is properly configured and pushed to GitHub
- GitHub Actions workflow deploys successfully
- Site is accessible at the GitHub Pages URL
```

### Chunk 1.2: Supabase Configuration and Database Setup

#### Prompt 1.2.1
```text
Set up Supabase project and configure the database schema. Create environment variable management.

Requirements:
- Create Supabase project
- Design and implement database schema:
  - users table: id (UUID/PK), email (TEXT/UNIQUE), created_at (TIMESTAMP), feedback (JSONB)
  - stories table: id (UUID/PK), user_id (UUID/FK), title (TEXT), content (TEXT), type (TEXT), is_private (BOOLEAN), image_url (TEXT), created_at (TIMESTAMP), updated_at (TIMESTAMP)
  - analytics table: id (UUID/PK), user_id (UUID/FK), event_type (TEXT), event_data (JSONB), timestamp (TIMESTAMP)
- Set up Row Level Security (RLS) policies
- Create .env file for Supabase credentials
- Add .env to .gitignore

Testing Requirements:
- Write SQL tests to verify schema creation
- Test foreign key relationships
- Verify RLS policies work correctly

Success Criteria:
- Database schema created successfully
- RLS policies enforce proper access control
- Environment variables load correctly in development
```

#### Prompt 1.2.2
```text
Create Supabase client utility and type definitions. Implement basic database operations.

Requirements:
- Install @supabase/supabase-js
- Create TypeScript interfaces for all database tables
- Build a Supabase client utility with proper typing
- Implement basic CRUD operations for each table
- Add error handling and logging
- Create composables for database operations

Testing Requirements:
- Write unit tests for each database operation
- Test error handling scenarios
- Mock Supabase client for testing

Success Criteria:
- All database operations work correctly
- TypeScript types are properly defined
- Error handling provides meaningful feedback
- Tests cover happy path and error scenarios
```

---

## Phase 2: Authentication System

### Chunk 2.1: User Registration and Login

#### Prompt 2.1.1
```text
Install and configure ShadCN UI. Create authentication forms with proper validation.

Requirements:
- Install and configure ShadCN UI components
- Create sign-up form with email/password fields
- Create sign-in form with email/password fields
- Implement client-side validation (email format, password requirements)
- Add proper form accessibility (ARIA labels, error announcements)
- Style forms with TailwindCSS and ShadCN components

Testing Requirements:
- Write unit tests for form validation logic
- Test form submission handling
- Test accessibility features
- Test responsive design

Success Criteria:
- Forms render correctly and are fully accessible
- Validation works on client-side
- Forms are responsive across device sizes
- All tests pass
```

#### Prompt 2.1.2
```text
Implement authentication logic using Supabase Auth. Handle authentication state management.

Requirements:
- Set up Supabase Auth configuration
- Create authentication composables (useAuth)
- Implement sign-up functionality with email verification
- Implement sign-in functionality
- Add authentication state management
- Handle authentication errors gracefully
- Create route guards for protected pages

Testing Requirements:
- Write integration tests for authentication flows
- Test error handling for various scenarios
- Mock authentication for testing components
- Test route protection

Success Criteria:
- Users can successfully register and sign in
- Authentication state is properly managed
- Errors are handled and displayed appropriately
- Protected routes work correctly
```

### Chunk 2.2: Email Verification and User Experience

[don't use this prompt directly, use the text below where things are broken into smaller steps]
#### Prompt 2.2.1
```text
Implement email verification flow and user feedback.

Requirements:
- Configure email verification in Supabase
- Create email verification page/component
- Add "resend verification" functionality
- Implement user feedback for verification status
- Handle verification success/failure states
- Add loading states and user-friendly messages

Testing Requirements:
- Test email verification flow end-to-end
- Test resend functionality with rate limiting
- Test error states and user feedback

Success Criteria:
- Email verification works completely
- Users receive clear feedback at each step
- Rate limiting prevents spam
- All edge cases are handled gracefully
```

Smaller steps for next focus (Phase 2 → Task 2.2.1)
- Implement `EmailVerify` view and route: `/verify-email` to consume callback token.
- Add `confirmEmail(token)` and `resendVerification()` to `useAuth` (TDD-first).
- Unit tests: mock Supabase confirm/resend behaviors (success, invalid, expired).
- UX: loading / success / failure messages; route guard for unverified users.

TDD subtasks for Task 2.2.1
1. Add unit tests for `confirmEmail` and `resendVerification` (mocked).
2. Implement `confirmEmail` in composable and wire `/verify-email` route.
3. Add resend button in SignUp UI and tests.
4. Add route guard for unverified accounts and UI messaging.

Verification plan (summary)
- Unit tests first (Vitest with Supabase mocks), then CI run + Pages verification.
- Success: tests pass, verify route confirms tokens, protected routes respect verification state.



Next major phases (after 2.2.1)
- Phase 3: story CRUD composables, grid and list UI (TDD).
- Phase 4: generator UI incremental steps + Edge function integration (Gemini proxy).
- Phase 5–6: analytics, accessibility audit and polish.

---

## Phase 3: Core Story Management

### Chunk 3.1: Story Display and Grid Layout

#### Prompt 3.1.1
```text
Create story card components and grid layout. Implement responsive design.

Requirements:
- Design story card component using ShadCN UI
- Create responsive grid layout
- Add placeholder content and loading states
- Implement proper image handling with fallbacks
- Add accessibility features (alt text, proper headings)
- Create story preview modal

Testing Requirements:
- Test component rendering with various data
- Test responsive behavior
- Test accessibility features
- Test loading and error states

Success Criteria:
- Story cards display correctly in responsive grid
- Images load properly with fallbacks
- Components are fully accessible
- Loading states provide good UX
```

#### Prompt 3.1.2
```text
Implement story fetching and pagination. Add search and filter functionality.

Requirements:
- Create API functions for fetching stories
- Implement pagination with proper loading states
- Add search functionality (title, content, type)
- Create filter controls (type, date, privacy)
- Implement infinite scroll or pagination UI
- Add proper error handling and empty states

Testing Requirements:
- Test story fetching with various parameters
- Test search and filter functionality
- Test pagination behavior
- Test error handling and empty states

Success Criteria:
- Stories load efficiently with pagination
- Search and filters work correctly
- Performance is optimal with large datasets
- Error states are handled gracefully
```

### Chunk 3.2: Story Details and Management

#### Prompt 3.2.1
```text
Create story detail view and editing functionality.

Requirements:
- Build detailed story view component
- Add edit mode for story owners
- Implement story deletion with confirmation
- Create story sharing functionality
- Add proper permission checks
- Handle image uploads and URL inputs

Testing Requirements:
- Test story detail rendering
- Test edit functionality and permissions
- Test deletion with confirmation flow
- Test sharing functionality

Success Criteria:
- Story details display correctly
- Only story owners can edit/delete
- Sharing generates proper URLs
- All user interactions are smooth
```

---

## Phase 4: Story Generation System

### Chunk 4.1: Story Generation Form and API Integration

#### Prompt 4.1.1
```text
Create dynamic story generation form with advanced input handling.

Requirements:
- Build form with dynamic character fields (name, role, description)
- Add dynamic theme and plot point inputs
- Implement story type selection (including custom types)
- Add advanced AI customization options (tone, creativity level)
- Include image upload/URL input functionality
- Implement form validation and character limits
- implement any reasonable client side user input sanitization, however since sanitization is better handled inside the edge function, tell the developer an explicit and thorough plan for what to design the edge function like in order to sanitize any user input at any time it is advisable to do so. See docs/improvements/user-input-sanitization.md for ideas.

Testing Requirements:
- Test dynamic field addition/removal
- Test form validation logic
- Test custom story type creation
- Test file upload functionality

Success Criteria:
- Form handles dynamic inputs smoothly
- Validation provides clear feedback
- Custom story types are saved properly
- File uploads work reliably
```

#### Prompt 4.1.2
```text
Create Supabase Edge Function for story generation. Integrate with Gemini API.

Requirements:
- Build Edge Function for Gemini API integration
- Implement proper prompt engineering for different story types
- Add input sanitization and validation
- Handle API errors and rate limiting (429 errors)
- Parse and clean Gemini responses
- Save generated stories to database

Testing Requirements:
- Test Edge Function with various inputs
- Test error handling for API failures
- Test rate limiting scenarios
- Test response parsing and cleaning

Success Criteria:
- Story generation works reliably
- API errors are handled gracefully
- Generated content is properly formatted
- Stories are saved correctly to database
```

#### Prompt 4.1.3
```text
Implement story preview and save functionality. Add retry mechanism.

Requirements:
- Create story preview component
- Add save/discard options
- Implement retry functionality for generation
- Add loading states and progress indicators
- Create gamification features (toast notifications, story count)
- Handle generation errors with user-friendly messages

Testing Requirements:
- Test preview functionality
- Test save/discard flows
- Test retry mechanism
- Test gamification features

Success Criteria:
- Preview displays generated content properly
- Save/discard options work correctly
- Retry generates new content reliably
- Gamification enhances user experience
```

---

## Phase 5: User Feedback and Analytics

### Chunk 5.1: Feedback System and Analytics

#### Prompt 5.1.1
```text
Implement user feedback modal and analytics tracking.

Requirements:
- Create feedback modal accessible from navigation
- Add feedback form with validation
- Implement feedback storage in user profile
- Set up analytics event tracking
- Add privacy controls for analytics
- Create user profile page with story count and feedback history

Testing Requirements:
- Test feedback submission and storage
- Test analytics event tracking
- Test privacy controls
- Test user profile functionality

Success Criteria:
- Feedback system works end-to-end
- Analytics track user interactions properly
- Privacy controls function correctly
- User profile displays accurate information
```

---

## Phase 6: Polish and Enhancement Features

### Chunk 6.1: Accessibility and Responsive Design

#### Prompt 6.1.1
```text
Implement comprehensive accessibility features and responsive design improvements.

Requirements:
- Add full keyboard navigation support
- Implement proper ARIA roles and labels
- Create skip links for navigation
- Test with screen readers
- Optimize for mobile devices
- Add focus management for modals and forms

Testing Requirements:
- Run accessibility audits (axe-core)
- Test keyboard navigation flows
- Test screen reader compatibility
- Test mobile responsiveness

Success Criteria:
- App is fully accessible via keyboard
- Screen readers work properly
- Mobile experience is excellent
- Accessibility audits pass
```

### Chunk 6.2: Dark Mode and UI Polish

#### Prompt 6.2.1
```text
Implement dark mode toggle and final UI polish.

Requirements:
- Add dark mode toggle in navigation
- Implement TailwindCSS dark mode classes
- Persist theme preference in localStorage
- Add smooth transitions between themes
- Polish overall visual design
- Implement one or two Easter eggs

Testing Requirements:
- Test dark mode toggle functionality
- Test theme persistence
- Test visual consistency across modes
- Test Easter egg functionality

Success Criteria:
- Dark mode works flawlessly
- Theme preference persists across sessions
- Visual design is polished and professional
- Easter eggs delight users without interfering with functionality
```

---

## Testing and Quality Assurance Strategy

### Unit Testing
- Test individual components in isolation
- Mock external dependencies (Supabase, APIs)
- Test edge cases and error scenarios
- Maintain >80% code coverage

### Integration Testing
- Test component interactions
- Test authentication flows
- Test story generation end-to-end
- Test database operations

### End-to-End Testing
- Test complete user workflows
- Test across different browsers
- Test responsive design
- Test accessibility features

### Performance Testing
- Test with large datasets
- Monitor bundle size
- Test loading performance
- Optimize critical rendering path

---

## Success Metrics

### Technical Metrics
- All tests pass consistently
- TypeScript compilation with no errors
- Accessibility audit scores >95%
- Lighthouse performance score >90%

### User Experience Metrics
- Smooth interactions with no blocking operations
- Clear error messages and loading states
- Responsive design across all device sizes
- Intuitive navigation and workflows

### Code Quality Metrics
- Clean, maintainable TypeScript code
- Proper separation of concerns
- Reusable components and composables
- Comprehensive error handling

---

## Conclusion

This prompt plan ensures a systematic, test-driven approach to building the Story Starter application. Each phase builds upon the previous work while maintaining high code quality and user experience standards. The incremental approach allows for early testing and validation of features, reducing the risk of integration issues and ensuring a polished final product.
