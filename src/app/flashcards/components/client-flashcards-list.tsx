'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Clock, Book } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FlashcardDeck, getDueCards } from '@/app/actions/flashcard';

interface ClientFlashcardsListProps {
  initialDecks: FlashcardDeck[];
}

export default function ClientFlashcardsList({ initialDecks }: ClientFlashcardsListProps) {
  const router = useRouter();
  const decks = initialDecks;
  const [dueForReview, setDueForReview] = useState<{
    deckId: string;
    name: string;
    dueCount: number;
    lastReview: string;
  }[]>([]);
  
  useEffect(() => {
    // Lọc các bộ thẻ có thẻ cần ôn tập
    const fetchDueCards = async () => {
      try {
        const dueDecks = [];
        
        for (const deck of decks) {
          if (!deck._id) continue;
          
          const dueCards = await getDueCards(deck._id);
          
          if (dueCards.length > 0) {
            dueDecks.push({
              deckId: typeof deck._id === 'string' ? deck._id : deck._id.toString(),
              name: deck.name,
              dueCount: dueCards.length,
              lastReview: deck.lastReviewed 
                ? formatLastReviewTime(new Date(deck.lastReviewed)) 
                : 'Chưa ôn tập'
            });
          }
        }
        
        setDueForReview(dueDecks);
      } catch (error) {
        console.error('Lỗi khi lấy thẻ cần ôn tập:', error);
      }
    };
    
    fetchDueCards();
  }, [decks]);
  
  // Hàm định dạng thời gian ôn tập cuối
  function formatLastReviewTime(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else {
      return `${diffDays} ngày trước`;
    }
  }
  
  function handleReviewDeck(deckId: string) {
    router.push(`/flashcards/review/${deckId}`);
  }
  
  function handleEditDeck(deckId: string) {
    router.push(`/flashcards/decks/${deckId}`);
  }
  
  return (
    <Tabs defaultValue="myCards" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-8 border border-cyan-100 bg-cyan-50/50 shadow-sm">
        <TabsTrigger value="myCards" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          <Package size={16} />
          Bộ thẻ của tôi
        </TabsTrigger>
        <TabsTrigger value="review" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          <Clock size={16} />
          Cần ôn tập {dueForReview.length > 0 && <span className="ml-1 bg-cyan-600 text-white text-xs rounded-full px-1.5 py-0.5">{dueForReview.length}</span>}
        </TabsTrigger>
        <TabsTrigger value="study" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-cyan-700 data-[state=active]:shadow-sm">
          <Book size={16} />
          Học tập
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="myCards">
        {decks.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 p-8 text-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package size={64} className="text-cyan-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Chưa có bộ thẻ nào</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Bạn chưa tạo bộ flashcard nào. Hãy tạo bộ thẻ đầu tiên để bắt đầu học tập!
              </p>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
                <Link href="/flashcards/create-deck">
                  Tạo bộ thẻ mới
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map(deck => (
              <Card key={deck._id?.toString()} className="flex flex-col group overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 hover:shadow-xl hover:shadow-cyan-200/30 transition-all duration-500">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16"></div>
                <CardHeader>
                  <CardTitle className="group-hover:text-cyan-700 transition-colors">{deck.name}</CardTitle>
                  <CardDescription>{deck.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-2">
                    {deck.cardCount} thẻ
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {deck.tags.map(tag => (
                      <Badge key={tag} variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => deck._id && handleEditDeck(deck._id.toString())} 
                    className="border-cyan-200 hover:bg-cyan-50 text-slate-700"
                  >
                    Chỉnh sửa
                  </Button>
                  <Button 
                    onClick={() => deck._id && handleReviewDeck(deck._id.toString())} 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
                    disabled={deck.cardCount === 0}
                  >
                    Ôn tập
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="review">
        {dueForReview.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 p-8 text-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Clock size={64} className="text-cyan-300 mb-4" />
              <h3 className="text-xl font-semibold text-slate-700 mb-2">Không có thẻ cần ôn tập</h3>
              <p className="text-slate-500 mb-6 max-w-md mx-auto">
                Bạn đã ôn tập tất cả các thẻ. Hãy quay lại sau hoặc thêm thẻ mới để tiếp tục học tập!
              </p>
              <Button asChild className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
                <Link href="/flashcards">
                  Quay lại
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {dueForReview.map(deck => (
              <Card key={deck.deckId} className="flex flex-col group overflow-hidden border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 hover:shadow-xl hover:shadow-cyan-200/30 transition-all duration-500">
                <CardHeader>
                  <CardTitle className="group-hover:text-cyan-700 transition-colors">{deck.name}</CardTitle>
                  <CardDescription>Cần ôn tập: {deck.dueCount} thẻ</CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    Lần ôn tập cuối: {deck.lastReview}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button 
                    onClick={() => handleReviewDeck(deck.deckId)} 
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
                  >
                    Bắt đầu ôn tập
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="study">
        <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16"></div>
          <CardHeader>
            <CardTitle className="text-slate-900">Chế độ học tập</CardTitle>
            <CardDescription>
              Học từ vựng và kiến thức mới trước khi thêm vào bộ flashcards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-slate-600">
              Chọn một chế độ học tập phù hợp với bạn:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Button variant="outline" className="h-24 flex flex-col bg-gradient-to-br from-white to-blue-50/50 border-blue-100 hover:bg-blue-50/50 hover:border-blue-200 hover:shadow-md hover:shadow-blue-200/20 transition-all" asChild>
                <Link href="/flashcards/study/vocabulary">
                  <span className="font-bold mb-1 text-blue-700">Từ vựng</span>
                  <span className="text-sm text-slate-600">Học từ mới theo chủ đề</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col bg-gradient-to-br from-white to-purple-50/50 border-purple-100 hover:bg-purple-50/50 hover:border-purple-200 hover:shadow-md hover:shadow-purple-200/20 transition-all" asChild>
                <Link href="/flashcards/study/kanji">
                  <span className="font-bold mb-1 text-purple-700">Kanji</span>
                  <span className="text-sm text-slate-600">Học và thực hành Kanji</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col bg-gradient-to-br from-white to-teal-50/50 border-teal-100 hover:bg-teal-50/50 hover:border-teal-200 hover:shadow-md hover:shadow-teal-200/20 transition-all" asChild>
                <Link href="/flashcards/study/grammar">
                  <span className="font-bold mb-1 text-teal-700">Ngữ pháp</span>
                  <span className="text-sm text-slate-600">Ôn tập cấu trúc ngữ pháp</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 