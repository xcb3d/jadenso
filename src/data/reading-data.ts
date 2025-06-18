export interface JapaneseWord {
  word: string;
  reading: string;
  meaning?: string;
  grammarPoint?: string;
  grammarType?: string;
  grammarExplanation?: string;
}

export interface JapaneseText {
  title: string;
  content: JapaneseWord[];
  jlptLevel?: string;
  grammarPoints?: string[];
}

// Mẫu bài đọc tiếng Nhật
export const sampleReadings: JapaneseText[] = [
  {
    title: "私の一日",
    jlptLevel: "N5",
    grammarPoints: ["は-主語", "を-目的語", "に-場所/時点", "で-場所", "ます形", "て形"],
    content: [
      { word: "私", reading: "わたし", meaning: "Tôi" },
      { 
        word: "は", 
        reading: "は", 
        meaning: "Trợ từ chỉ chủ thể", 
        grammarPoint: "は-主語", 
        grammarType: "助詞", 
        grammarExplanation: "Trợ từ 'は' dùng để đánh dấu chủ ngữ trong câu. Ví dụ: 私は学生です (Tôi là học sinh)." 
      },
      { word: "毎日", reading: "まいにち", meaning: "Hàng ngày" },
      { word: "学校", reading: "がっこう", meaning: "Trường học" },
      { 
        word: "に", 
        reading: "に", 
        meaning: "Trợ từ chỉ địa điểm", 
        grammarPoint: "に-場所/時点", 
        grammarType: "助詞", 
        grammarExplanation: "Trợ từ 'に' dùng để chỉ nơi đến của hành động di chuyển hoặc thời điểm. Ví dụ: 東京に行きます (Tôi đi Tokyo), 7時に起きます (Tôi thức dậy lúc 7 giờ)." 
      },
      { word: "行き", reading: "いき", meaning: "Đi" },
      { word: "ます", reading: "ます", meaning: "Đuôi thể hiện tại lịch sự" },
      { word: "。", reading: "。" }
    ]
  }
]; 