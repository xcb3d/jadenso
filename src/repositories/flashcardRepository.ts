import { ObjectId, Document } from 'mongodb';
import { Flashcard, FlashcardDeck, FlashcardDeckMap } from '../models/Flashcard';
import { COLLECTIONS, getCollection, toObjectId, now } from '../infrastructure/db/collections';

// Collection names
const FLASH_CARDS = 'flashCards';
const FLASH_CARD_DECKS = 'flashCardDecks';
const FLASH_CARD_DECK_MAPS = 'flashCardDeckMaps';

// Thêm collections vào danh sách
export const updateCollections = {
  ...COLLECTIONS,
  FLASH_CARDS,
  FLASH_CARD_DECKS,
  FLASH_CARD_DECK_MAPS,
};

// Tạo flashcard mới
export async function createFlashCard(flashCard: Omit<Flashcard, '_id'>): Promise<Flashcard> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  
  const currentTime = now();
  const newFlashCard = {
    ...flashCard,
    createdAt: currentTime,
    updatedAt: currentTime,
    reviewCount: 0,
    box: 0,
    correct: 0,
    incorrect: 0,
  };
  
  const result = await collection.insertOne(newFlashCard);
  
  return { 
    ...newFlashCard, 
    _id: result.insertedId 
  };
}

// Cập nhật flashcard
export async function updateFlashCard(id: string | ObjectId, update: Partial<Flashcard>): Promise<Flashcard | null> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: update },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

// Xóa flashcard
export async function deleteFlashCard(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  const result = await collection.deleteOne({ _id: objectId });
  
  return result.deletedCount > 0;
}

// Lấy flashcard theo id
export async function getFlashCardById(id: string | ObjectId): Promise<Flashcard | null> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  return collection.findOne({ _id: objectId });
}

// Lấy danh sách flashcards của user
export async function getFlashCardsByUserId(
  userId: string | ObjectId,
  options: {
    limit?: number;
    skip?: number;
    tags?: string[];
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Flashcard[]> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  const objectUserId = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const { limit = 100, skip = 0, tags, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  
  const query: Record<string, unknown> = { userId: objectUserId };
  
  // Thêm filter theo tags nếu có
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  // Convert sort to MongoDB sort format
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  
  return collection
    .find(query)
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limit)
    .toArray();
}

// Lấy danh sách flashcards cần ôn tập
export async function getFlashCardsForReview(
  userId: string | ObjectId,
  options: {
    limit?: number;
    tags?: string[];
  } = {}
): Promise<Flashcard[]> {
  const collection = await getCollection<Flashcard>(FLASH_CARDS);
  const objectUserId = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const { limit = 20, tags } = options;
  
  const query: Record<string, unknown> = {
    userId: objectUserId,
    nextReviewAt: { $lte: new Date() }
  };
  
  // Thêm filter theo tags nếu có
  if (tags && tags.length > 0) {
    query.tags = { $in: tags };
  }
  
  return collection
    .find(query)
    .limit(limit)
    .toArray();
}

// Cập nhật trạng thái ôn tập của flashcard
export async function updateFlashCardReviewStatus(
  id: string | ObjectId,
  isCorrect: boolean
): Promise<Flashcard | null> {
  const flashCard = await getFlashCardById(id);
  
  if (!flashCard) {
    return null;
  }
  
  // Tính toán thời gian ôn tập tiếp theo dựa trên thuật toán spaced repetition
  // Sử dụng phương pháp Leitner box system
  let newBox = flashCard.box;
  const reviewInterval: number = Math.pow(2, newBox);
  
  if (isCorrect) {
    // Nếu trả lời đúng, tăng box lên (max là 5)
    newBox = Math.min(flashCard.box + 1, 5);
  } else {
    // Nếu trả lời sai, quay lại box 0
    newBox = 0;
  }
  
  // Tính số ngày đến lần ôn tập tiếp theo
  // Box 0: 1 ngày, Box 1: 2 ngày, Box 2: 4 ngày, Box 3: 8 ngày, Box 4: 16 ngày, Box 5: 32 ngày
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + reviewInterval);
  
  // Cập nhật flashcard
  return updateFlashCard(id, {
    box: newBox,
    reviewCount: flashCard.reviewCount + 1,
    lastReviewedAt: new Date(),
    nextReviewAt: nextReview,
    correct: isCorrect ? flashCard.correct + 1 : flashCard.correct,
    incorrect: isCorrect ? flashCard.incorrect : flashCard.incorrect + 1,
  });
}

// --- FLASH CARD DECK ---

// Tạo deck mới
export async function createFlashCardDeck(deck: Omit<FlashcardDeck, '_id' | 'createdAt' | 'updatedAt' | 'cardCount'>): Promise<FlashcardDeck> {
  const collection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  
  const currentTime = now();
  const newDeck = {
    ...deck,
    cardCount: 0,
    createdAt: currentTime,
    updatedAt: currentTime,
  };
  
  const result = await collection.insertOne(newDeck);
  
  return { 
    ...newDeck, 
    _id: result.insertedId 
  };
}

