import { ObjectId } from 'mongodb';

export interface Unit {
  _id?: ObjectId;
  title: string;
  description: string;
  order: number;
  courseId?: ObjectId;
  lessons: ObjectId[];
  difficulty: string; // "beginner", "intermediate", "advanced"
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 