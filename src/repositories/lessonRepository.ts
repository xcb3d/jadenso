import { COLLECTIONS, getCollection, toObjectId, now } from '../infrastructure/db/collections';
import { Lesson } from '@/models/Lesson';

export async function findLessonById(id: string): Promise<Lesson | null> {
  try {
    const objectId = toObjectId(id);
    
    const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
    const lesson = await collection.findOne({ _id: objectId });
    
    return lesson;
  } catch (error) {
    console.error(`Error in findLessonById:`, error);
    return null;
  }
}

export async function findLessonsByUnitId(unitId: string): Promise<Lesson[]> {
  try {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
    const lessons = await collection.find({ unitId: toObjectId(unitId) }).sort({ order: 1 }).toArray();
    
    return lessons;
  } catch (error) {
    console.error(`Error in findLessonsByUnitId:`, error);
    return [];
  }
}

export async function findLessonsBySkill(skill: string): Promise<Lesson[]> {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
  return collection.find({ skills: skill, isActive: true }).sort({ order: 1 }).toArray();
}

export async function createLesson(lesson: Lesson): Promise<string | null> {
  try {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
    const result = await collection.insertOne(lesson);
    
    return result.insertedId.toString();
  } catch (error) {
    console.error(`Error in createLesson:`, error);
    return null;
  }
}

export async function updateLesson(id: string, update: Partial<Lesson>): Promise<boolean> {
  try {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
  const result = await collection.updateOne(
    { _id: toObjectId(id) },
      { $set: update }
  );
  
  return result.modifiedCount > 0;
  } catch (error) {
    console.error(`Error in updateLesson:`, error);
    return false;
  }
}

export async function addExerciseToLesson(lessonId: string, exerciseId: string): Promise<boolean> {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(lessonId) },
    { 
      $push: { exercises: toObjectId(exerciseId) },
      $set: { updatedAt: now() }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteLesson(id: string): Promise<boolean> {
  try {
  const collection = await getCollection<Lesson>(COLLECTIONS.LESSONS);
  const result = await collection.deleteOne({ _id: toObjectId(id) });
  
  return result.deletedCount > 0;
  } catch (error) {
    console.error(`Error in deleteLesson:`, error);
    return false;
  }
} 