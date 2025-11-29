-- Create a secure function to look up email by phone number
-- This allows users to log in with their phone number even if they signed up with email
CREATE OR REPLACE FUNCTION public.get_email_by_phone(p_phone TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with privileges of the creator (admin)
SET search_path = public -- Secure search path
AS $$
DECLARE
    v_email TEXT;
BEGIN
    -- Normalize phone number (remove +91 if present for loose matching, or strict)
    -- For now, assume exact match or simple +91 handling
    
    SELECT email INTO v_email
    FROM public.profiles
    WHERE phone = p_phone
       OR phone = '+91' || p_phone
       OR phone = replace(p_phone, '+91', '')
    LIMIT 1;
    
    RETURN v_email;
END;
$$;

-- Grant execute permission to anon and authenticated users
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_email_by_phone(TEXT) TO authenticated;
