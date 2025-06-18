'use server';

import { findAllUnits, findUnitById } from '@/repositories/unitRepository';
import { findLessonsByUnitId } from '@/repositories/lessonRepository';
import { Unit } from '@/models/Unit';
import { Lesson } from '@/models/Lesson';

// Helper function to convert MongoDB objects to plain objects
function convertToPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

export async function getUnits(): Promise<Unit[]> {
  try {
    const units = await findAllUnits();
    // Convert MongoDB objects to plain objects
    return convertToPlainObject(units);
  } catch (error) {
    console.error('Error getting units:', error);
    return [];
  }
}

export async function getUnitWithLessons(unitId: string): Promise<{ unit: Unit | null; lessons: Lesson[] }> {
  try {
    const unit = await findUnitById(unitId);
    const lessons = unit ? await findLessonsByUnitId(unitId) : [];
    
    // Convert MongoDB objects to plain objects
    return convertToPlainObject({ unit, lessons });
  } catch (error) {
    console.error(`Error getting unit with lessons for unit ${unitId}:`, error);
    return { unit: null, lessons: [] };
  }
} 