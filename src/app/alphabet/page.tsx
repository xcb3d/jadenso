import { getAllAlphabets } from "@/app/actions/alphabet";
import { AlphabetCategory } from "@/components/alphabet/AlphabetCategory";
import { AlphabetNav } from "@/components/alphabet/AlphabetNav";
import { AlphabetSearch } from "@/components/alphabet/AlphabetSearch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchIcon, Book, Layers, Navigation2, Brain, BookOpen, LayoutGrid, Languages } from "lucide-react";

export const metadata = {
  title: "Bảng chữ cái Nhật Bản",
  description: "Học hệ thống bảng chữ cái Nhật Bản: Hiragana, Katakana, và Kanji",
};

export default async function AlphabetPage() {
  const alphabets = await getAllAlphabets();

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="text-center mb-12 relative">
        <div className="inline-block animate-fade-in relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 floating-badge mb-6">
            <Book className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-700">Bảng chữ cái</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Bảng chữ cái Nhật Bản
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Tiếng Nhật có ba hệ thống chữ viết riêng biệt: Hiragana, Katakana và Kanji. Hiragana và Katakana (gọi chung là Kana) là các bảng chữ cái biểu âm, mỗi ký tự đại diện cho một âm tiết. Kanji là các ký tự Hán tự biểu ý được vay mượn từ tiếng Trung và thường có nhiều cách đọc.
          </p>
        </div>
      </div>
      
      {/* Search section - Made more prominent */}
      <Card className="border-0 bg-gradient-to-br from-blue-50 to-indigo-50/80 shadow-lg shadow-blue-100/50 mb-12 overflow-hidden floating-card">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
        <CardContent className="p-8 relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
              <SearchIcon className="h-5 w-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Tìm kiếm ký tự</h2>
          </div>
          <AlphabetSearch />
        </CardContent>
      </Card>
      
      {/* Main content organized in tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="flex justify-center mb-8 bg-gradient-to-r from-slate-100 to-slate-50 border border-slate-200 p-1 rounded-lg">
          <TabsTrigger 
            value="overview" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-2 px-4 rounded-md transition-all duration-300"
          >
            <Layers className="h-4 w-4 mr-2" />
            Tổng quan
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-2 px-4 rounded-md transition-all duration-300"
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Tất cả ký tự
          </TabsTrigger>
          <TabsTrigger 
            value="navigation" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white py-2 px-4 rounded-md transition-all duration-300"
          >
            <Navigation2 className="h-4 w-4 mr-2" />
            Điều hướng
          </TabsTrigger>
        </TabsList>
        
        {/* Overview tab */}
        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="border-0 bg-gradient-to-br from-white to-blue-50/50 shadow-lg shadow-blue-100/50 overflow-hidden group hover:shadow-xl transition-all duration-300 floating-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                  <span className="text-xs font-bold">あ</span>
                </Badge>
              </div>
              <CardContent className="p-6 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 group-hover:shadow-lg group-hover:shadow-blue-200/50 transition-all duration-300 shimmer">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-blue-800 mb-0">Hiragana</h3>
                </div>
                <p className="text-slate-600 mb-6">Chữ cái cơ bản dùng cho từ gốc Nhật, trợ từ, đuôi động từ. Đây thường là bảng chữ cái đầu tiên mà người học tiếng Nhật nên học.</p>
                <div className="flex justify-end">
                  <a href="/alphabet/hiragana" className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium group">
                    Xem chi tiết 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-purple-50/50 shadow-lg shadow-purple-100/50 overflow-hidden group hover:shadow-xl transition-all duration-300 floating-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-violet-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  <span className="text-xs font-bold">カ</span>
                </Badge>
              </div>
              <CardContent className="p-6 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-violet-500 group-hover:shadow-lg group-hover:shadow-purple-200/50 transition-all duration-300 shimmer">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-purple-800 mb-0">Katakana</h3>
                </div>
                <p className="text-slate-600 mb-6">Chữ cái dùng để viết các từ nước ngoài, từ vay mượn, tên riêng nước ngoài và đôi khi dùng để nhấn mạnh (tương tự như in nghiêng trong tiếng Việt).</p>
                <div className="flex justify-end">
                  <a href="/alphabet/katakana" className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-800 font-medium group">
                    Xem chi tiết 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-white to-amber-50/50 shadow-lg shadow-amber-100/50 overflow-hidden group hover:shadow-xl transition-all duration-300 floating-card">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-yellow-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
              <div className="absolute top-3 right-3">
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  <span className="text-xs font-bold">漢</span>
                </Badge>
              </div>
              <CardContent className="p-6 pt-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-500 group-hover:shadow-lg group-hover:shadow-amber-200/50 transition-all duration-300 shimmer">
                    <Languages className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-xl text-amber-800 mb-0">Kanji</h3>
                </div>
                <p className="text-slate-600 mb-6">Chữ Hán được vay mượn từ tiếng Trung. Một ký tự Kanji có thể có nhiều cách đọc và ý nghĩa phức tạp. Trong tiếng Nhật hiện đại có khoảng 2,000 chữ Kanji thông dụng.</p>
                <div className="flex justify-end">
                  <a href="/alphabet/kanji" className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800 font-medium group">
                    Xem chi tiết 
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 shimmer">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Phương pháp học hiệu quả</h3>
              </div>
              <div className="space-y-4">
                <div className="flex gap-4 items-start p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-100 hover:shadow-sm transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">1</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Học theo nhóm</h4>
                    <p className="text-slate-600">Tập trung học từng nhóm nhỏ ký tự (5-10 ký tự mỗi lần) để dễ tiếp thu và ghi nhớ.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-100 hover:shadow-sm transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">2</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Viết tay</h4>
                    <p className="text-slate-600">Luyện viết ký tự để nhớ nét và cách viết đúng. Viết nhiều lần sẽ giúp cơ thể có trí nhớ cơ học.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-100 hover:shadow-sm transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">3</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Học theo bộ nhớ thị giác</h4>
                    <p className="text-slate-600">Liên kết ký tự với hình ảnh hoặc câu chuyện để tạo sự liên tưởng, giúp nhớ lâu hơn.</p>
                  </div>
                </div>
                
                <div className="flex gap-4 items-start p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/20 border border-slate-100 hover:shadow-sm transition-all duration-300">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">4</div>
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Ôn tập thường xuyên</h4>
                    <p className="text-slate-600">Sử dụng flashcards hoặc ứng dụng để ôn tập mỗi ngày, áp dụng phương pháp lặp lại ngắt quãng.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* All characters tab */}
        <TabsContent value="all">
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 shimmer">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Tất cả ký tự</h3>
              </div>
              <div>
                {alphabets.map((category) => (
                  <AlphabetCategory key={category.type} category={category} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Navigation tab with alphabet navigation */}
        <TabsContent value="navigation">
          <Card className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden mb-8">
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-gradient-to-r from-slate-600 to-slate-700 shimmer">
                  <Navigation2 className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Chọn bảng chữ cái</h3>
              </div>
              <p className="text-slate-600 mb-6">Chọn loại bảng chữ cái bạn muốn học:</p>
              <AlphabetNav />
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {alphabets.map((category) => (
              <Card key={category.type} className="border-0 bg-gradient-to-br from-white to-slate-50/50 shadow-lg shadow-slate-100/50 overflow-hidden group hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 shimmer">
                      <Languages className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">{category.name}</h3>
                  </div>
                  <p className="text-slate-600 mb-4">{category.description.substring(0, 100)}...</p>
                  <a 
                    href={`/alphabet/${category.type.toLowerCase()}`} 
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium group-hover:underline"
                  >
                    Xem tất cả {category.name} <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 