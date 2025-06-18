import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  username: string;
  password?: string;
  displayName?: string;
  avatarUrl?: string;
  settings: {
    targetLanguage: string;
    nativeLanguage: string;
    dailyGoal: number;
  };
  stats: {
    totalXP: number;
    streak: number;
    totalLessonsCompleted: number;
  };
  createdAt: Date;
  lastActivity: Date;
  updatedAt: Date;
  xp: number;
  streak: number;
}

export const DEFAULT_USER_SETTINGS = {
  targetLanguage: 'japanese',
  nativeLanguage: 'vietnamese',
  dailyGoal: 50, // XP points
};

export const DEFAULT_USER_STATS = {
  totalXP: 0,
  streak: 0,
  totalLessonsCompleted: 0,
}; 