'use server';

import { revalidatePath } from 'next/cache';
import { ObjectId } from 'mongodb';
import { updateLessonProgress, updateDailyProgress, addCompletedExercise, getUserProgress, createUserProgress } from '@/repositories/userProgressRepository';
import { getCurrentUser } from '@/app/actions/user';
import { findLessonById } from '@/repositories/lessonRepository';
import { findExercisesByLessonId } from '@/repositories/exerciseRepository';
import { convertToPlainObject } from '@/lib/utils';
import crypto from 'crypto';
import { getCollection } from '@/infrastructure/db/collections';

// Thêm rate limiting
const userCompletionAttempts = new Map<string, { 
  count: number; 
  lastReset: Date;
}>();

// Thêm logging
interface SecurityLog {
  timestamp: Date;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ip?: string;
}

const securityLogs: SecurityLog[] = [];

// Hàm kiểm tra rate limit
function checkRateLimit(userId: string, maxAttempts = 10): boolean {
  const now = new Date();
  const hourMs = 60 * 60 * 1000;
  
  // Lấy thông tin rate limit của user
  let userLimit = userCompletionAttempts.get(userId);
  
  // Nếu chưa có hoặc đã quá 1 giờ từ lần reset cuối, reset counter
  if (!userLimit || (now.getTime() - userLimit.lastReset.getTime() > hourMs)) {
    userLimit = { count: 0, lastReset: now };
  }
  
  // Tăng counter
  userLimit.count++;
  
  // Lưu lại
  userCompletionAttempts.set(userId, userLimit);
  
  // Kiểm tra xem có vượt quá giới hạn không
  return userLimit.count <= maxAttempts;
}

// Hàm ghi log bảo mật
function logSecurityEvent(
  userId: string, 
  action: string, 
  details: Record<string, unknown>, 
  ip?: string
) {
  const log: SecurityLog = {
    timestamp: new Date(),
    userId,
    action,
    details,
    ip
  };
  
  securityLogs.push(log);
  
  // Trong thực tế, nên lưu log vào database
  console.log(`Security Log: ${action}`, log);
  
  // Giới hạn kích thước mảng log trong memory
  if (securityLogs.length > 1000) {
    securityLogs.shift();
  }
}

// Interface cho session token trong database
interface SessionToken {
  _id?: ObjectId;
  token: string;
  userId: string;
  lessonId: string;
  createdAt: Date;
  exerciseCount: number;
  isUsed: boolean;
}

/**
 * Tạo token xác thực cho phiên học tập
 * @param userId - ID của người dùng
 * @param lessonId - ID của bài học
 * @returns Token xác thực
 */
export async function createLessonSessionToken(userId: string, lessonId: string): Promise<string> {
  try {
    const token = crypto.randomBytes(32).toString('hex');
    
    // Lấy số lượng bài tập trong bài học
    const exercises = await findExercisesByLessonId(lessonId);
    const exerciseCount = exercises.length;
    
    // Lưu token vào database
    const db = await getCollection('sessionTokens');
    await db.insertOne({
      token,
      userId,
      lessonId,
      createdAt: new Date(),
      exerciseCount,
      isUsed: false
    });
    
    // Xóa các token cũ sau 2 giờ
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    await db.deleteMany({ createdAt: { $lt: twoHoursAgo } });
    
    return token;
  } catch (error) {
    console.error('Error creating session token:', error);
    throw error;
  }
}

/**
 * Xác thực token phiên học tập
 * @param token - Token cần xác thực
 * @param userId - ID người dùng
 * @param lessonId - ID bài học
 * @returns Thông tin phiên học tập nếu hợp lệ
 */
async function validateSessionToken(token: string, userId: string, lessonId: string): Promise<SessionToken | null> {
  try {
    const db = await getCollection('sessionTokens');
    
    // Tìm token trong database
    const sessionInfo = await db.findOne({ 
      token,
      userId,
      lessonId,
      isUsed: false
    });
    
    if (!sessionInfo) {
      return null;
    }
    
    // Đánh dấu token đã sử dụng
    await db.updateOne(
      { token },
      { $set: { isUsed: true } }
    );
    
    return sessionInfo as unknown as SessionToken;
  } catch (error) {
    console.error('Error validating session token:', error);
    return null;
  }
}

