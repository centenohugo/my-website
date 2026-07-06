create table if not exists projects (
  id serial primary key,
  title text not null,
  slug text not null unique,
  subtitle text,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  stage text not null default 'in_progress' check (stage in ('in_progress', 'completed', 'archived')),
  repo_url text,
  live_url text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists projects_status_published_at_idx
  on projects (status, published_at desc);
