import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
	const missing = [];
	if (!url) missing.push('VITE_SUPABASE_URL');
	if (!key) missing.push('VITE_SUPABASE_ANON_KEY');
	throw new Error(`Missing Supabase env vars: ${missing.join(' ')}`);
}

const supabase = createClient(url, key);

export default supabase;
