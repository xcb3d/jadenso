import { ObjectId } from 'mongodb';

/**
 * Trạng thái của phiên ôn tập
 */
export type ReviewStatus = 'in_progress' | 'completed';

/**
 * Model cho một lượt làm bài tập
 */
export interface ExerciseAttempt {
  exerciseId: ObjectId;
  answer: string;
  isCorrect: boolean;
  timeSpent: number; // thời gian làm bài (giây)
  attemptedAt: Date;
}

/**
 * Model cho phiên ôn tập
 */
export interface Review {
  _id?: ObjectId;
  userId: ObjectId;
  skills: string[];
  exerciseIds: ObjectId[];
  attempts: ExerciseAttempt[];
  startedAt: Date;
  completedAt?: Date;
  status: ReviewStatus;
  score?: number;
} 