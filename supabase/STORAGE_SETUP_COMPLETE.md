# 📦 Supabase Storage Configuration - Complete

## ✅ Deliverables Summary

### Storage Migration Files
1. **`008_create_storage_bucket.sql`** - Storage bucket creation with:
   - quiz-media bucket (5MB limit)
   - RLS policies for admin upload/delete
   - Public and authenticated read access
   - Folder structure enforcement (/logos, /personalities)
   - Helper functions for validation and management

2. **`009_enhance_media_storage.sql`** - Media library integration:
   - Storage object tracking
   - Automatic sync triggers
   - Enhanced management functions
   - Statistics and duplicate detection

### Documentation Files
1. **`STORAGE_GUIDE.md`** - Comprehensive guide with:
   - Setup instructions (SQL, Dashboard, CLI)
   - Upload/download examples (JS, Python, cURL)
   - Image optimization techniques
   - Helper function usage
   - Troubleshooting tips

2. **`STORAGE_STRUCTURE.md`** - Visual diagrams showing:
   - Bucket and folder structure
   - Access control flow
   - Upload workflow
   - Database relationships
   - Security layers

### Setup Scripts
1. **`setup-storage.sh`** - Bash script for Linux/Mac
2. **`setup-storage.ps1`** - PowerShell script for Windows

Both scripts include:
- Automated migration execution
- Verification checks
- Summary output
- Error handling

## 🗂️ Storage Structure

```
quiz-media/ (Bucket)
├── logos/              # Company/brand logos
│   ├── *.jpg
│   ├── *.png
│   └── *.webp
└── personalities/      # Person identification images
    ├── *.jpg
    ├── *.png
    └── *.webp
```

## 🔒 Access Control

| Role | Read | Upload | Update | Delete |
|------|------|--------|--------|--------|
| **Public** | ✅ | ❌ | ❌ | ❌ |
| **Authenticated** | ✅ | ❌ | ❌ | ❌ |
| **Admin** | ✅ | ✅ | ✅ | ✅ |

## 📋 Configuration Details

### Bucket Settings
- **Name**: `quiz-media`
- **Access**: Public (read-only)
- **Max File Size**: 5MB (5,242,880 bytes)
- **Allowed MIME Types**:
  - `image/jpeg`
  - `image/jpg`
  - `image/png`
  - `image/webp`
  - `image/gif`

### Folder Rules
- ✅ Only 2 top-level folders: `logos/` and `personalities/`
- ❌ No nested subfolders allowed
- ✅ Files must be directly inside these folders
- ✅ Folder enforced by RLS policies

### File Validation
- ✅ Size limit: 5MB maximum
- ✅ Extension validation: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- ✅ MIME type verification
- ✅ Folder structure enforcement
- ✅ Admin role requirement for uploads

## 🚀 Quick Setup

### Option 1: Automated (Recommended)

**Linux/Mac:**
```bash
cd e:/projects/playqzv3/supabase
chmod +x setup-storage.sh
export DB_URL="postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"
./setup-storage.sh
```

**Windows PowerShell:**
```powershell
cd e:/projects/playqzv3/supabase
$env:DB_URL = "postgresql://postgres:[PASSWORD]@db.hvkduszjecwrmdhyhndb.supabase.co:5432/postgres"
.\setup-storage.ps1
```

### Option 2: Manual

1. Run migrations in Supabase SQL Editor:
   - `008_create_storage_bucket.sql`
   - `009_enhance_media_storage.sql`

2. Verify setup:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'quiz-media';
   SELECT COUNT(*) FROM pg_policies WHERE tablename = 'objects';
   ```

## 📤 Upload Example

```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://hvkduszjecwrmdhyhndb.supabase.co',
  'your-anon-key'
)

