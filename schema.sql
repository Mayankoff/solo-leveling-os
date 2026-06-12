-- Solo Leveling OS Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table: players (users)
CREATE TABLE IF NOT EXISTS players (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    title TEXT DEFAULT 'The Weakest Hunter',
    level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    max_xp INTEGER DEFAULT 1000,
    hp INTEGER DEFAULT 100,
    max_hp INTEGER DEFAULT 100,
    mp INTEGER DEFAULT 100,
    max_mp INTEGER DEFAULT 100,
    str INTEGER DEFAULT 10,
    int_stat INTEGER DEFAULT 10,
    agi INTEGER DEFAULT 10,
    vit INTEGER DEFAULT 10,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: quests (habits)
CREATE TABLE IF NOT EXISTS quests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- 'WORKOUT', 'STUDY', 'NUTRITION', 'SKINCARE'
    base_xp INTEGER DEFAULT 10,
    stat_reward TEXT, -- e.g., 'STR', 'INT', 'AGI', 'VIT'
    is_penalty BOOLEAN DEFAULT false,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Table: daily_logs
CREATE TABLE IF NOT EXISTS daily_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    player_id UUID REFERENCES players(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    total_xp_earned INTEGER DEFAULT 0,
    is_perfect_day BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    UNIQUE(player_id, log_date)
);

-- Table: quest_completions
CREATE TABLE IF NOT EXISTS quest_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE,
    quest_id UUID REFERENCES quests(id) ON DELETE CASCADE,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(daily_log_id, quest_id)
);

-- Insert initial dummy player (For local testing without auth)
INSERT INTO players (title, level, current_xp, max_xp, hp, max_hp, mp, max_mp, str, int_stat, agi, vit) 
VALUES ('The Shadow Monarch', 12, 450, 1500, 1200, 1200, 800, 800, 45, 60, 30, 40)
ON CONFLICT DO NOTHING;
