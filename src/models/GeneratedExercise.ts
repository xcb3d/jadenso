import { ObjectId } from "mongodb";
import { ExerciseType } from "./Exercise";

/**
 * Model bài tập được tạo bởi AI
 */
export interface GeneratedExercise {
  _id?: ObjectId;
  sessionId: ObjectId;
  userId: ObjectId;
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
    proficiencyLevel: string;
    audioUrl?: string;
    audioText?: string;
    imageUrl?: string;
    [key: string]: string | number | boolean | string[] | undefined;
  };
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Model phiên tạo bài tập
 */
export interface ExerciseSession {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  description: string;
  exerciseCount: number;
  proficiencyLevel: string;
  createdAt: Date;
  updatedAt: Date;
  vocabulary: string;
} 