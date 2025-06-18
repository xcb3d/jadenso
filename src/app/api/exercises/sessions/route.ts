import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getExerciseSessionsByUserId } from '@/repositories/generatedExerciseRepository';

export async function GET() {
  try {
    // Kiểm tra phiên làm việc
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    // Lấy danh sách phiên tập luyện
    const exerciseSessions = await getExerciseSessionsByUserId(session.user.id);
    
    return NextResponse.json({ 
      sessions: exerciseSessions.map(session => ({
        ...session,
        _id: session._id?.toString(),
        userId: session.userId.toString(),
        createdAt: session.createdAt.toISOString(),
        updatedAt: session.updatedAt.toISOString()
      }))
    });
    
  } catch (error) {
    console.error('Error fetching exercise sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise sessions' }, { status: 500 });
  }
} 