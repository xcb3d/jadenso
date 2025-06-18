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
    
    const { audioBase64, targetText, difficultyLevel = 'beginner' } = await request.json();
    
    if (!audioBase64) {
      return NextResponse.json({ error: 'Dữ liệu âm thanh không được cung cấp' }, { status: 400 });
    }

    if (!targetText) {
      return NextResponse.json({ error: 'Văn bản mục tiêu không được cung cấp' }, { status: 400 });
    }
    
    // Use API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured on the server' }, { status: 500 });
    }

    // Create system prompt for Gemini based on difficulty level
    const systemPrompt = `Bạn là một giáo viên tiếng Nhật giàu kinh nghiệm, chuyên dạy phát âm cho học viên người Việt. Bạn có phong cách giảng dạy thân thiện, tự nhiên như bạn bè.

# VAI TRÒ CỦA BẠN
Hãy đánh giá bản ghi âm tiếng Nhật của học viên như một người bạn, tập trung vào những gì bạn nghe được. Bạn cần:
1. Ghi lại chính xác bằng CHỮ NHẬT những gì bạn nghe được từ bản ghi âm
2. Đánh giá chất lượng phát âm, ngữ điệu và độ trôi chảy

# HIỂU VỀ HỌC VIÊN
Học viên của bạn đang ở trình độ '${difficultyLevel}'. Hãy điều chỉnh phản hồi phù hợp:
- beginner: Học viên mới bắt đầu, cần được động viên nhiều
- intermediate: Học viên đã có nền tảng, cần phản hồi chi tiết hơn
- advanced: Học viên trình độ cao, cần phản hồi chuyên sâu

# CÁCH ĐÁNH GIÁ
1. Lắng nghe cẩn thận và ghi lại bằng CHỮ NHẬT chính xác những gì học viên phát âm
2. Sau đó, đối chiếu với văn bản gốc "${targetText}" (chỉ dùng để đối chiếu sau khi đã ghi lại phiên âm)
3. Đánh giá chất lượng phát âm dựa trên những gì bạn nghe được
4. Phân tích các lỗi phổ biến của người Việt khi phát âm tiếng Nhật
5. Đưa ra nhận xét với giọng điệu thân thiện, tự nhiên như bạn bè

# TIÊU CHÍ ĐÁNH GIÁ
- Độ chính xác (40%): Phát âm đúng từng âm tiết
- Trọng âm (25%): Nhấn đúng cao độ trong từng từ
- Nhịp điệu (20%): Tốc độ phù hợp, ngắt nghỉ tự nhiên
- Độ trôi chảy (15%): Phát âm tự nhiên, không gượng ép

# NHỮNG LỖI THƯỜNG GẶP
- Khó phân biệt các cặp âm tiếng Nhật: つ/す, し/ち, ふ/ほ
- Không phân biệt được nguyên âm dài và ngắn
- Phát âm không đủ mạnh với phụ âm kép (促音)
- Phát âm ん cuối từ không đúng
- Thêm nguyên âm không cần thiết giữa các phụ âm
- Áp dụng thanh điệu tiếng Việt vào trọng âm tiếng Nhật

# PHẢN HỒI CỦA BẠN
Trả về đánh giá của bạn CHỈ theo định dạng JSON sau đây, với giọng điệu thân thiện, tự nhiên như bạn bè:
{
  "japaneseTranscription": "Phiên âm tiếng Nhật chính xác của những gì bạn nghe được (bằng chữ Nhật)",
  "originalText": "${targetText}",
  "score": Điểm tổng thể từ 0-100,
  "accuracy": Điểm cho độ chính xác phát âm (0-100),
  "pitchAccent": Điểm cho trọng âm (0-100),
  "rhythm": Điểm cho nhịp điệu (0-100),
  "fluency": Điểm cho độ trôi chảy (0-100),
  "feedback": {
    "friendlyComment": "Nhận xét tổng quan bằng tiếng Việt, với giọng điệu thân thiện",
    "strengths": ["1-3 điểm mạnh cụ thể trong phát âm bằng tiếng Việt"],
    "weaknesses": ["1-3 điểm yếu cần cải thiện bằng tiếng Việt"],
    "improvementTips": ["2-3 bài tập hoặc kỹ thuật cụ thể giúp cải thiện bằng tiếng Việt"],
    "comparison": "So sánh giữa phiên âm của học viên và văn bản gốc, chỉ ra sự khác biệt bằng tiếng Việt"
  }
}

KHÔNG bao gồm bất kỳ văn bản nào bên ngoài định dạng JSON này.
Phiên âm tiếng Nhật phải được viết bằng chữ Nhật, còn phản hồi phải được viết bằng tiếng Việt, với giọng điệu thân thiện, tự nhiên như bạn bè.`;

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
                  mime_type: "audio/mp3",  // Adjust based on your audio format
                  data: audioBase64.includes('base64,') ? 
                        audioBase64.split('base64,')[1].trim() : 
                        audioBase64.trim()
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
        { error: data.error?.message || 'Không thể phân tích phát âm' }, 
        { status: geminiResponse.status }
      );
    }

    // Get content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json({ 
        error: 'Không nhận được phản hồi hợp lệ từ API phân tích phát âm' 
      }, { status: 500 });
    }

    try {
      // Clean up the content - handle markdown code blocks
      const cleanedContent = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      // Parse the JSON response
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Add debug info
      const debugInfo = {
        audioDataLength: audioBase64.length,
        targetText,
        rawGeminiResponse: data.candidates?.[0]?.content?.parts?.[0]
      };
      
      return NextResponse.json({
        ...parsedResponse,
        success: true,
        debug: debugInfo
      });
      
    } catch (error) {
      console.error("Failed to parse Gemini response:", content);
      console.error("Parse error:", error);
      
      // Return error for failed parsing
      return NextResponse.json({ 
        error: 'Không thể phân tích kết quả đánh giá phát âm' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error in speech recognition:', error);
    return NextResponse.json(
      { error: 'Lỗi khi xử lý đánh giá phát âm' },
      { status: 500 }
    );
  }
} 