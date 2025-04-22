create table public."Users" (
  id serial not null,
  username character varying(255) not null,
  password character varying(255) not null,
  is_admin boolean not null default false,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;

create table public.chat_messages (
  id serial not null,
  sender text not null,
  receiver text not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  read boolean null default false,
  is_edited boolean null default false,
  is_deleted boolean null default false,
  project_id integer null,
  constraint chat_messages_pkey primary key (id)
) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_sender on public.chat_messages using btree (sender) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_receiver on public.chat_messages using btree (receiver) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_created_at on public.chat_messages using btree (created_at) TABLESPACE pg_default;

create index IF not exists idx_chat_messages_project_id on public.chat_messages using btree (project_id) TABLESPACE pg_default;

create table public.project_shares (
  id serial not null,
  project_id uuid not null,
  user_id integer not null,
  shared_by integer not null,
  shared_at timestamp with time zone not null default now(),
  read boolean null,
  constraint project_shares_pkey primary key (id),
  constraint project_shares_project_id_user_id_key unique (project_id, user_id),
  constraint project_shares_project_id_fkey foreign KEY (project_id) references projects (id) on delete CASCADE,
  constraint project_shares_shared_by_fkey foreign KEY (shared_by) references "Users" (id) on delete set null,
  constraint project_shares_user_id_fkey foreign KEY (user_id) references "Users" (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.projects (
  id uuid not null default gen_random_uuid (),
  name text not null,
  file_url text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone null,
  status public.project_status not null default 'Incompleted'::project_status,
  category text null,
  is_featured boolean null default false,
  constraint projects_pkey primary key (id)
) TABLESPACE pg_default;