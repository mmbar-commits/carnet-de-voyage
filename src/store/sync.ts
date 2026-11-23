import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthUser,
  MemberRole,
  TripAccessRole,
  TripMember,
  TripState,
} from '../types/trip';
import { isValidTripState, migrateTripState } from './storage';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || '';
const SUPABASE_ANON_KEY =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() || '';

let cachedClient: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}

async function getSupabaseClient(): Promise<SupabaseClient | null> {
  if (!isSupabaseConfigured()) return null;
  if (!cachedClient) {
    const { createClient } = await import('@supabase/supabase-js');
    cachedClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return cachedClient;
}

export function normalizeFamilyCode(raw: string): string {
  return raw
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
    .slice(0, 32);
}

// ---------------------------------------------------------------------------
// Auth (Option A — Supabase Auth)
// ---------------------------------------------------------------------------

function mapUser(u: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  if (!u || !u.id || !u.email) return null;
  return { id: u.id, email: u.email.toLowerCase() };
}

export async function getCurrentAuthUser(): Promise<AuthUser | null> {
  const client = await getSupabaseClient();
  if (!client) return null;
  const { data } = await client.auth.getSession();
  return mapUser(data.session?.user);
}

export function subscribeAuthState(onChange: (user: AuthUser | null) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};
  let active = true;
  let unsubscribeFn: (() => void) | null = null;

  void getSupabaseClient().then((client) => {
    if (!active || !client) return;
    const { data } = client.auth.onAuthStateChange((_event, session) => {
      onChange(mapUser(session?.user));
    });
    unsubscribeFn = () => data.subscription.unsubscribe();
  });

  return () => {
    active = false;
    if (unsubscribeFn) unsubscribeFn();
  };
}

export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error?: string }> {
  const client = await getSupabaseClient();
  if (!client) return { user: null, error: 'Supabase non configuré.' };

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { user: null, error: error.message };
  return { user: mapUser(data.user) };
}

export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; needsConfirmation?: boolean; error?: string }> {
  const client = await getSupabaseClient();
  if (!client) return { user: null, error: 'Supabase non configuré.' };

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

  const { data, error } = await client.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });

  if (error) return { user: null, error: error.message };
  return {
    user: mapUser(data.user),
    needsConfirmation: !data.session,
  };
}

export async function signInWithMagicLink(
  email: string
): Promise<{ ok: boolean; error?: string }> {
  const client = await getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase non configuré.' };

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

  const { error } = await client.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signInWithGoogleOAuth(): Promise<{ ok: boolean; error?: string }> {
  const client = await getSupabaseClient();
  if (!client) return { ok: false, error: 'Supabase non configuré.' };

  const redirectTo =
    typeof window !== 'undefined'
      ? `${window.location.origin}${window.location.pathname}`
      : undefined;

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: redirectTo ? { redirectTo } : undefined,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

export async function signOutAuth(): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

// ---------------------------------------------------------------------------
// Trip Members & Roles (Option A — Postgres RLS: admin / editor / viewer)
// ---------------------------------------------------------------------------

function normalizeMemberRole(raw: unknown): MemberRole {
  if (raw === 'admin') return 'admin';
  if (raw === 'editor') return 'editor';
  return 'viewer';
}

interface MemberRow {
  id: string;
  family_code: string;
  email: string;
  user_id: string | null;
  role: string;
  created_at: string;
}

export interface TripAccessResolution {
  sqlReady: boolean;
  role: TripAccessRole;
  members: TripMember[];
  myTrips: { familyCode: string; role: MemberRole }[];
}

function isMissingSchemaError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes('could not find the function') ||
    lower.includes('could not find the table') ||
    lower.includes('does not exist') ||
    lower.includes('schema cache')
  );
}

export async function resolveTripAccess(
  familyCode: string,
  authUser: AuthUser | null
): Promise<TripAccessResolution> {
  const client = await getSupabaseClient();
  const normalized = normalizeFamilyCode(familyCode);
  if (!client || !normalized) {
    return { sqlReady: true, role: 'unclaimed', members: [], myTrips: [] };
  }

  // Check whether the Option A SQL migration is installed and whether this trip is protected
  const { data: hasMembersData, error: hasMembersErr } = await client.rpc(
    'trip_has_members',
    { p_code: normalized }
  );

  if (hasMembersErr) {
    if (isMissingSchemaError(hasMembersErr.message)) {
      return { sqlReady: false, role: 'unclaimed', members: [], myTrips: [] };
    }
    throw new Error(hasMembersErr.message);
  }

  const tripIsProtected = Boolean(hasMembersData);

  if (!authUser) {
    return {
      sqlReady: true,
      role: tripIsProtected ? 'none' : 'unclaimed',
      members: [],
      myTrips: [],
    };
  }

  // Link any pending email invitations to this authenticated user
  const { data: linkedRows, error: linkErr } = await client.rpc(
    'link_my_trip_memberships'
  );

  if (linkErr) {
    if (isMissingSchemaError(linkErr.message)) {
      return { sqlReady: false, role: 'unclaimed', members: [], myTrips: [] };
    }
    throw new Error(linkErr.message);
  }

  const myTrips: { familyCode: string; role: MemberRole }[] = Array.isArray(linkedRows)
    ? linkedRows
        .filter(
          (r): r is { family_code: string; role: string } =>
            Boolean(r && typeof r.family_code === 'string')
        )
        .map((r) => ({
          familyCode: r.family_code,
          role: normalizeMemberRole(r.role),
        }))
    : [];

  const currentTripMembership = myTrips.find((m) => m.familyCode === normalized);

  if (!currentTripMembership) {
    return {
      sqlReady: true,
      role: tripIsProtected ? 'none' : 'unclaimed',
      members: [],
      myTrips,
    };
  }

  // Fetch members visible to this trip member
  const { data: memberRows, error: membersErr } = await client
    .from('trip_members')
    .select('id, family_code, email, user_id, role, created_at')
    .eq('family_code', normalized)
    .order('created_at', { ascending: true });

  if (membersErr) {
    throw new Error(membersErr.message);
  }

  const members: TripMember[] = ((memberRows ?? []) as MemberRow[]).map((row) => ({
    id: row.id,
    familyCode: row.family_code,
    email: row.email,
    userId: row.user_id,
    role: normalizeMemberRole(row.role),
    createdAt: row.created_at,
  }));

  return {
    sqlReady: true,
    role: currentTripMembership.role,
    members,
    myTrips,
  };
}