// Cập nhật deck
export async function updateFlashCardDeck(id: string | ObjectId, update: Partial<Omit<FlashcardDeck, 'cardCount'>>): Promise<FlashcardDeck | null> {
  const collection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  const updateData = {
    ...update,
    updatedAt: now(),
  };
  
  const result = await collection.findOneAndUpdate(
    { _id: objectId },
    { $set: updateData },
    { returnDocument: 'after' }
  );
  
  return result || null;
}

// Lấy thông tin deck
export async function getFlashCardDeckById(id: string | ObjectId): Promise<FlashcardDeck | null> {
  const collection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  return collection.findOne({ _id: objectId });
}

// Lấy danh sách deck của user
export async function getFlashCardDecksByUserId(
  userId: string | ObjectId,
  options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<FlashcardDeck[]> {
  const collection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  const objectUserId = typeof userId === 'string' ? toObjectId(userId) : userId;
  
  const { limit = 100, skip = 0, sortBy = 'updatedAt', sortOrder = 'desc' } = options;
  
  // Convert sort to MongoDB sort format
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  return collection
    .find({ userId: objectUserId })
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limit)
    .toArray();
}

// Xóa deck
export async function deleteFlashCardDeck(id: string | ObjectId): Promise<boolean> {
  const collection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  const mapCollection = await getCollection<FlashcardDeckMap>(FLASH_CARD_DECK_MAPS);
  const objectId = typeof id === 'string' ? toObjectId(id) : id;
  
  // Xóa tất cả ánh xạ card-deck liên quan đến deck này
  await mapCollection.deleteMany({ deckId: objectId });
  
  // Xóa deck
  const result = await collection.deleteOne({ _id: objectId });
  
  return result.deletedCount > 0;
}

// --- FLASH CARD DECK MAPPING ---

// Thêm card vào deck
export async function addFlashCardToDeck(cardId: string | ObjectId, deckId: string | ObjectId): Promise<boolean> {
  const cardObjId = typeof cardId === 'string' ? toObjectId(cardId) : cardId;
  const deckObjId = typeof deckId === 'string' ? toObjectId(deckId) : deckId;
  
  const mapCollection = await getCollection<FlashcardDeckMap>(FLASH_CARD_DECK_MAPS);
  const deckCollection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  
  // Kiểm tra xem ánh xạ đã tồn tại chưa
  const existingMap = await mapCollection.findOne({
    cardId: cardObjId,
    deckId: deckObjId
  });
  
  if (existingMap) {
    return true; // Đã tồn tại, không cần thêm
  }
  
  // Tạo ánh xạ mới
  const deckMap = {
    cardId: cardObjId,
    deckId: deckObjId,
    addedAt: now()
  };
  
  await mapCollection.insertOne(deckMap);
  
  // Cập nhật số lượng card trong deck
  await deckCollection.updateOne(
    { _id: deckObjId },
    { $inc: { cardCount: 1 }, $set: { updatedAt: now() } }
  );
  
  return true;
}

// Xóa card khỏi deck
export async function removeFlashCardFromDeck(cardId: string | ObjectId, deckId: string | ObjectId): Promise<boolean> {
  const cardObjId = typeof cardId === 'string' ? toObjectId(cardId) : cardId;
  const deckObjId = typeof deckId === 'string' ? toObjectId(deckId) : deckId;
  
  const mapCollection = await getCollection<FlashcardDeckMap>(FLASH_CARD_DECK_MAPS);
  const deckCollection = await getCollection<FlashcardDeck>(FLASH_CARD_DECKS);
  
  // Xóa ánh xạ
  const result = await mapCollection.deleteOne({
    cardId: cardObjId,
    deckId: deckObjId
  });
  
  if (result.deletedCount > 0) {
    // Cập nhật số lượng card trong deck
    await deckCollection.updateOne(
      { _id: deckObjId },
      { $inc: { cardCount: -1 }, $set: { updatedAt: now() } }
    );
    return true;
  }
  
  return false;
}

// Lấy tất cả cards trong deck
export async function getFlashCardsInDeck(
  deckId: string | ObjectId,
  options: {
    limit?: number;
    skip?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}
): Promise<Flashcard[]> {
  const mappingCollection = await getCollection<FlashcardDeckMap>(FLASH_CARD_DECK_MAPS);
  const flashcardsCollection = await getCollection<Flashcard>(FLASH_CARDS);
  
  const objectDeckId = typeof deckId === 'string' ? toObjectId(deckId) : deckId;
  const { limit = 100, skip = 0, sortBy = 'addedAt', sortOrder = 'desc' } = options;
  
  // Lấy các id thẻ trong deck
  const cardMappings = await mappingCollection
    .find({ deckId: objectDeckId })
    .toArray();
  
  if (cardMappings.length === 0) {
    return [];
  }
  
  const cardIds = cardMappings.map(mapping => mapping.cardId);
  
  // Convert sort to MongoDB sort format
  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  
  // Lấy các thẻ theo id
  return flashcardsCollection
    .find({ _id: { $in: cardIds } })
    .sort({ [sortBy]: sortDirection })
    .skip(skip)
    .limit(limit)
    .toArray();
} 