/**
 * Hoàn thành bài học
 * @param lessonId - ID của bài học
 * @param score - Điểm số đạt được
 * @param exerciseAttempts - Danh sách ID của các bài tập đã thực hiện
 * @param sessionToken - Token xác thực phiên học tập
 * @returns Thông tin kết quả
 */
export async function completeLesson(
  lessonId: string, 
  score: number,
  exerciseAttempts: string[],
  sessionToken: string
) {
  try {
    // Lấy thông tin người dùng hiện tại
    const user = await getCurrentUser();
    
    if (!user || !user._id) {
      throw new Error('Bạn cần đăng nhập để hoàn thành bài học');
    }
    
    const userId = user._id.toString();
    
    // Kiểm tra rate limit
    if (!checkRateLimit(userId)) {
      // Ghi log hành vi đáng ngờ
      logSecurityEvent(userId, 'rate_limit_exceeded', {
        lessonId,
        score,
        exerciseAttemptsCount: exerciseAttempts.length
      });
      
      throw new Error('Bạn đã hoàn thành quá nhiều bài học trong thời gian ngắn. Vui lòng thử lại sau.');
    }
    
    // Debug log
    console.log('Validating session token:', sessionToken);
    
    // Xác thực session token từ database
    const sessionInfo = await validateSessionToken(sessionToken, userId, lessonId);
    
    // Debug log
    console.log('Session validation result:', sessionInfo);
    
    if (!sessionInfo) {
      // Ghi log hành vi đáng ngờ
      logSecurityEvent(userId, 'invalid_session_token', {
        lessonId,
        sessionToken
      });
      
      throw new Error('Phiên học tập không hợp lệ hoặc đã hết hạn');
    }
    
    // Kiểm tra thời gian hoàn thành bài học
    const now = new Date();
    const sessionDuration = now.getTime() - sessionInfo.createdAt.getTime();
    const minTimePerExercise = 3000; // Tối thiểu 3 giây cho mỗi bài tập
    const minExpectedTime = sessionInfo.exerciseCount * minTimePerExercise;
    
    if (sessionDuration < minExpectedTime) {
      // Ghi log hành vi đáng ngờ
      logSecurityEvent(userId, 'suspicious_completion_time', {
        lessonId,
        sessionDuration,
        minExpectedTime,
        exerciseCount: sessionInfo.exerciseCount
      });
      
      throw new Error('Bạn đã hoàn thành bài học quá nhanh. Vui lòng thực hiện đầy đủ các bài tập.');
    }
    
    // Convert user._id to ObjectId
    const userObjectId = new ObjectId(user._id);
    const lessonObjectId = new ObjectId(lessonId);
    
    // Lấy thông tin về bài học
    const lesson = await findLessonById(lessonId);
    
    if (!lesson) {
      throw new Error('Không tìm thấy bài học');
    }
    
    // Đảm bảo lesson._id không undefined
    if (!lesson._id) {
      throw new Error('Bài học không có ID hợp lệ');
    }

    // Lấy các bài tập của bài học
    const exercises = await findExercisesByLessonId(lessonId);
    
    // Kiểm tra xem người dùng đã làm đủ số bài tập chưa
    if (exerciseAttempts.length < exercises.length) {
      throw new Error('Bạn cần hoàn thành tất cả bài tập trước');
    }
    
    // Kiểm tra xem các bài tập đã thực hiện có hợp lệ không
    for (const attemptId of exerciseAttempts) {
      const isValidExercise = exercises.some(ex => ex._id?.toString() === attemptId);
      if (!isValidExercise) {
        throw new Error('Dữ liệu bài tập không hợp lệ');
      }
    }
    
    // Kiểm tra xem điểm số có hợp lý không
    const maxPossibleScore = 100;
    if (score < 0 || score > maxPossibleScore) {
      throw new Error('Điểm số không hợp lệ');
    }
    
    // Kiểm tra xem bài học đã hoàn thành trước đó chưa
    const userProgress = await getUserProgress(userObjectId);
    let alreadyCompleted = false;
    
    if (userProgress) {
      alreadyCompleted = userProgress.lessonProgress.some(
        p => p.lessonId.toString() === lessonId && p.status === 'completed'
      );
    }

    // Tính XP nhận được - nếu đã hoàn thành trước đó thì không nhận XP
    const xpEarned = alreadyCompleted ? 0 : (lesson.xpReward || 10);
    
    // Cập nhật danh sách bài tập đã hoàn thành
    for (const exercise of exercises) {
      if (exercise._id) {
        try {
          await addCompletedExercise(userObjectId, {
            exerciseId: new ObjectId(exercise._id),
            lessonId: lessonObjectId,
            skillType: exercise.skills?.[0] || 'vocabulary',  // Lấy kỹ năng đầu tiên nếu có
            strength: 1,
            completedAt: new Date(),
            reviewCount: 0
          });
        } catch (error) {
          console.error(`Failed to add completed exercise ${exercise._id}:`, error);
        }
      }
    }
    
    // Cập nhật tiến độ người dùng
    try {
      await updateLessonProgress(
        userObjectId,
        lessonObjectId,
        { 
          status: 'completed',
          completedAt: new Date()
        },
        score
      );
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
      throw error;
    }
    
    // Chỉ cập nhật XP hàng ngày nếu bài học chưa hoàn thành trước đó
    if (!alreadyCompleted) {
      try {
        await updateDailyProgress(userObjectId, xpEarned);
      } catch (error) {
        console.error('Failed to update daily progress:', error);
        throw error;
      }
    }
    
    // Xác định unitId để revalidate
    const unitId = lesson.unitId?.toString() || '';
    
    // Revalidate các trang liên quan
    revalidatePath(`/lessons/${lessonId}`);
    revalidatePath(`/units/${unitId}`);
    revalidatePath('/units');
    revalidatePath('/profile');
    
    return { 
      success: true, 
      lessonId,
      unitId, 
      score, 
      xpEarned 
    };
  } catch (error) {
    console.error(`Error completing lesson:`, error);
    throw error;
  }
}

