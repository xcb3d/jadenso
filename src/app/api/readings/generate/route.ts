import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createReading } from '@/repositories/japaneseReadingRepository';
import { JapaneseWord } from '@/data/reading-data';
import { encrypt } from '@/lib/encryption';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    // Kiểm tra phiên làm việc
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    const { vocabulary, proficiencyLevel = 'intermediate', prompt = '' } = await request.json();
    
    // Use API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    // Validate inputs
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured on the server' }, { status: 500 });
    }
    
    if (!vocabulary || vocabulary.trim().length === 0) {
      return NextResponse.json({ error: 'Vocabulary is required' }, { status: 400 });
    }

    // Configure difficulty based on proficiency level
    let jlptLevel = 'N4';
    let sentenceComplexity = '';
    let vocabularyUsage = '';
    let grammarPoints = '';
    
    switch(proficiencyLevel) {
      case 'beginner':
        jlptLevel = 'N5';
        sentenceComplexity = 'simple sentences with basic grammar patterns (は, です, ます, etc.)';
        vocabularyUsage = 'basic vocabulary with minimal kanji, focus on hiragana';
        grammarPoints = 'は-主語, を-目的語, に-場所/時点, で-場所, ます形, て形';
        break;
      case 'elementary':
        jlptLevel = 'N4';
        sentenceComplexity = 'short sentences with common grammar patterns';
        vocabularyUsage = 'common vocabulary with basic kanji (JLPT N4 level)';
        grammarPoints = 'は-主語, が-主語, の-所有, を-目的語, に-場所/時点, で-場所, から-起点, まで-終点, て形, た形, ている';
        break;
      case 'intermediate':
        jlptLevel = 'N3';
        sentenceComplexity = 'medium-length sentences with varied grammar patterns';
        vocabularyUsage = 'moderately complex vocabulary with common kanji (JLPT N3 level)';
        grammarPoints = 'は-主語, が-主語, の-所有, を-目的語, に-場所/時点/目的, で-場所/手段, から-起点, まで-終点, ながら, ために, のに, ても, たら, なら, ば条件';
        break;
      case 'advanced':
        jlptLevel = 'N2';
        sentenceComplexity = 'longer sentences with more complex grammar structures';
        vocabularyUsage = 'advanced vocabulary with complex kanji usage (JLPT N2 level)';
        grammarPoints = 'は-主語, が-主語, の-所有, を-目的語, に-場所/時点/目的/変化, で-場所/手段/原因, によって, について, にとって, わけではない, はずがない, にもかかわらず';
        break;
      case 'expert':
        jlptLevel = 'N1';
        sentenceComplexity = 'sophisticated sentences with advanced grammar and expressions';
        vocabularyUsage = 'sophisticated vocabulary with extensive kanji usage (JLPT N1 level)';
        grammarPoints = 'は-主語, が-主語, の-所有, を-目的語, に-場所/時点/目的/変化/受身, で-場所/手段/原因/範囲, によって, について, にとって, ものの, ゆえに, にせよ, をはじめ, かのようだ';
        break;
    }

    // Create system prompt
    const promptSuggestion = prompt ? 
      `The reading should be about: ${prompt}.` : 
      `Generate a reading about daily life, travel, culture, or any common topic appropriate for the level.`;

    const systemPrompt = `You are a Japanese reading passage generator for language learners.

# IMPORTANT RULES
- Create a SHORT Japanese reading passage at JLPT ${jlptLevel} level
- Use the vocabulary words provided below (try to use all of them)
- The passage should be 5-8 sentences long
- Use ${sentenceComplexity}
- Include ${vocabularyUsage}
- Include ALL of the provided vocabulary words
- Include grammar points appropriate for ${jlptLevel} level (such as: ${grammarPoints})
- The output should be a valid JSON array of word objects
- Do NOT include any explanations or text outside the JSON array
- ${promptSuggestion}

# OUTPUT FORMAT
Create a valid JSON array where each element represents a word in the passage. 
Each word should have:
1. "word": The Japanese word (kanji, hiragana, or katakana)
2. "reading": The hiragana reading of the word
3. "meaning": The Vietnamese meaning of the word (if applicable)
4. "grammarPoint": The grammar point identifier (if applicable, e.g., "は-主語", "を-目的語", etc.)
5. "grammarType": The type of grammar element (e.g., "助詞" for particles, "動詞" for verbs, etc.)
6. "grammarExplanation": A clear explanation in Vietnamese with an example

For example:
[
  { "word": "私", "reading": "わたし", "meaning": "Tôi" },
  { 
    "word": "は", 
    "reading": "は", 
    "meaning": "Trợ từ chỉ chủ thể", 
    "grammarPoint": "は-主語", 
    "grammarType": "助詞", 
    "grammarExplanation": "Trợ từ 'は' dùng để đánh dấu chủ ngữ trong câu. Ví dụ: 私は学生です (Tôi là học sinh)."
  },
  { "word": "毎日", "reading": "まいにち", "meaning": "Hàng ngày" },
  { "word": "学校", "reading": "がっこう", "meaning": "Trường học" },
  { 
    "word": "に", 
    "reading": "に", 
    "meaning": "Trợ từ chỉ địa điểm", 
    "grammarPoint": "に-場所", 
    "grammarType": "助詞", 
    "grammarExplanation": "Trợ từ 'に' dùng để chỉ nơi đến của hành động di chuyển. Ví dụ: 東京に行きます (Tôi đi Tokyo)."
  },
  { 
    "word": "行き", 
    "reading": "いき", 
    "meaning": "Đi", 
    "grammarType": "動詞", 
    "grammarExplanation": "Động từ nhóm 1 (う-động từ). Dạng từ điển: 行く (iku)"
  },
  { 
    "word": "ます", 
    "reading": "ます", 
    "meaning": "Đuôi thể hiện tại lịch sự", 
    "grammarType": "助動詞", 
    "grammarExplanation": "Đuôi 'ます' dùng để biến động từ thành thể lịch sự, hiện tại. Ví dụ: 行きます (đi - lịch sự)"
  },
  { "word": "。", "reading": "。" }
]

# VOCABULARY TO INCLUDE
${vocabulary.trim()}

# GRAMMAR POINTS TO INCLUDE
Include at least 3-5 different grammar points from this list in your passage:
${grammarPoints}

# GRAMMAR EXPLANATIONS
For each grammar point, provide:
1. A clear Vietnamese explanation of how the grammar works
2. At least one simple example using the grammar point
3. The part of speech (grammarType) in Japanese (助詞, 動詞, 助動詞, etc.)

# ADDITIONAL INSTRUCTIONS
- Make sure punctuation (。、「」etc.) is separate from words
- Each particle (は, が, を, に, etc.) should be a separate entry
- Create a coherent passage that makes sense and flows naturally
- Use natural Japanese that a native speaker would write
- ALL meanings and explanations should be in Vietnamese language, not English
- For words without meaning (like punctuation), omit the meaning field
- For words without grammar points, you can omit the grammarPoint, grammarType, and grammarExplanation fields
- The passage should include a variety of grammar patterns appropriate for the level
- Make sure all grammar explanations are clear, concise, and include examples`;

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
        { error: data.error?.message || 'Failed to generate reading' }, 
        { status: geminiResponse.status }
      );
    }

    // Get content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json({ error: 'Invalid response from Gemini API' }, { status: 500 });
    }

    // Xử lý phản hồi từ Gemini
    let readingContent: JapaneseWord[] = [];
    let title = "日本語の読み物"; // Default title
    
    try {
      // Try to parse the response text as JSON
      readingContent = JSON.parse(content);
      
      // Generate title based on the content
      const firstSentence = extractFirstSentence(readingContent);
      if (firstSentence && firstSentence.length > 0) {
        title = firstSentence.slice(0, Math.min(firstSentence.length, 10)).join("");
      }
    } catch {
      // If direct parsing fails, try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        readingContent = JSON.parse(jsonMatch[1].trim());
      } else {
        return NextResponse.json({ error: 'Could not parse JSON from the response' }, { status: 500 });
      }
    }

    if (!Array.isArray(readingContent) || readingContent.length === 0) {
      return NextResponse.json({ error: 'Response is not a valid array of words' }, { status: 500 });
    }

    // Extract grammar points for the reading
    const grammarPointSet = new Set<string>();
    readingContent.forEach(word => {
      if (word.grammarPoint) {
        grammarPointSet.add(word.grammarPoint);
      }
    });
    
    const readingGrammarPoints = Array.from(grammarPointSet);

    // Tạo bài đọc mới
    const reading = await createReading(
      authSession.user.id,
      title,
      jlptLevel,
      readingContent,
      vocabulary.trim(),
      prompt,
      readingGrammarPoints
    );

    // Mã hóa dữ liệu trước khi gửi về client
    const { encrypted, key } = encrypt({
      readingId: reading._id,
      title: reading.title,
      content: reading.content,
      grammarPoints: reading.grammarPoints
    });

    return NextResponse.json({ 
      success: true,
      data: encrypted,
      key
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

// Helper function to extract the first sentence
function extractFirstSentence(content: JapaneseWord[]): string[] {
  const result: string[] = [];
  
  for (const wordObj of content) {
    result.push(wordObj.word);
    if (wordObj.word === "。") {
      break;
    }
  }
  
  return result;
} 