alter table posts
  add column if not exists share_token uuid not null default gen_random_uuid() unique;

alter table projects
  add column if not exists share_token uuid not null default gen_random_uuid() unique;
