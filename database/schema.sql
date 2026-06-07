-- KUROKO AI MVP Supabase schema draft
-- Initial product uses local storage for the demo app, but these tables map to the intended production model.

create type proposal_status as enum ('draft', 'approved', 'rejected', 'posted');
create type proposal_category as enum (
  'google_business_profile_post',
  'note_article',
  'line_message',
  'review_reply',
  'faq_aeo_article',
  'store_improvement',
  'gbp_review_reply',
  'gbp_post'
);
create type proposal_platform as enum ('google_business_profile', 'note', 'line', 'website', 'internal');
create type automation_mode as enum ('approval', 'semi_auto', 'full_auto');
create type reply_status as enum (
  'unprocessed',
  'draft',
  'pending_approval',
  'approved',
  'rejected',
  'replied',
  'failed',
  'skipped'
);
create type gbp_post_status as enum (
  'draft',
  'pending_approval',
  'approved',
  'scheduled',
  'posted',
  'rejected',
  'failed'
);

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  unique (organization_id, profile_id)
);

create table stores (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  industry text not null,
  address text,
  phone_number text,
  business_hours jsonb,
  regular_holidays text,
  services text,
  strengths text,
  target_customers text,
  competitors text[] not null default '{}',
  post_tone text,
  ng_expressions text[] not null default '{}',
  automation_mode automation_mode not null default 'approval',
  allow_template_review_auto_reply boolean not null default false,
  allow_low_risk_gbp_auto_post boolean not null default false,
  post_frequency_per_month int not null default 20,
  gbp_account_name text,
  gbp_location_name text,
  gbp_place_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table store_keywords (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  keyword text not null,
  priority int not null default 1 check (priority between 1 and 20),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, keyword)
);

create table ai_proposals (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  title text not null,
  category proposal_category not null,
  body text not null,
  platform proposal_platform not null,
  goal text,
  target_keywords text[] not null default '{}',
  status proposal_status not null default 'draft',
  source_type text not null default 'ai',
  risk_notes text[] not null default '{}',
  prompt_template_id uuid,
  prompt_version int,
  ai_model text,
  generation_input jsonb,
  generation_output jsonb,
  generation_error text,
  approved_by uuid references profiles(id),
  approved_at timestamptz,
  rejected_reason text,
  posted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table proposal_revisions (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references ai_proposals(id) on delete cascade,
  edited_by uuid references profiles(id),
  title text not null,
  body text not null,
  goal text,
  target_keywords text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table proposal_status_events (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references ai_proposals(id) on delete cascade,
  from_status proposal_status,
  to_status proposal_status not null,
  actor_id uuid references profiles(id),
  reason text,
  created_at timestamptz not null default now()
);

create table review_reply_templates (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  industry text,
  template_name text not null,
  template_body text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table google_reviews (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  google_review_id text not null,
  reviewer_name text,
  rating int not null check (rating between 1 and 5),
  comment text,
  review_created_at timestamptz not null,
  reply_status reply_status not null default 'unprocessed',
  reply_body text,
  replied_at timestamptz,
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, google_review_id)
);

create table gbp_posts (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references stores(id) on delete cascade,
  proposal_id uuid references ai_proposals(id) on delete set null,
  title text not null,
  body text not null,
  category text not null,
  target_keywords text[] not null default '{}',
  image_url text,
  google_post_id text,
  status gbp_post_status not null default 'draft',
  scheduled_at timestamptz,
  posted_at timestamptz,
  risk_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
