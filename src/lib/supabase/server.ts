/**
 * Supabase Server Client
 * For use in Server Components, Route Handlers, and Server Actions
 */

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}