export async function claimTripAsAdmin(familyCode: string): Promise<TripAccessRole> {
  const client = await getSupabaseClient();
  const normalized = normalizeFamilyCode(familyCode);
  if (!client || !normalized) return 'none';

  const { data, error } = await client.rpc('claim_trip_if_unclaimed', {
    p_code: normalized,
  });

  if (error) {
    throw new Error(error.message);
  }

  if (data === 'admin' || data === 'editor' || data === 'viewer') return data;
  return 'none';
}

export async function inviteOrUpdateMember(
  familyCode: string,
  email: string,
  role: MemberRole
): Promise<void> {
  const client = await getSupabaseClient();
  const normalized = normalizeFamilyCode(familyCode);
  const cleanEmail = email.trim().toLowerCase();
  if (!client || !normalized || !cleanEmail) return;

  // Check if member already exists for this trip (case-insensitive)
  const { data: existing } = await client
    .from('trip_members')
    .select('id')
    .eq('family_code', normalized)
    .ilike('email', cleanEmail)
    .maybeSingle<{ id: string }>();

  if (existing?.id) {
    const { error } = await client
      .from('trip_members')
      .update({ role })
      .eq('id', existing.id);
    if (error) throw new Error(error.message);
    return;
  }

  const { error } = await client.from('trip_members').insert({
    family_code: normalized,
    email: cleanEmail,
    role,
  });

  if (error) throw new Error(error.message);
}

export async function updateTripMemberRole(
  memberId: string,
  role: MemberRole
): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) return;
  const { error } = await client
    .from('trip_members')
    .update({ role })
    .eq('id', memberId);
  if (error) throw new Error(error.message);
}

export async function deleteTripMember(memberId: string): Promise<void> {
  const client = await getSupabaseClient();
  if (!client) return;
  const { error } = await client.from('trip_members').delete().eq('id', memberId);
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------------------
// Trip State Realtime Sync
// ---------------------------------------------------------------------------

interface SyncRow {
  family_code: string;
  payload: unknown;
  updated_at: string;
}

export async function pullRemoteState(familyCode: string): Promise<TripState | null> {
  const client = await getSupabaseClient();
  const normalized = normalizeFamilyCode(familyCode);
  if (!client || !normalized) return null;

  const { data, error } = await client
    .from('trip_sync')
    .select('family_code, payload, updated_at')
    .eq('family_code', normalized)
    .maybeSingle<SyncRow>();

  if (error) {
    throw new Error(error.message);
  }

  if (data && isValidTripState(data.payload)) {
    return migrateTripState(data.payload, normalized);
  }

  return null;
}

export async function pushRemoteState(familyCode: string, state: TripState): Promise<void> {
  const client = await getSupabaseClient();
  const normalized = normalizeFamilyCode(familyCode);
  if (!client || !normalized) return;

  const { error } = await client.from('trip_sync').upsert(
    {
      family_code: normalized,
      payload: state,
      updated_at: state.updatedAt,
    },
    { onConflict: 'family_code' }
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function subscribeToFamilySync(
  familyCode: string,
  onRemoteState: (remote: TripState) => void
): () => void {
  const normalized = normalizeFamilyCode(familyCode);
  if (!isSupabaseConfigured() || !normalized) return () => {};

  let active = true;
  let channel: RealtimeChannel | null = null;
  let activeClient: SupabaseClient | null = null;

  void getSupabaseClient().then((client) => {
    if (!active || !client) return;
    activeClient = client;
    channel = client
      .channel(`trip-sync-${normalized}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'trip_sync',
          filter: `family_code=eq.${normalized}`,
        },
        (payload) => {
          const nextRow = payload.new as Partial<SyncRow> | undefined;
          if (nextRow && isValidTripState(nextRow.payload)) {
            onRemoteState(migrateTripState(nextRow.payload, normalized));
          }
        }
      )
      .subscribe();
  });

  return () => {
    active = false;
    if (activeClient && channel) {
      void activeClient.removeChannel(channel);
    }
  };
}
