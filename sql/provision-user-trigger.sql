-- Trigger function to map newly authenticated users to the public.users table
CREATE OR REPLACE FUNCTION public.provision_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert the authenticated user record into the public schema
  INSERT INTO public.users (
    userid, 
    email, 
    username, 
    user_type, 
    record_status, 
    stamp
  )
  VALUES (
    new.id, 
    new.email, 
    -- Extract the user's full name from OAuth metadata, defaulting to the email prefix if unavailable
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 
    'USER', 
    'INACTIVE', 
    NOW()
  );
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to execute after every insert on the Supabase auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.provision_new_user();