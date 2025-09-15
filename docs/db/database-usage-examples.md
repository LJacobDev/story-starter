# Database Operations Usage Examples

This document demonstrates how to use the database operations composable in your Vue components.

## Basic Usage

```typescript
<script setup lang="ts">
import { useDatabase } from '@/composables/useDatabase'
import { onMounted, ref } from 'vue'

const { 
  loading, 
  error, 
  createProfile, 
  getStories, 
  createStory,
  trackEvent 
} = useDatabase()

const stories = ref([])

// Create a user profile
const handleCreateProfile = async () => {
  const response = await createProfile({
    email: 'user@example.com',
    story_count: 0
  })
  
  if (response.success) {
    console.log('Profile created:', response.data)
  } else {
    console.error('Error:', response.error)
  }
}

// Fetch stories
const loadStories = async () => {
  const response = await getStories({ 
    limit: 10,
    isPrivate: false 
  })
  
  if (response.success) {
    stories.value = response.data || []
  }
}

// Create a new story
const handleCreateStory = async () => {
  const response = await createStory({
    user_id: 'current-user-id',
    title: 'My New Story',
    content: 'Once upon a time...',
    story_type: 'short_story',
    is_private: false
  })
  
  if (response.success) {
    console.log('Story created:', response.data)
    await loadStories() // Refresh the list
  }
}

// Track user activity
const trackStoryView = async (storyId: string) => {
  await trackEvent({
    user_id: 'current-user-id',
    event_type: 'story_viewed',
    event_data: { story_id: storyId }
  })
}

onMounted(loadStories)
</script>

<template>
  <div>
    <div v-if="loading" class="text-center">
      Loading...
    </div>
    
    <div v-if="error" class="text-red-500">
      Error: {{ error }}
    </div>
    
    <div class="space-y-4">
      <button 
        @click="handleCreateProfile"
        class="bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Profile
      </button>
      
      <button 
        @click="handleCreateStory"
        class="bg-green-500 text-white px-4 py-2 rounded"
      >
        Create Story
      </button>
      
      <div class="grid gap-4">
        <div 
          v-for="story in stories" 
          :key="story.id"
          @click="trackStoryView(story.id)"
          class="border p-4 rounded cursor-pointer hover:bg-gray-50"
        >
          <h3 class="font-bold">{{ story.title }}</h3>
          <p class="text-gray-600">{{ story.content.substring(0, 100) }}...</p>
        </div>
      </div>
    </div>
  </div>
</template>
```

## Error Handling

```typescript
const handleDatabaseOperation = async () => {
  const response = await createStory(storyData)
  
  if (!response.success) {
    // Handle specific error types
    if (response.error?.includes('unique constraint')) {
      showMessage('A story with this title already exists')
    } else if (response.error?.includes('foreign key')) {
      showMessage('Invalid user reference')
    } else {
      showMessage(`Error: ${response.error}`)
    }
    return
  }
  
  // Success case
  showMessage('Story created successfully!')
}
```

## Type Safety

All operations are fully typed:

```typescript
import type { 
  StoryInsert, 
  StoryUpdate, 
  ProfileInsert 
} from '@/types/database'

// TypeScript will enforce the correct structure
const newStory: StoryInsert = {
  user_id: 'uuid',
  title: 'Story Title',
  content: 'Story content...',
  story_type: 'short_story',
  is_private: false
  // created_at and updated_at are handled automatically
}

const storyUpdate: StoryUpdate = {
  title: 'Updated Title'
  // Only include fields you want to update
}
```

## Best Practices

1. **Always check the response**: Never assume database operations succeed
2. **Use loading states**: Show users when operations are in progress
3. **Handle errors gracefully**: Provide meaningful error messages
4. **Track user actions**: Use analytics to understand user behavior
5. **Respect privacy**: Check is_private flags when displaying stories
