import { ObjectId } from 'mongodb';

/**
 * Trạng thái của một bài học
 */
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * Model theo dõi tiến độ một bài học
 */
export interface LessonProgress {
  lessonId: ObjectId;
  status: LessonStatus;
  score?: number;
  startedAt?: Date;
  completedAt?: Date;
}

/**
 * Model theo dõi tiến độ một đơn vị học
 */
export interface UnitProgress {
  unitId: ObjectId;
  completed: boolean;
  unlockedAt: Date;
  completedAt?: Date;
}

/**
 * Model theo dõi một bài tập đã hoàn thành
 */
export interface CompletedExercise {
  exerciseId: ObjectId;
  skillType: string;
  lessonId: ObjectId;
  completedAt: Date;
  lastReviewedAt?: Date;
  reviewCount?: number;
  strength?: number; // Độ thuần thục từ 0-100
}

/**
 * Model theo dõi tiến độ học tập của người dùng
 */
export interface UserProgress {
  _id?: ObjectId;
  userId: ObjectId;
  totalXp: number;
  dailyGoal: number;
  dailyProgress: number; // XP đạt được trong ngày hiện tại
  lastActiveDate?: Date; // Ngày cuối cùng người dùng hoạt động
  lessonProgress: LessonProgress[];
  unitProgress: UnitProgress[];
  completedExercises: CompletedExercise[];
  
  // Thống kê kỹ năng (từ 0-100)
  skills: {
    vocabulary?: number;
    grammar?: number;
    reading?: number;
    listening?: number;
  };
} 