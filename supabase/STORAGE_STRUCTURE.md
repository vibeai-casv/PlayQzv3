# 🗂️ Supabase Storage Structure

## Storage Bucket: quiz-media

```
┌─────────────────────────────────────────────────────────────┐
│                    QUIZ-MEDIA BUCKET                        │
│                   (Public Access)                           │
│                  Max Size: 5MB/file                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                           │
┌───────▼────────┐                         ┌────────▼────────┐
│  logos/        │                         │ personalities/  │
│  folder        │                         │  folder         │
└───────┬────────┘                         └────────┬────────┘
        │                                           │
        │                                           │
   ┌────┴────┐                                 ┌────┴────┐
   │  Files  │                                 │  Files  │
   └─────────┘                                 └─────────┘
   • .jpg                                      • .jpg
   • .jpeg                                     • .jpeg
   • .png                                      • .png
   • .webp                                     • .webp
   • .gif                                      • .gif
```

## Access Control

```
┌──────────────────────────────────────────────────────────┐
│                    STORAGE POLICIES                       │
└──────────────────────────────────────────────────────────┘

PUBLIC ACCESS:
├─ 📖 Read (SELECT)
│  └─ All files in quiz-media bucket
│     ✅ Allowed for everyone
│     ✅ No authentication required

AUTHENTICATED USERS:
├─ 📖 Read (SELECT)
│  └─ All files in quiz-media bucket
│     ✅ Allowed

ADMIN USERS ONLY:
├─ 📤 Upload (INSERT)
│  ├─ Must be admin role
│  ├─ Must follow folder structure (logos/ or personalities/)
│  ├─ Must have valid extension (.jpg, .jpeg, .png, .webp, .gif)
│  └─ Max 5MB per file
│
├─ ✏️ Update (UPDATE)
│  ├─ Must be admin role
│  └─ Must maintain folder structure
│
└─ 🗑️ Delete (DELETE)
   └─ Must be admin role
```

## Data Flow

```
┌─────────────┐
│   CLIENT    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Upload Request
       │    (with admin JWT)
       ▼
┌──────────────────────┐
│  SUPABASE STORAGE    │
│  - Check JWT token   │
│  - Verify admin role │◄──── RLS Policies
│  - Validate file     │
│  - Check size/type   │
└──────┬───────────────┘
       │ 2. Store file
       ▼
┌──────────────────────┐
│  quiz-media bucket   │
│  /logos/file.png     │
└──────┬───────────────┘
       │ 3. Trigger fires
       ▼
┌──────────────────────┐
│  Database Trigger    │
│  - Call function     │
└──────┬───────────────┘
       │ 4. Register upload
       ▼
┌──────────────────────┐
│  media_library       │
│  - Create record     │
│  - Link storage_id   │
│  - Log activity      │
└──────────────────────┘
```

## Complete Workflow

```
┌─────────────────────────────────────────────────────────┐
│              FILE UPLOAD WORKFLOW                        │
└─────────────────────────────────────────────────────────┘

1. CLIENT SIDE
   ┌──────────────────────┐
   │ Select file          │
   │ • Validate size      │ ──► Max 5MB
   │ • Validate type      │ ──► jpg, png, webp, gif
   │ • Compress (opt.)    │ ──► Optimize for web
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Call validate API    │
   │ validate_media_      │
   │ upload()             │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Upload to Storage    │
   │ supabase.storage     │
   │ .from('quiz-media')  │
   │ .upload()            │
   └──────────┬───────────┘
              │
              ▼

2. SERVER SIDE
   ┌──────────────────────┐
   │ RLS Policy Check     │
   │ • Is admin?          │ ──► Check profiles.role
   │ • Valid folder?      │ ──► logos/ or personalities/
   │ • Valid extension?   │ ──► Regex check
   └──────────┬───────────┘
              │ ✅ Approved
              ▼
   ┌──────────────────────┐
   │ Store in bucket      │
   │ /quiz-media/         │
   │   logos/file.png     │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Register in DB       │
   │ register_media_      │
   │ upload()             │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Log activity         │
   │ user_activity_logs   │
   └──────────┬───────────┘
              │
              ▼
   ┌──────────────────────┐
   │ Return public URL    │
   │ https://...          │
   └──────────────────────┘
```

## Database Integration

```
┌──────────────────────────────────────────────────────────┐
│              DATABASE RELATIONSHIPS                       │
└──────────────────────────────────────────────────────────┘

storage.objects (Supabase managed)
       │
       │ storage_object_id
       ▼
media_library
       │
       ├─► uploaded_by ──► profiles (admin user)
       │
       └─► metadata ──► JSONB {
                          folder: "logos" | "personalities",
                          storage_id: UUID,
                          uploaded_at: timestamp
                        }

questions
       │
       └─► media_id ──► media_library
                        (for image questions)

user_activity_logs
       │
       └─► Logs all upload/delete operations
```

## URL Structure

```
Public URL Format:
https://hvkduszjecwrmdhyhndb.supabase.co/storage/v1/object/public/quiz-media/{folder}/{filename}

Examples:
┌─────────────────────────────────────────────────────────┐
│ Logo:                                                    │
│ https://hvkduszjecwrmdhyhndb.supabase.co/               │
│   storage/v1/object/public/quiz-media/                  │
│   logos/1732729200-company-logo.png                     │
│                                                          │
│ Personality:                                             │
│ https://hvkduszjecwrmdhyhndb.supabase.co/               │
│   storage/v1/object/public/quiz-media/                  │
│   personalities/1732729300-person-photo.jpg             │
└─────────────────────────────────────────────────────────┘
```

## File Naming Convention

```
Format: {timestamp}-{sanitized-original-name}.{extension}

Examples:
✅ 1732729200-google-logo.png
✅ 1732729300-albert-einstein.jpg
✅ 1732729400-nike-swoosh.webp

Process:
1. Generate timestamp (Unix epoch in seconds)
2. Sanitize original filename (remove special chars)
3. Convert to lowercase
4. Add extension
```

## Security Layers

```
┌─────────────────────────────────────────────────────────┐
│                 SECURITY LAYERS                          │
└─────────────────────────────────────────────────────────┘

Layer 1: Authentication
├─ JWT Token required for uploads
└─ Verified by Supabase Auth

Layer 2: Authorization (RLS)
├─ Check user role = 'admin'
├─ Query profiles table
└─ Deny if not admin

Layer 3: Validation
├─ File size ≤ 5MB
├─ MIME type in allowed list
├─ Extension matches MIME type
└─ Folder structure enforced

Layer 4: Storage Rules
├─ Bucket-level restrictions
├─ MIME type whitelist
└─ File size limit

Layer 5: Database Tracking
├─ All uploads logged
├─ Activity monitoring
└─ Audit trail in user_activity_logs
```

## Maintenance Tasks

```
Daily:
└─ Monitor storage usage
   SELECT * FROM public.get_storage_statistics();

Weekly:
├─ Check for duplicates
│  SELECT * FROM public.find_duplicate_media();
│
└─ Clean orphaned files
   SELECT public.cleanup_orphaned_media();

Monthly:
└─ Review and archive old files
```

---

**Base URL:** https://hvkduszjecwrmdhyhndb.supabase.co  
**Bucket:** quiz-media  
**Max Size:** 5MB per file  
**Public Access:** Yes (read-only)
