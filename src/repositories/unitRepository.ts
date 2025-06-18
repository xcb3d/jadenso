import { COLLECTIONS, getCollection, toObjectId, now } from '../infrastructure/db/collections';
import { Unit } from '../models/Unit';

export async function findUnitById(id: string): Promise<Unit | null> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  return collection.findOne({ _id: toObjectId(id) });
}

export async function findAllUnits(): Promise<Unit[]> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  return collection.find({}).sort({ order: 1 }).toArray();
}

export async function findActiveUnits(): Promise<Unit[]> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  return collection.find({ isActive: true }).sort({ order: 1 }).toArray();
}

export async function createUnit(unit: Omit<Unit, '_id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  
  const newUnit: Unit = {
    ...unit,
    createdAt: now(),
    updatedAt: now(),
  };
  
  const result = await collection.insertOne(newUnit);
  return { ...newUnit, _id: result.insertedId };
}

export async function updateUnit(id: string, update: Partial<Unit>): Promise<boolean> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  
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

export async function addLessonToUnit(unitId: string, lessonId: string): Promise<boolean> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  
  const result = await collection.updateOne(
    { _id: toObjectId(unitId) },
    { 
      $push: { lessons: toObjectId(lessonId) },
      $set: { updatedAt: now() }
    }
  );
  
  return result.modifiedCount > 0;
}

export async function deleteUnit(id: string): Promise<boolean> {
  const collection = await getCollection<Unit>(COLLECTIONS.UNITS);
  
  const result = await collection.deleteOne({ _id: toObjectId(id) });
  
  return result.deletedCount > 0;
} 