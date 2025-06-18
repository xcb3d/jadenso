'use server';

import { connectToDatabase } from '@/infrastructure/db';
import { ObjectId } from 'mongodb';
import { revalidatePath } from 'next/cache';
import { auth } from '@/infrastructure/auth';

// Interfaces
export interface Flashcard {
  _id?: string | ObjectId;
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  createdAt: Date;
  updatedAt: Date;
  lastReviewed?: Date;
  reviewCount: number;
  correctCount: number;
  incorrectCount: number;
  difficulty: number; // 0-5, 0 = easiest, 5 = hardest
  nextReviewDate?: Date;
  box: number; // Leitner box number (0-5)
}

export interface FlashcardDeck {
  _id?: string | ObjectId;
  name: string;
  description?: string;
  tags: string[];
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  cardCount: number;
  lastReviewed?: Date;
}

// Create a new flashcard deck
export async function createFlashcardDeck(data: {
  name: string;
  description?: string;
  tags: string[];
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  const deck = {
    name: data.name,
    description: data.description || '',
    tags: data.tags || [],
    userId: session.user.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    cardCount: 0
  };

  const result = await db.collection('flashCardDecks').insertOne(deck);
  
  revalidatePath('/flashcards');
  
  return {
    ...deck,
    _id: result.insertedId.toString()
  };
}

// Get all flashcard decks for the current user
export async function getFlashcardDecks() {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }

  const { db } = await connectToDatabase();
  
  const decks = await db.collection('flashCardDecks')
    .find({ userId: session.user.id })
    .sort({ updatedAt: -1 })
    .toArray();
  
  return JSON.parse(JSON.stringify(decks));
}

// Get a specific flashcard deck by ID
export async function getFlashcardDeck(deckId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  const deck = await db.collection('flashCardDecks').findOne({
    _id: new ObjectId(deckId),
    userId: session.user.id
  });
  
  if (!deck) {
    throw new Error('Không tìm thấy bộ thẻ');
  }
  
  return JSON.parse(JSON.stringify(deck));
}

// Update a flashcard deck
export async function updateFlashcardDeck(deckId: string, data: {
  name?: string;
  description?: string;
  tags?: string[];
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  const updateData: Partial<FlashcardDeck> = {
    updatedAt: new Date()
  };
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.tags !== undefined) updateData.tags = data.tags;
  
  const result = await db.collection('flashCardDecks').updateOne(
    { _id: new ObjectId(deckId), userId: session.user.id },
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) {
    throw new Error('Không tìm thấy bộ thẻ hoặc bạn không có quyền chỉnh sửa');
  }
  
  revalidatePath(`/flashcards/decks/${deckId}`);
  revalidatePath('/flashcards');
  
  return { success: true };
}

// Delete a flashcard deck
export async function deleteFlashcardDeck(deckId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  // Delete all flashcards in the deck
  await db.collection('flashCards').deleteMany({
    deckId: deckId,
    userId: session.user.id
  });
  
  // Delete the deck
  const result = await db.collection('flashCardDecks').deleteOne({
    _id: new ObjectId(deckId),
    userId: session.user.id
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Không tìm thấy bộ thẻ hoặc bạn không có quyền xóa');
  }
  
  revalidatePath('/flashcards');
  
  return { success: true };
}

// Add a flashcard to a deck
export async function addFlashcard(deckId: string, data: {
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  // Verify deck exists and belongs to user
  const deck = await db.collection('flashCardDecks').findOne({
    _id: new ObjectId(deckId),
    userId: session.user.id
  });
  
  if (!deck) {
    throw new Error('Không tìm thấy bộ thẻ hoặc bạn không có quyền thêm thẻ');
  }
  
  const flashcard = {
    front: data.front,
    back: data.back,
    pronunciation: data.pronunciation || '',
    example: data.example || '',
    createdAt: new Date(),
    updatedAt: new Date(),
    reviewCount: 0,
    correctCount: 0,
    incorrectCount: 0,
    difficulty: 2.5, // Medium difficulty by default
    box: 0, // Start in box 0 (new card)
    deckId: deckId,
    userId: session.user.id
  };
  
  // Insert the flashcard
  const result = await db.collection('flashCards').insertOne(flashcard);
  
  // Update the card count in the deck
  await db.collection('flashCardDecks').updateOne(
    { _id: new ObjectId(deckId) },
    { 
      $inc: { cardCount: 1 },
      $set: { updatedAt: new Date() }
    }
  );
  
  revalidatePath(`/flashcards/decks/${deckId}`);
  
  return {
    ...flashcard,
    _id: result.insertedId.toString()
  };
}

// Get all flashcards in a deck
export async function getFlashcards(deckId: string) {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }

  const { db } = await connectToDatabase();
  
  const flashcards = await db.collection('flashCards')
    .find({ 
      deckId: deckId,
      userId: session.user.id
    })
    .sort({ createdAt: -1 })
    .toArray();
  
  return JSON.parse(JSON.stringify(flashcards));
}

// Update a flashcard
export async function updateFlashcard(cardId: string, data: {
  front?: string;
  back?: string;
  pronunciation?: string;
  example?: string;
}) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  const updateData: Partial<Flashcard> = {
    updatedAt: new Date()
  };
  
  if (data.front !== undefined) updateData.front = data.front;
  if (data.back !== undefined) updateData.back = data.back;
  if (data.pronunciation !== undefined) updateData.pronunciation = data.pronunciation;
  if (data.example !== undefined) updateData.example = data.example;
  
  const card = await db.collection('flashCards').findOne({
    _id: new ObjectId(cardId)
  });
  
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }
  
  const result = await db.collection('flashCards').updateOne(
    { _id: new ObjectId(cardId), userId: session.user.id },
    { $set: updateData }
  );
  
  if (result.matchedCount === 0) {
    throw new Error('Không tìm thấy thẻ hoặc bạn không có quyền chỉnh sửa');
  }
  
  revalidatePath(`/flashcards/decks/${card.deckId}`);
  
  return { success: true };
}

