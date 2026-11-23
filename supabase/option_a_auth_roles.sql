-- ============================================================================
-- Option A (v2) : Comptes personnels (Supabase Auth + Google)
--                 + 3 rôles sécurisés : Admin / Éditeur / Lecteur (RLS)
-- Idempotent : peut être exécuté sur une base vierge ou par-dessus la v1.
-- ============================================================================

-- 1. Table des membres et rôles par voyage (family_code)
create table if not exists public.trip_members (
  id uuid primary key default gen_random_uuid(),
  family_code text not null,
  email text not null,
  user_id uuid references auth.users(id) on delete set null,
  role text not null default 'viewer',
  created_at timestamptz not null default now()
);

-- Mise à jour idempotente de la contrainte des rôles (admin / editor / viewer)
alter table public.trip_members
  drop constraint if exists trip_members_role_check;

alter table public.trip_members
  add constraint trip_members_role_check
  check (role in ('admin', 'editor', 'viewer'));

create unique index if not exists trip_members_code_email_idx
  on public.trip_members (family_code, lower(email));

create index if not exists trip_members_user_idx
  on public.trip_members (user_id);

-- Migration douce v1 -> v2 : si un voyage avait déjà des éditeurs mais aucun admin,
-- promouvoir les éditeurs existants en admin pour ne verrouiller personne.
update public.trip_members m
set role = 'admin'
where m.role = 'editor'
  and not exists (
    select 1
    from public.trip_members a
    where a.family_code = m.family_code
      and a.role = 'admin'
  );

-- 2. Fonctions utilitaires SECURITY DEFINER (évite toute récursion RLS)
create or replace function public.current_user_email()
returns text
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''));
$$;

create or replace function public.trip_has_members(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.trip_members where family_code = p_code
  );
$$;

create or replace function public.is_trip_member(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.trip_members
    where family_code = p_code
      and (
        user_id = auth.uid()
        or lower(email) = public.current_user_email()
      )
  );
$$;

-- Admin OU Éditeur : peut modifier le contenu du voyage (trip_sync)
create or replace function public.is_trip_editor(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.trip_members
    where family_code = p_code
      and role in ('admin', 'editor')
      and (
        user_id = auth.uid()
        or lower(email) = public.current_user_email()
      )
  );
$$;

-- Admin uniquement : peut gérer les utilisateurs et leurs rôles (trip_members)
create or replace function public.is_trip_admin(p_code text)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select auth.uid() is not null and exists (
    select 1
    from public.trip_members
    where family_code = p_code
      and role = 'admin'
      and (
        user_id = auth.uid()
        or lower(email) = public.current_user_email()
      )
  );
$$;

