'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil, Trash2, BookOpen, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { FlashcardDeck, Flashcard, deleteFlashcard } from '@/app/actions/flashcard';
import { toast } from 'sonner';
import Link from 'next/link';

interface DeckDetailClientProps {
  deck: FlashcardDeck;
  initialCards: Flashcard[];
}

export default function DeckDetailClient({ deck, initialCards }: DeckDetailClientProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [cards, setCards] = useState<Flashcard[]>(initialCards);
  const [filteredCards, setFilteredCards] = useState<Flashcard[]>(initialCards);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredCards(cards);
      return;
    }
    
    const filtered = cards.filter(card => 
      card.front.toLowerCase().includes(query) || 
      card.back.toLowerCase().includes(query) ||
      card.pronunciation?.toLowerCase().includes(query) ||
      card.example?.toLowerCase().includes(query)
    );
    
    setFilteredCards(filtered);
  }
  
  function handleEditCard(_: string) {
    router.push(`/flashcards/decks/${deck._id}/add-card`);
  }
  
  async function handleDeleteCard(cardId: string) {
    if (!cardId) return;
    
    try {
      setIsDeleting(cardId);
      await deleteFlashcard(cardId);
      
      // Cập nhật danh sách thẻ sau khi xóa
      const updatedCards = cards.filter(card => card._id !== cardId);
      setCards(updatedCards);
      setFilteredCards(updatedCards);
      
      toast.success('Đã xóa thẻ thành công');
    } catch (error) {
      console.error('Lỗi khi xóa thẻ:', error);
      toast.error('Có lỗi xảy ra khi xóa thẻ');
    } finally {
      setIsDeleting(null);
    }
  }
  
  function handleReview() {
    router.push(`/flashcards/review/${deck._id}`);
  }
  
  // Tính toán số lượng thẻ mới (chưa ôn tập)
  const newCards = cards.filter(card => !card.lastReviewed);
  
  // Tính toán số lượng thẻ đang học (đã ôn tập ít nhất 1 lần và box < 3)
  const learningCards = cards.filter(card => card.lastReviewed && card.box < 3);
  
  // Tính toán số lượng thẻ cần ôn tập (box >= 3)
  const reviewCards = cards.filter(card => card.box >= 3);
  
  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList className="mb-8 border border-cyan-100 bg-cyan-50/50 shadow-sm">
        <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          Tất cả thẻ ({cards.length})
        </TabsTrigger>
        <TabsTrigger value="new" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          Thẻ mới ({newCards.length})
        </TabsTrigger>
        <TabsTrigger value="learning" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          Đang học ({learningCards.length})
        </TabsTrigger>
        <TabsTrigger value="review" className="data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          Ôn tập ({reviewCards.length})
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="all">
        <div className="mb-6">
          <div className="relative">
            <Input
              type="text"
              placeholder="Tìm thẻ..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-9 border-cyan-100 focus-visible:ring-cyan-400"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 border border-cyan-100">
              <Search className="w-8 h-8 text-cyan-600" />
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-800">Không tìm thấy thẻ</h3>
            <p className="text-sm text-slate-600 mb-6">Không tìm thấy thẻ phù hợp với từ khóa tìm kiếm</p>
            <Button 
              onClick={() => setSearchQuery('')} 
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
            >
              Xóa tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCards.map((card) => (
              <Card key={card._id?.toString()} className="overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
                <CardContent className="p-6">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
                    <div className="w-full sm:w-5/12 p-4 bg-cyan-50/80 rounded-lg border border-cyan-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt trước</Label>
                      <div className="text-xl font-bold text-blue-700 font-japanese">{card.front}</div>
                    </div>
                    
                    <div className="w-full sm:w-7/12 p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt sau</Label>
                      <div className="text-xl font-bold text-cyan-800 mb-1">{card.back}</div>
                      {card.pronunciation && (
                        <div className="text-sm text-slate-600">{card.pronunciation}</div>
                      )}
                      {card.example && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-600">{card.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="text-xs text-slate-500">
                      {card.lastReviewed ? (
                        <span>Đã ôn tập {card.reviewCount} lần • Box {card.box}</span>
                      ) : (
                        <span>Chưa ôn tập</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50/80" 
                        onClick={() => card._id && handleEditCard(card._id.toString())}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50/80 hover:text-red-700" 
                        onClick={() => card._id && handleDeleteCard(card._id.toString())}
                        disabled={isDeleting === card._id}
                      >
                        {isDeleting === card._id ? (
                          <span className="animate-spin mr-1">◌</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="new">
        {newCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 border border-cyan-100">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-800">Chưa có thẻ mới</h3>
            <p className="text-sm text-slate-600 mb-6">Thêm các thẻ mới để bắt đầu học</p>
            <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
              <Link href={`/flashcards/decks/${deck._id}/add-card`}>
                Thêm thẻ mới
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {newCards.map((card) => (
              <Card key={card._id?.toString()} className="overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
                <CardContent className="p-6">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
                    <div className="w-full sm:w-5/12 p-4 bg-cyan-50/80 rounded-lg border border-cyan-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt trước</Label>
                      <div className="text-xl font-bold text-blue-700 font-japanese">{card.front}</div>
                    </div>
                    
                    <div className="w-full sm:w-7/12 p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt sau</Label>
                      <div className="text-xl font-bold text-cyan-800 mb-1">{card.back}</div>
                      {card.pronunciation && (
                        <div className="text-sm text-slate-600">{card.pronunciation}</div>
                      )}
                      {card.example && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-600">{card.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4 gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50/80" 
                      onClick={() => card._id && handleEditCard(card._id.toString())}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Chỉnh sửa
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-8 border-red-200 text-red-600 hover:bg-red-50/80 hover:text-red-700" 
                      onClick={() => card._id && handleDeleteCard(card._id.toString())}
                      disabled={isDeleting === card._id}
                    >
                      {isDeleting === card._id ? (
                        <span className="animate-spin mr-1">◌</span>
                      ) : (
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                      )}
                      Xóa
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="learning">
        {learningCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 border border-cyan-100">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-800">Chưa có thẻ đang học</h3>
            <p className="text-sm text-slate-600 mb-6">Bắt đầu ôn tập để đưa thẻ vào trạng thái học tập</p>
            <Button 
              onClick={handleReview} 
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
              disabled={cards.length === 0}
            >
              <BookOpen className="h-4 w-4" />
              Bắt đầu ôn tập
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {learningCards.map((card) => (
              <Card key={card._id?.toString()} className="overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
                <CardContent className="p-6">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
                    <div className="w-full sm:w-5/12 p-4 bg-cyan-50/80 rounded-lg border border-cyan-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt trước</Label>
                      <div className="text-xl font-bold text-blue-700 font-japanese">{card.front}</div>
                    </div>
                    
                    <div className="w-full sm:w-7/12 p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt sau</Label>
                      <div className="text-xl font-bold text-cyan-800 mb-1">{card.back}</div>
                      {card.pronunciation && (
                        <div className="text-sm text-slate-600">{card.pronunciation}</div>
                      )}
                      {card.example && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-600">{card.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="text-xs text-slate-500">
                      <span>Đã ôn tập {card.reviewCount} lần • Box {card.box}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50/80" 
                        onClick={() => card._id && handleEditCard(card._id.toString())}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50/80 hover:text-red-700" 
                        onClick={() => card._id && handleDeleteCard(card._id.toString())}
                        disabled={isDeleting === card._id}
                      >
                        {isDeleting === card._id ? (
                          <span className="animate-spin mr-1">◌</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="review">
        {reviewCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 border border-cyan-100">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2 text-slate-800">Không có thẻ cần ôn tập</h3>
            <p className="text-sm text-slate-600 mb-6">Quay lại sau khi bạn đã tiến hành học</p>
            <Button 
              onClick={handleReview} 
              className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
              disabled={cards.length === 0}
            >
              <BookOpen className="h-4 w-4" />
              Bắt đầu ôn tập
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {reviewCards.map((card) => (
              <Card key={card._id?.toString()} className="overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20">
                <CardContent className="p-6">
                  <div className="flex flex-wrap sm:flex-nowrap justify-between gap-4">
                    <div className="w-full sm:w-5/12 p-4 bg-cyan-50/80 rounded-lg border border-cyan-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt trước</Label>
                      <div className="text-xl font-bold text-blue-700 font-japanese">{card.front}</div>
                    </div>
                    
                    <div className="w-full sm:w-7/12 p-4 bg-slate-50/80 rounded-lg border border-slate-100">
                      <Label className="text-xs text-slate-500 font-medium mb-1 block">Mặt sau</Label>
                      <div className="text-xl font-bold text-cyan-800 mb-1">{card.back}</div>
                      {card.pronunciation && (
                        <div className="text-sm text-slate-600">{card.pronunciation}</div>
                      )}
                      {card.example && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                          <p className="text-sm text-slate-600">{card.example}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <div className="text-xs text-slate-500">
                      <span>Đã ôn tập {card.reviewCount} lần • Box {card.box}</span>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-slate-200 text-slate-700 hover:bg-slate-50/80" 
                        onClick={() => card._id && handleEditCard(card._id.toString())}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        Chỉnh sửa
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 border-red-200 text-red-600 hover:bg-red-50/80 hover:text-red-700" 
                        onClick={() => card._id && handleDeleteCard(card._id.toString())}
                        disabled={isDeleting === card._id}
                      >
                        {isDeleting === card._id ? (
                          <span className="animate-spin mr-1">◌</span>
                        ) : (
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                        )}
                        Xóa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
} 