import { ObjectId } from 'mongodb';
import { getCollection, COLLECTIONS, now, toObjectId } from '@/infrastructure/db/collections';
import { JapaneseReading } from '@/models/JapaneseReading';
import { JapaneseWord } from '@/data/reading-data';

/**
 * Tạo một bài đọc mới
 * @param userId ID người dùng
 * @param title Tiêu đề bài đọc
 * @param level Cấp độ JLPT
 * @param content Nội dung bài đọc
 * @param vocabulary Từ vựng được sử dụng để tạo bài đọc
 * @param prompt Prompt gợi ý
 * @param grammarPoints Các điểm ngữ pháp trong bài đọc
 * @returns Bài đọc đã được tạo
 */
export async function createReading(
  userId: ObjectId | string,
  title: string,
  level: string,
  content: JapaneseWord[],
  vocabulary: string,
  prompt?: string,
  grammarPoints?: string[],
): Promise<JapaneseReading> {
  const userIdObj = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const timestamp = now();
  const reading: Omit<JapaneseReading, '_id'> = {
    userId: userIdObj,
    title,
    level,
    content,
    vocabulary,
    prompt,
    grammarPoints,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  const collection = await getCollection<JapaneseReading>(COLLECTIONS.JAPANESE_READINGS);
  const result = await collection.insertOne(reading);
  
  return {
    ...reading,
    _id: result.insertedId
  };
}

/**
 * Lấy danh sách bài đọc của người dùng
 * @param userId ID người dùng
 * @returns Danh sách bài đọc
 */
export async function getReadingsByUserId(userId: ObjectId | string): Promise<JapaneseReading[]> {
  const userIdObj = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const collection = await getCollection<JapaneseReading>(COLLECTIONS.JAPANESE_READINGS);
  return collection.find({ userId: userIdObj }).sort({ createdAt: -1 }).toArray();
}

/**
 * Lấy thông tin một bài đọc
 * @param readingId ID bài đọc
 * @returns Thông tin bài đọc
 */
export async function getReadingById(readingId: ObjectId | string): Promise<JapaneseReading | null> {
  const readingIdObj = typeof readingId === 'string' ? toObjectId(readingId) : readingId;
  
  const collection = await getCollection<JapaneseReading>(COLLECTIONS.JAPANESE_READINGS);
  return collection.findOne({ _id: readingIdObj });
}

/**
 * Xóa một bài đọc
 * @param readingId ID bài đọc
 * @returns Kết quả xóa
 */
export async function deleteReading(readingId: ObjectId | string): Promise<boolean> {
  const readingIdObj = typeof readingId === 'string' ? toObjectId(readingId) : readingId;
  
  const collection = await getCollection<JapaneseReading>(COLLECTIONS.JAPANESE_READINGS);
  const result = await collection.deleteOne({ _id: readingIdObj });
  
  return result.deletedCount > 0;
} 