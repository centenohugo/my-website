alter table posts
  add column if not exists asset_prefix uuid;

alter table projects
  add column if not exists asset_prefix uuid;
