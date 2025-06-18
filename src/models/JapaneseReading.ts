import { ObjectId } from "mongodb";
import { JapaneseWord } from "@/data/reading-data";

/**
 * Model bài đọc được tạo bởi AI
 */
export interface JapaneseReading {
  _id?: ObjectId;
  userId: ObjectId;
  title: string;
  level: string;  // Cấp độ JLPT (N5, N4, N3, N2, N1)
  content: JapaneseWord[];
  vocabulary: string;  // Từ vựng được sử dụng để tạo bài đọc
  prompt?: string;     // Prompt gợi ý chủ đề
  grammarPoints?: string[];  // Các điểm ngữ pháp trong bài đọc
  createdAt: Date;
  updatedAt: Date;
} 