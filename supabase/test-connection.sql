-- TEST: Run this first in Supabase SQL Editor to verify connection
SELECT 'Connection successful!' as message;

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_keys', 'vault_items');
