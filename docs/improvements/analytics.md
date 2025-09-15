# Analytics Plan for Story Starter

This document outlines how to implement analytics for the Story Starter application using GitHub Pages and Supabase.

## Goals of Analytics
1. **Understand User Behavior**: Track how users interact with the app to identify popular features and areas for improvement.
2. **Monitor Performance**: Ensure the app is performing well and identify bottlenecks.
3. **Measure Engagement**: Track metrics like story creation frequency, user retention, and feature usage.

## Challenges with GitHub Pages
Since GitHub Pages is a static hosting service, it does not support server-side code. However, we can use Supabase as the backend to handle analytics data.

## Implementation Plan

### 1. Event Tracking
Track key user actions, such as:
- **Story Creation**: When a user creates a new story.
- **Story Edits**: When a user edits an existing story.
- **Story Deletion**: When a user deletes a story.
- **Searches**: When a user performs a search.
- **Filters**: When a user applies filters to the story grid.

### 2. Data Collection
Use Supabase to store analytics data. Create a table called `analytics` with the following schema:

| Column Name   | Data Type   | Description                       |
|---------------|-------------|-----------------------------------|
| id            | UUID        | Unique identifier for the event. |
| user_id       | UUID        | ID of the user performing the action. |
| event_type    | TEXT        | Type of event (e.g., `story_created`, `search_performed`). |
| event_data    | JSONB       | Additional data about the event. |
| timestamp     | TIMESTAMP   | Time the event occurred.         |

### 3. Frontend Integration
Use the Supabase JavaScript client to send analytics events to the backend. For example:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function trackEvent(eventType, eventData) {
  const user = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('analytics')
    .insert([
      {
        user_id: user.id,
        event_type: eventType,
        event_data: eventData,
        timestamp: new Date().toISOString(),
      },
    ]);

  if (error) {
    console.error('Error tracking event:', error);
  }
}

// Example usage
trackEvent('story_created', { storyType: 'short_story' });
```

### 4. Privacy Considerations
- **Anonymize Data**: Avoid storing personally identifiable information (PII) in the `analytics` table.
- **Opt-Out Option**: Provide users with an option to disable analytics tracking in their profile settings.

### 5. Visualization
Use Supabase's built-in SQL editor or connect a visualization tool like Metabase to create dashboards for analytics data. Example metrics to track:
- Total stories created over time.
- Most popular story types.
- Average number of stories per user.
- Search and filter usage frequency.

### 6. Rate Limiting
To prevent abuse, implement rate limiting for analytics events. For example, limit the number of events a user can send per minute.

### 7. Testing and Monitoring
- Test the analytics implementation thoroughly to ensure data accuracy.
- Monitor the `analytics` table for unusual patterns or errors.

## Conclusion
By implementing this plan, you can gain valuable insights into user behavior and app performance while respecting user privacy.
