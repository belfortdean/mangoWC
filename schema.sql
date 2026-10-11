create table public.research_snapshots (
 id uuid primary key default gen_random_uuid(),
 snapshot_date date not null unique,
 source_url text not null check (source_url like 'https://shamaqar.net/%'),
 methodology_version text not null default '1.0',
 status text not null default 'draft' check (status in ('draft','published')),
 payload jsonb not null check (jsonb_typeof(payload) = 'object'),
 created_at timestamptz not null default now()
);
alter table public.research_snapshots enable row level security;
revoke all on public.research_snapshots from anon, authenticated;
grant select on public.research_snapshots to anon, authenticated;
create policy published_research_read on public.research_snapshots for select to anon, authenticated using (status = 'published');
comment on table public.research_snapshots is 'Aggregate public Sham Aqar market snapshots with provenance. No personal or raw listing data. Writes restricted to trusted administration.';

