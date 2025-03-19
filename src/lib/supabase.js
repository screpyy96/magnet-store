import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Creează o singură instanță a clientului, care va fi exportată
export const supabase = createClientComponentClient() 