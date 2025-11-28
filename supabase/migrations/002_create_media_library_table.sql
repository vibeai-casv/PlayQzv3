-- =====================================================
-- MIGRATION: Create media_library table
-- Description: Store uploaded images and media files
-- =====================================================

-- Create enum for media types
CREATE TYPE media_type AS ENUM ('logo', 'personality', 'question_image', 'avatar');

-- Create media_library table
CREATE TABLE IF NOT EXISTS public.media_library (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    url TEXT NOT NULL,
    type media_type NOT NULL,
    mime_type TEXT NOT NULL,
    size_bytes INTEGER NOT NULL,
    description TEXT,
    
    -- Metadata stored as JSONB
    metadata JSONB DEFAULT '{}',
    
    -- Who uploaded it
    uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Constraints
    CONSTRAINT valid_filename CHECK (char_length(filename) > 0),
    CONSTRAINT valid_url CHECK (url ~* '^https?://'),
    CONSTRAINT valid_size CHECK (size_bytes > 0 AND size_bytes <= 10485760), -- Max 10MB
    CONSTRAINT valid_mime_type CHECK (
        mime_type IN (
            'image/jpeg', 'image/jpg', 'image/png', 
            'image/gif', 'image/webp', 'image/svg+xml'
        )
    )
);

-- Create indexes
CREATE INDEX idx_media_type ON public.media_library(type);
CREATE INDEX idx_media_uploaded_by ON public.media_library(uploaded_by);
CREATE INDEX idx_media_is_active ON public.media_library(is_active) WHERE is_active = true;
CREATE INDEX idx_media_created_at ON public.media_library(created_at DESC);
CREATE INDEX idx_media_mime_type ON public.media_library(mime_type);

-- Create trigger for updated_at
CREATE TRIGGER update_media_library_updated_at
    BEFORE UPDATE ON public.media_library
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.media_library ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active media files
CREATE POLICY "Anyone can view active media"
    ON public.media_library
    FOR SELECT
    USING (is_active = true);

-- Policy: Admins can view all media
CREATE POLICY "Admins can view all media"
    ON public.media_library
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can insert media
CREATE POLICY "Admins can insert media"
    ON public.media_library
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update media
CREATE POLICY "Admins can update media"
    ON public.media_library
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can delete media
CREATE POLICY "Admins can delete media"
    ON public.media_library
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Grant permissions
GRANT ALL ON public.media_library TO authenticated;
