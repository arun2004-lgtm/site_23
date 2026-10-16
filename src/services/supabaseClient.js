import { createClient } from '@supabase/supabase-js';
import { initialBatchmates } from '../data/batchData.js';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
const SUPABASE_URL = env.VITE_SUPABASE_URL || 'https://drpjcnanbntscabnocvd.supabase.co';
const SUPABASE_ANON_KEY = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_bQ7SwKgJ8vj5x5QoprBUaA_JtY-ePUx';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

/**
 * Convert frontend camelCase object to Postgres snake_case row
 */
export function toDbRow(member) {
  const row = {
    id: member.id,
    name: member.name,
    updated_at: new Date().toISOString()
  };

  if (member.regNo !== undefined) row.reg_no = member.regNo;
  if (member.nickname !== undefined) row.nickname = member.nickname;
  if (member.birthday !== undefined) row.birthday = member.birthday;
  if (member.photo !== undefined) row.photo = member.photo;
  if (member.role !== undefined) row.role = member.role;
  if (member.department !== undefined) row.department = member.department;
  if (member.quote !== undefined) row.quote = member.quote;
  if (member.universityEmail !== undefined) row.university_email = member.universityEmail;
  if (member.personalEmail !== undefined) row.personal_email = member.personalEmail;
  if (member.detailsPending !== undefined) row.details_pending = member.detailsPending;
  if (member.social !== undefined) row.social = member.social;

  return row;
}

/**
 * Convert Postgres snake_case row to frontend camelCase member object
 */
export function fromDbRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    regNo: row.reg_no || '',
    name: row.name || '',
    nickname: row.nickname || '',
    birthday: row.birthday || '',
    photo: row.photo || '',
    role: row.role || 'Batchmate',
    department: row.department || 'Faculty of Engineering, University of Peradeniya',
    quote: row.quote || '',
    universityEmail: row.university_email || '',
    personalEmail: row.personal_email || '',
    detailsPending: !!row.details_pending,
    social: row.social || {},
    updatedAt: row.updated_at
  };
}

/**
 * Fetch all batchmates from Supabase.
 * If cloud database is empty, automatically seed initialBatchmates into the cloud!
 */
export async function fetchBatchmatesFromCloud() {
  try {
    const { data, error } = await supabase
      .from('batchmates')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.warn('Could not load from Supabase cloud database, using local fallback:', error.message);
      return null;
    }

    // Auto-seed cloud database if table is newly created / empty
    if (!data || data.length === 0) {
      console.log('⚡ Initializing cloud database with official E/23 batch roster...');
      const seedRows = initialBatchmates.map(toDbRow);
      const { data: seededData, error: seedError } = await supabase
        .from('batchmates')
        .upsert(seedRows)
        .select();

      if (seedError) {
        console.error('Failed to seed cloud database:', seedError);
        return initialBatchmates;
      }
      return (seededData || []).map(fromDbRow);
    }

    return data.map(fromDbRow);
  } catch (err) {
    console.error('Network error connecting to Supabase cloud:', err);
    return null;
  }
}

/**
 * Persist member update to Supabase cloud
 */
export async function updateMemberInCloud(id, safeUpdates) {
  try {
    const row = toDbRow({ ...safeUpdates, id });
    const { data, error } = await supabase
      .from('batchmates')
      .update(row)
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase update failed:', error.message);
      return false;
    }
    return data && data.length > 0 ? fromDbRow(data[0]) : true;
  } catch (err) {
    console.error('Network error updating member in cloud:', err);
    return false;
  }
}

/**
 * Insert new member in Supabase cloud
 */
export async function insertMemberInCloud(member) {
  try {
    const row = toDbRow(member);
    const { data, error } = await supabase
      .from('batchmates')
      .insert([row])
      .select();

    if (error) {
      console.error('Supabase insert failed:', error.message);
      return false;
    }
    return data && data.length > 0 ? fromDbRow(data[0]) : true;
  } catch (err) {
    console.error('Network error inserting member in cloud:', err);
    return false;
  }
}

/**
 * Delete member in Supabase cloud
 */
export async function deleteMemberInCloud(id) {
  try {
    const { error } = await supabase
      .from('batchmates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete failed:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('Network error deleting member in cloud:', err);
    return false;
  }
}

/**
 * Subscribe to real-time Postgres changes so all connected devices update live!
 */
export function subscribeToBatchmateRealtime(onInsert, onUpdate, onDelete) {
  try {
    const channel = supabase
      .channel('batchmates-live-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'batchmates' },
        (payload) => {
          if (onInsert && payload.new) onInsert(fromDbRow(payload.new));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'batchmates' },
        (payload) => {
          if (onUpdate && payload.new) onUpdate(fromDbRow(payload.new));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'batchmates' },
        (payload) => {
          if (onDelete && payload.old) onDelete(payload.old.id);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Could not establish Supabase Realtime channel:', err);
    return () => {};
  }
}
