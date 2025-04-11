create table public."Users" (
  id serial not null,
  username character varying(255) not null,
  password character varying(255) not null,
  constraint users_pkey primary key (id),
  constraint users_username_key unique (username)
) TABLESPACE pg_default;