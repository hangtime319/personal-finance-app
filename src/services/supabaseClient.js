import { createClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase para o aplicativo 'Bolso'
 *
 * Consome as variáveis de ambiente expostas pelo Vite:
 * - VITE_SUPABASE_URL: URL base do projeto no Supabase
 * - VITE_SUPABASE_ANON_KEY: Chave pública/anônima (anon key)
 */

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[SupabaseClient] Variáveis de ambiente VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não foram encontradas. ' +
    'Certifique-se de configurar o arquivo .env na raiz do projeto.'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export default supabase;
