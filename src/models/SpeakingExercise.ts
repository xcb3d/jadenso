import { ObjectId } from 'mongodb';

export interface SpeakingExercise {
  _id?: ObjectId;
  text: string;
  translation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  audioUrl?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  isCustom?: boolean;
  userId?: string | ObjectId;
}

export interface SpeakingAttempt {
  _id?: ObjectId;
  userId: ObjectId;
  exerciseId: ObjectId;
  audioUrl: string;
  transcription: string;
  score: number;
  accuracy: number;
  pitchAccent: number;
  rhythm: number;
  fluency: number;
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvementTips: string[];
  };
  createdAt: Date;
} 