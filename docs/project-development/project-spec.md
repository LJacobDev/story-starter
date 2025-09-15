# Story Starter Specification

## Overview
Story Starter is a web application designed to help writers generate creative story ideas. It serves as both a portfolio piece and a functional tool for users. The app will be built using Vue 3 with the Composition API, TypeScript, TailwindCSS, and ShadCN UI components. Supabase will handle authentication, backend services, and database management. The app will be hosted on GitHub Pages.

---

## Features

### Core Features
1. **User Authentication**
   - Sign-up and sign-in using email and password.
   - Email verification with a redirect URL (e.g., `ljacobdev.github.io/story-starter/`).
   - Password reset functionality.

2. **Story Management**
   - Display a grid of story cards showing public stories and private stories created by the authenticated user.
   - Search stories by title, genre, and description.
   - Filter stories by type, creation date, and privacy status.
   - View, edit, and delete stories created by the user.
   - Share stories via a link.

3. **Story Generation**
   - Generate stories based on user-provided tags for characters, themes, and plot points.
   - Support multiple story types: short stories, movie summaries, TV commercials, and custom types.
   - Allow users to upload or link images for stories.
   - Use a fallback SVG for stories without images.

4. **Feedback Collection**
   - A feedback modal accessible from the navigation bar.
   - Feedback is stored as an array of strings in the user’s profile.

5. **Gamification**
   - Toast notifications congratulating users on creating new stories.
   - Display the total number of stories created in the user’s profile.

6. **Accessibility and Responsiveness**
   - Full keyboard navigation.
   - ARIA roles for accessibility.
   - Fully responsive design for seamless mobile and desktop use.

7. **Dark Mode**
   - A toggle in the UI to switch between light and dark themes.

8. **Analytics**
   - Track user interactions (e.g., story creation, edits, searches).
   - Store analytics data in Supabase.
   - Provide an opt-out option for users.

9. **Easter Eggs and Fun Surprises**
   - Placeholder for future fun features (e.g., random quotes, themed UI modes).

---

## Architecture

### Frontend
- **Framework**: Vue 3 with the Composition API.
- **Styling**: TailwindCSS and ShadCN UI components.
- **TypeScript**: For type safety and maintainability.
- **Hosting**: GitHub Pages.

### Backend
- **Database**: Supabase for user authentication, story storage, and analytics.
- **Edge Functions**: Supabase Edge Functions for handling API calls and user input sanitization.
- **LLM Integration**: Gemini 2.5 Flash API for story generation.

### Data Flow
1. User inputs data via the frontend.
2. Data is validated and sanitized in Supabase Edge Functions.
3. Valid data is stored in the Supabase database.
4. The frontend fetches and displays data as needed.

---

## Data Handling

### Database Schema
#### Users Table
| Column Name | Data Type | Description              |
|-------------|-----------|--------------------------|
| id          | UUID      | Unique user identifier. |
| email       | TEXT      | User email address.     |
| feedback    | JSONB     | Array of feedback strings. |

#### Stories Table
| Column Name | Data Type | Description              |
|-------------|-----------|--------------------------|
| id          | UUID      | Unique story identifier. |
| user_id     | UUID      | ID of the story creator. |
| title       | TEXT      | Story title.            |
| content     | TEXT      | Story content.          |
| type        | TEXT      | Story type.             |
| is_private  | BOOLEAN   | Privacy status.         |
| image_url   | TEXT      | URL of the story image. |
| created_at  | TIMESTAMP | Creation timestamp.     |

#### Analytics Table
| Column Name | Data Type | Description              |
|-------------|-----------|--------------------------|
| id          | UUID      | Unique event identifier. |
| user_id     | UUID      | ID of the user.         |
| event_type  | TEXT      | Type of event.          |
| event_data  | JSONB     | Additional event data.  |
| timestamp   | TIMESTAMP | Event timestamp.        |

---

## Error Handling

### Frontend
- Display user-friendly error messages for all errors.
- Provide a retry button for API errors (e.g., rate limiting).
- Ensure no silent failures.

### Backend
- Sanitize all user input in Supabase Edge Functions.
- Use parameterized queries to prevent SQL injection.
- Log and monitor errors for debugging.

---

## Testing Plan

### Test-Driven Development (TDD)
1. **Unit Tests**
   - Test individual components and functions.
   - Example: Validate story generation form inputs.

2. **Integration Tests**
   - Test interactions between components and the backend.
   - Example: Ensure stories are correctly saved and retrieved.

3. **End-to-End Tests**
   - Simulate user workflows.
   - Example: Sign up, create a story, and view it in the grid.

4. **Error Handling Tests**
   - Simulate API errors and ensure proper handling.
   - Example: Test rate-limiting error messages.

5. **Accessibility Tests**
   - Use tools like Axe to ensure compliance with accessibility standards.

### Testing Frameworks
- **Frontend**: Vitest or Jest.
- **Backend**: Supabase testing utilities.
- **End-to-End**: Playwright or Cypress.

---

## Development Workflow
1. **Iterative Development**
   - Build features incrementally, starting with core functionality.
   - Test each feature before moving to the next.

2. **Version Control**
   - Use Git for version control.
   - Commit changes frequently with descriptive messages.

3. **Code Reviews**
   - Conduct peer reviews to ensure code quality.

4. **Deployment**
   - Use GitHub Actions to automate deployment to GitHub Pages.

---

## Future Enhancements
- **Custom Story Types**: Allow users to create and save custom story types.
- **Text-to-Image Generation**: Integrate an API for generating story cover images.
- **Collaborative Editing**: Enable multiple users to edit the same story.
- **Advanced Sharing Options**: Add expiration dates and password protection for shared stories.
- **Easter Eggs**: Implement fun surprises to delight users.

---

## Conclusion
This specification provides a comprehensive plan for developing the Story Starter application. By following this spec, developers can build a polished, functional, and engaging tool for writers while showcasing their technical skills.
