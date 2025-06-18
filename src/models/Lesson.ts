import { ObjectId } from 'mongodb';

export interface Lesson {
  _id?: ObjectId;
  unitId: ObjectId;
  title: string;
  description: string;
  order: number;
  exercises: ObjectId[];
  skills: string[]; // ["vocabulary", "grammar", "listening", etc.]
  difficulty: string; // "easy", "medium", "hard"
  xpReward: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 