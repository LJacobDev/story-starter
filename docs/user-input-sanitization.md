# User Input Sanitization in Supabase Edge Functions

When handling user input, it's crucial to sanitize and validate the data on the backend to prevent security vulnerabilities such as SQL injection, cross-site scripting (XSS), or other malicious attacks. Below is a guide on how to implement sanitization and safety measures within Supabase Edge Functions.

## Why Sanitization on the Backend?
- **Trust Boundary**: The backend is the trust boundary where data must be validated and sanitized. Frontend validation is helpful for user experience but cannot be trusted for security.
- **Preventing Exploits**: Unsanitized input can lead to database corruption, unauthorized access, or even server compromise.

## Steps for Sanitizing Input in Supabase Edge Functions

### 1. Validate Input
- **Define Expected Data Types**: Use libraries like `zod` or `yup` to validate the shape and type of incoming data.
- **Check Required Fields**: Ensure all required fields are present and non-empty.
- **Set Length Limits**: Restrict the length of strings to prevent buffer overflows or excessive data storage.

Example:
```javascript
import { z } from 'zod';

const feedbackSchema = z.object({
  feedback: z.string().max(1000), // Limit feedback to 1000 characters
  userId: z.string().uuid(), // Ensure userId is a valid UUID
});

const validateInput = (data) => {
  return feedbackSchema.safeParse(data);
};
```

### 2. Escape Special Characters
- Use libraries like `sqlstring` to escape special characters in SQL queries.
- For example:
```javascript
import sqlstring from 'sqlstring';

const sanitizedFeedback = sqlstring.escape(userInput.feedback);
```

### 3. Strip Dangerous HTML Tags
- Use libraries like `sanitize-html` to remove potentially harmful HTML tags and attributes.
- For example:
```javascript
import sanitizeHtml from 'sanitize-html';

const cleanFeedback = sanitizeHtml(userInput.feedback, {
  allowedTags: [], // Remove all HTML tags
  allowedAttributes: {},
});
```

### 4. Use Parameterized Queries
- Always use parameterized queries to prevent SQL injection.
- For example:
```javascript
const { data, error } = await supabase
  .from('feedback')
  .insert([
    { user_id: userId, feedback: sanitizedFeedback },
  ]);
```

### 5. Rate Limiting
- Implement rate limiting to prevent abuse of the feedback feature.
- Use Supabase's built-in rate-limiting features or implement custom logic in the edge function.

### 6. Log Suspicious Activity
- Log and monitor unusual patterns of input to detect potential attacks.
- Use tools like Supabase Logs or external monitoring services.

### 7. Test Regularly
- Perform security testing to ensure sanitization measures are effective.
- Use tools like OWASP ZAP or Burp Suite to simulate attacks.

## Example Edge Function
Here’s an example of a Supabase Edge Function that sanitizes user input:

```javascript
import { createClient } from '@supabase/supabase-js';
import sanitizeHtml from 'sanitize-html';
import { z } from 'zod';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export async function handleFeedback(req) {
  const body = await req.json();

  // Validate input
  const feedbackSchema = z.object({
    feedback: z.string().max(1000),
    userId: z.string().uuid(),
  });

  const validation = feedbackSchema.safeParse(body);
  if (!validation.success) {
    return new Response('Invalid input', { status: 400 });
  }

  // Sanitize input
  const sanitizedFeedback = sanitizeHtml(body.feedback, {
    allowedTags: [],
    allowedAttributes: {},
  });

  // Insert into database
  const { data, error } = await supabase
    .from('feedback')
    .insert([
      { user_id: body.userId, feedback: sanitizedFeedback },
    ]);

  if (error) {
    return new Response('Error saving feedback', { status: 500 });
  }

  return new Response('Feedback saved successfully', { status: 200 });
}
```

## Conclusion
By following these steps, you can ensure that user input is properly sanitized and validated in Supabase Edge Functions, protecting your application from common security vulnerabilities.
