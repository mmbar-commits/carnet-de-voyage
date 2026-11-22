import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js';
import type { TripState } from '../types/trip';
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
      auth: { persistSession: false },
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
    return migrateTripState(data.payload);
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
            onRemoteState(migrateTripState(nextRow.payload));
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
