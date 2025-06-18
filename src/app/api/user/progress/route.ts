import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { findUserById } from '@/repositories/userRepository';
import { getUserProgress } from '@/repositories/userProgressRepository';

export async function GET() {
  try {
    // Lấy thông tin người dùng từ session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: 'Bạn cần đăng nhập để xem tiến độ' }, { status: 401 });
    }

    // Lấy thông tin user từ database
    const user = await findUserById(session.user.id);
    if (!user || !user._id) {
      return NextResponse.json({ message: 'Không tìm thấy thông tin người dùng' }, { status: 404 });
    }

    // Lấy tiến độ học tập
    const progress = await getUserProgress(user._id);
    
    const simplifiedProgress = {
      userId: user._id.toString(),
      email: user.email,
      totalXp: progress?.totalXp || 0,
      dailyProgress: progress?.dailyProgress || 0,
      completedExercises: progress?.completedExercises.map(ex => ({
        exerciseId: ex.exerciseId.toString(),
        skillType: ex.skillType,
        lessonId: ex.lessonId.toString(),
        completedAt: ex.completedAt,
      })) || [],
      lessonProgress: progress?.lessonProgress.map(lp => ({
        lessonId: lp.lessonId.toString(),
        status: lp.status,
        completedAt: lp.completedAt,
      })) || [],
      unitProgress: progress?.unitProgress.map(up => ({
        unitId: up.unitId.toString(),
        completed: up.completed,
        unlockedAt: up.unlockedAt,
      })) || [],
    };

    return NextResponse.json({ success: true, progress: simplifiedProgress });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Có lỗi xảy ra khi lấy tiến độ người dùng', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 