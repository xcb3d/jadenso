'use server';

import { Db } from 'mongodb';
import clientPromise from './mongodb';

// Export hàm connectToDatabase để sử dụng trong server actions
export async function connectToDatabase(): Promise<{ db: Db }> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'japanese_learning_app');
  return { db };
} 