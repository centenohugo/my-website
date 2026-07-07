alter table posts
  add column if not exists title_es text,
  add column if not exists subtitle_es text,
  add column if not exists content_es text;
