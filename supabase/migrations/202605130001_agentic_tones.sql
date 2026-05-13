CREATE TABLE public.agentic_tones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    state TEXT NOT NULL, -- 'delta', 'theta', 'alpha', 'beta', 'gamma'
    base_freq_hz FLOAT NOT NULL,
    target_hz FLOAT NOT NULL,
    noise_type TEXT,
    modes JSONB NOT NULL, -- { binaural: true, ... }
    duration_sec INTEGER NOT NULL DEFAULT 180,
    description TEXT,
    summary TEXT,
    wav_url TEXT,
    webm_url TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Index for mood matching
CREATE INDEX idx_agentic_tones_state ON public.agentic_tones(state);
