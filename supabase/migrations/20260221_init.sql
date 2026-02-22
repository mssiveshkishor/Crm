-- Supabase schema for Yadhurtech CRM

create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table profiles (
  id uuid primary key,
  email text unique not null,
  full_name text not null,
  role text check (role in ('superadmin', 'manager', 'sales')) not null default 'sales',
  team text,
  created_at timestamptz default now()
);

create table leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  company text,
  value numeric default 0,
  stage text check (stage in ('New', 'Contacted', 'Qualified', 'Negotiation', 'Won', 'Lost')) not null default 'New',
  owner_id uuid references profiles(id),
  priority text check (priority in ('Low', 'Medium', 'High')) not null default 'Medium',
  last_contacted timestamptz,
  next_action text,
  notes text,
  channel text,
  created_at timestamptz default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete cascade,
  performed_by uuid references profiles(id),
  description text not null,
  inserted_at timestamptz default now()
);

-- Example policy: only superadmins can do everything, others limited to owner row
create policy "Superadmin full access" on leads
  for all
  using (auth.role() = 'superadmin')
  with check (auth.role() = 'superadmin');

create policy "Owners can read own leads" on leads
  for select
  using (owner_id = auth.uid());

create table stage_labels (
  stage text primary key,
  label text not null,
  updated_at timestamptz default now()
);

insert into stage_labels (stage, label)
values
  ('New', 'New'),
  ('Contacted', 'Contacted'),
  ('Qualified', 'Qualified'),
  ('Negotiation', 'Negotiation'),
  ('Won', 'Won'),
  ('Lost', 'Lost')
on conflict (stage) do update set label = excluded.label, updated_at = now();
