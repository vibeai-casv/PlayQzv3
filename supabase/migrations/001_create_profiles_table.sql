-- =====================================================
-- MIGRATION: Create profiles table
-- Description: User profiles extending auth.users
-- =====================================================

-- Create enum types
CREATE TYPE user_category AS ENUM ('student', 'professional', 'educator', 'hobbyist');
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE theme_preference AS ENUM ('light', 'dark', 'auto');

-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    phone TEXT,
    name TEXT NOT NULL,
    institution TEXT,
    category user_category DEFAULT 'student',
    role user_role DEFAULT 'user' NOT NULL,
    bio TEXT,
    avatar TEXT,
    
    -- Preferences stored as JSONB
    preferences JSONB DEFAULT jsonb_build_object(
        'notifications', true,
        'theme', 'auto'
    ),
    
    -- Stats stored as JSONB for flexibility
    stats JSONB DEFAULT jsonb_build_object(
        'totalAttempts', 0,
        'averageScore', 0,
        'bestScore', 0,
        'totalTimeSpent', 0
    ),
    
    -- Status fields
    disabled BOOLEAN DEFAULT false,
    disabled_reason TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    last_login_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT email_or_phone_required CHECK (
        email IS NOT NULL OR phone IS NOT NULL
    ),
    CONSTRAINT bio_length CHECK (char_length(bio) <= 500),
    CONSTRAINT phone_format CHECK (
        phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$'
    )
);

-- Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email) WHERE email IS NOT NULL;
CREATE INDEX idx_profiles_phone ON public.profiles(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_profiles_category ON public.profiles(category);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_disabled ON public.profiles(disabled) WHERE disabled = true;
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: Admins can update all profiles
CREATE POLICY "Admins can update all profiles"
    ON public.profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Policy: New users can insert their own profile
CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'User')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
