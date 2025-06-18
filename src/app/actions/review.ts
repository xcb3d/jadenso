'use server';

import { revalidatePath } from 'next/cache';
import { updateExerciseProgress, updateDailyProgress, getUserProgress } from '@/repositories/userProgressRepository';
import { getExercisesByIds, getExercisesBySkills, findExerciseById } from '@/repositories/exerciseRepository';
import { getCurrentUser } from './user';
import { createReviewSession, addAttemptToReview, completeReviewSession as completeReview } from '@/repositories/reviewRepository';
import { ObjectId } from 'mongodb';
import { Exercise } from '@/models/Exercise';
import { CompletedExercise } from '@/models/UserProgress';
import { convertToPlainObject } from '@/lib/utils';

/**
 * Bắt đầu một phiên ôn tập mới dựa trên các kỹ năng đã chọn
 * @param skills - Danh sách các kỹ năng cần ôn tập
 * @returns Dữ liệu cho phiên ôn tập
 */
export async function startReview(skills: string[]) {
  // Lấy thông tin người dùng hiện tại
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Bạn cần đăng nhập để thực hiện ôn tập');
  }
  
  if (!user._id) {
    throw new Error('Người dùng không có ID hợp lệ');
  }
  
  // Tìm các bài tập phù hợp cho việc ôn tập
  // Ưu tiên các bài tập người dùng đã học nhưng cần ôn tập lại
  const userProgress = await getUserProgress(user._id);
  
  // Lấy danh sách ID các bài tập mà người dùng đã hoàn thành
  // và cần được ôn tập dựa trên thời gian
  const completedExerciseIds = userProgress?.completedExercises
    .filter((ex: CompletedExercise) => {
      // Lọc các bài tập thuộc kỹ năng được chọn
      if (!ex.skillType || !skills.includes(ex.skillType)) return false;
      
      // Tính thời gian từ lần ôn tập gần nhất
      const lastReviewedAt = ex.lastReviewedAt || ex.completedAt;
      if (!lastReviewedAt) return false;
      
      const daysSinceLastReview = Math.floor(
        (Date.now() - new Date(lastReviewedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Chọn bài tập cần ôn tập dựa trên khoảng thời gian
      // Thời gian tăng dần theo số lần ôn tập để tuân theo thuật toán spaced repetition
      const reviewCount = ex.reviewCount || 0;
      const nextReviewDays = [1, 3, 7, 14, 30, 90]; // Lịch ôn tập theo ngày
      const minDaysForReview = nextReviewDays[Math.min(reviewCount, nextReviewDays.length - 1)];
      
      return daysSinceLastReview >= minDaysForReview;
    })
    .map((ex: CompletedExercise) => ex.exerciseId);
  
  // Tìm các bài tập để ôn tập
  let exercises: Exercise[] = [];
  
  if (completedExerciseIds && completedExerciseIds.length > 0) {
    // Ưu tiên lấy các bài tập đã học và đến hạn ôn tập
    exercises = await getExercisesByIds(completedExerciseIds);
  }
  
  // Nếu không đủ bài tập, lấy thêm bài tập từ các kỹ năng được chọn
  if (exercises.length < 10) {
    const additionalExercises = await getExercisesBySkills(
      skills, 
      10 - exercises.length,
      completedExerciseIds // Loại trừ các ID đã có
    );
    
    exercises = [...exercises, ...additionalExercises];
  }
  
  // Giới hạn số lượng bài tập
  exercises = exercises.slice(0, 10);
  
  // Nếu không có bài tập nào, trả về null
  if (exercises.length === 0) {
    return null;
  }
  
  // Tạo một phiên ôn tập mới
  const reviewSession = await createReviewSession({
    userId: user._id,
    skills,
    exerciseIds: exercises.map(ex => ex._id!), // Use non-null assertion as we filter out undefined IDs
    startedAt: new Date(),
    status: 'in_progress',
    attempts: []
  });
  
  if (!reviewSession || !reviewSession._id) {
    throw new Error('Không thể tạo phiên ôn tập');
  }
  
  // Trả về dữ liệu cho phiên ôn tập
  // Use JSON.stringify and JSON.parse to serialize and deserialize the exercises
  // This ensures all MongoDB types like ObjectId and Date are serialized to strings
  const serializedExercises = JSON.parse(JSON.stringify(exercises));
  
  return {
    reviewId: reviewSession._id.toString(),
    exercises: serializedExercises.map((ex: any) => ({
      ...ex,
      _id: ex._id // This is already a string through JSON serialization
    }))
  };
}

/**
 * Gửi kết quả làm bài tập trong phiên ôn tập
 */
export async function submitExerciseAttempt(
  reviewId: string,
  exerciseId: string,
  answer: string,
  isCorrect: boolean,
  timeSpent: number
) {
  console.log(`[DEBUG] submitExerciseAttempt called with reviewId=${reviewId}, exerciseId=${exerciseId}, isCorrect=${isCorrect}`);
  
  try {
  // Lấy thông tin người dùng
  const user = await getCurrentUser();
    if (!user || !user._id) {
    throw new Error('Bạn cần đăng nhập để thực hiện ôn tập');
  }
    
    console.log(`[DEBUG] Attempting to add review for user ${user.email}`);
  
  // Ghi nhận kết quả làm bài
  await addAttemptToReview(
    new ObjectId(reviewId),
    {
      exerciseId: new ObjectId(exerciseId),
      answer,
      isCorrect,
      timeSpent,
      attemptedAt: new Date()
    }
  );
  
    console.log(`[DEBUG] Successfully recorded attempt for exercise ${exerciseId}`);
  return { success: true };
  } catch (error) {
    console.error(`[ERROR] Failed to submit exercise attempt:`, error);
    throw error;
  }
}

/**
 * Hoàn thành phiên ôn tập
 */
export async function completeReviewSession(reviewId: string, score: number) {
  // Lấy thông tin người dùng
  const user = await getCurrentUser();
  if (!user || !user._id) {
    throw new Error('Bạn cần đăng nhập để thực hiện ôn tập');
  }
  
  // Cập nhật trạng thái phiên ôn tập
  const reviewSession = await completeReview(
    new ObjectId(reviewId),
    score
  );
  
  if (!reviewSession) {
    throw new Error('Không tìm thấy phiên ôn tập');
  }
  
  // Cập nhật tiến độ người dùng
  // 1. Cập nhật XP và tiến độ hàng ngày
  const xpEarned = Math.floor(score / 10); // 10 điểm = 1 XP
  await updateExerciseProgress(user._id, exerciseId => {
    // Tìm tất cả các bài tập đúng và cập nhật tiến độ
    const correctAttempts = reviewSession.attempts.filter(a => a.isCorrect);
    return correctAttempts.some(a => a.exerciseId.equals(exerciseId));
  }, { lastReviewedAt: new Date() });
  
  await updateDailyProgress(user._id, xpEarned);
  
  // Revalidate các trang liên quan
  revalidatePath('/reviews');
  revalidatePath('/profile');
  
  return { success: true, score, xpEarned };
}

/**
 * Lấy danh sách bài tập cần ôn tập
 */
export async function getReviewExercises() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userProgress = await getUserProgress(new ObjectId(user._id));
    if (!userProgress || !userProgress.skills) {
      return [];
    }

    // Check if there are any skills to process
    const hasSkills = Object.values(userProgress.skills).some(value => value !== undefined);
    if (!hasSkills) {
      return [];
    }

    // Get completed exercises to review
    if (!userProgress.completedExercises || userProgress.completedExercises.length === 0) {
      return [];
    }

    // Filter exercises that need reviewing based on skill strength
    const reviewSkills = userProgress.completedExercises.filter(ex => {
      if (!ex.strength || ex.strength < 1) return true;
      
      if (!ex.lastReviewedAt) return false;
      
      const lastReview = new Date(ex.lastReviewedAt);
      const now = new Date();
      const daysSinceLastReview = Math.floor((now.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
      
      // Tính thời gian ôn tập dựa trên độ mạnh của kỹ năng
      // Công thức: Số ngày = 2^strength
      const reviewInterval = Math.pow(2, ex.strength);
      
      return daysSinceLastReview >= reviewInterval;
    });

    // Lấy thông tin chi tiết của các bài tập cần ôn tập
    const exercisePromises = reviewSkills.map(async ex => {
      const exerciseId = typeof ex.exerciseId === 'string' ? ex.exerciseId : ex.exerciseId.toString();
      return findExerciseById(exerciseId);
    });

    const exercises = await Promise.all(exercisePromises);
    const validExercises = exercises.filter(exercise => exercise !== null) as Exercise[];
    
    // Chuyển đổi ObjectId thành plain objects
    return convertToPlainObject(validExercises);
  } catch (error) {
    console.error('Error getting review exercises:', error);
    return [];
  }
} 