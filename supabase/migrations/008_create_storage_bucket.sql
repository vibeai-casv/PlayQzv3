-- =====================================================
-- MIGRATION: Create Storage Bucket and Policies
-- Description: Set up quiz-media bucket for logos and personalities
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKET
-- =====================================================

-- Create the quiz-media bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'quiz-media',
    'quiz-media',
    true, -- Public bucket for serving images
    5242880, -- 5MB in bytes (5 * 1024 * 1024)
    ARRAY[
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ]::text[]
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- UPLOAD POLICIES
-- =====================================================

-- Policy: Admins can upload files to quiz-media bucket
CREATE POLICY "Admins can upload to quiz-media"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'quiz-media' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    ) AND
    -- Enforce folder structure
    (
        (name LIKE 'logos/%' AND name NOT LIKE 'logos/%/%') OR
        (name LIKE 'personalities/%' AND name NOT LIKE 'personalities/%/%')
    ) AND
    -- Validate file extensions
    (
        name ~* '\.(jpg|jpeg|png|webp|gif)$'
    )
);

-- =====================================================
-- READ POLICIES
-- =====================================================

-- Policy: Public can view all files in quiz-media bucket
CREATE POLICY "Public can view quiz-media files"
ON storage.objects
FOR SELECT
TO public
USING (
    bucket_id = 'quiz-media' AND
    -- Only allow access to files in proper folders
    (
        name LIKE 'logos/%' OR
        name LIKE 'personalities/%'
    )
);

-- Policy: Authenticated users can view all files
CREATE POLICY "Authenticated users can view quiz-media"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'quiz-media');

-- =====================================================
-- UPDATE POLICIES
-- =====================================================

-- Policy: Admins can update files
CREATE POLICY "Admins can update quiz-media files"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
    bucket_id = 'quiz-media' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    bucket_id = 'quiz-media' AND
    (
        (name LIKE 'logos/%' AND name NOT LIKE 'logos/%/%') OR
        (name LIKE 'personalities/%' AND name NOT LIKE 'personalities/%/%')
    )
);

-- =====================================================
-- DELETE POLICIES
-- =====================================================

-- Policy: Admins can delete files
CREATE POLICY "Admins can delete quiz-media files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'quiz-media' AND
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get file URL
CREATE OR REPLACE FUNCTION public.get_storage_url(
    p_bucket_id TEXT,
    p_file_path TEXT
)
RETURNS TEXT AS $$
BEGIN
    RETURN 'https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/' || 
           p_bucket_id || '/' || p_file_path;
END;
$$ LANGUAGE plpgsql;

-- Function to validate file upload
CREATE OR REPLACE FUNCTION public.validate_media_upload(
    p_file_name TEXT,
    p_file_size INTEGER,
    p_mime_type TEXT,
    p_folder TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_result JSONB;
    v_errors TEXT[] := ARRAY[]::TEXT[];
BEGIN
    -- Check file size (5MB max)
    IF p_file_size > 5242880 THEN
        v_errors := array_append(v_errors, 'File size exceeds 5MB limit');
    END IF;
    
    -- Check file extension
    IF NOT (p_file_name ~* '\.(jpg|jpeg|png|webp|gif)$') THEN
        v_errors := array_append(v_errors, 'Invalid file extension. Allowed: jpg, jpeg, png, webp, gif');
    END IF;
    
    -- Check MIME type
    IF NOT (p_mime_type = ANY(ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'])) THEN
        v_errors := array_append(v_errors, 'Invalid MIME type');
    END IF;
    
    -- Check folder
    IF NOT (p_folder = ANY(ARRAY['logos', 'personalities'])) THEN
        v_errors := array_append(v_errors, 'Invalid folder. Must be "logos" or "personalities"');
    END IF;
    
    -- Build result
    IF array_length(v_errors, 1) IS NULL THEN
        v_result := jsonb_build_object(
            'valid', true,
            'message', 'File validation passed'
        );
    ELSE
        v_result := jsonb_build_object(
            'valid', false,
            'errors', to_jsonb(v_errors)
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql;

-- Function to list files in a folder
CREATE OR REPLACE FUNCTION public.list_storage_files(
    p_folder TEXT,
    p_limit INTEGER DEFAULT 100
)
RETURNS TABLE(
    name TEXT,
    id UUID,
    size INTEGER,
    mime_type TEXT,
    created_at TIMESTAMPTZ,
    url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        o.name,
        o.id,
        o.metadata->>'size' AS size,
        o.metadata->>'mimetype' AS mime_type,
        o.created_at,
        public.get_storage_url('quiz-media', o.name) AS url
    FROM storage.objects o
    WHERE 
        o.bucket_id = 'quiz-media' AND
        o.name LIKE (p_folder || '/%') AND
        o.name NOT LIKE (p_folder || '/%/%')
    ORDER BY o.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up orphaned media files
CREATE OR REPLACE FUNCTION public.cleanup_orphaned_media()
RETURNS INTEGER AS $$
DECLARE
    v_deleted_count INTEGER := 0;
BEGIN
    -- Delete storage objects that don't have a reference in media_library
    DELETE FROM storage.objects
    WHERE 
        bucket_id = 'quiz-media' AND
        id NOT IN (
            SELECT DISTINCT (metadata->>'storage_id')::UUID
            FROM public.media_library
            WHERE metadata->>'storage_id' IS NOT NULL
        );
    
    GET DIAGNOSTICS v_deleted_count = ROW_COUNT;
    RETURN v_deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_storage_url TO authenticated;
GRANT EXECUTE ON FUNCTION public.validate_media_upload TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_storage_files TO authenticated;

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON FUNCTION public.get_storage_url IS 'Generate public URL for a storage object';
COMMENT ON FUNCTION public.validate_media_upload IS 'Validate file before upload';
COMMENT ON FUNCTION public.list_storage_files IS 'List files in a specific folder';
COMMENT ON FUNCTION public.cleanup_orphaned_media IS 'Remove storage files not referenced in media_library';
