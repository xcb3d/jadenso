import { ObjectId } from 'mongodb';

export type ExerciseType = 
  | 'multiple_choice' 
  | 'fill_in_the_blank' 
  | 'translation' 
  | 'listening' 
  | 'speaking'
  | 'matching';

export interface Exercise {
  _id?: ObjectId;
  lessonId: ObjectId;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  skills: string[];
  difficulty: string; // "easy", "medium", "hard"
  metadata: {
    targetLanguage: string;
    nativeLanguage: string;
    audioUrl?: string;
    audioText?: string;
    imageUrl?: string;
  };
  createdAt: Date;
  updatedAt: Date;
} 