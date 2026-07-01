create table if not exists posts (
  id serial primary key,
  title text not null,
  slug text not null unique,
  content text not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

create index if not exists posts_status_published_at_idx
  on posts (status, published_at desc);
