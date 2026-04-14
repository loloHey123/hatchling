-- Add theme palette preference to user profiles
ALTER TABLE profiles ADD COLUMN theme_palette text NOT NULL DEFAULT 'sunset-garden';
