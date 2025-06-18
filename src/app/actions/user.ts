'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { findUserByEmail } from '@/repositories/userRepository';
import { getUserProgress as getProgress, createUserProgress } from '@/repositories/userProgressRepository';
import { User } from '@/models/User';
import { UserProgress } from '@/models/UserProgress';
import { ObjectId } from 'mongodb';
import { convertToPlainObject } from '@/lib/utils';

/**
 * Lấy thông tin người dùng hiện tại từ session
 * @returns Thông tin người dùng
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    // Lấy session từ next-auth
    const session = await getServerSession(authOptions);
    
    // Nếu không có session hoặc email, trả về null
    if (!session?.user?.email) {
      return null;
    }
    
    // Tìm user trong database
    const user = await findUserByEmail(session.user.email);
    
    return user ? convertToPlainObject(user) : null;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Lấy tiến độ học tập của người dùng hiện tại
 * @returns Tiến độ học tập
 */
export async function getUserProgress(): Promise<UserProgress | null> {
  try {
    // Lấy thông tin người dùng hiện tại
    const user = await getCurrentUser();
    
    if (!user || !user._id) {
      return null;
    }
    
    // Lấy tiến độ học tập
    let progress = await getProgress(new ObjectId(user._id));
    
    // Nếu chưa có tiến độ, tạo mới
    if (!progress) {
      progress = await createUserProgress(new ObjectId(user._id));
    }
    
    return progress ? convertToPlainObject(progress) : null;
  } catch (error) {
    console.error('Error in getUserProgress:', error);
    return null;
  }
} 