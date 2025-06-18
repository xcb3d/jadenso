'use server';

import { findLessonById } from '@/repositories/lessonRepository';
import { findExercisesByLessonId } from '@/repositories/exerciseRepository';
import { PlainLesson, PlainExercise } from '@/models/PlainTypes';

export async function getLessonWithExercises(lessonId: string): Promise<{ lesson: PlainLesson | null; exercises: PlainExercise[] }> {
  try {
    const lesson = await findLessonById(lessonId);
    const exercises = lesson ? await findExercisesByLessonId(lessonId) : [];
    
    // Chuyển đổi các đối tượng MongoDB thành plain objects
    const plainLesson = lesson ? {
      ...lesson,
      _id: lesson._id?.toString() || '',
      unitId: lesson.unitId?.toString() || '',
      createdAt: lesson.createdAt instanceof Date ? lesson.createdAt.toISOString() : undefined,
      updatedAt: lesson.updatedAt instanceof Date ? lesson.updatedAt.toISOString() : undefined,
    } as PlainLesson : null;
    
    const plainExercises = exercises.map(exercise => ({
      ...exercise,
      _id: exercise._id?.toString() || '',
      lessonId: exercise.lessonId ? exercise.lessonId.toString() : undefined,
      createdAt: exercise.createdAt instanceof Date ? exercise.createdAt.toISOString() : undefined,
      updatedAt: exercise.updatedAt instanceof Date ? exercise.updatedAt.toISOString() : undefined,
    } as PlainExercise));
    
    return { 
      lesson: plainLesson, 
      exercises: plainExercises 
    };
  } catch (error) {
    console.error(`Error getting lesson with exercises for lesson ${lessonId}:`, error);
    return { lesson: null, exercises: [] };
  }
} 