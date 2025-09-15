# Agent Notepad 8

## Project Overview
**Story Starter** is a web application designed for professional writers or creative individuals who want to generate creative starting points for stories. The generated content serves as inspiration, which users can expand and refine on their own. While the application doesn't need to be feature-rich, it must be polished and impressive as a portfolio piece.

### Key Goals:
- Provide a tool for professional writers to spark creativity.
- Showcase technical and design skills as a portfolio project.
- Focus on quality, usability, and aesthetics over extensive features.

### Notes:
- Target audience: Professional writers and creatives.
- Purpose: Generate creative starting points for stories.
- Priority: High-quality design and functionality to impress as a portfolio piece.

---

### Next Steps:
- Develop detailed specifications iteratively.
- Focus on features that balance functionality and visual appeal.
- Ensure the application demonstrates technical proficiency and creativity.

---

## Story Types and Formats
The **Story Starter** application will support the following types of stories, each with its own structure and length guidelines:

### 1. Short Stories
- **Format**: Freely written paragraphs.
- **Length**: 2 to 5 pages.
- **Purpose**: Provide a complete narrative that can be expanded or refined.

### 2. Movie Summaries
- **Format**:
  - Scene/Camera Shot.
  - Description of what the character is doing.
  - Meta comments about why the scene is important to the story.
- **Length**: Structured to help turn the summary into a full screenplay later.
- **Purpose**: Serve as a starting point for screenwriters.

### 3. TV Commercials
- **Format**:
  - Camera shot angles and composition.
  - Brief descriptions of actions and visuals.
- **Length**: Short, suitable for 15 to 60-second commercials.
- **Purpose**: Provide concise, impactful ideas for advertisements.

---

### Notes:
- Each story type will influence the structure and length of the generated content.
- The application should guide the user in selecting the appropriate format for their needs.
- Focus on making the output clear, structured, and easy to build upon.

---

### Next Steps:
- Define how users will input their preferences for story types.
- Plan the user interface to accommodate these formats.

---

## User Input for Story Details

### Characters
- **Fields**:
  - **Name**: A text field for the character's name.
  - **Description**: A text area for describing the character's role, motives, and personality (e.g., protagonist, antagonist).
- **Dynamic Addition**: Users can click "Add New Character" to dynamically add more character fields to the form. This will function similarly to adding meta tags in forms.

### Themes
- **Fields**:
  - **Theme Element**: A text area where users can input a theme element (up to 1000 characters).
- **Dynamic Addition**: Users can click "Add Theme Element" to dynamically add multiple theme elements to the form.

### Plot Points
- **Fields**:
  - **Plot Point**: A text area where users can input a plot point (up to 1000 characters).
- **Dynamic Addition**: Users can click "Add Plot Point" to dynamically add multiple plot points to the form.

### Story Type
- **Dropdown**: A dropdown menu for selecting the story type (e.g., "Movie Summary," "Short Story").
- **Custom Types**: Users can create their own custom story types, which will be private to their account.

### Notes:
- The input method will be uniform across all story types.
- The form should be intuitive and visually appealing, with a focus on ease of use for adding dynamic fields.

---

## Story Display and Management

### Story Grid
- **Layout**: Stories will be displayed as cards in a grid layout.
- **Preview**: Each card will show a preview of the story.
- **Full View**: Clicking on a card will display the full story in a detailed view.

### Card Actions
- **Ellipsis Menu**: Each card will have an ellipsis menu button (top-right corner) with the following options:
  - **Edit**: Opens the story in an editable form.
  - **Delete**: Deletes the story.
  - **Share**: Provides a shareable link to the story.

### Search and Filter
- **Search**: Users can search stories by:
  - Name
  - Description
  - Genre
- **Filter and Sort**: Users can filter and sort stories by:
  - Type
  - Genre
  - Creation Date
  - Other common conveniences (e.g., "is private").

### Notes:
- The grid layout should be visually appealing and responsive.
- Ensure the search and filter options are intuitive and easy to use.

---

## Generate New Story Form

### Modal Design
- **Appearance**: The form will appear in a beautiful modal.
- **Accessibility**:
  - Users can back out of the modal by pressing the `Escape` key.
  - The form will be fully navigable via keyboard, with fields easily tabbable.
