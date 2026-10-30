-- The site is English-only now. The Spanish translations were generated from
-- the English source (see 0005, 0008, 0009), so nothing here is original
-- content. Irreversible: take a backup before applying to production.
alter table posts
  drop column if exists title_es,
  drop column if exists subtitle_es,
  drop column if exists content_es;

alter table projects
  drop column if exists title_es,
  drop column if exists subtitle_es,
  drop column if exists content_es;

alter table site_profile
  drop column if exists bio_es;
