create table public."Users" (
  id serial not null,
  username character varying(255) not null,
  password character varying(255) not null,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

CREATE TABLE IF NOT EXISTS public.projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                file_url TEXT,
                created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
                updated_at TIMESTAMPTZ
            );
            
            ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
            
            -- Create policies
            CREATE POLICY IF NOT EXISTS "Allow public select" ON "projects"
            FOR SELECT USING (true);
            
            CREATE POLICY IF NOT EXISTS "Allow public insert" ON "projects"
            FOR INSERT WITH CHECK (true);
            
            CREATE POLICY IF NOT EXISTS "Allow public update" ON "projects"
            FOR UPDATE USING (true);
            
            CREATE POLICY IF NOT EXISTS "Allow public delete" ON "projects"
            FOR DELETE USING (true);