import webpush from 'web-push';
import { supabase } from '@/lib/supabase';

// Log pentru debugging (șterge după ce rezolvi problema)
console.log("VAPID Private Key exists:", !!process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY);

// Configurăm web-push cu cheile VAPID
webpush.setVapidDetails(
  'mailto:iosifscrepy@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
  process.env.NEXT_PUBLIC_VAPID_PRIVATE_KEY
); 

// Restul codului... 