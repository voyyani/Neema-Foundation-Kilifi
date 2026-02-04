-- Check programs in database
SELECT 
  id,
  name,
  slug,
  category,
  is_active,
  is_featured,
  display_order,
  created_at
FROM programs
ORDER BY display_order;
