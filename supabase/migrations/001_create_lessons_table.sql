-- Create lessons table
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    outline TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('generating', 'completed', 'failed')),
    content TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on status for faster queries
CREATE INDEX idx_lessons_status ON public.lessons(status);

-- Create index on created_at for sorting
CREATE INDEX idx_lessons_created_at ON public.lessons(created_at DESC);

-- Enable Row Level Security (RLS) - but allow all operations for now since no auth is required
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since no auth is required)
CREATE POLICY "Allow all operations on lessons"
    ON public.lessons
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_lessons_updated_at
    BEFORE UPDATE ON public.lessons
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();
