import { NextResponse } from 'next/server';
import { createUnit } from '@/repositories/unitRepository';

export async function POST(request: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed API is not available in production' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { title, description, order, difficulty, imageUrl } = body;

    // Validate required fields
    if (!title || !description || !order || !difficulty) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create unit
    const unit = await createUnit({
      title,
      description,
      order,
      lessons: [],
      difficulty,
      imageUrl,
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error('Error creating unit:', error);
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 });
  }
} 