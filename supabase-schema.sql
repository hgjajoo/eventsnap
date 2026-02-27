-- ============================================
-- Eventsnap — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Users (all users via OAuth — role determines access)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  image TEXT DEFAULT '',
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  role TEXT DEFAULT 'attendee' CHECK (role IN ('attendee', 'organizer')),
  face_encoding JSONB DEFAULT NULL,
  has_encoding BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Events
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code CHAR(6) NOT NULL UNIQUE,
  description TEXT DEFAULT '',
  date TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('draft', 'active', 'archived')),
  photo_count INTEGER DEFAULT 0,
  total_size_mb REAL DEFAULT 0,
  download_count INTEGER DEFAULT 0,
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_owner ON events(owner_id);
CREATE INDEX IF NOT EXISTS idx_events_code ON events(code);

-- Event ↔ User join table (tracks attendee access + cached sort results)
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  downloaded BOOLEAN DEFAULT FALSE,
  downloaded_at TIMESTAMPTZ,
  matched_photos JSONB DEFAULT NULL,
  match_count INTEGER DEFAULT 0,
  UNIQUE(event_id, attendee_id)
);

CREATE INDEX IF NOT EXISTS idx_ea_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_ea_attendee ON event_attendees(attendee_id);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_attendees ENABLE ROW LEVEL SECURITY;

-- ─── Users Policies ───────────────────────

CREATE POLICY "Users can view own profile" 
ON users FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Organizers can view attendee profiles"
ON users FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM event_attendees
    JOIN events ON events.id = event_attendees.event_id
    WHERE event_attendees.attendee_id = users.id
    AND events.owner_id = auth.uid()
  )
);

-- ─── Events Policies ──────────────────────

CREATE POLICY "Anyone can view active events" 
ON events FOR SELECT 
TO authenticated 
USING (status = 'active');

CREATE POLICY "Organizers can manage own events" 
ON events FOR ALL 
TO authenticated 
USING (owner_id = auth.uid());

-- ─── Event Attendees Policies ─────────────

CREATE POLICY "Attendees can view own attendance" 
ON event_attendees FOR SELECT 
TO authenticated 
USING (attendee_id = auth.uid());

CREATE POLICY "Organizers can view their event attendees" 
ON event_attendees FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM events 
    WHERE events.id = event_attendees.event_id 
    AND events.owner_id = auth.uid()
  )
);
