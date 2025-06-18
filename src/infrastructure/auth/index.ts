'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
 
// Export hàm auth để sử dụng trong server actions
export const auth = async () => {
  return await getServerSession(authOptions);
}; 