- **Submission**:
  - Pressing `Enter` will not submit the form.
  - Pressing `Ctrl + Enter` will submit the form.
  - The submit button will have a hover popup text indicating that `Ctrl + Enter` will submit the form.

### Preview and Retry
- **Preview**: Users can preview the AI-generated story before saving it.
- **Retry**: If the user dislikes the generated story, they can press a "Retry" button to generate a new one.
  - API calls are stateless, so each retry will start a new session.

### Field Validation
- **Required Fields**: All fields are required for now.
- **Character Limits**: All text fields will have a 1000-character limit.
  - If the user approaches the limit, an indication will appear to notify them of the 1000-character limit.
  - The limit will not be shown unless the user is close to reaching it.

---

## User Authentication

### Supabase Authentication
- **Method**: Users will sign up and log in using email and password.
- **Email Verification**:
  - Supabase will handle email verification for new accounts.
  - A redirect page will be prepared for email confirmation, with a URL like `ljacobdev.github.io/story-starter/`.

### Password Reset
- **Feature**: Users will be able to reset their passwords.
- **Timeline**: This feature will be added during the "final polish phase," after the main functionality is complete.

### Notes:
- Focus on implementing email/password authentication and email verification first.
- Password reset and other enhancements will be addressed later during the final polish phase.

---

## Story Sharing

### Link Sharing
- **Access**: Anyone with the link can view the story.
- **Warning**: When sharing a story, the user will be warned that the link allows anyone to view the story.

### Future Enhancement
- **Private Sharing**: During the "final polish phase," consider adding an option to require users to log in before viewing private stories.
- **Public Stories**: Stories marked as public will not require login for viewing.

### Notes:
- Focus on implementing basic link sharing first.
- Add private sharing options and other enhancements during the final polish phase.

---

## Story Images

### User-Provided Images
- **Options**: Users can either:
  - Upload their own images.
  - Provide a link to an image.
- **Restrictions**:
  - Images must be under 10MB in size.
  - Supported formats: JPG, JPEG, PNG.
  - No restrictions on dimensions for now.

### Fallback Image
- **Default**: If the user does not provide an image, a fallback SVG will be used.
- **SVG Path Data**:
  ```svg
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" stroke="currentColor" stroke-width="2">
    <rect x="10" y="10" width="80" height="80" rx="10" ry="10" fill="#f3f4f6" />
    <circle cx="50" cy="50" r="20" fill="#e5e7eb" />
    <line x1="35" y1="35" x2="65" y2="65" stroke="#9ca3af" />
    <line x1="65" y1="35" x2="35" y2="65" stroke="#9ca3af" />
  </svg>
  ```
  - This SVG can be saved as a file in the `/public` directory.

### Future Enhancements
- **Image Generation**: During the "final polish phase," consider adding features to:
  - Fetch images from Pexels using Gemini.
  - Use a text-to-image generation API.
- **Integration**: Generated images can be suggested as potential story cover images.

---

## Accessibility and User Experience

### Keyboard Navigation
- **Focus**: The application will prioritize full keyboard navigation.
  - Ensure all interactive elements are tabbable in a logical order.
  - Include skip links for easier navigation.
  - Use ARIA roles to enhance accessibility.

### Dark Mode
- **Support**: The application will support dark mode.
  - This feature will be added during the "final polish phase."
  - Design the app in a way that makes it easy to implement dark mode later.

### Animations and Transitions
- **Suggestions**:
  1. **Card Hover Animation**: Subtle scaling or shadow effect when hovering over story cards.
  2. **Modal Transitions**: Smooth fade-in and slide-up animation when opening modals.
  3. **Button Feedback**: Slight color change or ripple effect when buttons are clicked.
  4. **Page Transitions**: Crossfade or slide transitions when navigating between pages.
  5. **Loading Indicators**: Animated spinner or progress bar for API calls (e.g., generating stories).
  6. **Story Preview Animation**: Fade-in effect when displaying the story preview.

### Notes:
- Animations should be subtle and not hinder usability.
- Ensure all animations are accessible and do not cause motion sickness for users.
