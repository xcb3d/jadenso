import { Collection, Document, ObjectId } from 'mongodb';
import clientPromise from './mongodb';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  UNITS: 'units',
  LESSONS: 'lessons',
  EXERCISES: 'exercises',
  REVIEWS: 'reviews',
  USER_PROGRESS: 'userProgress',
  GENERATED_EXERCISES: 'generatedExercises',
  EXERCISE_SESSIONS: 'exerciseSessions',
  JAPANESE_READINGS: 'japaneseReadings',
  FLASH_CARDS: 'flashCards',
  FLASH_CARD_DECKS: 'flashCardDecks',
  FLASH_CARD_DECK_MAPS: 'flashCardDeckMaps',
};

// Helper function to get collection
export async function getCollection<T extends Document>(collectionName: string): Promise<Collection<T>> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB_NAME || 'japanese_learning_app');
  return db.collection<T>(collectionName);
}

// Helper function to convert string to ObjectId
export function toObjectId(id: string): ObjectId {
  try {
    return new ObjectId(id);
  } catch {
    console.error(`Invalid ObjectId: ${id}`);
    throw new Error(`Invalid ObjectId: ${id}`);
  }
}

// Helper function to handle MongoDB dates
export function toISODate(date: Date): string {
  return date.toISOString();
}

// Helper function to create a new date
export function now(): Date {
  return new Date();
} 