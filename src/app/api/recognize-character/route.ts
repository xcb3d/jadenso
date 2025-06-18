import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export async function POST(request: Request) {
  try {
    // Check authentication
    const authSession = await getServerSession(authOptions);
    
    if (!authSession?.user) {
      return NextResponse.json({ error: 'Bạn cần đăng nhập để sử dụng tính năng này' }, { status: 401 });
    }
    
    const { imageBase64, targetCharacter, characterType } = await request.json();
    
    if (!imageBase64) {
      return NextResponse.json({ error: 'Hình ảnh ký tự viết tay không được cung cấp' }, { status: 400 });
    }

    // Validate characterType if provided
    if (characterType && !['hiragana', 'katakana', 'kanji'].includes(characterType)) {
      return NextResponse.json({ error: 'Loại ký tự không hợp lệ' }, { status: 400 });
    }
    
    // Use API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured on the server' }, { status: 500 });
    }

    // Construct the character set limitations based on characterType
    let characterSetLimitation = '';
    let characterSetReference = '';
    
    if (characterType === 'hiragana') {
      characterSetLimitation = 'ONLY identify Hiragana characters. Do not consider Katakana or Kanji characters.';
      characterSetReference = `
# HIRAGANA REFERENCE SET
あ(a), い(i), う(u), え(e), お(o),
か(ka), き(ki), く(ku), け(ke), こ(ko),
さ(sa), し(shi), す(su), せ(se), そ(so),
た(ta), ち(chi), つ(tsu), て(te), と(to),
な(na), に(ni), ぬ(nu), ね(ne), の(no),
は(ha), ひ(hi), ふ(fu), へ(he), ほ(ho),
ま(ma), み(mi), む(mu), め(me), も(mo),
や(ya), ゆ(yu), よ(yo),
ら(ra), り(ri), る(ru), れ(re), ろ(ro),
わ(wa), を(wo), ん(n)
が(ga), ぎ(gi), ぐ(gu), げ(ge), ご(go),
ざ(za), じ(ji), ず(zu), ぜ(ze), ぞ(zo),
だ(da), ぢ(ji), づ(zu), で(de), ど(do),
ば(ba), び(bi), ぶ(bu), べ(be), ぼ(bo),
ぱ(pa), ぴ(pi), ぷ(pu), ぺ(pe), ぽ(po)
      `;
    } 
    else if (characterType === 'katakana') {
      characterSetLimitation = 'ONLY identify Katakana characters. Do not consider Hiragana or Kanji characters.';
      characterSetReference = `
# KATAKANA REFERENCE SET
ア(a), イ(i), ウ(u), エ(e), オ(o),
カ(ka), キ(ki), ク(ku), ケ(ke), コ(ko),
サ(sa), シ(shi), ス(su), セ(se), ソ(so),
タ(ta), チ(chi), ツ(tsu), テ(te), ト(to),
ナ(na), ニ(ni), ヌ(nu), ネ(ne), ノ(no),
ハ(ha), ヒ(hi), フ(fu), ヘ(he), ホ(ho),
マ(ma), ミ(mi), ム(mu), メ(me), モ(mo),
ヤ(ya), ユ(yu), ヨ(yo),
ラ(ra), リ(ri), ル(ru), レ(re), ロ(ro),
ワ(wa), ヲ(wo), ン(n),
ガ(ga), ギ(gi), グ(gu), ゲ(ge), ゴ(go),
ザ(za), ジ(ji), ズ(zu), ゼ(ze), ゾ(zo),
ダ(da), ヂ(ji), ヅ(zu), デ(de), ド(do),
バ(ba), ビ(bi), ブ(bu), ベ(be), ボ(bo),
パ(pa), ピ(pi), プ(pu), ペ(pe), ポ(po)
      `;
    } 
    else if (characterType === 'kanji') {
      characterSetLimitation = 'ONLY identify Kanji characters. Do not consider Hiragana or Katakana characters.';
      characterSetReference = '# KANJI\nFocus on common kanji learned in Japanese education.';
    } 
    else {
      // Default behavior - consider all Japanese characters
      characterSetLimitation = 'Identify the handwritten character as either Hiragana, Katakana, or Kanji.';
      characterSetReference = '';
    }

    // Create prompt for Gemini - pure character recognition with character type limitation
    const systemPrompt = `You are a Japanese handwriting recognition expert specialized in identifying handwritten Japanese characters with extremely high accuracy.

# TASK
Analyze the provided handwritten image and identify which Japanese character it represents. ${characterSetLimitation} Provide your confidence level as a percentage.

# SPECIFIC CHARACTER SET FOCUS
${characterSetReference}

# RECOGNITION APPROACH
1. Examine the stroke count, stroke order, proportions, and distinctive features of the character.
2. Compare the image against standard forms of ${characterType || 'all Japanese'} characters.
3. Identify the most likely character match based on structural similarity.
4. Be extremely strict in your assessment - only return a high confidence if the character is clearly written.
5. If the character cannot be confidently identified, return "UNKNOWN".
6. If there is no clear character drawn, or the drawing is incomplete/unclear, return "UNKNOWN".
7. Do not guess or return a character when uncertain - it's better to return "UNKNOWN" than an incorrect guess.

# DETAILED EVALUATION CRITERIA
- Stroke count and formation (40%): Must have exactly the right number of strokes with proper shapes.
- Stroke connections and positioning (30%): Strokes must connect or separate at the correct points.
- Character proportions (20%): Parts of the character must have correct relative sizes.
- Stroke quality and execution (10%): Strokes should be confident and properly formed.

# COMMON CONFUSION PATTERNS TO AVOID
${characterType === 'hiragana' ? `
- Do not confuse similar hiragana: あ/お, は/ほ, ぬ/め, れ/わ, る/ろ, さ/き
- Watch for proper hooks in は, け, さ
- Ensure correct loop sizes in あ, の, め
- Verify correct stroke crossings in ゆ, み, や` : ''}
${characterType === 'katakana' ? `
- Do not confuse similar katakana: ウ/ワ, シ/ツ, ン/ソ, ク/タ
- Ensure proper angles in ス, ク, ケ, セ
- Verify straight lines are straight, not curved
- Check for proper stroke extension in ス, ヌ, ミ` : ''}
${characterType === 'kanji' ? `
- Focus on stroke count first, then structure
- Verify radical placement and proportions
- Check for proper enclosures and crossings` : ''}

# CONFIDENCE CALCULATION
- Start at 100% for a perfect match.
- Deduct 20-30% for any significant stroke formation error.
- Deduct 10-20% for any angle or proportion error.
- Only return confidence above 70% if you are very confident in your identification.
- If confidence is below 60%, return "UNKNOWN".
- If you cannot clearly identify what character is drawn, return "UNKNOWN".

# RETURN FORMAT
Return your answer in the following JSON format only:
{
  "character": "The recognized Japanese character or UNKNOWN",
  "confidence": A number between 0-100 representing your confidence percentage,
  "characterType": "${characterType || 'hiragana, katakana, or kanji'}"
}

DO NOT include any text outside this JSON format. The response will be parsed programmatically.`;

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
              },
              {
                inline_data: {
                  mime_type: "image/png",
                  data: imageBase64.includes('base64,') ? 
                        imageBase64.split('base64,')[1].trim() : 
                        imageBase64.trim() // Handle both formats safely and trim extra spaces
                }
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
        { error: data.error?.message || 'Không thể nhận diện ký tự' }, 
        { status: geminiResponse.status }
      );
    }

    // Get character from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json({ 
        error: 'Không nhận được phản hồi hợp lệ từ API nhận diện' 
      }, { status: 500 });
    }

    let recognizedCharacter = "UNKNOWN";
    let confidence = 0;
    let recognizedCharacterType = characterType || "";
    
    try {
      // Clean up the content - handle markdown code blocks
      const cleanedContent = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      console.log("Cleaned Gemini response:", cleanedContent);
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Extract the recognized character and confidence
      recognizedCharacter = parsedResponse.character || "UNKNOWN";
      confidence = parsedResponse.confidence || 0;
      recognizedCharacterType = parsedResponse.characterType || characterType || "";
      
      console.log("Parsed recognition result:", parsedResponse);
    } catch (error) {
      console.error("Failed to parse Gemini response:", content);
      console.error("Parse error:", error);
      
      // Return error for failed parsing
      return NextResponse.json({ 
        error: 'Không thể phân tích kết quả nhận diện' 
      }, { status: 500 });
    }
    
    // Compare with target character if provided
    let isCorrect = false;
    if (targetCharacter) {
      isCorrect = targetCharacter === recognizedCharacter;
    }
    
    // For debugging
    const debugInfo = {
      imageDataLength: imageBase64.length,
      promptSent: systemPrompt,
      rawGeminiResponse: data.candidates?.[0]?.content?.parts?.[0]
    };
    
    return NextResponse.json({
      recognizedCharacter,
      confidence,
      characterType: recognizedCharacterType,
      isCorrect,
      success: true,
      debug: debugInfo
    });
    
  } catch (error) {
    console.error('Error in character recognition:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xử lý nhận diện ký tự' },
      { status: 500 }
    );
  }
} 