-- 3. RPC : Rattache automatiquement le compte connecté aux invitations reçues par email
create or replace function public.link_my_trip_memberships()
returns table (family_code text, role text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
begin
  if auth.uid() is null then
    return;
  end if;

  v_email := public.current_user_email();

  if v_email <> '' then
    update public.trip_members
    set user_id = auth.uid()
    where lower(email) = v_email
      and (user_id is null or user_id <> auth.uid());
  end if;

  return query
  select m.family_code, m.role
  from public.trip_members m
  where m.user_id = auth.uid()
     or (v_email <> '' and lower(m.email) = v_email)
  order by m.created_at asc;
end;
$$;

-- 4. RPC : Permet au premier utilisateur connecté de revendiquer un voyage en tant qu'Admin
create or replace function public.claim_trip_if_unclaimed(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role text;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  v_email := public.current_user_email();
  if v_email = '' then
    raise exception 'Email required';
  end if;

  -- Si le voyage n'a encore aucun membre, l'utilisateur connecté devient le premier Admin
  if not exists (select 1 from public.trip_members where family_code = p_code) then
    insert into public.trip_members (family_code, email, user_id, role)
    values (p_code, v_email, auth.uid(), 'admin');
    return 'admin';
  end if;

  -- Sinon, rattacher s'il a déjà une invitation par email
  update public.trip_members
  set user_id = auth.uid()
  where family_code = p_code
    and lower(email) = v_email;

  select m.role into v_role
  from public.trip_members m
  where m.family_code = p_code
    and (m.user_id = auth.uid() or lower(m.email) = v_email)
  limit 1;

  return coalesce(v_role, 'none');
end;
$$;

-- 5. Droits & Row Level Security sur public.trip_members (gestion réservée aux Admin)
grant select, insert, update, delete on public.trip_members to authenticated;
grant execute on function public.trip_has_members(text) to anon, authenticated;
grant execute on function public.link_my_trip_memberships() to authenticated;
grant execute on function public.claim_trip_if_unclaimed(text) to authenticated;

alter table public.trip_members enable row level security;

drop policy if exists "Members read trip_members" on public.trip_members;
create policy "Members read trip_members"
  on public.trip_members
  for select
  to authenticated
  using (public.is_trip_member(family_code));

drop policy if exists "Editors insert trip_members" on public.trip_members;
drop policy if exists "Admins insert trip_members" on public.trip_members;
create policy "Admins insert trip_members"
  on public.trip_members
  for insert
  to authenticated
  with check (public.is_trip_admin(family_code));

drop policy if exists "Editors update trip_members" on public.trip_members;
drop policy if exists "Admins update trip_members" on public.trip_members;
create policy "Admins update trip_members"
  on public.trip_members
  for update
  to authenticated
  using (public.is_trip_admin(family_code))
  with check (public.is_trip_admin(family_code));

drop policy if exists "Editors delete trip_members" on public.trip_members;
drop policy if exists "Admins delete trip_members" on public.trip_members;
create policy "Admins delete trip_members"
  on public.trip_members
  for delete
  to authenticated
  using (public.is_trip_admin(family_code));

-- 6. RLS sur public.trip_sync
--    - Admin & Éditeur : lecture + écriture du contenu du voyage
--    - Lecteur : lecture seule
--    - Suppression de ligne réservée aux Admin
alter table public.trip_sync enable row level security;

drop policy if exists "Family code read/write" on public.trip_sync;
drop policy if exists "Trip sync select" on public.trip_sync;
drop policy if exists "Trip sync insert" on public.trip_sync;
drop policy if exists "Trip sync update" on public.trip_sync;
drop policy if exists "Trip sync delete" on public.trip_sync;

create policy "Trip sync select"
  on public.trip_sync
  for select
  to anon, authenticated
  using (
    not public.trip_has_members(family_code)
    or public.is_trip_member(family_code)
  );

create policy "Trip sync insert"
  on public.trip_sync
  for insert
  to anon, authenticated
  with check (
    not public.trip_has_members(family_code)
    or public.is_trip_editor(family_code)
  );

create policy "Trip sync update"
  on public.trip_sync
  for update
  to anon, authenticated
  using (
    not public.trip_has_members(family_code)
    or public.is_trip_editor(family_code)
  )
  with check (
    not public.trip_has_members(family_code)
    or public.is_trip_editor(family_code)
  );

create policy "Trip sync delete"
  on public.trip_sync
  for delete
  to authenticated
  using (public.is_trip_admin(family_code));

-- 7. RPC : Permet à un membre (Éditeur, Lecteur, ou Admin s'il reste un autre Admin) de quitter un voyage
create or replace function public.leave_trip(p_code text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_role text;
  v_other_admins integer;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  v_email := public.current_user_email();

  select m.role into v_role
  from public.trip_members m
  where m.family_code = p_code
    and (m.user_id = auth.uid() or (v_email <> '' and lower(m.email) = v_email))
  limit 1;

  if v_role is null then
    return 'not_member';
  end if;

  if v_role = 'admin' then
    select count(*) into v_other_admins
    from public.trip_members m
    where m.family_code = p_code
      and m.role = 'admin'
      and not (m.user_id = auth.uid() or (v_email <> '' and lower(m.email) = v_email));

    if v_other_admins < 1 then
      return 'last_admin';
    end if;
  end if;

  delete from public.trip_members m
  where m.family_code = p_code
    and (m.user_id = auth.uid() or (v_email <> '' and lower(m.email) = v_email));

  return 'left';
end;
$$;

grant execute on function public.leave_trip(text) to authenticated;

-- 8. Recharger le schéma PostgREST
notify pgrst, 'reload schema';
