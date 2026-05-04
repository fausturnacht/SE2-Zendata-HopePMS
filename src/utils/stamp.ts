import { supabase } from '../lib/supabase';

export const createStamp = async (action: string) => {
  const { data } = await supabase.auth.getUser();
  let userIdentifier = 'System';
  
  if (data?.user) {
    userIdentifier = data.user.email?.split('@')[0] || data.user.id.substring(0, 8);
  }

  // Format: "YYYY-MM-DD HH:mm"
  const dateStr = new Date().toISOString().slice(0, 16).replace('T', ' ');
  
  return `${action} ${userIdentifier} ${dateStr}`;
};