/**
 * Cập nhật tiến độ bài tập
 * @param exerciseId - ID của bài tập
 * @param lessonId - ID của bài học
 * @param correct - Đúng hay sai
 * @returns Kết quả cập nhật
 */
export async function updateExerciseProgress(exerciseId: string, lessonId: string, correct: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user || !user._id) {
      throw new Error('Bạn cần đăng nhập để cập nhật tiến độ');
    }
    
    // Thêm bài tập vào danh sách đã hoàn thành
    await addCompletedExercise(new ObjectId(user._id), {
        exerciseId: new ObjectId(exerciseId),
        lessonId: new ObjectId(lessonId),
      skillType: 'vocabulary',  // Mặc định
      strength: correct ? 1 : 0.5,  // Nếu đúng thì strength cao hơn
        completedAt: new Date(),
        reviewCount: 0
      });
    
    // Revalidate các trang liên quan
    revalidatePath(`/lessons/${lessonId}`);
    
    return { success: true };
  } catch (error) {
    console.error(`Error updating exercise progress:`, error);
    throw error;
  }
}

export async function getUserProgressAction() {
  try {
    const currentUser = await getCurrentUser();
    
    if (!currentUser || !currentUser._id) {
      throw new Error('User not authenticated');
    }

    // Đảm bảo userId là ObjectId
    const userObjectId = typeof currentUser._id === 'string' ? new ObjectId(currentUser._id) : currentUser._id;
    
    let progress = await getUserProgress(userObjectId);

    if (!progress) {
      progress = await createUserProgress(userObjectId);
    }

    return convertToPlainObject(progress);
  } catch (error) {
    console.error(`Error in getUserProgress:`, error);
    throw error;
  }
} 