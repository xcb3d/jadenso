import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createSpeakingExercise } from '@/repositories/speakingRepository';

export async function POST(request: Request) {
  try {
    // Check authentication
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    const { text, translation, difficulty, category, tags } = await request.json();
    
    // Validate required fields
    if (!text || !translation || !difficulty) {
      return NextResponse.json({ 
        error: 'Thiếu thông tin bắt buộc. Vui lòng cung cấp văn bản, bản dịch và độ khó.' 
      }, { status: 400 });
    }

    // Validate difficulty
    if (!['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json({ 
        error: 'Độ khó không hợp lệ. Chọn beginner, intermediate hoặc advanced.' 
      }, { status: 400 });
    }
    
    // Create the new speaking exercise
    const now = new Date();
    const exerciseData = {
      text,
      translation,
      difficulty,
      category: category || 'Custom',
      tags: tags || [],
      createdAt: now,
      updatedAt: now,
      isActive: true,
      userId: authSession.user.id, // Add user ID to track who created it
      isCustom: true // Flag to identify user-created exercises
    };
    
    // Save to database
    const exerciseId = await createSpeakingExercise(exerciseData);
    
    return NextResponse.json({
      success: true,
      exerciseId,
      message: 'Bài tập phát âm đã được tạo thành công'
    });
    
  } catch (error) {
    console.error('Error creating speaking exercise:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bài tập phát âm' },
      { status: 500 }
    );
  }
} 