async function uploadLogo(file) {
  // 1. Validate
  const validation = await supabase.rpc('validate_media_upload', {
    p_file_name: file.name,
    p_file_size: file.size,
    p_mime_type: file.type,
    p_folder: 'logos'
  })
  
  if (!validation.data.valid) {
    throw new Error(validation.data.errors)
  }
  
  // 2. Upload to storage
  const fileName = `logos/${Date.now()}-${file.name}`
  const { data: storageData, error: storageError } = await supabase.storage
    .from('quiz-media')
    .upload(fileName, file)
  
  if (storageError) throw storageError
  
  // 3. Get public URL
  const { data: urlData } = supabase.storage
    .from('quiz-media')
    .getPublicUrl(fileName)
  
  // 4. Register in database
  const { data: mediaData } = await supabase.rpc('register_media_upload', {
    p_filename: fileName,
    p_original_filename: file.name,
    p_url: urlData.publicUrl,
    p_type: 'logo',
    p_mime_type: file.type,
    p_size_bytes: file.size,
    p_folder: 'logos',
    p_storage_object_id: storageData.id
  })
  
  return mediaData
}
```

## 🔧 Helper Functions

### 1. Validate Upload
```sql
SELECT public.validate_media_upload(
    'company-logo.png',  -- filename
    2048000,             -- size in bytes
    'image/png',         -- MIME type
    'logos'              -- folder
);
```

### 2. Get Storage URL
```sql
SELECT public.get_storage_url('quiz-media', 'logos/company-1.png');
-- Returns: https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/logos/company-1.png
```

### 3. List Files in Folder
```sql
SELECT * FROM public.list_storage_files('logos', 50);
```

### 4. Get Storage Statistics
```sql
SELECT * FROM public.get_storage_statistics();
```

### 5. Find Duplicates
```sql
SELECT * FROM public.find_duplicate_media();
```

### 6. Cleanup Orphaned Files
```sql
SELECT public.cleanup_orphaned_media();
```

## 🔗 URL Format

```
Public URL Pattern:
https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/{folder}/{filename}

Examples:
✅ https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/logos/google-logo.png
✅ https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/personalities/einstein.jpg
```

## 🖼️ Image Optimization

### Client-Side Compression
```javascript
import imageCompression from 'browser-image-compression'

const options = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
  fileType: 'image/webp'
}

const compressedFile = await imageCompression(file, options)
// Upload compressedFile instead
```

### Recommended Settings
- **Format**: WebP (better compression)
- **Max Width/Height**: 1920px
- **Quality**: 80-85%
- **Max Size**: 1-2MB before upload

## 📊 Monitoring

### Check Storage Usage
```sql
SELECT 
    bucket_id,
    COUNT(*) as file_count,
    pg_size_pretty(SUM((metadata->>'size')::bigint)) as total_size
FROM storage.objects
WHERE bucket_id = 'quiz-media'
GROUP BY bucket_id;
```

### Recent Uploads
```sql
SELECT 
    name,
    created_at,
    metadata->>'size' as size_bytes,
    metadata->>'mimetype' as mime_type
FROM storage.objects
WHERE bucket_id = 'quiz-media'
ORDER BY created_at DESC
LIMIT 20;
```

## 🛠️ Troubleshooting

### Upload Fails
- ✅ Check user has admin role
- ✅ Verify file size ≤ 5MB
- ✅ Check file extension is allowed
- ✅ Ensure folder is 'logos' or 'personalities'

### Image Not Loading
- ✅ Bucket set to public
- ✅ File exists in storage
- ✅ Correct URL format
- ✅ CORS configured properly

### Policy Violation
- ✅ User authenticated
- ✅ User role = 'admin'
- ✅ File path matches pattern

## 📁 Integration Points

### With Questions Table
```sql
-- Link media to question
UPDATE public.questions
SET 
    media_id = 'media-library-uuid',
    image_url = 'https://...storage.../logos/image.png'
WHERE id = 'question-uuid';
```

### With User Activity Logs
All uploads/deletes automatically logged:
```sql
SELECT * FROM public.user_activity_logs
WHERE activity_type IN ('media_uploaded', 'media_deleted')
ORDER BY created_at DESC;
```

## ✅ Verification Checklist

After setup, verify:

- [ ] Bucket `quiz-media` exists
- [ ] Bucket is public
- [ ] File size limit is 5MB
- [ ] Storage policies created (5+ policies)
- [ ] Helper functions exist (4+ functions)
- [ ] Can upload as admin
- [ ] Cannot upload as regular user
- [ ] Public URL works without auth
- [ ] Files appear in media_library table
- [ ] Activity is logged

## 🎯 Next Steps

1. ✅ Storage configured (you are here)
2. ⏳ Create admin user
3. ⏳ Test file upload via API
4. ⏳ Upload sample logos and personalities
5. ⏳ Create quiz questions with images
6. ⏳ Test image display in quiz

## 📚 Related Documentation

- **API Spec**: `openapi.yaml`
- **Storage Guide**: `supabase/STORAGE_GUIDE.md`
- **Storage Structure**: `supabase/STORAGE_STRUCTURE.md`
- **Deployment Guide**: `DEPLOYMENT_CHECKLIST.md`
- **Quick Reference**: `QUICK_REFERENCE.md`

---

**Status**: ✅ Ready for Deployment  
**Last Updated**: 2025-11-27  
**Bucket**: quiz-media  
**Base URL**: https://hvkduszjecwrmdhyhndb.supabase.co
