# AI Quiz Application - React Frontend

A modern, fully-typed React application for the AI Quiz platform built with Vite, TypeScript, and Tailwind CSS.

## 🚀 Tech Stack

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** Custom components (shadcn/ui compatible)
- **State Management:** Zustand with persist middleware
- **Routing:** React Router v6
- **Form Handling:** React Hook Form + Zod validation
- **HTTP Client:** Supabase JS Client
- **Authentication:** Supabase Auth

## 📁 Project Structure

```
client/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Main navigation header
│   │   │   ├── Footer.tsx          # Footer component
│   │   │   └── Layout.tsx          # Layout wrapper
│   │   ├── ui/                     # Reusable UI components (to be added)
│   │   ├── quiz/                   # Quiz-specific components (to be added)
│   │   ├── admin/                  # Admin components (to be added)
│   │   └── ProtectedRoute.tsx     # Route protection wrapper
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx          # Login page with form validation
│   │   │   └── Signup.tsx         # Signup page
│   │   ├── user/
│   │   │   ├── Dashboard.tsx      # User dashboard
│   │   │   ├── TakeQuiz.tsx       # Quiz taking interface
│   │   │   ├── History.tsx        # Quiz history
│   │   │   └── Profile.tsx        # User profile
│   │   └── admin/
│   │       ├── Dashboard.tsx      # Admin dashboard
│   │       ├── Users.tsx          # User management
│   │       ├── Questions.tsx      # Question management
│   │       └── Media.tsx          # Media upload/management
│   ├── hooks/
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useQuiz.ts             # Quiz management hook
│   │   └── useAdmin.ts            # Admin operations hook
│   ├── stores/
│   │   ├── authStore.ts           # Authentication state (Zustand)
│   │   └── quizStore.ts           # Quiz state (Zustand)
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client configuration
│   │   └── utils.ts               # Utility functions
│   ├── types/
│   │   └── index.ts               # TypeScript type definitions
│   ├── App.tsx                    # Main app component with routing
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles with Tailwind
├── .env.example                   # Environment variables template
├── tailwind.config.js             # Tailwind configuration
├── postcss.config.js              # PostCSS configuration
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
└── package.json                   # Dependencies
```

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd client
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the `client` directory:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://hvkduszjecwrmdhyhndb.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
```

### 3. Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 4. Build for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## 🔑 Key Features Implemented

### Authentication
- ✅ Login with email/password
- ✅ Signup with validation
- ✅ Session persistence
- ✅ Protected routes
- ✅ Admin role checking
- ⏳ Google OAuth (Supabase configured)
- ⏳ Phone OTP (Supabase configured)

### State Management
- ✅ Zustand stores for auth and quiz state
- ✅ Persistent session storage
- ✅ Type-safe state updates

### Routing
- ✅ React Router v6 configuration
- ✅ Protected route wrapper
- ✅ Admin route protection
- ✅ Automatic redirects

### Form Handling
- ✅ React Hook Form integration
- ✅ Zod schema validation
- ✅ Error handling
- ✅ Loading states

### UI Components
- ✅ Responsive layout
- ✅ Header with navigation
- ✅ Footer
- ✅ Loading states
- ✅ Error messages

## 📝 API Integration

### Supabase Client

The Supabase client is configured in `src/lib/supabase.ts`:

```typescript
import { supabase } from '../lib/supabase';

// Authentication
await supabase.auth.signInWithPassword({ email, password });
await supabase.auth.signUp({ email, password });
await supabase.auth.signOut();

// Database queries
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();

// Storage operations
await supabase.storage.from('quiz-media').upload(path, file);
```

### Custom Hooks

#### `useAuth()`
```typescript
const {
  user,              // Current user object
  isLoading,         // Loading state
  isAuthenticated,   // Authentication status
  isAdmin,           // Admin role check
  login,             // Login function
  signup,            // Signup function
  logout,            // Logout function
  updateProfile,     // Update user profile
} = useAuth();
```

## 🔐 Authentication Flow

1. **Login/Signup** → User enters credentials
2. **Supabase Auth** → Validates and creates session
3. **Profile Fetch** → Gets user profile from `profiles` table
4. **Store Update** → Updates Zustand auth store
5. **Redirect** → Navigates to dashboard
6. **Session Check** → Validates on app load

## 🛣️ Routes

### Public Routes
- `/login` - Login page
- `/signup` - Signup page

### Protected Routes (Authenticated Users)
- `/dashboard` - User dashboard
- `/take-quiz` - Take a quiz
- `/history` - Quiz history
- `/profile` - User profile

### Protected Routes (Admin Only)
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/questions` - Question management
- `/admin/media` - Media management

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - React DOM rendering
- `typescript` - Type safety
- `vite` - Build tool

### Routing & Forms
- `react-router-dom` - Routing
- `react-hook-form` - Form handling
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation

### State & Data
- `zustand` - State management
- `@supabase/supabase-js` - Supabase client

### Styling
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes
- `clsx` - Class name utilities

## 🚧 Next Steps

### To Implement
1. Quiz Components (QuestionCard, ResultsCard, Timer)
2. Admin Components (UserTable, QuestionTable, MediaUploader)
3. UI Components (Button, Input, Modal, Toast)
4. Features (Real-time timer, Image questions, Results viz)

## 📚 Resources

- **OpenAPI Spec**: `../openapi.yaml`
- **Database Migrations**: `../supabase/migrations/`
- **API Documentation**: `../README_API.md`

---

**Version**: 1.0.0  
**Last Updated**: 2025-11-27  
**Stack**: React 18 + TypeScript + Vite + Tailwind CSS
