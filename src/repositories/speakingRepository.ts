import clientPromise from '@/infrastructure/db/mongodb';
import { Db } from 'mongodb';
import { ObjectId } from 'mongodb';
import { SpeakingExercise, SpeakingAttempt } from '@/models/SpeakingExercise';

// Helper function to get database connection
async function connectToDatabase(): Promise<{ db: Db }> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || 'japanese_learning_app');
  return { db };
}

// Get all speaking exercises
export async function getAllSpeakingExercises(): Promise<SpeakingExercise[]> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingExercises')
    .find({})
    .sort({ difficulty: 1, category: 1 })
    .toArray() as SpeakingExercise[];
}

// Get speaking exercises by difficulty
export async function getSpeakingExercisesByDifficulty(difficulty: string): Promise<SpeakingExercise[]> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingExercises')
    .find({ difficulty })
    .sort({ category: 1 })
    .toArray() as SpeakingExercise[];
}

// Get speaking exercises by category
export async function getSpeakingExercisesByCategory(category: string): Promise<SpeakingExercise[]> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingExercises')
    .find({ category })
    .sort({ difficulty: 1 })
    .toArray() as SpeakingExercise[];
}

// Get a single speaking exercise by ID
export async function getSpeakingExerciseById(id: string): Promise<SpeakingExercise | null> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingExercises')
    .findOne({ _id: new ObjectId(id) }) as SpeakingExercise | null;
}

// Save a speaking attempt
export async function saveSpeakingAttempt(attempt: SpeakingAttempt): Promise<ObjectId> {
  const { db } = await connectToDatabase();
  const result = await db
    .collection('speakingAttempts')
    .insertOne({
      ...attempt,
      createdAt: new Date()
    });
  return result.insertedId;
}

// Get speaking attempts by user
export async function getUserSpeakingAttempts(userId: string): Promise<SpeakingAttempt[]> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingAttempts')
    .find({ userId: new ObjectId(userId) })
    .sort({ createdAt: -1 })
    .toArray() as SpeakingAttempt[];
}

// Get speaking attempts by exercise
export async function getExerciseSpeakingAttempts(exerciseId: string): Promise<SpeakingAttempt[]> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingAttempts')
    .find({ exerciseId: new ObjectId(exerciseId) })
    .sort({ createdAt: -1 })
    .toArray() as SpeakingAttempt[];
}

// Get user's latest attempt for a specific exercise
export async function getUserLatestAttemptForExercise(userId: string, exerciseId: string): Promise<SpeakingAttempt | null> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingAttempts')
    .findOne(
      { userId: new ObjectId(userId), exerciseId: new ObjectId(exerciseId) },
      { sort: { createdAt: -1 } }
    ) as SpeakingAttempt | null;
}

// Get user's best attempt for a specific exercise (highest score)
export async function getUserBestAttemptForExercise(userId: string, exerciseId: string): Promise<SpeakingAttempt | null> {
  const { db } = await connectToDatabase();
  return await db
    .collection('speakingAttempts')
    .findOne(
      { userId: new ObjectId(userId), exerciseId: new ObjectId(exerciseId) },
      { sort: { score: -1 } }
    ) as SpeakingAttempt | null;
}

// Create a new speaking exercise
export async function createSpeakingExercise(exercise: Omit<SpeakingExercise, '_id' | 'createdAt' | 'updatedAt'>): Promise<ObjectId> {
  const { db } = await connectToDatabase();
  const now = new Date();
  const result = await db
    .collection('speakingExercises')
    .insertOne({
      ...exercise,
      createdAt: now,
      updatedAt: now
    });
  return result.insertedId;
} 