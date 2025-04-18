create table public."Users" (
  id serial not null,
  username character varying(255) not null,
  password character varying(255) not null,
  is_admin boolean not null default false,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

-- Insert test users
INSERT INTO public."Users" (username, password, is_admin)
VALUES ('admin', 'admin123', true),
       ('client', 'client123', false)
ON CONFLICT (username) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- Category field for industry classification
  client TEXT, -- Client name or identifier
  file_url TEXT,
  image_url TEXT, -- Project image
  status TEXT DEFAULT 'active', -- Project status (active, completed, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ
);

-- Tabela para compartilhamento de projetos
CREATE TABLE IF NOT EXISTS public.project_shares (
  id SERIAL PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id INTEGER NOT NULL,
  shared_by INTEGER NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES public."Users"(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES public."Users"(id) ON DELETE SET NULL,
  UNIQUE(project_id, user_id)
);

-- Enable row level security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_shares ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY IF NOT EXISTS "Allow public select" ON "projects"
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Allow public insert" ON "projects"
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Allow public update" ON "projects"
FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Allow public delete" ON "projects"
FOR DELETE USING (true);

-- Políticas para compartilhamentos
CREATE POLICY IF NOT EXISTS "Allow admin manage shares" ON "project_shares" 
FOR ALL USING (EXISTS (SELECT 1 FROM public."Users" WHERE id = auth.uid() AND is_admin = true));

CREATE POLICY IF NOT EXISTS "Allow users view own shares" ON "project_shares"
FOR SELECT USING (user_id = auth.uid());

-- Insert sample projects for different categories
INSERT INTO public.projects (name, description, category, client, status)
VALUES 
  ('Telecom Tower Network', 'Design and implementation of telecommunication tower infrastructure', 'rf-telecommunications', 'TelecomCorp', 'active'),
  ('Solar Farm Design', 'Large-scale solar farm architectural planning', 'energy', 'GreenEnergy Inc', 'completed'),
  ('Highway Expansion', 'Expansion and redesign of major highway intersection', 'construction', 'State DOT', 'active'),
  ('Modern Bank Branch', 'Contemporary banking facility with advanced security features', 'banking', 'First National Bank', 'completed'),
  ('Exhibition Stand', 'Custom exhibition stand for international trade show', 'sand', 'Tech Innovations', 'completed'),
  ('Oil Refinery Expansion', 'Architectural planning for refinery capacity expansion', 'oil-gas', 'PetroServices', 'active'),
  ('Luxury Apartment Complex', 'High-end residential development with amenities', 'real-estate', 'Premium Properties', 'active'),
  ('Nuclear Plant Safety Upgrades', 'Safety and containment system architectural redesign', 'nuclear', 'Energy Solutions', 'active'),
  ('Manufacturing Facility', 'Modern manufacturing plant with optimized workflow', 'industrial', 'Industrial Systems', 'completed'),
  ('Port Terminal Design', 'Cargo handling terminal with advanced logistics features', 'naval', 'Maritime Logistics', 'active'),
  ('BPO Office Complex', 'Ergonomic and efficient workspace for call center operations', 'bpo', 'Global Services Inc', 'completed'),
  ('Auto Dealership Design', 'Premium automobile showroom with service center', 'automotive', 'Luxury Motors', 'active'),
  ('Aerospace Testing Facility', 'Specialized testing and development center for aerospace components', 'aerospace', 'AeroTech Innovations', 'active'),
  ('Pharmaceutical Laboratory', 'Clean room and research laboratory complex', 'chemistry-pharmaceutical', 'MediPharm Research', 'completed')
ON CONFLICT DO NOTHING;