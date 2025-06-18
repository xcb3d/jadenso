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
    
    const { prompt, difficulty, quantity = 1 } = await request.json();
    
    if (!prompt) {
      return NextResponse.json({ error: 'Hãy cung cấp một yêu cầu để AI tạo bài tập' }, { status: 400 });
    }
    
    if (!difficulty || !['beginner', 'intermediate', 'advanced'].includes(difficulty)) {
      return NextResponse.json({ error: 'Độ khó không hợp lệ' }, { status: 400 });
    }
    
    // Use API key from environment variable
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({ error: 'API key is not configured on the server' }, { status: 500 });
    }
    
    // Create system prompt for Gemini
    const systemPrompt = `Bạn là một trợ lý giúp tạo ra các bài tập phát âm tiếng Nhật phù hợp với nhu cầu của người dùng.

# NHIỆM VỤ
Tạo ${quantity} bài tập phát âm tiếng Nhật phù hợp với độ khó "${difficulty}" và yêu cầu: "${prompt}".

# CẤP ĐỘ KHÓ
- beginner: Câu ngắn, cơ bản, thường dùng hàng ngày, ít từ vựng khó.
- intermediate: Câu có độ dài trung bình, từ vựng phong phú hơn.
- advanced: Câu phức tạp, dài, nhiều từ vựng chuyên ngành hoặc khó.

# CẤU TRÚC KẾT QUẢ
Trả về kết quả dưới dạng mảng JSON với cấu trúc như sau:
[
  {
    "text": "Câu tiếng Nhật",
    "translation": "Bản dịch tiếng Việt",
    "difficulty": "${difficulty}",
    "category": "Phân loại của câu/bài tập",
    "tags": ["Từ khóa 1", "Từ khóa 2", ...]
  },
  ...
]

# YÊU CẦU CHẤT LƯỢNG
- Văn bản tiếng Nhật phải chính xác về ngữ pháp và từ vựng
- Bản dịch tiếng Việt phải tự nhiên và chính xác
- Phân loại phải phản ánh nội dung bài tập (ví dụ: Giao tiếp, Du lịch, Học thuật, v.v.)
- Từ khóa phải liên quan và hữu ích cho việc phân loại

Chỉ trả về mảng JSON, không kèm theo bất kỳ giải thích nào khác.`;

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
        { error: data.error?.message || 'Lỗi khi tạo bài tập từ AI' }, 
        { status: geminiResponse.status }
      );
    }

    // Get content from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!content) {
      return NextResponse.json({ 
        error: 'Không nhận được phản hồi hợp lệ từ AI' 
      }, { status: 500 });
    }

    try {
      // Clean up the content - handle markdown code blocks
      const cleanedContent = content.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      // Parse the JSON response
      const exercises = JSON.parse(cleanedContent);
      
      // Validate the exercises format
      if (!Array.isArray(exercises)) {
        throw new Error('Kết quả không đúng định dạng');
      }
      
      // Return the exercises
      return NextResponse.json({
        success: true,
        exercises,
      });
      
    } catch (error) {
      console.error("Failed to parse Gemini response:", content);
      console.error("Parse error:", error);
      
      // Return error for failed parsing
      return NextResponse.json({ 
        error: 'Không thể phân tích kết quả từ AI' 
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('Error generating speaking exercises:', error);
    return NextResponse.json(
      { error: 'Lỗi khi tạo bài tập phát âm' },
      { status: 500 }
    );
  }
} 