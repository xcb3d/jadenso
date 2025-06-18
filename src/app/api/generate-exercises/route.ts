import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  createExerciseSession,
  addExercisesToSession 
} from '@/repositories/generatedExerciseRepository';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    // Kiểm tra phiên làm việc
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    const { questionLimit, vocabulary, proficiencyLevel = 'intermediate' } = await request.json();
    
    // Use API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    // Validate inputs
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured on the server' }, { status: 500 });
    }
    
    if (!vocabulary) {
      return NextResponse.json({ error: 'Vocabulary is required' }, { status: 400 });
    }

    // Configure difficulty distribution based on proficiency level
    let difficultyDistribution = '';
    let contextRichness = '';
    let vocabularyUsage = '';
    
    switch(proficiencyLevel) {
      case 'beginner':
        difficultyDistribution = 'mostly easy (70%), some medium (30%), no hard exercises';
        contextRichness = 'simple everyday scenarios with basic sentence structures';
        vocabularyUsage = 'basic vocabulary with minimal kanji, focus on hiragana';
        break;
      case 'elementary':
        difficultyDistribution = 'balance of easy (50%) and medium (50%) exercises';
        contextRichness = 'common daily life situations with simple but complete sentences';
        vocabularyUsage = 'common vocabulary with basic kanji (JLPT N4 level)';
        break;
      case 'intermediate':
        difficultyDistribution = 'mostly medium (60%), some easy (20%) and hard (20%) exercises';
        contextRichness = 'varied situations including work, travel, and social interactions';
        vocabularyUsage = 'moderately complex vocabulary with common kanji (JLPT N3 level)';
        break;
      case 'advanced':
        difficultyDistribution = 'mostly hard (50%), some medium (40%), few easy (10%) exercises';
        contextRichness = 'complex scenarios including abstract topics, news, business situations';
        vocabularyUsage = 'advanced vocabulary with complex kanji usage (JLPT N2 level)';
        break;
      case 'expert':
        difficultyDistribution = 'primarily hard (80%), some medium (20%) exercises';
        contextRichness = 'sophisticated contexts including academic, literary, cultural topics';
        vocabularyUsage = 'sophisticated vocabulary with extensive kanji usage (JLPT N1 level)';
        break;
    }

    // Create detailed system prompt with embedded exercise templates and examples
    const systemPrompt = `You are an exercise generation assistant for a Japanese language learning app. Generate exactly ${questionLimit} varied exercises for the vocabulary words below.

# IMPORTANT RULES
- Create exactly ${questionLimit} exercises total, no more, no less
- Make sure each vocabulary word has at least one exercise
- Include a mix of different exercise types (see details below)
- Return ONLY a valid JSON array of exercises
- Do not include any explanations, markdown formatting, or text outside the JSON array
- Follow the proficiency level guidelines: ${proficiencyLevel} level (${difficultyDistribution})
- Create context-rich exercises using ${contextRichness}
- Use vocabulary appropriate for ${vocabularyUsage}
- ALL explanations MUST be in Vietnamese language, not in English or any other language

# EXERCISE TYPES AND TEMPLATES

## 1. Multiple Choice (type: "multiple_choice")
Example: {
  "type": "multiple_choice",
  "question": "What is the meaning of 'せんげつ' in Vietnamese?",
  "options": ["Tháng trước", "Tháng này", "Tháng sau", "Năm ngoái"],
  "correctAnswer": "Tháng trước",
  "explanation": "せんげつ (sengetsu) có nghĩa là 'tháng trước' trong tiếng Nhật. Từ này được cấu tạo từ 先 (sen, nghĩa là 'trước') và 月 (getsu/tsuki, nghĩa là 'tháng'). Trong ngữ cảnh trang trọng, bạn có thể sử dụng dạng kanji 先月.",
  "skills": ["vocabulary"],
  "difficulty": "easy",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "jlptLevel": "N5",
    "usageNote": "Used in both formal and casual conversations when referring to events in the previous month"
  }
}

## 2. Fill in the Blank (type: "fill_in_the_blank")
Example: {
  "type": "fill_in_the_blank",
  "question": "わたしは ________ ともだちと東京に行きました。 (Điền từ 'tháng trước')",
  "options": [],
  "correctAnswer": "せんげつ",
  "explanation": "せんげつ có nghĩa là 'tháng trước' trong tiếng Nhật. Câu hoàn chỉnh 'わたしはせんげつともだちと東京に行きました' có nghĩa là 'Tháng trước tôi đã đi Tokyo với bạn'. Câu này sử dụng biểu thức thời gian せんげつ, tiếp theo là điểm đến được đánh dấu bằng trợ từ に.",
  "skills": ["vocabulary", "grammar"],
  "difficulty": "medium",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "grammarPoints": ["Time expressions placement", "Particle に with destinations"],
    "relatedVocabulary": ["ともだち (friend)", "行きます (to go)"]
  }
}

## 3. Translation (type: "translation")
Example: {
  "type": "translation",
  "question": "Translate to Japanese: 'Tháng trước tôi đã mua một chiếc áo khoác vì thời tiết trở nên lạnh.'",
  "options": [],
  "correctAnswer": "せんげつ、わたしはさむくなってきたからコートを買いました。",
  "explanation": "せんげつ (sengetsu) = tháng trước, わたし (watashi) = tôi, さむくなってきた (samuku natte kita) = trở nên lạnh, から (kara) = bởi vì, コート (kōto) = áo khoác, 買いました (kaimashita) = đã mua. Câu này thể hiện cách biểu thức thời gian thường đặt ở đầu câu và cách sử dụng から để diễn đạt lý do.",
  "skills": ["vocabulary", "translation", "grammar"],
  "difficulty": "hard",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "culturalContext": "In Japan, seasonal changes often prompt clothing purchases, especially in fall when preparing for winter.",
    "grammarPoints": ["Reason expression with から", "Past tense verb forms"]
  }
}

## 4. Listening (type: "listening")
Example: {
  "type": "listening",
  "question": "Listen and type what you hear:",
  "options": [],
  "correctAnswer": "せんげつ日本語の試験がありました",
  "explanation": "せんげつ日本語の試験がありました (Sengetsu nihongo no shiken ga arimashita) có nghĩa là 'Tháng trước có bài kiểm tra tiếng Nhật'. Câu này sử dụng biểu thức thời gian せんげつ ở đầu câu, tiếp theo là chủ ngữ (日本語の試験) và động từ ありました (đã có).",
  "skills": ["listening", "vocabulary"],
  "difficulty": "medium",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "audioText": "せんげつ日本語の試験がありました",
    "pronunciationTips": "Pay attention to the pitch accent: せんげつ has a low-high-low-low pattern. The つ at the end is often barely audible.",
    "listeningChallenges": "Focus on identifying time expressions at the beginning of sentences, which is a common pattern in Japanese."
  }
}

## 5. Speaking (type: "speaking")
Example: {
  "type": "speaking",
  "question": "Using the word 'せんげつ' (last month), create a sentence about something you did. Example: せんげつ何をしましたか？",
  "options": [],
  "correctAnswer": "せんげつ日本語を勉強しました。",
  "explanation": "せんげつ日本語を勉強しました (Sengetsu nihongo o benkyō shimashita) có nghĩa là 'Tháng trước tôi đã học tiếng Nhật'. Đây chỉ là một câu trả lời có thể. Bất kỳ câu nào sử dụng せんげつ mô tả một hành động trong quá khứ đều được chấp nhận. Từ せんげつ được đặt ở đầu câu như một biểu thức thời gian.",
  "skills": ["speaking", "vocabulary", "pronunciation", "grammar"],
  "difficulty": "medium",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "acceptableVariations": ["せんげつ友達に会いました", "せんげつ映画を見ました", "せんげつ日本に行きました"],
    "pronunciationFocus": "Make sure to maintain a steady rhythm and not stress any particular syllable too strongly"
  }
}

## 6. Matching (type: "matching")
Example: {
  "type": "matching",
  "question": "Match the Japanese time expressions with their Vietnamese meanings",
  "options": ["せんげつ - Tháng trước", "こんげつ - Tháng này", "らいげつ - Tháng sau", "きょねん - Năm ngoái", "ことし - Năm nay"],
  "correctAnswer": "せんげつ:Tháng trước,こんげつ:Tháng này,らいげつ:Tháng sau,きょねん:Năm ngoái,ことし:Năm nay",
  "explanation": "Những biểu thức thời gian này tạo thành một hệ thống logic trong tiếng Nhật: せんげつ (tháng trước), こんげつ (tháng này), らいげつ (tháng sau) tuân theo cùng một mẫu với tiền tố せん (trước), こん (này), らい (sau). Tương tự, きょねん (năm ngoái), ことし (năm nay), らいねん (năm sau) tuân theo cùng một mẫu cho các năm. Hiểu các mẫu này giúp học các biểu thức thời gian liên quan.",
  "skills": ["vocabulary", "reading", "pattern recognition"],
  "difficulty": "medium",
  "metadata": {
    "targetLanguage": "Japanese",
    "nativeLanguage": "Vietnamese",
    "conceptualGroup": "Time expressions",
    "patternExplanation": "Biểu thức thời gian trong tiếng Nhật thường sử dụng tiền tố 先/昨 (quá khứ), 今 (hiện tại), và 来/明 (tương lai)"
  }
}

# CONTEXTS AND REAL-LIFE SCENARIOS
Create exercises that place vocabulary in meaningful contexts such as:
- Daily conversations between friends, family, or colleagues
- Practical situations like shopping, travel, dining, and healthcare
- Cultural contexts related to Japanese customs, holidays, and traditions
- Work and school scenarios relevant to learners' experiences
- Narratives about personal experiences and storytelling

# HIGH-QUALITY DISTRACTORS
For multiple choice questions, create plausible distractors that:
- Include words with similar meanings but important differences
- Use words that sound or look similar but have different meanings
- Include common misconceptions that learners might have
- Represent logical but incorrect translations or interpretations
- Include words from the same semantic field (e.g., other time expressions)

# VOCABULARY LIST TO CREATE EXERCISES FOR:
${vocabulary.trim()}

# RETURN FORMAT
Return a valid JSON array of exercise objects following the templates above. Each exercise must include all required fields.`;

    // Make API call to Gemini
    const geminiResponse = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt
              }
            ]
          }
        ]
      })
    });

    const data = await geminiResponse.json();
    
    // Handle API error
    if (!geminiResponse.ok) {
      console.error('Gemini API error:', data);
      return NextResponse.json(
        { error: data.error?.message || 'Failed to generate exercises' }, 
        { status: geminiResponse.status }
      );
    }

    // Get content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json({ error: 'Invalid response from Gemini API' }, { status: 500 });
    }

    // Tạo phiên mới
    const sessionTitle = `Bài tập từ vựng - ${new Date().toLocaleDateString('vi-VN')}`;
    const exerciseSession = await createExerciseSession(
      authSession.user.id,
      sessionTitle,
      `Bài tập được tạo từ ${vocabulary.trim().split('\n').length} từ vựng`,
      proficiencyLevel,
      vocabulary.trim()
    );
    
    // Xử lý phản hồi từ Gemini
    let exercisesJson;
    try {
      // Try to parse the response text as JSON
      exercisesJson = JSON.parse(content);
    } catch {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        exercisesJson = JSON.parse(jsonMatch[1].trim());
      } else {
        return NextResponse.json({ error: 'Could not parse JSON from the response' }, { status: 500 });
      }
    }

    if (!Array.isArray(exercisesJson)) {
      return NextResponse.json({ error: 'Response is not a valid array of exercises' }, { status: 500 });
    }

    // Limit number of exercises to the requested amount
    const limitedExercises = exercisesJson.slice(0, questionLimit);

    // Chuyển đổi định dạng bài tập và lưu vào database
    const exercises = await addExercisesToSession(
      exerciseSession._id!,
      authSession.user.id,
      limitedExercises.map(exercise => ({
        type: exercise.type,
        question: exercise.question,
        options: exercise.options || [],
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation || '',
        skills: exercise.skills || ['vocabulary'],
        difficulty: exercise.difficulty || 'medium',
        metadata: {
          targetLanguage: exercise.metadata?.targetLanguage || 'Japanese',
          nativeLanguage: exercise.metadata?.nativeLanguage || 'Vietnamese',
          proficiencyLevel: proficiencyLevel,
          ...exercise.metadata
        }
      }))
    );

    return NextResponse.json({ 
      success: true, 
      sessionId: exerciseSession._id,
      exerciseCount: exercises.length
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
} 