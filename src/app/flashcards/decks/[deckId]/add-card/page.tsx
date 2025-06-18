'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Plus, Upload, Trash2, FileText, Edit, Table } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addFlashcard } from '@/app/actions/flashcard';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CardFormData {
  id: string;
  front: string;
  back: string;
  pronunciation: string;
  example: string;
}

export default function AddCardPage({ params }: { params: { deckId: string } }) {
  const router = useRouter();
  const deckId = params.deckId;
  
  // Single card mode
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [example, setExample] = useState('');
  
  // Batch mode
  const [cards, setCards] = useState<CardFormData[]>([
    { id: '1', front: '', back: '', pronunciation: '', example: '' }
  ]);
  
  // CSV mode
  const [csvContent, setCsvContent] = useState('');
  const [csvPreview, setCsvPreview] = useState<CardFormData[]>([]);
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveAndAdd, setSaveAndAdd] = useState(false);
  
  // Thêm một thẻ đơn lẻ
  const handleSubmitSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addFlashcard(deckId, {
        front: front.trim(),
        back: back.trim(),
        pronunciation: pronunciation.trim(),
        example: example.trim()
      });
      
      toast.success('Đã thêm thẻ mới thành công!');
      
      if (saveAndAdd) {
        setFront('');
        setBack('');
        setPronunciation('');
        setExample('');
        setIsSubmitting(false);
      } else {
        router.push(`/flashcards/decks/${deckId}`);
      }
    } catch (error) {
      console.error('Lỗi khi thêm thẻ:', error);
      toast.error('Có lỗi xảy ra khi thêm thẻ');
      setIsSubmitting(false);
    }
  };
  
  // Thêm nhiều thẻ cùng lúc
  const handleSubmitBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const validCards = cards.filter(card => card.front.trim() && card.back.trim());
      
      if (validCards.length === 0) {
        toast.error('Vui lòng nhập ít nhất một thẻ hợp lệ');
        setIsSubmitting(false);
        return;
      }
      
      let successCount = 0;
      
      for (const card of validCards) {
        try {
          await addFlashcard(deckId, {
            front: card.front.trim(),
            back: card.back.trim(),
            pronunciation: card.pronunciation.trim(),
            example: card.example.trim()
          });
          successCount++;
        } catch (error) {
          console.error(`Lỗi khi thêm thẻ "${card.front}":`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} thẻ mới thành công!`);
        
        if (saveAndAdd) {
          setCards([{ id: '1', front: '', back: '', pronunciation: '', example: '' }]);
          setIsSubmitting(false);
        } else {
          router.push(`/flashcards/decks/${deckId}`);
        }
      } else {
        toast.error('Không thể thêm thẻ nào');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi khi thêm thẻ:', error);
      toast.error('Có lỗi xảy ra khi thêm thẻ');
      setIsSubmitting(false);
    }
  };
  
  // Thêm thẻ từ CSV
  const handleSubmitCsv = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (csvPreview.length === 0) {
        toast.error('Không có dữ liệu CSV hợp lệ');
        setIsSubmitting(false);
        return;
      }
      
      let successCount = 0;
      
      for (const card of csvPreview) {
        if (!card.front.trim() || !card.back.trim()) continue;
        
        try {
          await addFlashcard(deckId, {
            front: card.front.trim(),
            back: card.back.trim(),
            pronunciation: card.pronunciation.trim(),
            example: card.example.trim()
          });
          successCount++;
        } catch (error) {
          console.error(`Lỗi khi thêm thẻ "${card.front}":`, error);
        }
      }
      
      if (successCount > 0) {
        toast.success(`Đã thêm ${successCount} thẻ mới từ CSV thành công!`);
        router.push(`/flashcards/decks/${deckId}`);
      } else {
        toast.error('Không thể thêm thẻ nào từ CSV');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi khi thêm thẻ từ CSV:', error);
      toast.error('Có lỗi xảy ra khi thêm thẻ từ CSV');
      setIsSubmitting(false);
    }
  };
  
  // Thêm một hàng mới trong chế độ hàng loạt
  const addNewRow = () => {
    setCards([...cards, { 
      id: Date.now().toString(), 
      front: '', 
      back: '', 
      pronunciation: '', 
      example: '' 
    }]);
  };
  
  // Xóa một hàng trong chế độ hàng loạt
  const removeRow = (id: string) => {
    if (cards.length === 1) {
      setCards([{ id: '1', front: '', back: '', pronunciation: '', example: '' }]);
    } else {
      setCards(cards.filter(card => card.id !== id));
    }
  };
  
  // Cập nhật giá trị của một thẻ trong chế độ hàng loạt
  const updateCardField = (id: string, field: keyof CardFormData, value: string) => {
    setCards(cards.map(card => 
      card.id === id ? { ...card, [field]: value } : card
    ));
  };
  
  // Xử lý nhập CSV
  const handleCsvInput = (content: string) => {
    setCsvContent(content);
    
    try {
      // Phân tích nội dung CSV
      const lines = content.trim().split('\n');
      const parsedCards: CardFormData[] = [];
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Hỗ trợ cả định dạng CSV chuẩn và tab-separated
        let parts: string[];
        if (line.includes('\t')) {
          parts = line.split('\t');
        } else {
          // Xử lý CSV có dấu phẩy và có thể có dấu ngoặc kép
          const regex = /(?:^|,)(?:"([^"]*(?:""[^"]*)*)"|([^,]*))/g;
          parts = [];
          let match;
          while ((match = regex.exec(line)) !== null) {
            parts.push(match[1] || match[2] || '');
          }
        }
        
        // Đảm bảo có ít nhất 2 cột: front và back
        if (parts.length >= 2) {
          parsedCards.push({
            id: (i + 1).toString(),
            front: parts[0].replace(/""/g, '"').trim(),
            back: parts[1].replace(/""/g, '"').trim(),
            pronunciation: parts[2] ? parts[2].replace(/""/g, '"').trim() : '',
            example: parts[3] ? parts[3].replace(/""/g, '"').trim() : ''
          });
        }
      }
      
      setCsvPreview(parsedCards);
      setShowCsvPreview(parsedCards.length > 0);
    } catch (error) {
      console.error('Lỗi khi phân tích CSV:', error);
      toast.error('Định dạng CSV không hợp lệ');
      setCsvPreview([]);
      setShowCsvPreview(false);
    }
  };
  
  return (
    <>
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 rounded-xl blur-3xl"></div>
        <div className="relative px-6 py-8 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-white border border-cyan-100 shadow-lg shadow-cyan-100/20">
          <div className="flex items-center mb-2">
            <Button variant="outline" className="mr-2 border-cyan-200 hover:bg-cyan-50" asChild>
              <Link href={`/flashcards/decks/${deckId}`}>
                <ArrowLeft className="mr-2 h-4 w-4 text-cyan-700" />
                Quay lại
              </Link>
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">Thêm thẻ mới</h1>
          </div>
          
          <p className="text-slate-600 mt-1">Thêm thẻ mới vào bộ thẻ của bạn</p>
        </div>
      </div>

      <Tabs defaultValue="single" className="w-full">
        <TabsList className="mb-6 border border-cyan-100 bg-cyan-50/50 shadow-sm">
          <TabsTrigger value="single" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
            <Edit className="h-4 w-4" />
            Thêm từng thẻ
          </TabsTrigger>
          <TabsTrigger value="batch" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
            <Table className="h-4 w-4" />
            Thêm hàng loạt
          </TabsTrigger>
          <TabsTrigger value="csv" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
            <FileText className="h-4 w-4" />
            Nhập từ CSV
          </TabsTrigger>
        </TabsList>
        
        {/* Chế độ thêm từng thẻ */}
        <TabsContent value="single">
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
            <CardContent className="p-6">
              <form onSubmit={handleSubmitSingle} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6 h-full">
                    <div className="p-4 bg-cyan-50/80 rounded-lg border border-cyan-100 h-full">
                      <Label htmlFor="front" className="text-sm font-medium text-cyan-800 mb-2 block">
                        Mặt trước (Tiếng Nhật)
                      </Label>
                      <Input
                        id="front"
                        placeholder="Nhập từ tiếng Nhật"
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        required
                        className="border-cyan-100 focus-visible:ring-cyan-400 text-lg font-japanese"
                      />
                    
                      <div className="mt-4">
                        <Label htmlFor="pronunciation" className="text-sm font-medium text-cyan-800 mb-2 block">
                          Phát âm (Romaji)
                        </Label>
                        <Input
                          id="pronunciation"
                          placeholder="Nhập phát âm (không bắt buộc)"
                          value={pronunciation}
                          onChange={(e) => setPronunciation(e.target.value)}
                          className="border-cyan-100 focus-visible:ring-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-6 h-full">
                    <div className="p-4 bg-cyan-50/80 rounded-lg border border-cyan-100 h-full">
                      <Label htmlFor="back" className="text-sm font-medium text-cyan-800 mb-2 block">
                        Mặt sau (Tiếng Việt)
                      </Label>
                      <Input
                        id="back"
                        placeholder="Nhập nghĩa tiếng Việt"
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        required
                        className="border-cyan-100 focus-visible:ring-cyan-400 text-lg"
                      />
                      
                      <div className="mt-4">
                        <Label htmlFor="example" className="text-sm font-medium text-cyan-800 mb-2 block">
                          Ví dụ (không bắt buộc)
                        </Label>
                        <Textarea
                          id="example"
                          placeholder="Nhập một ví dụ sử dụng từ này"
                          value={example}
                          onChange={(e) => setExample(e.target.value)}
                          rows={3}
                          className="border-cyan-100 focus-visible:ring-cyan-400"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-200 hover:bg-cyan-50 text-slate-700"
                    onClick={() => router.push(`/flashcards/decks/${deckId}`)}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !front.trim() || !back.trim()} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30 flex items-center gap-2"
                    onClick={() => setSaveAndAdd(false)}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thẻ'}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !front.trim() || !back.trim()} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200/30 flex items-center gap-2"
                    onClick={() => setSaveAndAdd(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu & thêm tiếp'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Chế độ thêm hàng loạt */}
        <TabsContent value="batch">
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-cyan-800 flex justify-between items-center">
                <span>Thêm nhiều thẻ cùng lúc</span>
                <Button 
                  onClick={addNewRow} 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-sm shadow-cyan-200/30 flex items-center gap-2"
                  size="sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Thêm hàng
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmitBatch} className="space-y-6">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-cyan-50/80 text-left">
                        <th className="p-3 border border-cyan-100 rounded-tl-lg text-sm font-medium text-cyan-800">Tiếng Nhật</th>
                        <th className="p-3 border border-cyan-100 text-sm font-medium text-cyan-800">Tiếng Việt</th>
                        <th className="p-3 border border-cyan-100 text-sm font-medium text-cyan-800">Phát âm</th>
                        <th className="p-3 border border-cyan-100 text-sm font-medium text-cyan-800">Ví dụ</th>
                        <th className="p-3 border border-cyan-100 rounded-tr-lg text-sm font-medium text-cyan-800 w-16">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cards.map((card, index) => (
                        <tr key={card.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                          <td className="p-2 border border-cyan-100">
                            <Input
                              value={card.front}
                              onChange={(e) => updateCardField(card.id, 'front', e.target.value)}
                              placeholder="Tiếng Nhật"
                              required
                              className="border-cyan-100 focus-visible:ring-cyan-400 font-japanese"
                            />
                          </td>
                          <td className="p-2 border border-cyan-100">
                            <Input
                              value={card.back}
                              onChange={(e) => updateCardField(card.id, 'back', e.target.value)}
                              placeholder="Tiếng Việt"
                              required
                              className="border-cyan-100 focus-visible:ring-cyan-400"
                            />
                          </td>
                          <td className="p-2 border border-cyan-100">
                            <Input
                              value={card.pronunciation}
                              onChange={(e) => updateCardField(card.id, 'pronunciation', e.target.value)}
                              placeholder="Phát âm"
                              className="border-cyan-100 focus-visible:ring-cyan-400"
                            />
                          </td>
                          <td className="p-2 border border-cyan-100">
                            <Input
                              value={card.example}
                              onChange={(e) => updateCardField(card.id, 'example', e.target.value)}
                              placeholder="Ví dụ"
                              className="border-cyan-100 focus-visible:ring-cyan-400"
                            />
                          </td>
                          <td className="p-2 border border-cyan-100">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRow(card.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-cyan-200 hover:bg-cyan-50 text-slate-700"
                    onClick={() => router.push(`/flashcards/decks/${deckId}`)}
                  >
                    Hủy bỏ
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !cards.some(card => card.front.trim() && card.back.trim())} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30 flex items-center gap-2"
                    onClick={() => setSaveAndAdd(false)}
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu tất cả'}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || !cards.some(card => card.front.trim() && card.back.trim())} 
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200/30 flex items-center gap-2"
                    onClick={() => setSaveAndAdd(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu & thêm tiếp'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Chế độ nhập từ CSV */}
        <TabsContent value="csv">
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-cyan-800">Nhập thẻ từ CSV</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="mb-6">
                <p className="text-sm text-slate-600 mb-2">
                  Nhập dữ liệu CSV với định dạng: <span className="font-medium">Tiếng Nhật, Tiếng Việt, Phát âm, Ví dụ</span>
                </p>
                <p className="text-xs text-slate-500 mb-4">
                  Mỗi dòng là một thẻ. Hai cột đầu tiên (Tiếng Nhật và Tiếng Việt) là bắt buộc.
                </p>
                
                <div className="p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                  <Textarea
                    placeholder="食べる,Ăn,たべる (taberu),私は毎日朝ごはんを食べます。(Tôi ăn bữa sáng mỗi ngày.)"
                    value={csvContent}
                    onChange={(e) => handleCsvInput(e.target.value)}
                    rows={10}
                    className="font-mono text-sm border-slate-200 focus-visible:ring-slate-400"
                  />
                </div>
              </div>
              
              {showCsvPreview && csvPreview.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-slate-800 mb-3">Xem trước ({csvPreview.length} thẻ)</h3>
                  <div className="overflow-x-auto max-h-64 overflow-y-auto border border-cyan-100 rounded-lg">
                    <table className="w-full border-collapse">
                      <thead className="sticky top-0">
                        <tr className="bg-cyan-50/80 text-left">
                          <th className="p-3 border-b border-cyan-100 text-sm font-medium text-cyan-800">Tiếng Nhật</th>
                          <th className="p-3 border-b border-cyan-100 text-sm font-medium text-cyan-800">Tiếng Việt</th>
                          <th className="p-3 border-b border-cyan-100 text-sm font-medium text-cyan-800">Phát âm</th>
                          <th className="p-3 border-b border-cyan-100 text-sm font-medium text-cyan-800">Ví dụ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {csvPreview.map((card, index) => (
                          <tr key={card.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
                            <td className="p-2 border-b border-cyan-100 font-japanese">{card.front}</td>
                            <td className="p-2 border-b border-cyan-100">{card.back}</td>
                            <td className="p-2 border-b border-cyan-100">{card.pronunciation}</td>
                            <td className="p-2 border-b border-cyan-100">{card.example}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="border-cyan-200 hover:bg-cyan-50 text-slate-700"
                  onClick={() => router.push(`/flashcards/decks/${deckId}`)}
                >
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handleSubmitCsv}
                  disabled={isSubmitting || csvPreview.length === 0} 
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30 flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  {isSubmitting ? 'Đang nhập...' : 'Nhập thẻ từ CSV'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
} 