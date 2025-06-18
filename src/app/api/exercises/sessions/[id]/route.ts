import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getExerciseSessionById,
  getExercisesBySessionId
} from '@/repositories/generatedExerciseRepository';
import { encrypt } from '@/lib/encryption';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    // Kiểm tra phiên làm việc
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    const { id } = params;
    
    // Lấy thông tin phiên
    const exerciseSession = await getExerciseSessionById(id);
    
    if (!exerciseSession) {
      return NextResponse.json({ error: 'Phiên tập luyện không tồn tại' }, { status: 404 });
    }
    
    // Kiểm tra quyền truy cập
    if (exerciseSession.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Không có quyền truy cập phiên này' }, { status: 403 });
    }
    
    // Lấy danh sách bài tập
    const exercises = await getExercisesBySessionId(id);
    
    // Prepare data
    const responseData = {
      session: {
        ...exerciseSession,
        _id: exerciseSession._id?.toString(),
        userId: exerciseSession.userId.toString(),
        createdAt: exerciseSession.createdAt.toISOString(),
        updatedAt: exerciseSession.updatedAt.toISOString()
      },
      exercises: exercises.map(exercise => ({
        ...exercise,
        _id: exercise._id?.toString(),
        sessionId: exercise.sessionId.toString(),
        userId: exercise.userId.toString(),
        createdAt: exercise.createdAt.toISOString(),
        updatedAt: exercise.updatedAt.toISOString()
      }))
    };
    
    // Encrypt the response data
    const { encrypted, key } = encrypt(responseData);
    
    return NextResponse.json({
      data: encrypted,
      key
    });
    
  } catch (error) {
    console.error('Error fetching exercise session:', error);
    return NextResponse.json({ error: 'Failed to fetch exercise session' }, { status: 500 });
  }
} 