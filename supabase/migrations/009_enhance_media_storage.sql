-- =====================================================
-- MIGRATION: Update media_library table for storage integration
-- Description: Add storage tracking and enhance media management
-- =====================================================

-- Add storage_object_id column to track storage.objects
ALTER TABLE public.media_library
ADD COLUMN IF NOT EXISTS storage_object_id UUID REFERENCES storage.objects(id) ON DELETE SET NULL;

-- Add folder column for organization
ALTER TABLE public.media_library
ADD COLUMN IF NOT EXISTS folder TEXT CHECK (folder IN ('logos', 'personalities'));

-- Create index on storage_object_id
CREATE INDEX IF NOT EXISTS idx_media_storage_object 
ON public.media_library(storage_object_id) 
WHERE storage_object_id IS NOT NULL;

-- Create index on folder
CREATE INDEX IF NOT EXISTS idx_media_folder 
ON public.media_library(folder) 
WHERE folder IS NOT NULL;

-- =====================================================
-- TRIGGER: Sync media_library with storage deletions
-- =====================================================

-- Function to handle storage deletion
CREATE OR REPLACE FUNCTION public.handle_storage_deletion()
RETURNS TRIGGER AS $$
BEGIN
    -- Mark media_library record as inactive when storage object is deleted
    UPDATE public.media_library
    SET 
        is_active = false,
        updated_at = NOW(),
        metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb),
            '{deleted_from_storage}',
            to_jsonb(NOW())
        )
    WHERE storage_object_id = OLD.id;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on storage.objects
DROP TRIGGER IF EXISTS trigger_storage_deletion ON storage.objects;
CREATE TRIGGER trigger_storage_deletion
    BEFORE DELETE ON storage.objects
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_storage_deletion();

-- =====================================================
-- ENHANCED MEDIA MANAGEMENT FUNCTIONS
-- =====================================================

-- Function to upload media and create database record
CREATE OR REPLACE FUNCTION public.register_media_upload(
    p_filename TEXT,
    p_original_filename TEXT,
    p_url TEXT,
    p_type media_type,
    p_mime_type TEXT,
    p_size_bytes INTEGER,
    p_folder TEXT,
    p_storage_object_id UUID,
    p_description TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_media_id UUID;
BEGIN
    INSERT INTO public.media_library (
        filename,
        original_filename,
        url,
        type,
        mime_type,
        size_bytes,
        folder,
        storage_object_id,
        description,
        uploaded_by,
        metadata
    ) VALUES (
        p_filename,
        p_original_filename,
        p_url,
        p_type,
        p_mime_type,
        p_size_bytes,
        p_folder,
        p_storage_object_id,
        p_description,
        auth.uid(),
        jsonb_build_object(
            'uploaded_at', NOW(),
            'folder', p_folder
        )
    )
    RETURNING id INTO v_media_id;
    
    -- Log activity
    PERFORM public.log_user_activity(
        auth.uid(),
        'media_uploaded',
        'Uploaded ' || p_type || ': ' || p_original_filename,
        'media_library',
        v_media_id,
        jsonb_build_object(
            'filename', p_filename,
            'type', p_type,
            'size', p_size_bytes,
            'folder', p_folder
        )
    );
    
    RETURN v_media_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get media by folder
CREATE OR REPLACE FUNCTION public.get_media_by_folder(
    p_folder TEXT,
    p_active_only BOOLEAN DEFAULT true,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
    id UUID,
    filename TEXT,
    url TEXT,
    type media_type,
    size_bytes INTEGER,
    created_at TIMESTAMPTZ,
    description TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.filename,
        m.url,
        m.type,
        m.size_bytes,
        m.created_at,
        m.description
    FROM public.media_library m
    WHERE 
        m.folder = p_folder AND
        (NOT p_active_only OR m.is_active = true)
    ORDER BY m.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to get storage statistics
CREATE OR REPLACE FUNCTION public.get_storage_statistics()
RETURNS TABLE(
    folder TEXT,
    file_count BIGINT,
    total_size_bytes BIGINT,
    total_size_mb NUMERIC,
    avg_file_size_kb NUMERIC,
    most_common_type media_type
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.folder,
        COUNT(*) as file_count,
        SUM(m.size_bytes) as total_size_bytes,
        ROUND(SUM(m.size_bytes)::NUMERIC / 1048576, 2) as total_size_mb,
        ROUND(AVG(m.size_bytes)::NUMERIC / 1024, 2) as avg_file_size_kb,
        MODE() WITHIN GROUP (ORDER BY m.type) as most_common_type
    FROM public.media_library m
    WHERE m.is_active = true AND m.folder IS NOT NULL
    GROUP BY m.folder
    ORDER BY total_size_bytes DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to find duplicate files
CREATE OR REPLACE FUNCTION public.find_duplicate_media()
RETURNS TABLE(
    original_filename TEXT,
    duplicate_count BIGINT,
    total_size_bytes BIGINT,
    file_ids UUID[]
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.original_filename,
        COUNT(*) as duplicate_count,
        SUM(m.size_bytes) as total_size_bytes,
        array_agg(m.id) as file_ids
    FROM public.media_library m
    WHERE m.is_active = true
    GROUP BY m.original_filename
    HAVING COUNT(*) > 1
    ORDER BY duplicate_count DESC, total_size_bytes DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.register_media_upload TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_media_by_folder TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_storage_statistics TO authenticated;
GRANT EXECUTE ON FUNCTION public.find_duplicate_media TO authenticated;

-- =====================================================
-- UPDATE DEPLOYMENT CHECKLIST
-- =====================================================

COMMENT ON FUNCTION public.register_media_upload IS 'Register a media upload in both storage and database';
COMMENT ON FUNCTION public.get_media_by_folder IS 'Retrieve media files filtered by folder';
COMMENT ON FUNCTION public.get_storage_statistics IS 'Get storage usage statistics by folder';
COMMENT ON FUNCTION public.find_duplicate_media IS 'Find duplicate files to optimize storage';
