import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createLessonSessionToken } from '@/app/actions/userProgress';

/**
 * API endpoint để tạo session token cho bài học
 * POST /api/lesson/session
 * Body: { lessonId: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Kiểm tra xem người dùng đã đăng nhập chưa
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Lấy lessonId từ body request
    const body = await request.json();
    const { lessonId } = body;
    
    if (!lessonId) {
      return NextResponse.json(
        { error: 'Missing lessonId' },
        { status: 400 }
      );
    }
    
    // Tạo session token
    const token = await createLessonSessionToken(session.user.id, lessonId);
    
    // Trả về token
    return NextResponse.json({ token });
  } catch (error) {
    console.error('Error creating lesson session token:', error);
    
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 