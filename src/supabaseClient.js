// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// === INÍCIO DO CÓDIGO DE TESTE TEMPORÁRIO ===
console.log("Supabase client initializing...");
console.log("URL from env:", import.meta.env.VITE_SUPABASE_URL);
console.log("Key from env:", import.meta.env.VITE_SUPABASE_ANON_KEY);
// === FIM DO CÓDIGO DE TESTE TEMPORÁRIO ===

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);