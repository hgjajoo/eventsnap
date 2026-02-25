-- ============================================
-- Eventsnap — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- Users (organizers via OAuth)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  image TEXT DEFAULT '',
  provider TEXT NOT NULL CHECK (provider IN ('google', 'github')),
  is_admin BOOLEAN DEFAULT FALSE,
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

-- Attendees
CREATE TABLE IF NOT EXISTS attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Attendee',
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  face_encoding JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event ↔ Attendee join table
CREATE TABLE IF NOT EXISTS event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  attendee_id UUID NOT NULL REFERENCES attendees(id) ON DELETE CASCADE,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  downloaded BOOLEAN DEFAULT FALSE,
  downloaded_at TIMESTAMPTZ,
  UNIQUE(event_id, attendee_id)
);

CREATE INDEX IF NOT EXISTS idx_ea_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_ea_attendee ON event_attendees(attendee_id);
