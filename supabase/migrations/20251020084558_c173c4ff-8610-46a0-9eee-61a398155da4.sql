-- Drop existing projects table to recreate with new structure
DROP TABLE IF EXISTS public.projects CASCADE;

-- Create projects table with complete structure
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  client_name TEXT,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  request_id UUID REFERENCES public.service_requests(id) ON DELETE SET NULL,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'done')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  critical_points JSONB DEFAULT '[]',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_jalons table for project milestones
CREATE TABLE public.project_jalons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  responsible TEXT,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'done')),
  progress INTEGER DEFAULT 0 CHECK (progress BETWEEN 0 AND 100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create project_notes table for project notes and communication
CREATE TABLE public.project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  visibility TEXT DEFAULT 'internal' CHECK (visibility IN ('internal', 'client')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_jalons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects
CREATE POLICY "Admins can manage all projects"
ON public.projects
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their own projects"
ON public.projects
FOR SELECT
USING (profile_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()));

-- RLS Policies for project_jalons
CREATE POLICY "Admins can manage all jalons"
ON public.project_jalons
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view their project jalons"
ON public.project_jalons
FOR SELECT
USING (
  project_id IN (
    SELECT id FROM projects WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- RLS Policies for project_notes
CREATE POLICY "Admins can manage all notes"
ON public.project_notes
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Clients can view client-visible notes"
ON public.project_notes
FOR SELECT
USING (
  visibility = 'client' AND
  project_id IN (
    SELECT id FROM projects WHERE profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  )
);

-- Add trigger for updated_at on projects
CREATE TRIGGER update_projects_updated_at
BEFORE UPDATE ON public.projects
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();