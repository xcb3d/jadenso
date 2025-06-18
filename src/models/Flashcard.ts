import { ObjectId } from 'mongodb';

/**
 * Model cho flashcard
 */
export interface Flashcard {
  _id?: ObjectId;
  userId: ObjectId;
  front: string; // Mặt trước của flashcard (ví dụ: từ tiếng Nhật)
  back: string; // Mặt sau của flashcard (ví dụ: nghĩa tiếng Việt)
  example?: string; // Câu ví dụ sử dụng từ
  pronunciation?: string; // Cách đọc (furigana cho từ tiếng Nhật)
  tags: string[]; // Nhãn để phân loại (ví dụ: 'N5', 'động từ', 'thức ăn', 'bài 2')
  createdAt: Date;
  lastReviewedAt?: Date;
  nextReviewAt?: Date; // Ngày giờ nên ôn tập lại (cho spaced repetition)
  
  // Trường dữ liệu dành cho spaced repetition
  box: number; // Box number trong hệ thống Leitner (0-5)
  reviewCount: number; // Số lần đã ôn tập
  
  // Trường theo dõi tiến độ
  correct: number; // Số lần trả lời đúng
  incorrect: number; // Số lần trả lời sai
}

/**
 * Kiểu dữ liệu chứa thông tin về một deck flashcard
 */
export interface FlashcardDeck {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  description?: string;
  tags: string[];
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
}

/**
 * Liên kết giữa flashcard và deck
 */
export interface FlashcardDeckMap {
  _id?: ObjectId;
  deckId: ObjectId;
  cardId: ObjectId;
  addedAt: Date;
} 