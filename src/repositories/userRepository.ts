import { COLLECTIONS, getCollection, toObjectId, now } from '../infrastructure/db/collections';
import { User, DEFAULT_USER_SETTINGS, DEFAULT_USER_STATS } from '../models/User';

export async function findUserByEmail(email: string): Promise<User | null> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  return collection.findOne({ email });
}

export async function findUserById(id: string): Promise<User | null> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  return collection.findOne({ _id: toObjectId(id) });
}

export async function createUser(user: Omit<User, '_id' | 'settings' | 'stats'>): Promise<User> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  
  const newUser: User = {
    ...user,
    settings: DEFAULT_USER_SETTINGS,
    stats: DEFAULT_USER_STATS,
    createdAt: user.createdAt || now(),
    updatedAt: user.updatedAt || now(),
    lastActivity: user.lastActivity || now(),
  };
  
  const result = await collection.insertOne(newUser);
  return { ...newUser, _id: result.insertedId };
}

export async function updateUser(id: string, update: Partial<User>): Promise<boolean> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { 
      $set: { 
        ...update,
        updatedAt: now() 
      } 
    }
  );
  
  return result.modifiedCount > 0;
}

export async function updateUserStats(id: string, xpEarned: number, lessonCompleted: boolean = false): Promise<boolean> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateFields: any = {
    'stats.totalXP': xpEarned,
    xp: xpEarned,
    updatedAt: now()
  };
  
  if (lessonCompleted) {
    updateFields['stats.totalLessonsCompleted'] = 1;
  }
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { $inc: updateFields }
  );
  
  return result.modifiedCount > 0;
}

export async function updateUserStreak(id: string): Promise<boolean> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { 
      $inc: { 
        'stats.streak': 1,
        streak: 1 
      },
      $set: { 
        updatedAt: now(),
        lastActivity: now()
      }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function resetUserStreak(id: string): Promise<boolean> {
  const collection = await getCollection<User>(COLLECTIONS.USERS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
    { 
      $set: { 
        'stats.streak': 0,
        streak: 0,
        updatedAt: now() 
      } 
    }
  );
  
  return result.modifiedCount > 0;
} 