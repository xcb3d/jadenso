import { ObjectId } from 'mongodb';
import clientPromise from '@/infrastructure/db/mongodb';
import { COLLECTIONS } from '@/infrastructure/db/collections';
import { Unit } from '@/models/Unit';
import { Lesson } from '@/models/Lesson';
import { Exercise } from '@/models/Exercise';

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'japanese_learning_app');
    
    console.log('Connected to MongoDB. Seeding data...');
    
    // Clear existing data
    await db.collection(COLLECTIONS.UNITS).deleteMany({});
    await db.collection(COLLECTIONS.LESSONS).deleteMany({});
    await db.collection(COLLECTIONS.EXERCISES).deleteMany({});

    // --------- UNIT 1: HIRAGANA ---------
    console.log('Creating Unit 1: Hiragana...');
    const unit1Id = new ObjectId();

    const unit1: Unit = {
      _id: unit1Id,
      title: 'Bảng chữ cái Hiragana',
      description: 'Học bảng chữ cái Hiragana cơ bản, một trong ba hệ thống chữ viết của tiếng Nhật.',
      order: 1,
      lessons: [], // Sẽ được cập nhật sau
      difficulty: 'beginner',
      imageUrl: 'https://i.imgur.com/JBZMEi5.png',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Tạo các bài học Hiragana
    const hiraganaLessons: Lesson[] = [];
    const hiraganaLessonIds: ObjectId[] = [];
    
    // Lesson 1: Hiragana cơ bản - nhóm A
    const lesson1Id = new ObjectId();
    hiraganaLessonIds.push(lesson1Id);
    
    const lesson1: Lesson = {
      _id: lesson1Id,
      unitId: unit1Id,
      title: 'Hiragana cơ bản - nhóm A',
      description: 'Học các ký tự Hiragana cơ bản: あ (a), い (i), う (u), え (e), お (o)',
      order: 1,
      exercises: [], // Sẽ được cập nhật sau
      skills: ['reading', 'writing'],
      difficulty: 'easy',
      xpReward: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Lesson 2: Hiragana - nhóm K
    const lesson2Id = new ObjectId();
    hiraganaLessonIds.push(lesson2Id);
    
    const lesson2: Lesson = {
      _id: lesson2Id,
      unitId: unit1Id,
      title: 'Hiragana - nhóm K',
      description: 'Học các ký tự Hiragana: か (ka), き (ki), く (ku), け (ke), こ (ko)',
      order: 2,
      exercises: [], // Sẽ được cập nhật sau
      skills: ['reading', 'writing'],
      difficulty: 'easy',
      xpReward: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Lesson 3: Hiragana - nhóm S
    const lesson3Id = new ObjectId();
    hiraganaLessonIds.push(lesson3Id);
    
    const lesson3: Lesson = {
      _id: lesson3Id,
      unitId: unit1Id,
      title: 'Hiragana - nhóm S',
      description: 'Học các ký tự Hiragana: さ (sa), し (shi), す (su), せ (se), そ (so)',
      order: 3,
      exercises: [], // Sẽ được cập nhật sau
      skills: ['reading', 'writing'],
      difficulty: 'easy',
      xpReward: 10,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Cập nhật danh sách bài học cho Unit 1
    unit1.lessons = hiraganaLessonIds;
    
    hiraganaLessons.push(lesson1, lesson2, lesson3);

    // ------ Bài tập cho Lesson 1: Hiragana cơ bản - nhóm A ------
    const lesson1Exercises: Exercise[] = [];
    const lesson1ExerciseIds: ObjectId[] = [];

    // Bài tập 1: Nhận biết "あ"
    const exercise1_1Id = new ObjectId();
    lesson1ExerciseIds.push(exercise1_1Id);
    
    const exercise1_1: Exercise = {
      _id: exercise1_1Id,
      lessonId: lesson1Id,
      type: 'multiple_choice',
      question: 'Đâu là cách đọc đúng của chữ "あ"?',
      options: ['a', 'i', 'u', 'e'],
      correctAnswer: 'a',
      explanation: 'Chữ "あ" được phiên âm là "a" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
        imageUrl: 'https://i.imgur.com/JFzDZYu.png',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 2: Nhận biết "い"
    const exercise1_2Id = new ObjectId();
    lesson1ExerciseIds.push(exercise1_2Id);
    
    const exercise1_2: Exercise = {
      _id: exercise1_2Id,
      lessonId: lesson1Id,
      type: 'multiple_choice',
      question: 'Đâu là chữ "i" trong Hiragana?',
      options: ['あ', 'い', 'う', 'え'],
      correctAnswer: 'い',
      explanation: 'Chữ "い" được phiên âm là "i" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
        imageUrl: 'https://i.imgur.com/dYws8VV.png',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 3: Matching exercise
    const exercise1_3Id = new ObjectId();
    lesson1ExerciseIds.push(exercise1_3Id);
    
    const exercise1_3: Exercise = {
      _id: exercise1_3Id,
      lessonId: lesson1Id,
      type: 'matching',
      question: 'Nối các chữ cái Hiragana với cách đọc tương ứng',
      options: ['あ - a', 'い - i', 'う - u', 'え - e', 'お - o'],
      correctAnswer: 'あ-a,い-i,う-u,え-e,お-o',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 4: Viết chữ あ
    const exercise1_4Id = new ObjectId();
    lesson1ExerciseIds.push(exercise1_4Id);
    
    const exercise1_4: Exercise = {
      _id: exercise1_4Id,
      lessonId: lesson1Id,
      type: 'multiple_choice',
      question: 'Chọn hình có cách viết đúng của chữ "あ"',
      options: [
        'https://i.imgur.com/JFzDZYu.png',
        'https://i.imgur.com/wrong1.png',
        'https://i.imgur.com/wrong2.png',
        'https://i.imgur.com/wrong3.png'
      ],
      correctAnswer: 'https://i.imgur.com/JFzDZYu.png',
      explanation: 'Chữ "あ" được viết như trong hình đầu tiên.',
      skills: ['writing'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 5: Fill in the blank
    const exercise1_5Id = new ObjectId();
    lesson1ExerciseIds.push(exercise1_5Id);
    
    const exercise1_5: Exercise = {
      _id: exercise1_5Id,
      lessonId: lesson1Id,
      type: 'fill_in_the_blank',
      question: 'Điền âm đúng cho chữ "お": ___',
      correctAnswer: 'o',
      explanation: 'Chữ "お" được phiên âm là "o" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
        imageUrl: 'https://i.imgur.com/8QKzQol.png',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    lesson1Exercises.push(exercise1_1, exercise1_2, exercise1_3, exercise1_4, exercise1_5);
    
    // Cập nhật danh sách bài tập cho Lesson 1
    lesson1.exercises = lesson1ExerciseIds;

    // ------ Bài tập cho Lesson 2: Hiragana - nhóm K ------
    const lesson2Exercises: Exercise[] = [];
    const lesson2ExerciseIds: ObjectId[] = [];

    // Bài tập 1: Nhận biết "か"
    const exercise2_1Id = new ObjectId();
    lesson2ExerciseIds.push(exercise2_1Id);
    
    const exercise2_1: Exercise = {
      _id: exercise2_1Id,
      lessonId: lesson2Id,
      type: 'multiple_choice',
      question: 'Đâu là cách đọc đúng của chữ "か"?',
      options: ['ka', 'ki', 'ku', 'ke'],
      correctAnswer: 'ka',
      explanation: 'Chữ "か" được phiên âm là "ka" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 2: Nhận biết "き"
    const exercise2_2Id = new ObjectId();
    lesson2ExerciseIds.push(exercise2_2Id);
    
    const exercise2_2: Exercise = {
      _id: exercise2_2Id,
      lessonId: lesson2Id,
      type: 'multiple_choice',
      question: 'Đâu là chữ "ki" trong Hiragana?',
      options: ['か', 'き', 'く', 'け'],
      correctAnswer: 'き',
      explanation: 'Chữ "き" được phiên âm là "ki" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    lesson2Exercises.push(exercise2_1, exercise2_2);
    
    // Cập nhật danh sách bài tập cho Lesson 2
    lesson2.exercises = lesson2ExerciseIds;

    // ------ Bài tập cho Lesson 3: Hiragana - nhóm S ------
    const lesson3Exercises: Exercise[] = [];
    const lesson3ExerciseIds: ObjectId[] = [];

    // Bài tập 1: Nhận biết "さ"
    const exercise3_1Id = new ObjectId();
    lesson3ExerciseIds.push(exercise3_1Id);
    
    const exercise3_1: Exercise = {
      _id: exercise3_1Id,
      lessonId: lesson3Id,
      type: 'multiple_choice',
      question: 'Đâu là cách đọc đúng của chữ "さ"?',
      options: ['sa', 'shi', 'su', 'se'],
      correctAnswer: 'sa',
      explanation: 'Chữ "さ" được phiên âm là "sa" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Bài tập 2: Nhận biết "し"
    const exercise3_2Id = new ObjectId();
    lesson3ExerciseIds.push(exercise3_2Id);
    
    const exercise3_2: Exercise = {
      _id: exercise3_2Id,
      lessonId: lesson3Id,
      type: 'multiple_choice',
      question: 'Đâu là chữ "shi" trong Hiragana?',
      options: ['さ', 'し', 'す', 'せ'],
      correctAnswer: 'し',
      explanation: 'Chữ "し" được phiên âm là "shi" trong tiếng Nhật.',
      skills: ['reading'],
      difficulty: 'easy',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    lesson3Exercises.push(exercise3_1, exercise3_2);
    
    // Cập nhật danh sách bài tập cho Lesson 3
    lesson3.exercises = lesson3ExerciseIds;

    // Lưu vào database
    console.log('Inserting units...');
    await db.collection(COLLECTIONS.UNITS).insertOne(unit1);
    
    console.log('Inserting lessons...');
    await db.collection(COLLECTIONS.LESSONS).insertMany(hiraganaLessons);
    
    console.log('Inserting exercises for Lesson 1...');
    await db.collection(COLLECTIONS.EXERCISES).insertMany(lesson1Exercises);
    
    console.log('Inserting exercises for Lesson 2...');
    await db.collection(COLLECTIONS.EXERCISES).insertMany(lesson2Exercises);
    
    console.log('Inserting exercises for Lesson 3...');
    await db.collection(COLLECTIONS.EXERCISES).insertMany(lesson3Exercises);

    console.log('Data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    process.exit(0);
  }
}

main(); 