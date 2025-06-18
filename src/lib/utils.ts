import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ObjectId } from 'mongodb';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Normalizes MongoDB ObjectId or string ID to a consistent string format for comparison
 * @param id The ID to normalize (can be string, ObjectId, or undefined)
 * @returns A normalized string ID or null if invalid
 */
export function normalizeId(id: string | ObjectId | undefined): string | null {
  if (!id) return null;
  const idStr = id.toString();
  // MongoDB ObjectIds are 24 characters long
  return idStr.length === 24 ? idStr : null;
}

/**
 * Chuyển đổi ObjectId thành string trong nested object
 * Giúp tránh lỗi "Objects with toJSON methods are not supported"
 * khi truyền dữ liệu từ Server Components sang Client Components
 */
export function convertToPlainObject<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
} 