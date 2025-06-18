import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/infrastructure/db/mongodb';
import { COLLECTIONS } from '@/infrastructure/db/collections';
import { Unit } from '@/models/Unit';
import { Lesson } from '@/models/Lesson';
import { Exercise } from '@/models/Exercise';

// Hàm tạo bài tập có cấu trúc cho mỗi lesson
function generateStructuredExercises(lessonId: ObjectId, characterGroup: string[]): { exercises: Exercise[], ids: ObjectId[] } {
  const exercises: Exercise[] = [];
  const exerciseIds: ObjectId[] = [];
  
  // Dữ liệu thực tế cho từng loại bài tập, tập trung vào nhóm ký tự Hiragana được truyền vào
  
  // Multiple Choice - Nhận biết hình dạng chữ
  characterGroup.forEach(char => {
    const [hiragana, romaji] = char.split(" ");
    
    // Tạo các tùy chọn từ các ký tự khác nhau nhưng đảm bảo có đáp án đúng
    let options = characterGroup
      .filter(c => c !== char)
      .map(c => c.split(" ")[0])
      .slice(0, 3);
    options.push(hiragana);
    options = shuffleArray([...options]);
    
    const exerciseId = new ObjectId();
    exerciseIds.push(exerciseId);
    
    exercises.push({
      _id: exerciseId,
      lessonId: lessonId,
      type: 'multiple_choice',
      question: `Trong các ký tự sau, đâu là ký tự đọc là "${romaji}"?`,
      options,
      correctAnswer: hiragana,
      explanation: `"${hiragana}" được đọc là "${romaji}" trong bảng chữ cái Hiragana.`,
      skills: ['reading'],
      difficulty: 'beginner',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  // Fill in the blank - Điền từ còn thiếu
  characterGroup.forEach((char, index) => {
    if (index < 2) { // Chỉ tạo 2 bài tập dạng fill in the blank cho mỗi lesson
      const [hiragana, romaji] = char.split(" ");
      
      const options = characterGroup.map(c => c.split(" ")[0]);
      
      const exerciseId = new ObjectId();
      exerciseIds.push(exerciseId);
      
      exercises.push({
        _id: exerciseId,
        lessonId: lessonId,
        type: 'fill_in_the_blank',
        question: `Điền vào chỗ trống: ${romaji} = ＿＿＿`,
        options,
        correctAnswer: hiragana,
        explanation: `Ký tự Hiragana "${hiragana}" được đọc là "${romaji}".`,
        skills: ['writing'],
        difficulty: 'beginner',
        metadata: {
          targetLanguage: 'japanese',
          nativeLanguage: 'vietnamese'
        },
        createdAt: new Date(),
        updatedAt: new Date()
    });
  }
  });
  
  // Translation - Dịch nghĩa các từ đơn giản chứa các ký tự Hiragana
  const vocabulary = [
    { word: characterGroup[0].split(" ")[0], meaning: "Ký tự đầu tiên trong nhóm" },
    { word: characterGroup[1].split(" ")[0], meaning: "Ký tự thứ hai trong nhóm" }
  ];
  
  vocabulary.forEach(item => {
    const exerciseId = new ObjectId();
    exerciseIds.push(exerciseId);
    
    exercises.push({
      _id: exerciseId,
      lessonId: lessonId,
      type: 'translation',
      question: `Dịch từ sau sang tiếng Việt: ${item.word}`,
      correctAnswer: item.meaning,
      explanation: `${item.word} có nghĩa là "${item.meaning}" trong tiếng Việt.`,
      skills: ['vocabulary'],
      difficulty: 'beginner',
      metadata: {
        targetLanguage: 'japanese',
        nativeLanguage: 'vietnamese'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    });
  });
  
  // Listening - Nghe và chọn ký tự tương ứng
  const listeningExerciseId = new ObjectId();
  exerciseIds.push(listeningExerciseId);
  
  exercises.push({
    _id: listeningExerciseId,
    lessonId: lessonId,
    type: 'listening',
    question: `Nghe âm thanh và chọn ký tự Hiragana tương ứng:`,
    options: characterGroup.map(c => c.split(" ")[0]),
    correctAnswer: characterGroup[0].split(" ")[0],
    explanation: `Âm thanh phát ra là ${characterGroup[0].split(" ")[1]}, tương ứng với ký tự ${characterGroup[0].split(" ")[0]}.`,
    skills: ['listening'],
    difficulty: 'beginner',
    metadata: {
      targetLanguage: 'japanese',
      nativeLanguage: 'vietnamese',
      audioUrl: `https://example.com/audio/hiragana/${characterGroup[0].split(" ")[1]}.mp3`
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Speaking - Đọc các ký tự Hiragana
  const speakingExerciseId = new ObjectId();
  exerciseIds.push(speakingExerciseId);
  
  exercises.push({
    _id: speakingExerciseId,
    lessonId: lessonId,
    type: 'speaking',
    question: `Đọc to ký tự Hiragana sau: ${characterGroup[0].split(" ")[0]}`,
    correctAnswer: characterGroup[0].split(" ")[1],
    explanation: `Ký tự ${characterGroup[0].split(" ")[0]} được đọc là "${characterGroup[0].split(" ")[1]}".`,
    skills: ['speaking'],
    difficulty: 'beginner',
    metadata: {
      targetLanguage: 'japanese',
      nativeLanguage: 'vietnamese'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // Matching - Nối ký tự Hiragana với cách đọc
  const matchingExerciseId = new ObjectId();
  exerciseIds.push(matchingExerciseId);
  
  const matchOptions = characterGroup.map(char => {
    const [hiragana, romaji] = char.split(" ");
    return `${hiragana} - ${romaji}`;
  });
  
  exercises.push({
    _id: matchingExerciseId,
    lessonId: lessonId,
    type: 'matching',
    question: 'Nối ký tự Hiragana với cách đọc tương ứng',
    options: matchOptions,
    correctAnswer: 'Tất cả đều đúng',
    explanation: 'Các cặp ghép đúng giữa ký tự Hiragana và cách đọc romaji.',
    skills: ['reading', 'writing'],
    difficulty: 'beginner',
    metadata: {
      targetLanguage: 'japanese',
      nativeLanguage: 'vietnamese'
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return { exercises, ids: exerciseIds };
}

// Hàm xáo trộn mảng ngẫu nhiên
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export async function GET() {
  try {
    // Kiểm tra môi trường để tránh chạy trong production
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ message: 'Seed API không khả dụng trong môi trường production' }, { status: 403 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || 'japanese_learning_app');
    
    console.log('Connected to MongoDB. Seeding data...');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await db.collection(COLLECTIONS.UNITS).deleteMany({});
    await db.collection(COLLECTIONS.LESSONS).deleteMany({});
    await db.collection(COLLECTIONS.EXERCISES).deleteMany({});

    // ------ UNIT: HIRAGANA ------
    console.log('Creating Hiragana unit...');
    
    const units: Unit[] = [];
    const lessons: Lesson[] = [];
    const exercisesAll: Exercise[] = [];
    
    // Tạo Unit Hiragana
    const hiraganaUnitId = new ObjectId();
    const hiraganaLessonIds: ObjectId[] = [];
    
    // Các nhóm ký tự Hiragana
    const hiraganaGroups = [
      {
        title: 'Nhóm A',
        characters: ['あ a', 'い i', 'う u', 'え e', 'お o']
      },
      {
        title: 'Nhóm K',
        characters: ['か ka', 'き ki', 'く ku', 'け ke', 'こ ko']
      },
      {
        title: 'Nhóm S',
        characters: ['さ sa', 'し shi', 'す su', 'せ se', 'そ so']
      },
      {
        title: 'Nhóm T',
        characters: ['た ta', 'ち chi', 'つ tsu', 'て te', 'と to']
      },
      {
        title: 'Nhóm N',
        characters: ['な na', 'に ni', 'ぬ nu', 'ね ne', 'の no']
      },
      {
        title: 'Nhóm H',
        characters: ['は ha', 'ひ hi', 'ふ fu', 'へ he', 'ほ ho']
      },
      {
        title: 'Nhóm M',
        characters: ['ま ma', 'み mi', 'む mu', 'め me', 'も mo']
      },
      {
        title: 'Nhóm Y',
        characters: ['や ya', 'ゆ yu', 'よ yo']
      },
      {
        title: 'Nhóm R',
        characters: ['ら ra', 'り ri', 'る ru', 'れ re', 'ろ ro']
      },
      {
        title: 'Nhóm W và N',
        characters: ['わ wa', 'を wo', 'ん n']
      }
    ];
      
    // Tạo Lessons cho Hiragana
    hiraganaGroups.forEach((group, index) => {
        const lessonId = new ObjectId();
      hiraganaLessonIds.push(lessonId);
        
      // Tạo bài tập có cấu trúc cho mỗi lesson
      const { exercises, ids: exerciseIds } = generateStructuredExercises(lessonId, group.characters);
        
        // Thêm exercises vào danh sách chung
        exercisesAll.push(...exercises);
        
        // Tạo lesson
        const lesson: Lesson = {
          _id: lessonId,
        unitId: hiraganaUnitId,
        title: `Hiragana - ${group.title}`,
        description: `Học các ký tự Hiragana nhóm ${group.title}: ${group.characters.map(c => c.split(" ")[0]).join(", ")}`,
        order: index + 1,
          exercises: exerciseIds,
        skills: ['reading', 'writing', 'listening', 'speaking'],
        difficulty: 'beginner',
        xpReward: 20,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      lessons.push(lesson);
    });

    // Tạo Unit Hiragana
    const hiraganaUnit: Unit = {
      _id: hiraganaUnitId,
      title: 'Bảng chữ cái Hiragana',
      description: 'Học bảng chữ cái Hiragana cơ bản - hệ thống ký tự đầu tiên bạn cần làm chủ để học tiếng Nhật. Mỗi bài học sẽ tập trung vào một nhóm ký tự.',
      order: 1,
      lessons: hiraganaLessonIds,
      difficulty: 'beginner',
      imageUrl: 'https://i.imgur.com/JBZMEi5.png',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    units.push(hiraganaUnit);

    // Lưu vào database
    console.log('Inserting units...');
    await db.collection(COLLECTIONS.UNITS).insertMany(units);
    
    console.log('Inserting lessons...');
    await db.collection(COLLECTIONS.LESSONS).insertMany(lessons);
    
    console.log('Inserting exercises...');
    await db.collection(COLLECTIONS.EXERCISES).insertMany(exercisesAll);

    console.log('Data seeding completed successfully!');

    return NextResponse.json({ 
      success: true,
      message: 'Đã tạo dữ liệu mẫu thành công!',
      data: {
        units: units.length,
        lessons: lessons.length,
        exercises: exercisesAll.length
      }
    });
  } catch (error) {
    console.error('Error seeding data:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Lỗi khi tạo dữ liệu mẫu',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 