# Verbose Prompt Plan for Story Starter

This document provides a detailed, step-by-step blueprint for building the Story Starter application. Each prompt is written to be thorough and specific, ensuring clarity and maximizing the chances of successful implementation by a code generation agent. The plan is broken into phases, chunks, and prompts, with each step building on the previous ones.

---

## Phase 1: Project Setup and Core Infrastructure

### Chunk 1.1: Initialize the Project

#### Prompt 1.1.1
```text
Create a new Vue 3 project using Vite. Ensure the project is configured to use TypeScript for type safety and maintainability. Install TailwindCSS for styling and ShadCN UI components for pre-built, high-quality UI elements. Set up the project structure to be modular and clean, with separate folders for components, pages, and utilities. Verify that the project builds and runs successfully by starting the development server.
```

#### Prompt 1.1.2
```text
Initialize a Git repository for version control. Create a `.gitignore` file to exclude unnecessary files and folders, such as `node_modules`, `.env`, and build artifacts. Make an initial commit with the project setup. Ensure that the repository is ready for collaboration by setting up a remote repository on GitHub.
```

#### Prompt 1.1.3
```text
Set up GitHub Pages for deployment. Create a GitHub Actions workflow to automate the build and deployment process. Ensure the workflow uses Vite to build the project and deploys the output to the `gh-pages` branch. Test the deployment by pushing a commit to the main branch and verifying that the app is accessible on GitHub Pages.
```

### Chunk 1.2: Configure Supabase

#### Prompt 1.2.1
```text
Create a new Supabase project. Set up the database schema with tables for `users`, `stories`, and `analytics`. Use the following schema:
- `users`: Columns for `id` (UUID), `email` (TEXT), and `feedback` (JSONB).
- `stories`: Columns for `id` (UUID), `user_id` (UUID), `title` (TEXT), `content` (TEXT), `type` (TEXT), `is_private` (BOOLEAN), `image_url` (TEXT), and `created_at` (TIMESTAMP).
- `analytics`: Columns for `id` (UUID), `user_id` (UUID), `event_type` (TEXT), `event_data` (JSONB), and `timestamp` (TIMESTAMP).
Ensure the tables are properly linked with foreign keys where applicable.
```

#### Prompt 1.2.2
```text
Create a `.env` file in the project root to store Supabase secrets, such as the Supabase URL and anon key. Add the `.env` file to `.gitignore` to prevent it from being committed to the repository. Verify that the secrets are accessible in the development environment.
```

#### Prompt 1.2.3
```text
Write a Supabase client utility in TypeScript to handle database interactions. The utility should include functions for common operations, such as fetching data, inserting records, and updating entries. Ensure the utility is modular and reusable, and test it by fetching data from the `users` table.
```

---

## Phase 2: User Authentication

### Chunk 2.1: Implement Sign-Up and Sign-In

#### Prompt 2.1.1
```text
Create a sign-up form component using ShadCN UI. The form should include fields for email and password, with client-side validation to ensure the inputs are not empty and meet basic requirements (e.g., valid email format, password length). Add a submit button that triggers the sign-up process.
```

#### Prompt 2.1.2
```text
Write a Supabase Edge Function to handle user registration. The function should validate and sanitize the input on the backend, ensuring that the email is unique and the password meets security standards. Return appropriate error messages for invalid input or registration failures.
```

#### Prompt 2.1.3
```text
Create a sign-in form component using ShadCN UI. The form should include fields for email and password, with client-side validation. Authenticate the user using Supabase and handle errors, such as incorrect credentials or unverified email addresses, by displaying user-friendly messages.
```

### Chunk 2.2: Email Verification

#### Prompt 2.2.1
```text
Configure Supabase to send email verification links upon user registration. Create a redirect page for email confirmation (e.g., `ljacobdev.github.io/story-starter/verify`). The page should display a success message if the email is verified successfully or an error message otherwise.
```

#### Prompt 2.2.2
```text
Write a component to display a message prompting users to verify their email after registration. Include a button to resend the verification email, and ensure the button is disabled for a short period after each click to prevent abuse.
```

---

## Phase 3: Story Management

### Chunk 3.1: Story Grid

#### Prompt 3.1.1
```text
Create a grid layout to display story cards. Use ShadCN UI components for the cards, and include placeholders for the story title, description, and image. Ensure the grid is responsive and adapts to different screen sizes.
```

#### Prompt 3.1.2
```text
Fetch stories from the Supabase database. Display public stories and private stories created by the authenticated user. Use pagination to load stories in batches, and include a loading indicator while fetching data.
```

#### Prompt 3.1.3
```text
Add search and filter functionality to the story grid. Allow users to search by title, genre, and description, and filter by type, creation date, and privacy status. Ensure the search and filter options are intuitive and responsive.
```

### Chunk 3.2: Story Details

#### Prompt 3.2.1
```text
Create a detailed view for individual stories. Include the full story text, image, and metadata (e.g., type, creation date). Use ShadCN UI components to ensure a consistent design.
```

#### Prompt 3.2.2
```text
Add edit and delete functionality for stories. Ensure only the story creator can perform these actions. Use confirmation dialogs to prevent accidental deletions.
```

---

## Phase 4: Story Generation

### Chunk 4.1: Generate New Story

#### Prompt 4.1.1
```text
Create a form for generating new stories. Include fields for characters, themes, and plot points. Allow users to dynamically add multiple entries for each field. Validate the input to ensure all required fields are filled.
```

#### Prompt 4.1.2
```text
Write a Supabase Edge Function to handle story generation. Shape the user input into a prompt for the Gemini 2.5 Flash API. Parse the API response to extract the generated story, and save it to the database along with the user-provided metadata.
```

#### Prompt 4.1.3
```text
Display a preview of the generated story. Include options to save the story or retry the generation process. Ensure the retry button triggers a new API call with the same input.
```

---

## Phase 5: Feedback Collection

### Chunk 5.1: Feedback Modal

#### Prompt 5.1.1
```text
Create a feedback modal accessible from the navigation bar. Include a text area for users to leave feedback. Validate the input to ensure it is not empty and does not exceed the character limit.
```

#### Prompt 5.1.2
```text
Write a Supabase Edge Function to save feedback. Append each new feedback entry to the user’s `feedback` array in the database. Ensure the function handles concurrent updates safely.
```

---

## Phase 6: Final Polish

### Chunk 6.1: Accessibility and Dark Mode

#### Prompt 6.1.1
```text
Ensure all interactive elements are tabbable and include ARIA roles. Test the app with screen readers to ensure accessibility. Add skip links for easier navigation.
```

#### Prompt 6.1.2
```text
Add a dark mode toggle to the UI. Use TailwindCSS to implement light and dark themes. Ensure the toggle state is saved in local storage and persists across sessions.
```

### Chunk 6.2: Easter Eggs and Fun Surprises

#### Prompt 6.2.1
```text
Implement one or two Easter eggs from the `easter-eggs-fun-surprises.md` file. For example, display a random inspirational quote when generating a story or add a fun loading animation.
```

---

## Conclusion
This verbose prompt plan provides a detailed and specific roadmap for building the Story Starter application. Each step is designed to be clear and actionable, ensuring a smooth development process and successful implementation.
