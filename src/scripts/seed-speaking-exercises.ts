import clientPromise from '../infrastructure/db/mongodb';
import { Db, MongoClient } from 'mongodb';
import { SpeakingExercise } from '../models/SpeakingExercise';

// Helper function to get database connection
async function connectToDatabase(): Promise<{ client: MongoClient, db: Db }> {
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DATABASE || 'language-learning-app');
  return { client, db };
}

async function seedSpeakingExercises() {
  let connection: { client: MongoClient, db: Db } | null = null;
  
  try {
    connection = await connectToDatabase();
    const { db } = connection;
    
    // Clear existing speaking exercises
    await db.collection('speakingExercises').deleteMany({});
    
    // Sample speaking exercises
    const speakingExercises: Omit<SpeakingExercise, '_id' | 'createdAt' | 'updatedAt'>[] = [
      // Beginner exercises
      {
        text: "おはようございます",
        translation: "Chào buổi sáng",
        difficulty: "beginner",
        category: "Greetings",
        audioUrl: "/audio/speaking/ohayou-gozaimasu.mp3",
        tags: ["greeting", "morning", "basic"],
        isActive: true
      },
      {
        text: "こんにちは",
        translation: "Xin chào",
        difficulty: "beginner",
        category: "Greetings",
        audioUrl: "/audio/speaking/konnichiwa.mp3",
        tags: ["greeting", "basic"],
        isActive: true
      },
      {
        text: "ありがとうございます",
        translation: "Cảm ơn",
        difficulty: "beginner",
        category: "Greetings",
        audioUrl: "/audio/speaking/arigatou-gozaimasu.mp3",
        tags: ["thanks", "basic"],
        isActive: true
      },
      {
        text: "すみません",
        translation: "Xin lỗi / Làm ơn",
        difficulty: "beginner",
        category: "Basic Phrases",
        audioUrl: "/audio/speaking/sumimasen.mp3",
        tags: ["sorry", "excuse me", "basic"],
        isActive: true
      },
      
      // Intermediate exercises
      {
        text: "お元気ですか",
        translation: "Bạn khỏe không?",
        difficulty: "intermediate",
        category: "Daily Conversation",
        audioUrl: "/audio/speaking/ogenki-desuka.mp3",
        tags: ["conversation", "question"],
        isActive: true
      },
      {
        text: "日本語を勉強しています",
        translation: "Tôi đang học tiếng Nhật",
        difficulty: "intermediate",
        category: "Self Introduction",
        audioUrl: "/audio/speaking/nihongo-benkyou.mp3",
        tags: ["study", "introduction"],
        isActive: true
      },
      {
        text: "これはいくらですか",
        translation: "Cái này giá bao nhiêu?",
        difficulty: "intermediate",
        category: "Shopping",
        audioUrl: "/audio/speaking/kore-wa-ikura-desuka.mp3",
        tags: ["shopping", "price", "question"],
        isActive: true
      },
      
      // Advanced exercises
      {
        text: "日本に行ったことがありますか",
        translation: "Bạn đã từng đi Nhật Bản chưa?",
        difficulty: "advanced",
        category: "Travel",
        audioUrl: "/audio/speaking/nihon-ni-itta-koto.mp3",
        tags: ["travel", "experience", "question"],
        isActive: true
      },
      {
        text: "私は将来、日本で働きたいです",
        translation: "Trong tương lai, tôi muốn làm việc ở Nhật Bản",
        difficulty: "advanced",
        category: "Dreams and Goals",
        audioUrl: "/audio/speaking/watashi-wa-shourai.mp3",
        tags: ["future", "work", "goal"],
        isActive: true
      },
      {
        text: "日本語の発音は難しいですが、面白いです",
        translation: "Phát âm tiếng Nhật khó nhưng thú vị",
        difficulty: "advanced",
        category: "Language Learning",
        audioUrl: "/audio/speaking/nihongo-hatsuon.mp3",
        tags: ["pronunciation", "challenge", "opinion"],
        isActive: true
      }
    ];
    
    // Insert speaking exercises
    const now = new Date();
    const exercisesToInsert = speakingExercises.map(exercise => ({
      ...exercise,
      createdAt: now,
      updatedAt: now
    }));
    
    const result = await db.collection('speakingExercises').insertMany(exercisesToInsert);
    
    console.log(`${result.insertedCount} speaking exercises inserted successfully!`);
    console.log('Speaking exercises seeding completed!');
    
  } catch (error) {
    console.error('Error seeding speaking exercises:', error);
  } finally {
    if (connection) {
      await connection.client.close();
    }
  }
}

// Run the seed function
seedSpeakingExercises()
  .catch(err => console.error('Failed to seed speaking exercises:', err)); 