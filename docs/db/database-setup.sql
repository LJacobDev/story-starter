-- Story Starter Database Setup
-- Run this SQL in your Supabase SQL Editor

-- =============================================
-- 1. CREATE TABLES
-- =============================================

-- User profiles table (extends auth.users)
CREATE TABLE story_starter_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  feedback TEXT,
  story_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stories table
CREATE TABLE story_starter_stories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  story_type TEXT NOT NULL DEFAULT 'short-story',
  is_private BOOLEAN DEFAULT false,
  image_url TEXT,
  genre TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics/events table
CREATE TABLE story_starter_analytics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 2. CREATE INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for stories table
CREATE INDEX idx_story_starter_stories_user_id ON story_starter_stories(user_id);
CREATE INDEX idx_story_starter_stories_created_at ON story_starter_stories(created_at DESC);
CREATE INDEX idx_story_starter_stories_story_type ON story_starter_stories(story_type);
CREATE INDEX idx_story_starter_stories_is_private ON story_starter_stories(is_private);
CREATE INDEX idx_story_starter_stories_public_recent ON story_starter_stories(created_at DESC) WHERE is_private = false;

-- Indexes for analytics table
CREATE INDEX idx_story_starter_analytics_user_id ON story_starter_analytics(user_id);
CREATE INDEX idx_story_starter_analytics_timestamp ON story_starter_analytics(timestamp DESC);
CREATE INDEX idx_story_starter_analytics_event_type ON story_starter_analytics(event_type);

-- =============================================
-- 3. ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE story_starter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_starter_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE story_starter_analytics ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 4. CREATE RLS POLICIES
-- =============================================

-- ============= PROFILES POLICIES =============

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON story_starter_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON story_starter_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON story_starter_profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============= STORIES POLICIES =============

-- Anyone can view public stories
CREATE POLICY "Anyone can view public stories" ON story_starter_stories
  FOR SELECT USING (is_private = false);

-- Users can view their own stories (both public and private)
CREATE POLICY "Users can view own stories" ON story_starter_stories
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert stories
CREATE POLICY "Authenticated users can insert stories" ON story_starter_stories
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.uid() IS NOT NULL
  );

-- Users can update their own stories
CREATE POLICY "Users can update own stories" ON story_starter_stories
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own stories
CREATE POLICY "Users can delete own stories" ON story_starter_stories
  FOR DELETE USING (auth.uid() = user_id);

-- ============= ANALYTICS POLICIES =============

-- Users can view their own analytics
CREATE POLICY "Users can view own analytics" ON story_starter_analytics
  FOR SELECT USING (auth.uid() = user_id);

-- Authenticated users can insert their own analytics
CREATE POLICY "Users can insert own analytics" ON story_starter_analytics
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND 
    auth.uid() IS NOT NULL
  );

-- =============================================
-- 5. CREATE UPDATED_AT TRIGGER FUNCTION
-- =============================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables that have updated_at
CREATE TRIGGER update_story_starter_profiles_updated_at 
  BEFORE UPDATE ON story_starter_profiles 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_story_starter_stories_updated_at 
  BEFORE UPDATE ON story_starter_stories 
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- 6. CREATE STORAGE BUCKET FOR IMAGES
-- =============================================

-- Create a storage bucket for story images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('story-images', 'story-images', true);

-- ============= STORAGE POLICIES =============

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload story images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'story-images' AND 
    auth.uid() IS NOT NULL
  );

-- Allow users to view all images (public bucket)
CREATE POLICY "Anyone can view story images" ON storage.objects
  FOR SELECT USING (bucket_id = 'story-images');

-- Allow users to update their own images
CREATE POLICY "Users can update own story images" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'story-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow users to delete their own images
CREATE POLICY "Users can delete own story images" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'story-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- =============================================
-- 7. CREATE HELPER FUNCTIONS
-- =============================================

-- Function to get user's story count
CREATE OR REPLACE FUNCTION get_user_story_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::INTEGER 
    FROM story_starter_stories 
    WHERE user_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user story count (call after story insert/delete)
CREATE OR REPLACE FUNCTION update_user_story_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE story_starter_profiles 
    SET story_count = get_user_story_count(NEW.user_id)
    WHERE id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE story_starter_profiles 
    SET story_count = get_user_story_count(OLD.user_id)
    WHERE id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically update story count
CREATE TRIGGER update_story_count_on_insert
  AFTER INSERT ON story_starter_stories
  FOR EACH ROW EXECUTE PROCEDURE update_user_story_count();

CREATE TRIGGER update_story_count_on_delete
  AFTER DELETE ON story_starter_stories
  FOR EACH ROW EXECUTE PROCEDURE update_user_story_count();

-- =============================================
-- 8. INSERT SAMPLE DATA (OPTIONAL - FOR TESTING)
-- =============================================

-- Uncomment these if you want some sample data for testing
-- Note: You'll need to replace the UUIDs with actual user IDs from your auth.users table

/*
-- Sample stories (replace user_id with actual UUIDs from your auth.users)
INSERT INTO story_starter_stories (user_id, title, content, story_type, is_private, genre, description) VALUES
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'The Midnight Library',
    'In a town where the library only opened at midnight, Sarah discovered books that contained stories of lives she never lived...',
    'short-story',
    false,
    'fantasy',
    'A magical story about a library that exists between worlds'
  ),
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'The Last Coffee Shop',
    'As automation took over the world, Marcus ran the last human-operated coffee shop on Earth...',
    'short-story',
    false,
    'science-fiction',
    'A story about human connection in an automated world'
  );
*/

-- =============================================
-- SETUP COMPLETE!
-- =============================================

-- Your database is now ready with:
-- ✅ Three main tables with conflict-avoiding names
-- ✅ Comprehensive RLS policies for security
-- ✅ Performance indexes
-- ✅ Automatic timestamp updates
-- ✅ Storage bucket for images
-- ✅ Helper functions for story counting
-- ✅ Proper foreign key relationships

-- Next steps:
-- 1. Run this SQL in your Supabase SQL Editor
-- 2. Verify the tables were created successfully
-- 3. Test the RLS policies by creating a test user and story
-- 4. Begin implementing the Vue.js frontend!
