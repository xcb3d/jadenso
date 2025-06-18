import { AlphabetCategory as AlphabetCategoryComponent } from "@/components/alphabet/AlphabetCategory";
import { AlphabetNav } from "@/components/alphabet/AlphabetNav";
import { AlphabetSearch } from "@/components/alphabet/AlphabetSearch";
import { getAlphabetByType } from "@/app/actions/alphabet";
import { AlphabetType } from "@/models/JapaneseAlphabet";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Languages, BookOpen, Lightbulb, ListChecks, PenTool, Brain } from "lucide-react";

const alphabetInfo = {
  hiragana: {
    title: "Bảng chữ cái Hiragana",
    description: "Hiragana là bảng chữ cái đầu tiên nên học khi bắt đầu với tiếng Nhật.",
    extendedInfo: "Hiragana được sử dụng để viết các từ gốc Nhật, đuôi ngữ pháp, từ ghép và hỗ trợ đọc kanji (furigana). Đây là bảng chữ cái cơ bản nhất mà mọi người học tiếng Nhật đều cần phải nắm vững.",
    tips: ["Tập trung học theo thứ tự từng hàng (hàng A, hàng K, hàng S...)", "Luyện viết mỗi ký tự nhiều lần để nhớ", "Học các từ đơn giản với mỗi ký tự để nhớ lâu hơn"],
    color: "from-blue-500 to-indigo-500",
    bgColor: "from-blue-50 to-indigo-50/50",
    textColor: "text-blue-800",
    borderColor: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    character: "あ"
  },
  katakana: {
    title: "Bảng chữ cái Katakana",
    description: "Katakana chủ yếu dùng cho từ vay mượn từ tiếng nước ngoài.",
    extendedInfo: "Katakana có cấu trúc âm tiết giống với Hiragana, nhưng thường được dùng để viết các từ nước ngoài, tên nước ngoài, và từ vay mượn. Nó cũng được dùng cho các từ mô phỏng âm thanh, tên khoa học, và để nhấn mạnh từ ngữ.",
    tips: ["So sánh với Hiragana để dễ học", "Chú ý các ký tự dễ nhầm lẫn như シ (shi) và ツ (tsu)", "Tập đọc các từ vay mượn như 'テレビ' (terebi - TV)"],
    color: "from-purple-500 to-violet-500",
    bgColor: "from-purple-50 to-violet-50/50",
    textColor: "text-purple-800",
    borderColor: "border-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    character: "カ"
  },
  kanji: {
    title: "Kanji - Chữ Hán Nhật",
    description: "Kanji là ký tự Hán tự vay mượn từ tiếng Trung, được sử dụng rộng rãi trong tiếng Nhật.",
    extendedInfo: "Kanji là hệ thống ký tự phức tạp nhất trong tiếng Nhật. Một chữ Kanji có thể có nhiều cách đọc (âm Hán - onyomi và âm Nhật - kunyomi) và có thể biểu thị các khái niệm phức tạp. Người Nhật sử dụng khoảng 2,000 chữ Kanji hàng ngày.",
    tips: ["Học theo bộ thủ (radicals) để dễ nhớ", "Tập trung vào Kanji thông dụng trước (JLPT N5, N4)", "Luyện tập viết và sử dụng SRS (hệ thống ôn tập ngắt quãng) để học hiệu quả"],
    color: "from-amber-500 to-yellow-500",
    bgColor: "from-amber-50 to-yellow-50/50",
    textColor: "text-amber-800",
    borderColor: "border-amber-200",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    character: "漢"
  }
};

export async function generateMetadata({ params }: { params: { type: string } }) {
  const type = params.type as AlphabetType;
  
  if (alphabetInfo[type]) {
    return {
      title: alphabetInfo[type].title,
      description: alphabetInfo[type].description,
    };
  }
  
  const typeCapitalized = type.charAt(0).toUpperCase() + type.slice(1);
  return {
    title: `${typeCapitalized} | Bảng chữ cái Nhật Bản`,
    description: `Học bảng chữ cái ${typeCapitalized} trong tiếng Nhật.`,
  };
}

export async function generateStaticParams() {
  return [
    { type: "hiragana" },
    { type: "katakana" },
    { type: "kanji" },
  ];
}

export default async function AlphabetTypePage({ params }: { params: { type: string } }) {
  const type = params.type as AlphabetType;
  
  const alphabet = await getAlphabetByType(type);
  
  if (!alphabet) {
    notFound();
  }
  
  const info = alphabetInfo[type];
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
          <div className="inline-block animate-fade-in relative">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 floating-badge mb-6">
              <Languages className={`h-4 w-4 ${info ? info.iconColor : 'text-blue-500'}`} />
              <span className="text-sm font-medium text-slate-700">Bảng chữ cái</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
              {alphabet.name}
              {info && <span className="ml-3 text-5xl opacity-75 character-bounce">{info.character}</span>}
            </h1>
            <div className={`w-20 h-1 bg-gradient-to-r ${info ? info.color : 'from-blue-400 to-indigo-500'} mx-auto mb-6 rounded-full`}></div>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              {alphabet.description}
            </p>
          </div>
        </div>
        
        {/* Info Card */}
        {info && (
          <Card className={`border-0 bg-gradient-to-br ${info.bgColor} shadow-lg shadow-slate-100/50 overflow-hidden mb-12 floating-card`}>
            <div className="absolute top-0 right-0 w-64 h-64 opacity-10 flex items-center justify-center">
              <span className="text-9xl font-bold text-slate-800/10">{info.character}</span>
            </div>
            <CardContent className="p-8 relative">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-2 rounded-lg bg-gradient-to-r ${info.color} shimmer`}>
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Thông tin chi tiết</h2>
              </div>
              
              <p className="mb-8 text-slate-700 leading-relaxed">{info.extendedInfo}</p>
              
              {info.tips && info.tips.length > 0 && (
                <div className="bg-white/60 rounded-xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-full ${info.iconBg}`}>
                      <Lightbulb className={`h-5 w-5 ${info.iconColor}`} />
                    </div>
                    <h3 className={`font-semibold ${info.textColor}`}>Mẹo học tập</h3>
                  </div>
                  <ul className="space-y-3">
                    {info.tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className={`p-1 rounded-full ${info.iconBg} mt-1 flex-shrink-0`}>
                          <ListChecks className={`h-3 w-3 ${info.iconColor}`} />
                        </div>
                        <span className="text-slate-700">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Navigation */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${info ? info.color : 'from-slate-600 to-slate-700'} shimmer`}>
              <Languages className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Điều hướng bảng chữ cái</h2>
          </div>
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden mb-8">
            <CardContent className="p-6">
              <AlphabetNav activeType={type} />
            </CardContent>
          </Card>
        </div>
        
        {/* Search */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${info ? info.color : 'from-slate-600 to-slate-700'} shimmer`}>
              <Brain className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Tìm kiếm ký tự</h2>
          </div>
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden mb-8">
            <CardContent className="p-6">
              <AlphabetSearch />
            </CardContent>
          </Card>
        </div>
        
        {/* Character Grid */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-lg bg-gradient-to-r ${info ? info.color : 'from-slate-600 to-slate-700'} shimmer`}>
              <PenTool className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Danh sách ký tự</h2>
          </div>
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardContent className="p-6">
              <AlphabetCategoryComponent category={alphabet} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 