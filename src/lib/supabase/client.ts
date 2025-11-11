/**
 * Supabase Browser Client
 * For use in client components and browser-side code
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from './database.types';

export function createClient() {
  return createClientComponentClient<Database>();
}

// Export a singleton instance for convenience
export const supabase = createClient();
