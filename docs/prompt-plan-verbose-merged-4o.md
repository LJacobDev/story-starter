# Merged Verbose Prompt Plan for Story Starter

This document merges the contents of `prompt-plan-verbose.md` and `prompt-plan-verbose-2.md` to create a comprehensive, detailed, and enhanced roadmap for building the Story Starter application. Each prompt is written to be thorough and specific, ensuring clarity and maximizing the chances of successful implementation by a code generation agent. This merged version includes all details from both files, ensuring no information is lost.

---

## Phase 1: Project Setup and Core Infrastructure

### Chunk 1.1: Initialize the Project

#### Prompt 1.1.1
```text
Create a new Vue 3 project using Vite. Ensure the project is configured to use TypeScript for type safety and maintainability. Install TailwindCSS for styling and ShadCN UI components for pre-built, high-quality UI elements. Set up the project structure to be modular and clean, with separate folders for components, pages, and utilities. Verify that the project builds and runs successfully by starting the development server.
```

**Additional Details:**
- **Testing**: Write a basic test to ensure the app renders without errors.
- **Success Criteria**: The development server starts, and the default Vue app is displayed in the browser.

#### Prompt 1.1.2
```text
Initialize a Git repository for version control. Create a `.gitignore` file to exclude unnecessary files and folders, such as `node_modules`, `.env`, and build artifacts. Make an initial commit with the project setup. Ensure that the repository is ready for collaboration by setting up a remote repository on GitHub.
```

**Additional Details:**
- **Testing**: Verify that the `.gitignore` file excludes the specified files by running `git status`.
- **Success Criteria**: The repository is initialized, and the initial commit is pushed to GitHub.

#### Prompt 1.1.3
```text
Set up GitHub Pages for deployment. Create a GitHub Actions workflow to automate the build and deployment process. Ensure the workflow uses Vite to build the project and deploys the output to the `gh-pages` branch. Test the deployment by pushing a commit to the main branch and verifying that the app is accessible on GitHub Pages.
```

**Additional Details:**
- **Testing**: Verify the deployment by accessing the app’s URL on GitHub Pages.
- **Error Handling**: Include steps to debug common deployment issues, such as missing environment variables or build errors.

### Chunk 1.2: Configure Supabase

#### Prompt 1.2.1
```text
Create a new Supabase project. Set up the database schema with tables for `users`, `stories`, and `analytics`. Use the following schema:
- `users`: Columns for `id` (UUID), `email` (TEXT), and `feedback` (JSONB).
- `stories`: Columns for `id` (UUID), `user_id` (UUID), `title` (TEXT), `content` (TEXT), `type` (TEXT), `is_private` (BOOLEAN), `image_url` (TEXT), and `created_at` (TIMESTAMP).
- `analytics`: Columns for `id` (UUID), `user_id` (UUID), `event_type` (TEXT), `event_data` (JSONB), and `timestamp` (TIMESTAMP).
Ensure the tables are properly linked with foreign keys where applicable.
```

**Additional Details:**
- **Testing**: Write SQL queries to verify the schema and relationships.
- **Success Criteria**: The schema is created, and the relationships are validated.

#### Prompt 1.2.2
```text
Create a `.env` file in the project root to store Supabase secrets, such as the Supabase URL and anon key. Add the `.env` file to `.gitignore` to prevent it from being committed to the repository. Verify that the secrets are accessible in the development environment.
```

**Additional Details:**
- **Testing**: Write a script to log the environment variables and verify their values.
- **Error Handling**: Include a fallback mechanism for missing environment variables.

#### Prompt 1.2.3
```text
Write a Supabase client utility in TypeScript to handle database interactions. The utility should include functions for common operations, such as fetching data, inserting records, and updating entries. Ensure the utility is modular and reusable, and test it by fetching data from the `users` table.
```

**Additional Details:**
- **Testing**: Write unit tests for each function in the utility.
- **Success Criteria**: The utility functions work as expected, and the tests pass.

---

## Phase 2: User Authentication

### Chunk 2.1: Implement Sign-Up and Sign-In

#### Prompt 2.1.1
```text
Create a sign-up form component using ShadCN UI. The form should include fields for email and password, with client-side validation to ensure the inputs are not empty and meet basic requirements (e.g., valid email format, password length). Add a submit button that triggers the sign-up process.
```

**Additional Details:**
- **Testing**: Write unit tests for the form validation logic.
- **Success Criteria**: The form validates inputs correctly and displays error messages for invalid inputs.

#### Prompt 2.1.2
```text
Write a Supabase Edge Function to handle user registration. The function should validate and sanitize the input on the backend, ensuring that the email is unique and the password meets security standards. Return appropriate error messages for invalid input or registration failures.
```

**Additional Details:**
- **Testing**: Write integration tests to verify the function’s behavior with valid and invalid inputs.
- **Error Handling**: Include detailed error messages for common issues, such as duplicate emails.

#### Prompt 2.1.3
```text
Create a sign-in form component using ShadCN UI. The form should include fields for email and password, with client-side validation. Authenticate the user using Supabase and handle errors, such as incorrect credentials or unverified email addresses, by displaying user-friendly messages.
```

**Additional Details:**
- **Testing**: Write end-to-end tests to simulate the sign-in process.
- **Success Criteria**: The user is authenticated successfully, and errors are handled gracefully.

---

## Additional Enhancements

### Error Handling
- Include detailed instructions for handling API errors, such as rate limiting (429), invalid responses, and network issues.
- Provide fallback mechanisms and user-friendly error messages.

### Accessibility
- Add detailed instructions for implementing keyboard navigation, ARIA roles, and responsive design.
- Include testing steps for accessibility compliance using tools like Axe.

### Deployment
- Expand on the GitHub Actions workflow setup, including environment variable management and debugging deployment issues.

---

## Conclusion
This merged verbose prompt plan provides a comprehensive and detailed roadmap for building the Story Starter application. Each step includes additional details for testing, error handling, and success criteria, ensuring a smooth development process and successful implementation.