// Delete a flashcard
export async function deleteFlashcard(cardId: string) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  // Get the card to find its deck
  const card = await db.collection('flashCards').findOne({
    _id: new ObjectId(cardId)
  });
  
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }
  
  // Delete the card
  const result = await db.collection('flashCards').deleteOne({
    _id: new ObjectId(cardId),
    userId: session.user.id
  });
  
  if (result.deletedCount === 0) {
    throw new Error('Không tìm thấy thẻ hoặc bạn không có quyền xóa');
  }
  
  // Update the card count in the deck
  await db.collection('flashCardDecks').updateOne(
    { _id: new ObjectId(card.deckId) },
    { 
      $inc: { cardCount: -1 },
      $set: { updatedAt: new Date() }
    }
  );
  
  revalidatePath(`/flashcards/decks/${card.deckId}`);
  
  return { success: true };
}

// Update review progress for a flashcard
export async function updateFlashcardProgress(cardId: string, isCorrect: boolean) {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error('Bạn cần đăng nhập để thực hiện hành động này');
  }

  const { db } = await connectToDatabase();
  
  const card = await db.collection('flashCards').findOne({
    _id: new ObjectId(cardId),
    userId: session.user.id
  });
  
  if (!card) {
    throw new Error('Không tìm thấy thẻ');
  }
  
  // Calculate new difficulty based on performance
  let newDifficulty = card.difficulty;
  if (isCorrect) {
    // Decrease difficulty (make easier) if correct
    newDifficulty = Math.max(0, newDifficulty - 0.1);
  } else {
    // Increase difficulty (make harder) if incorrect
    newDifficulty = Math.min(5, newDifficulty + 0.3);
  }
  
  // Calculate next review date based on Leitner system
  let newBox = card.box;
  if (isCorrect) {
    // Move up a box if correct (max box 5)
    newBox = Math.min(5, newBox + 1);
  } else {
    // Move back to box 0 if incorrect
    newBox = 0;
  }
  
  // Calculate next review date based on box
  const nextReviewDate = new Date();
  switch (newBox) {
    case 0: // Review immediately
      nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
      break;
    case 1: // Review after 1 day
      nextReviewDate.setDate(nextReviewDate.getDate() + 1);
      break;
    case 2: // Review after 3 days
      nextReviewDate.setDate(nextReviewDate.getDate() + 3);
      break;
    case 3: // Review after 7 days
      nextReviewDate.setDate(nextReviewDate.getDate() + 7);
      break;
    case 4: // Review after 14 days
      nextReviewDate.setDate(nextReviewDate.getDate() + 14);
      break;
    case 5: // Review after 30 days
      nextReviewDate.setDate(nextReviewDate.getDate() + 30);
      break;
  }
  
  // Update the flashcard
  await db.collection('flashCards').updateOne(
    { _id: new ObjectId(cardId) },
    { 
      $set: {
        lastReviewed: new Date(),
        nextReviewDate: nextReviewDate,
        difficulty: newDifficulty,
        box: newBox,
        updatedAt: new Date()
      },
      $inc: {
        reviewCount: 1,
        correctCount: isCorrect ? 1 : 0,
        incorrectCount: isCorrect ? 0 : 1
      }
    }
  );
  
  // Update the last reviewed date of the deck
  await db.collection('flashCardDecks').updateOne(
    { _id: new ObjectId(card.deckId) },
    { $set: { lastReviewed: new Date(), updatedAt: new Date() } }
  );
  
  revalidatePath(`/flashcards/review/${card.deckId}`);
  
  return { success: true };
}

// Get cards due for review
export async function getDueCards(deckId: string | ObjectId, limit: number = 20) {
  const session = await auth();
  if (!session || !session.user) {
    return [];
  }

  const { db } = await connectToDatabase();
  
  const now = new Date();
  
  // Get cards that are due for review (nextReviewDate is in the past or doesn't exist)
  const dueCards = await db.collection('flashCards')
    .find({
      deckId: deckId.toString(), // Use toString since deckId is stored as string in flashCards collection
      userId: session.user.id,
      $or: [
        { nextReviewDate: { $lte: now } },
        { nextReviewDate: { $exists: false } }
      ]
    })
    .limit(limit)
    .toArray();
  
  return JSON.parse(JSON.stringify(dueCards));
} 