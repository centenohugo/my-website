-- The landing's editable bio and photo. There is only ever one row: the
-- boolean key can only be true, so every write is an upsert on id = true.
-- Null columns fall back to the copy in lib/i18n/locales and public/me.jpg.
create table if not exists site_profile (
  id boolean primary key default true check (id),
  bio text,
  bio_es text,
  photo_url text,
  updated_at timestamptz not null default now()
);
