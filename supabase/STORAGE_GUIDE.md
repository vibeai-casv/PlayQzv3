# Supabase Storage Configuration Guide

## 📦 Bucket Overview

**Bucket Name:** `quiz-media`  
**Purpose:** Store logos and personality images for quiz questions  
**Access:** Public read, Admin write  
**Max File Size:** 5MB per file  
**Allowed Formats:** JPG, JPEG, PNG, WebP, GIF

## 🗂️ Folder Structure

```
quiz-media/
├── logos/
│   ├── company-logo-1.png
│   ├── brand-logo-2.jpg
│   └── organization-logo-3.webp
└── personalities/
    ├── person-1.jpg
    ├── celebrity-2.png
    └── historical-figure-3.webp
```

**Rules:**
- Only 2 top-level folders: `logos/` and `personalities/`
- No nested subfolders allowed
- Files must be directly inside these folders

## 🚀 Setup Instructions

### Option 1: SQL Migration (Recommended)

Run the migration file:

```bash
# Using Supabase Dashboard
# Copy and paste: supabase/migrations/008_create_storage_bucket.sql

# Using psql
psql $DB_URL -f supabase/migrations/008_create_storage_bucket.sql
```

### Option 2: Supabase Dashboard (Manual)

1. **Create Bucket**
   - Go to Storage section
   - Click "New bucket"
   - Name: `quiz-media`
   - Public: ✅ Yes
   - File size limit: `5242880` (5MB)
   - Allowed MIME types: 
     ```
     image/jpeg
     image/jpg
     image/png
     image/webp
     image/gif
     ```

2. **Create Folders**
   - Open `quiz-media` bucket
   - Create folder: `logos`
   - Create folder: `personalities`

3. **Apply Policies**
   - Run the policy section from migration file in SQL Editor

## 🔒 Storage Policies

### Upload Policy (Admin Only)
```sql
-- Admins can upload to quiz-media bucket
-- Must follow folder structure: logos/ or personalities/
-- Must have valid file extension
```

### Read Policies
```sql
-- Public: Can view all files in quiz-media
-- Authenticated: Can view all files in quiz-media
```

### Update/Delete Policies
```sql
-- Admins: Can update and delete any file
```

## 📤 Upload Examples

### Using Supabase JavaScript Client

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hvkduszjecwrmdhyhndb.supabase.co',
  'your-anon-key'
)

// Upload logo
async function uploadLogo(file) {
  const fileName = `logos/${Date.now()}-${file.name}`
  
  // Validate file
  const validation = await supabase.rpc('validate_media_upload', {
    p_file_name: file.name,
    p_file_size: file.size,
    p_mime_type: file.type,
    p_folder: 'logos'
  })
  
  if (!validation.data.valid) {
    console.error('Validation failed:', validation.data.errors)
    return null
  }
  
  // Upload file
  const { data, error } = await supabase.storage
    .from('quiz-media')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    })
  
  if (error) {
    console.error('Upload error:', error)
    return null
  }
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('quiz-media')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}

// Upload personality image
async function uploadPersonality(file) {
  const fileName = `personalities/${Date.now()}-${file.name}`
  
  const { data, error } = await supabase.storage
    .from('quiz-media')
    .upload(fileName, file)
  
  if (error) throw error
  
  const { data: urlData } = supabase.storage
    .from('quiz-media')
    .getPublicUrl(fileName)
  
  return urlData.publicUrl
}
```

### Using cURL

```bash
# Get upload URL
UPLOAD_URL="https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/quiz-media/logos/example.png"

# Upload file (requires admin JWT token)
curl -X POST "$UPLOAD_URL" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: image/png" \
  --data-binary @logo.png
```

### Using Python

```python
from supabase import create_client
import os

supabase = create_client(
    "https://hvkduszjecwrmdhyhndb.supabase.co",
    "your-anon-key"
)

def upload_logo(file_path):
    file_name = f"logos/{int(time.time())}-{os.path.basename(file_path)}"
    
    with open(file_path, 'rb') as f:
        response = supabase.storage.from_('quiz-media').upload(
            file_name,
            f,
            file_options={"content-type": "image/png"}
        )
    
    # Get public URL
    url = supabase.storage.from_('quiz-media').get_public_url(file_name)
    return url
```

## 📥 Download/Access Files

### Get Public URL

```javascript
// Get public URL for a file
const { data } = supabase.storage
  .from('quiz-media')
  .getPublicUrl('logos/company-1.png')

console.log(data.publicUrl)
// https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/logos/company-1.png
```

### List Files in Folder

```javascript
// List all logos
const { data, error } = await supabase
  .rpc('list_storage_files', { p_folder: 'logos' })

console.log(data)
// [
//   {
//     name: 'logos/company-1.png',
//     size: 102400,
//     mime_type: 'image/png',
//     url: 'https://...'
//   }
// ]
```

### Download File

```javascript
// Download a file
const { data, error } = await supabase.storage
  .from('quiz-media')
  .download('logos/company-1.png')

