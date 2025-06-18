'use client';

import { useState, useEffect } from 'react';
import JapaneseReader from '@/components/JapaneseReader';
import { sampleReadings, JapaneseText, JapaneseWord } from '@/data/reading-data';
import { MainLayout } from '@/components/layout/main-layout';
import { BookOpen, BookText, Info, Plus, ChevronRight, BookMarked, Sparkles, ArrowRight, Brain, ScrollText, Calendar, Shuffle, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSession } from 'next-auth/react';
import { decrypt } from '@/lib/encryption';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';

interface SavedReading {
  _id: string;
  title: string;
  level: string;
  content: JapaneseWord[];
  grammarPoints?: string[];
  createdAt: string;
}

export default function ReadingPage() {
  const [selectedReadingId, setSelectedReadingId] = useState(sampleReadings[0].title);
  const [activeTab, setActiveTab] = useState('sample');
  const [savedReadings, setSavedReadings] = useState<SavedReading[]>([]);
  const [selectedSavedReadingId, setSelectedSavedReadingId] = useState<string | null>(null);
  const [currentReading, setCurrentReading] = useState<JapaneseText | null>(sampleReadings[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetchedReadings, setHasFetchedReadings] = useState(false);
  
  const { data: session } = useSession();

  // Fetch saved readings only once when the component mounts and user is logged in
  useEffect(() => {
    if (session?.user && !hasFetchedReadings) {
      fetchSavedReadings();
      setHasFetchedReadings(true);
    }
  }, [session, hasFetchedReadings]);

  // Update current reading when selection changes
  useEffect(() => {
    if (activeTab === 'sample') {
      const selected = sampleReadings.find(reading => reading.title === selectedReadingId);
      if (selected) {
        setCurrentReading(selected);
      }
    } else if (activeTab === 'saved' && selectedSavedReadingId) {
      // Kiểm tra xem có cần fetch lại không, hoặc có thể dùng dữ liệu từ savedReadings
      const existingReading = savedReadings.find(r => r._id === selectedSavedReadingId);
      if (existingReading) {
        // Nếu đã có dữ liệu, chuyển đổi sang định dạng JapaneseText
        const reading: JapaneseText = {
          title: existingReading.title,
          jlptLevel: existingReading.level,
          content: existingReading.content,
          grammarPoints: existingReading.grammarPoints
        };
        setCurrentReading(reading);
      } else {
        // Nếu không có dữ liệu, fetch từ server
        fetchReadingById(selectedSavedReadingId);
      }
    }
  }, [selectedReadingId, selectedSavedReadingId, activeTab, savedReadings]);

  const fetchSavedReadings = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/readings');
      if (!response.ok) {
        throw new Error('Failed to fetch readings');
      }
      const { success, data, key } = await response.json();
      
      if (success && data && key) {
        // Giải mã dữ liệu
        const decryptedData = decrypt(data, key) as { readings: SavedReading[] };
        setSavedReadings(decryptedData.readings || []);
        
        // Select the first saved reading if available
        if (decryptedData.readings && decryptedData.readings.length > 0) {
          setSelectedSavedReadingId(decryptedData.readings[0]._id);
        }
      } else {
        console.error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching saved readings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchReadingById = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/readings/${id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reading');
      }
      const { success, data, key } = await response.json();
      
      if (success && data && key) {
        // Giải mã dữ liệu
        const decryptedData = decrypt(data, key) as { reading: SavedReading };
        
        // Convert to JapaneseText format
        const reading: JapaneseText = {
          title: decryptedData.reading.title,
          jlptLevel: decryptedData.reading.level,
          content: decryptedData.reading.content,
          grammarPoints: decryptedData.reading.grammarPoints
        };
        
        setCurrentReading(reading);
      } else {
        console.error('Invalid response format from API');
      }
    } catch (error) {
      console.error('Error fetching reading:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Khi chuyển tab, đảm bảo hiển thị bài đọc phù hợp
    if (value === 'sample') {
      // Nếu chuyển sang tab mẫu, hiển thị bài đọc mẫu được chọn
      const selected = sampleReadings.find(reading => reading.title === selectedReadingId);
      if (selected) {
        setCurrentReading(selected);
      } else if (sampleReadings.length > 0) {
        // Nếu không có bài đọc mẫu nào được chọn, chọn bài đầu tiên
        setSelectedReadingId(sampleReadings[0].title);
        setCurrentReading(sampleReadings[0]);
      }
    } else if (value === 'saved') {
      // Nếu chuyển sang tab đã lưu
      if (selectedSavedReadingId) {
        // Nếu đã có bài đọc được chọn, hiển thị nó
        const existingReading = savedReadings.find(r => r._id === selectedSavedReadingId);
        if (existingReading) {
          // Nếu đã có dữ liệu, chuyển đổi sang định dạng JapaneseText
          const reading: JapaneseText = {
            title: existingReading.title,
            jlptLevel: existingReading.level,
            content: existingReading.content,
            grammarPoints: existingReading.grammarPoints
          };
          setCurrentReading(reading);
        } else {
          // Nếu không có dữ liệu, fetch từ server
          fetchReadingById(selectedSavedReadingId);
        }
      } else if (savedReadings.length > 0) {
        // Nếu không có bài đọc nào được chọn nhưng có bài đọc trong danh sách, chọn bài đầu tiên
        setSelectedSavedReadingId(savedReadings[0]._id);
        const reading: JapaneseText = {
          title: savedReadings[0].title,
          jlptLevel: savedReadings[0].level,
          content: savedReadings[0].content,
          grammarPoints: savedReadings[0].grammarPoints
        };
        setCurrentReading(reading);
      } else {
        // Nếu không có bài đọc nào, hiển thị trạng thái trống
        setCurrentReading(null);
      }
    }
  };

  const formatCreatedAtDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    };
    return date.toLocaleDateString('vi-VN', options);
  };
  
  // Hàm để refresh bài đọc từ server
  const refreshReading = (id: string) => {
    fetchReadingById(id);
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/patterns/circuit-board.svg')] opacity-10"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-purple-400/30 to-indigo-400/30 rounded-full translate-y-1/2 -translate-x-1/3 blur-3xl"></div>
          
          <div className="container mx-auto py-20 px-4 relative">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center"
            >
              <div className="mb-6 flex justify-center">
                <div className="bg-white/20 p-5 rounded-full inline-block shadow-lg shadow-blue-500/20 floating-icon">
                  <ScrollText className="h-10 w-10 text-white" />
                </div>
              </div>
              <h1 className="text-5xl font-bold mb-6 leading-tight text-glow">
                日本語 <span className="bg-gradient-to-r from-blue-200 to-purple-200 bg-clip-text text-transparent">Reading Practice</span>
              </h1>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto leading-relaxed">
                Nâng cao kỹ năng đọc tiếng Nhật với các bài đọc tương tác kèm furigana và trợ giúp ngôn ngữ
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/reading/generate">
                  <Button size="lg" className="w-full sm:w-auto group bg-white text-indigo-700 hover:bg-blue-50 hover:text-indigo-800 shadow-lg shadow-indigo-700/20 border-0 transition-all duration-300 ripple-effect">
                    <Sparkles className="mr-2 h-5 w-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span>Tạo bài đọc với AI</span>
                    <ArrowRight className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 transform wave-effect"></div>
        </div>

        <div className="container mx-auto py-12 px-4">
          {/* Tabs for Sample vs Saved Readings */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <Tabs 
              defaultValue="sample" 
              value={activeTab} 
              onValueChange={handleTabChange}
              className="bg-white rounded-xl shadow-lg border border-slate-100"
            >
              <TabsList className="w-full p-1 rounded-t-xl bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-100">
                <TabsTrigger 
                  value="sample" 
                  className="flex items-center rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  <span>Bài đọc mẫu</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="saved" 
                  className="flex items-center rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300" 
                  disabled={!session}
                >
                  <BookMarked className="mr-2 h-4 w-4" />
                  <span>Bài đọc đã lưu</span>
                </TabsTrigger>
              </TabsList>
              
              <div className="p-6">
                <TabsContent value="sample" className="mt-0 space-y-4">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="flex-1">
                      <label htmlFor="reading-selector" className="block text-sm font-medium text-slate-700 mb-2">
                        Chọn bài đọc mẫu:
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-blue-500/5 rounded-xl blur-xl"></div>
                        <Select value={selectedReadingId} onValueChange={setSelectedReadingId}>
                          <SelectTrigger className="w-full bg-white border-slate-200 hover:border-blue-300 transition-colors z-10 relative shadow-sm">
                            <SelectValue placeholder="Chọn bài đọc">
                              {selectedReadingId ? (
                                <div className="flex items-center">
                                  <div className="bg-indigo-100 p-1 rounded-md mr-2 flex-shrink-0">
                                    <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                                  </div>
                                  <span className="truncate">{selectedReadingId}</span>
                                </div>
                              ) : "Chọn bài đọc"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {sampleReadings.map(reading => (
                              <SelectItem key={reading.title} value={reading.title} className="py-3 px-1 hover:bg-indigo-50 transition-colors rounded-md my-1 cursor-pointer">
                                <div className="flex items-center justify-between w-full">
                                  <div className="flex items-center">
                                    <div className="bg-indigo-100 p-1.5 rounded-md mr-2">
                                      <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
                                    </div>
                                    <span>{reading.title}</span>
                                  </div>
                                  <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                                    {reading.jlptLevel}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="md:ml-4">
                      <Button 
                        className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-300 group flex items-center justify-center" 
                        onClick={() => {
                          const randomIndex = Math.floor(Math.random() * sampleReadings.length);
                          setSelectedReadingId(sampleReadings[randomIndex].title);
                        }}
                      >
                        <Shuffle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                        Bài đọc ngẫu nhiên
                      </Button>
                    </div>
                  </div>
                  
                  {selectedReadingId && (
                    <div className="mt-6 p-4 bg-indigo-50/50 rounded-lg border border-indigo-100 flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-indigo-100 p-2 rounded-full">
                          <BookOpen className="h-4 w-4 text-indigo-600" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-indigo-700">Bài đọc đã chọn</p>
                          <p className="font-medium text-slate-800">
                            {selectedReadingId}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {sampleReadings.find(r => r.title === selectedReadingId)?.jlptLevel}
                      </Badge>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="saved" className="mt-0 space-y-4">
                  {!session ? (
                    <div className="text-center py-10 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-100">
                      <div className="bg-white/80 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <BookMarked className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-slate-600 mb-4">Bạn cần đăng nhập để xem bài đọc đã lưu</p>
                      <Button variant="outline" size="sm" className="bg-white shadow-sm border-blue-200 hover:bg-blue-50 hover:text-blue-700 transition-colors">Đăng nhập</Button>
                    </div>
                  ) : isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-6 h-6 rounded-full bg-indigo-500/20"></div>
                        </div>
                      </div>
                      <p className="text-indigo-600 mt-4">Đang tải...</p>
                    </div>
                  ) : savedReadings.length === 0 ? (
                    <div className="text-center py-12 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-lg border border-slate-100">
                      <div className="bg-white/80 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm">
                        <BookMarked className="h-8 w-8 text-blue-400" />
                      </div>
                      <p className="text-slate-600 mb-4">Bạn chưa có bài đọc nào được lưu</p>
                      <Link href="/reading/generate">
                        <Button variant="default" size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 group">
                          <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                          Tạo bài đọc mới
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div>
                      <div className="mb-6">
                        <label htmlFor="saved-reading-selector" className="block text-sm font-medium text-slate-700 mb-2">
                          Chọn bài đọc đã lưu:
                        </label>
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                          <div className="flex-1 relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 rounded-xl blur-xl"></div>
                            <Select 
                              value={selectedSavedReadingId || ''} 
                              onValueChange={setSelectedSavedReadingId}
                            >
                              <SelectTrigger className="w-full bg-white border-slate-200 hover:border-blue-300 transition-colors z-10 relative shadow-sm">
                                <SelectValue placeholder="Chọn bài đọc">
                                  {selectedSavedReadingId ? (
                                    <div className="flex items-center">
                                      <div className="bg-blue-100 p-1 rounded-md mr-2 flex-shrink-0">
                                        <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                                      </div>
                                      <span className="truncate">
                                        {savedReadings.find(r => r._id === selectedSavedReadingId)?.title || "Đang tải..."}
                                      </span>
                                    </div>
                                  ) : "Chọn bài đọc"}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent className="max-h-80">
                                {savedReadings.map(reading => (
                                  <SelectItem key={reading._id} value={reading._id} className="py-3 px-1 hover:bg-blue-50 transition-colors rounded-md my-1 cursor-pointer">
                                    <div className="flex flex-col">
                                      <div className="flex items-center justify-between w-full">
                                        <div className="flex items-center">
                                          <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                                            <BookMarked className="h-3.5 w-3.5 text-blue-600" />
                                          </div>
                                          <span className="font-medium">{reading.title}</span>
                                        </div>
                                        <Badge variant="outline" className="ml-2 bg-indigo-50 text-indigo-700 border-indigo-200">
                                          {reading.level}
                                        </Badge>
                                      </div>
                                      <span className="text-xs text-slate-500 mt-1 flex items-center ml-7">
                                        <Calendar className="h-3 w-3 mr-1 inline-block" />
                                        {formatCreatedAtDate(reading.createdAt)}
                                      </span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:ml-4">
                            <Button 
                              className="w-full md:w-auto bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-md shadow-indigo-500/20 transition-all duration-300 group flex items-center justify-center"
                              onClick={() => {
                                if (savedReadings.length > 0) {
                                  const randomIndex = Math.floor(Math.random() * savedReadings.length);
                                  setSelectedSavedReadingId(savedReadings[randomIndex]._id);
                                }
                              }}
                            >
                              <Shuffle className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                              Bài đọc ngẫu nhiên
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-6">
                        <Link href="/reading/generate" className="w-full">
                          <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md shadow-blue-500/20 group">
                            <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" />
                            Tạo bài đọc mới
                          </Button>
                        </Link>
                      </div>
                      
                      {selectedSavedReadingId ? (
                        <div className="mt-6 p-4 bg-blue-50/50 rounded-lg border border-blue-100 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-blue-100 p-2 rounded-full">
                              <BookMarked className="h-4 w-4 text-blue-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-blue-700">Bài đọc đã chọn</p>
                              <p className="font-medium text-slate-800">
                                {savedReadings.find(r => r._id === selectedSavedReadingId)?.title}
                              </p>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="hover:bg-blue-100 text-blue-700 p-2 h-auto" onClick={() => refreshReading(selectedSavedReadingId)}>
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="mt-6 p-4 bg-amber-50/50 rounded-lg border border-amber-100 flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="bg-amber-100 p-2 rounded-full">
                              <Info className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm text-amber-700">Chưa chọn bài đọc</p>
                              <p className="font-medium text-slate-800">
                                Vui lòng chọn một bài đọc từ danh sách
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          </motion.div>

          {/* Reader Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl mx-auto"
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl shadow-lg border border-slate-100">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-100 border-t-indigo-500 animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20"></div>
                  </div>
                </div>
                <p className="text-indigo-600 mt-4 animate-pulse">Đang tải bài đọc...</p>
              </div>
            ) : currentReading ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-slate-100 transition-all duration-300 hover:shadow-xl">
                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-blue-50/30 py-5 px-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-indigo-900 bg-clip-text text-transparent">{currentReading.title}</h2>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white hover:from-indigo-600 hover:to-blue-600 border-0 shadow-sm shadow-indigo-500/20">
                      {currentReading.jlptLevel}
                    </Badge>
                  </div>
                  {currentReading.grammarPoints && currentReading.grammarPoints.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {currentReading.grammarPoints.map((point, index) => (
                        <Badge 
                          key={index} 
                          variant="outline" 
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors"
                        >
                          {point}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100 mb-6 shadow-sm">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700 text-sm">
                      <strong>Mẹo:</strong> Di chuột vào các ký tự kanji để xem phiên âm hiragana và nghĩa của từ.
                    </AlertDescription>
                  </Alert>
                  <JapaneseReader text={currentReading} />
                </div>
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-slate-100">
                <div className="bg-slate-50 w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="h-8 w-8 text-slate-300" />
                </div>
                <p className="text-slate-500">Không tìm thấy bài đọc</p>
              </div>
            )}
          </motion.div>

          {/* Featured Readings Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-5xl mx-auto mt-20 px-4"
          >
            <div className="text-center mb-12">
              <Badge className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border-0 mb-4">
                Tài nguyên
              </Badge>
              <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-indigo-800 to-slate-900 bg-clip-text text-transparent mb-4">Cải thiện kỹ năng đọc</h3>
              <p className="text-slate-600 max-w-2xl mx-auto">Khám phá thêm các tài nguyên hữu ích để luyện đọc tiếng Nhật hiệu quả hơn</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gradient-to-br from-white to-blue-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group floating-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardContent className="p-6 relative">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform shimmer">
                    <BookOpen className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-blue-700 transition-colors">Học từ vựng mới</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Mở rộng vốn từ vựng của bạn với các danh sách từ được phân loại theo cấp độ JLPT
                  </p>
                  <Button variant="outline" className="mt-2 bg-white hover:bg-blue-50 border-blue-200 text-blue-700 group-hover:border-blue-300 transition-all duration-300 group">
                    Khám phá
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-purple-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group floating-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardContent className="p-6 relative">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform shimmer">
                    <Brain className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-purple-700 transition-colors">Luyện ngữ pháp</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Thực hành các cấu trúc ngữ pháp phổ biến thông qua các ví dụ thực tế và bài tập
                  </p>
                  <Button variant="outline" className="mt-2 bg-white hover:bg-purple-50 border-purple-200 text-purple-700 group-hover:border-purple-300 transition-all duration-300 group">
                    Bắt đầu ngay
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-white to-emerald-50/50 border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group floating-card">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 rounded-full -translate-y-16 translate-x-16 floating-orb"></div>
                <CardContent className="p-6 relative">
                  <div className="bg-gradient-to-r from-emerald-500 to-teal-500 w-14 h-14 rounded-xl flex items-center justify-center mb-5 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform shimmer">
                    <BookText className="h-7 w-7 text-white" />
                  </div>
                  <h4 className="font-bold text-xl mb-3 text-slate-800 group-hover:text-emerald-700 transition-colors">Đọc truyện ngắn</h4>
                  <p className="text-slate-600 mb-5 leading-relaxed">
                    Thử thách bản thân với các câu chuyện ngắn được thiết kế cho người học tiếng Nhật
                  </p>
                  <Button variant="outline" className="mt-2 bg-white hover:bg-emerald-50 border-emerald-200 text-emerald-700 group-hover:border-emerald-300 transition-all duration-300 group">
                    Xem thư viện
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </div>
    </MainLayout>
  );
} 