# Prompt Plan for Story Starter

This document outlines a detailed, step-by-step blueprint for building the Story Starter application. The plan is broken into phases, chunks, and prompts to ensure incremental progress, adherence to best practices, and test-driven development. Each prompt builds on the previous steps, ensuring no orphaned or unused code.

---

## Phase 1: Project Setup and Core Infrastructure

### Chunk 1.1: Initialize the Project

#### Prompt 1.1.1
```text
Create a new Vue 3 project using Vite. Configure the project to use TypeScript and TailwindCSS. Install ShadCN UI components for pre-built UI elements. Ensure the project structure is clean and modular.
```

#### Prompt 1.1.2
```text
Set up Git for version control. Initialize a Git repository and create a `.gitignore` file to exclude unnecessary files. Commit the initial project setup.
```

#### Prompt 1.1.3
```text
Configure GitHub Pages for deployment. Set up a GitHub Actions workflow to build and deploy the project to GitHub Pages. Ensure the workflow uses Vite for the build process.
```

### Chunk 1.2: Configure Supabase

#### Prompt 1.2.1
```text
Set up a Supabase project. Create tables for `users`, `stories`, and `analytics` based on the schema provided in the specification. Configure authentication with email and password.
```

#### Prompt 1.2.2
```text
Create a `.env` file to store Supabase secrets (URL and anon key). Add the `.env` file to `.gitignore` to prevent it from being committed to the repository.
```

#### Prompt 1.2.3
```text
Write a Supabase client utility in TypeScript to handle database interactions. Ensure the utility is reusable and modular.
```

---

## Phase 2: User Authentication

### Chunk 2.1: Implement Sign-Up and Sign-In

#### Prompt 2.1.1
```text
Create a sign-up form component using ShadCN UI. Include fields for email and password. Validate the input on the frontend.
```

#### Prompt 2.1.2
```text
Write a Supabase Edge Function to handle user registration. Sanitize and validate the input on the backend. Ensure the function returns appropriate error messages for invalid input.
```

#### Prompt 2.1.3
```text
Create a sign-in form component. Include fields for email and password. Validate the input on the frontend and authenticate the user using Supabase.
```

### Chunk 2.2: Email Verification

#### Prompt 2.2.1
```text
Configure Supabase to send email verification links. Create a redirect page for email confirmation (e.g., `ljacobdev.github.io/story-starter/verify`).
```

#### Prompt 2.2.2
```text
Write a component to display a message prompting users to verify their email after registration. Include a button to resend the verification email.
```

---

## Phase 3: Story Management

### Chunk 3.1: Story Grid

#### Prompt 3.1.1
```text
Create a grid layout to display story cards. Use ShadCN UI components for the cards. Include placeholders for story title, description, and image.
```

#### Prompt 3.1.2
```text
Fetch stories from the Supabase database. Display public stories and private stories created by the authenticated user.
```

#### Prompt 3.1.3
```text
Add search and filter functionality to the story grid. Allow users to search by title, genre, and description, and filter by type, creation date, and privacy status.
```

### Chunk 3.2: Story Details

#### Prompt 3.2.1
```text
Create a detailed view for individual stories. Include the full story text, image, and metadata (e.g., type, creation date).
```

#### Prompt 3.2.2
```text
Add edit and delete functionality for stories. Ensure only the story creator can perform these actions.
```

---

## Phase 4: Story Generation

### Chunk 4.1: Generate New Story

#### Prompt 4.1.1
```text
Create a form for generating new stories. Include fields for characters, themes, and plot points. Allow users to dynamically add multiple entries for each field.
```

#### Prompt 4.1.2
```text
Write a Supabase Edge Function to handle story generation. Shape the user input into a prompt for the Gemini 2.5 Flash API. Parse the API response and save the generated story to the database.
```

#### Prompt 4.1.3
```text
Display a preview of the generated story. Include options to save the story or retry the generation process.
```

---

## Phase 5: Feedback Collection

### Chunk 5.1: Feedback Modal

#### Prompt 5.1.1
```text
Create a feedback modal accessible from the navigation bar. Include a text area for users to leave feedback.
```

#### Prompt 5.1.2
```text
Write a Supabase Edge Function to save feedback. Append each new feedback entry to the user’s `feedback` array in the database.
```

---

## Phase 6: Final Polish

### Chunk 6.1: Accessibility and Dark Mode

#### Prompt 6.1.1
```text
Ensure all interactive elements are tabbable and include ARIA roles. Test the app with screen readers to ensure accessibility.
```

#### Prompt 6.1.2
```text
Add a dark mode toggle to the UI. Use TailwindCSS to implement light and dark themes.
```

### Chunk 6.2: Easter Eggs and Fun Surprises

#### Prompt 6.2.1
```text
Implement one or two Easter eggs from the `easter-eggs-fun-surprises.md` file. For example, display a random inspirational quote when generating a story.
```

---

## Conclusion
This prompt plan provides a clear and incremental roadmap for building the Story Starter application. Each step is designed to be testable and builds on the previous steps, ensuring a smooth development process.
