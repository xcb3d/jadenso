import { Exercise } from './Exercise';
import { Lesson } from './Lesson';

export interface PlainExercise extends Omit<Exercise, '_id' | 'lessonId' | 'createdAt' | 'updatedAt'> {
  _id: string;
  lessonId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlainLesson extends Omit<Lesson, '_id' | 'unitId' | 'createdAt' | 'updatedAt'> {
  _id: string;
  unitId: string;
  createdAt?: string;
  updatedAt?: string;
} 