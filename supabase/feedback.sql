-- =============================================================================
-- Compixor AI — Feedback Database Schema (Supabase / PostgreSQL)
-- =============================================================================

CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  first_name VARCHAR(40),
  message VARCHAR(500) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  ip_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optimize retrieval for approved testimonials on Homepage
CREATE INDEX IF NOT EXISTS idx_feedback_approved ON feedback (status, created_at DESC);

-- Optimize rate limiting & abuse prevention queries by IP hash and creation time
CREATE INDEX IF NOT EXISTS idx_feedback_ip_hash_created ON feedback (ip_hash, created_at DESC);

-- Optional: Enable Row Level Security (RLS)
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts only via server service role or anon key (handled via backend API)
CREATE POLICY "Allow public read of approved feedback" 
ON feedback FOR SELECT 
USING (status = 'approved');