// Create blob URL for preview
const url = URL.createObjectURL(data)
```

## 🗑️ Delete Files

```javascript
// Delete a single file (admin only)
const { data, error } = await supabase.storage
  .from('quiz-media')
  .remove(['logos/old-logo.png'])

// Delete multiple files
const { data, error } = await supabase.storage
  .from('quiz-media')
  .remove([
    'logos/logo-1.png',
    'logos/logo-2.png',
    'personalities/person-1.jpg'
  ])
```

## 🔧 Helper Functions

### Validate Upload

```sql
-- Validate before uploading
SELECT public.validate_media_upload(
    'company-logo.png',  -- file name
    2048000,             -- file size in bytes
    'image/png',         -- MIME type
    'logos'              -- folder
);

-- Returns:
-- { "valid": true, "message": "File validation passed" }
-- or
-- { "valid": false, "errors": ["File size exceeds 5MB limit"] }
```

### Get Storage URL

```sql
-- Get public URL
SELECT public.get_storage_url('quiz-media', 'logos/company-1.png');

-- Returns:
-- https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/logos/company-1.png
```

### List Files

```sql
-- List all logos
SELECT * FROM public.list_storage_files('logos', 50);

-- List all personalities
SELECT * FROM public.list_storage_files('personalities', 100);
```

### Cleanup Orphaned Files

```sql
-- Remove files not referenced in media_library table
SELECT public.cleanup_orphaned_media();

-- Returns: number of files deleted
```

## 🖼️ Image Optimization

### Client-Side Optimization (Recommended)

Use Supabase Image Transformation (if available):

```javascript
// Get optimized image URL
const url = supabase.storage
  .from('quiz-media')
  .getPublicUrl('logos/company.png', {
    transform: {
      width: 300,
      height: 300,
      resize: 'contain',
      format: 'webp',
      quality: 80
    }
  })
```

### Pre-Upload Optimization

```javascript
// Compress image before upload using browser-image-compression
import imageCompression from 'browser-image-compression'

async function compressAndUpload(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp'
  }
  
  try {
    // Compress the image
    const compressedFile = await imageCompression(file, options)
    
    // Upload compressed file
    const fileName = `logos/${Date.now()}-${file.name.replace(/\.[^.]+$/, '.webp')}`
    
    const { data, error } = await supabase.storage
      .from('quiz-media')
      .upload(fileName, compressedFile)
    
    return data
  } catch (error) {
    console.error('Compression error:', error)
  }
}
```

### Server-Side Optimization (Edge Function)

Create an edge function to handle image optimization:

```typescript
// supabase/functions/optimize-image/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { file, folder } = await req.json()
  
  // Get file from storage
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )
  
  // Download, optimize, and re-upload
  // (Implementation depends on your optimization library)
  
  return new Response(
    JSON.stringify({ success: true }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
```

## 📊 Storage Limits

| Limit | Value |
|-------|-------|
| Max file size | 5 MB |
| Max bucket size | 100 GB (Supabase default) |
| Allowed file types | JPG, JPEG, PNG, WebP, GIF |
| Folder depth | 1 level (logos/, personalities/) |
| Public access | ✅ Yes |

## 🔍 Monitoring

### Check Storage Usage

```sql
-- Get total storage size
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'quiz-media'
GROUP BY bucket_id;
```

### List Recent Uploads

```sql
-- Get recent uploads
SELECT 
    name,
    created_at,
    metadata->>'size' as size,
    metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'quiz-media'
ORDER BY created_at DESC
LIMIT 20;
```

## 🛠️ Troubleshooting

### Upload Fails with "Policy violation"
- Ensure user has admin role in profiles table
- Check file is in correct folder (logos/ or personalities/)
- Verify file extension is allowed

### Image Not Loading
- Check bucket is set to public
- Verify file exists in storage
- Check file path in URL is correct

### File Size Too Large
- Maximum: 5MB per file
- Compress images before upload
- Use WebP format for better compression

## 🔗 Integration with Media Library Table

When uploading via API, also create a record in `media_library`:

```javascript
async function uploadAndRegister(file, type) {
  // Upload to storage
  const folder = type === 'logo' ? 'logos' : 'personalities'
  const fileName = `${folder}/${Date.now()}-${file.name}`
  
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('quiz-media')
    .upload(fileName, file)
  
  if (uploadError) throw uploadError
  
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('quiz-media')
    .getPublicUrl(fileName)
  
  // Register in media_library table
  const { data: mediaData, error: mediaError } = await supabase
    .from('media_library')
    .insert({
      filename: fileName,
      original_filename: file.name,
      url: urlData.publicUrl,
      type: type,
      mime_type: file.type,
      size_bytes: file.size,
      uploaded_by: user.id,
      metadata: {
        storage_id: uploadData.id,
        folder: folder
      }
    })
    .select()
    .single()
  
  return mediaData
}
```

---

**Last Updated:** 2025-11-27  
**Bucket:** quiz-media  
**Base URL:** https://hvkduszjecwrmdhyhndb.supabase.co
