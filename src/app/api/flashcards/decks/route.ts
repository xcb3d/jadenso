import { NextResponse } from 'next/server';
import { createFlashcardDeck } from '@/app/actions/flashcard';
import { auth } from '@/infrastructure/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { title, description, tags = [] } = await request.json();
    
    // Validate request body
    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    
    const deck = await createFlashcardDeck({
      name: title,
      description: description || '',
      tags
    });
    
    return NextResponse.json(deck, { status: 201 });
  } catch (error) {
    console.error('Error creating flashcard deck:', error);
    return NextResponse.json(
      { error: 'Failed to create flashcard deck' }, 
      { status: 500 }
    );
  }
} 