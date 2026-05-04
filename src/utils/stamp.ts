import { supabase } from '../lib/supabase';
import { getNowGMT8 } from './dateUtils';

export const createStamp = async (action: string) => {
  const { data } = await supabase.auth.getUser();
  let userIdentifier = 'System';
  
  if (data?.user) {
    userIdentifier = data.user.email?.split('@')[0] || data.user.id.substring(0, 8);
  }

  const formattedDate = getNowGMT8();
  
  return `${action} ${userIdentifier} ${formattedDate}`;
};
