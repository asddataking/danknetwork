-- Migration: Setup Receipts Storage Policies
-- Description: Configure RLS policies for the receipts storage bucket
-- Created: 2025-11-26

-- Note: The bucket itself should already exist (created via Dashboard or SQL)
-- This migration sets up the security policies

-- Enable RLS on storage.objects (should already be enabled)
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can upload receipts to their folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own receipts" ON storage.objects;
DROP POLICY IF EXISTS "Service role has full access to receipts" ON storage.objects;
DROP POLICY IF EXISTS "Public can view receipts" ON storage.objects;

-- Policy 1: Authenticated users can upload to their own folder
CREATE POLICY "Users can upload receipts to their folder"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 2: Authenticated users can view their own receipts
CREATE POLICY "Users can view their own receipts"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 3: Authenticated users can delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'receipts' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Service role has full access (needed for API routes)
CREATE POLICY "Service role has full access to receipts"
ON storage.objects FOR ALL
TO service_role
USING (bucket_id = 'receipts')
WITH CHECK (bucket_id = 'receipts');

-- Policy 5: Public can view receipts (since bucket is public for OCR)
-- This allows Gemini to access the images via public URL
CREATE POLICY "Public can view receipts"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'receipts');

-- Verify policies
SELECT 
  policyname,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'objects' 
  AND schemaname = 'storage'
  AND policyname LIKE '%receipt%'
ORDER BY policyname;

