'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ThumbsUp, ThumbsDown, ArrowLeft, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface CardData {
  id: string;
  front: string;
  back: string;
  example?: string;
  pronunciation?: string;
}

export default function ReviewPage({ params }: { params: { deckId: string } }) {
  console.log("Reviewing deck:", params.deckId); // For troubleshooting
  
  // Trạng thái
  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Demo data
  useEffect(() => {
    // Giả lập tải dữ liệu từ API
    // Trong thực tế sẽ dùng params.deckId để fetch dữ liệu từ server
    setTimeout(() => {
      const demoCards: CardData[] = [
        { 
          id: '1', 
          front: '食べる', 
          back: 'Ăn', 
          pronunciation: 'たべる (taberu)',
          example: '私は毎日朝ごはんを食べます。(Tôi ăn bữa sáng mỗi ngày.)'
        },
        { 
          id: '2', 
          front: '飲む', 
          back: 'Uống', 
          pronunciation: 'のむ (nomu)',
          example: '水をたくさん飲みます。(Tôi uống nhiều nước.)'
        },
        { 
          id: '3', 
          front: '行く', 
          back: 'Đi', 
          pronunciation: 'いく (iku)',
          example: '学校に行きます。(Tôi đi đến trường.)'
        },
        { 
          id: '4', 
          front: '来る', 
          back: 'Đến', 
          pronunciation: 'くる (kuru)',
          example: '友達が来ました。(Bạn tôi đã đến.)'
        },
        { 
          id: '5', 
          front: '見る', 
          back: 'Xem, nhìn', 
          pronunciation: 'みる (miru)',
          example: 'テレビを見ています。(Tôi đang xem tivi.)'
        },
      ];
      
      setCards(demoCards);
      setIsLoading(false);
    }, 800);
  }, [params.deckId]);

  // Các hàm xử lý
  function flipCard() {
    setShowBack(!showBack);
  }

  function handleAnswer(isCorrect: boolean) {
    // Lưu kết quả
    setResults(prev => ({
      ...prev,
      [cards[currentCardIndex].id]: isCorrect
    }));

    // Chuyển sang thẻ tiếp theo
    if (currentCardIndex < cards.length - 1) {
      setTimeout(() => {
        setShowBack(false);
        setCurrentCardIndex(prev => prev + 1);
      }, 300);
    } else {
      // Đã xem hết các thẻ
      setIsReviewComplete(true);
      // Trong thực tế, ở đây sẽ gửi kết quả lên server
    }
  }

  function restartReview() {
    setCurrentCardIndex(0);
    setShowBack(false);
    setResults({});
    setIsReviewComplete(false);
  }
  
  // Tính toán thống kê
  const correctAnswers = Object.values(results).filter(result => result).length;
  const progress = cards.length ? Math.round(((currentCardIndex + (isReviewComplete ? 1 : 0)) / cards.length) * 100) : 0;
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Đang tải thẻ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-2" asChild>
          <Link href="/flashcards">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Ôn tập Flashcards</h1>
      </div>
      
      {/* Thanh tiến độ */}
      <div className="mb-6">
        <div className="flex justify-between mb-2 text-sm">
          <span>{currentCardIndex + 1} / {cards.length}</span>
          <span>Đúng: {correctAnswers} ({cards.length > 0 ? Math.round((correctAnswers / Object.keys(results).length) * 100) || 0 : 0}%)</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {!isReviewComplete ? (
        <>
          {/* Thẻ flashcard */}
          <div className="mb-8">
            <div 
              onClick={flipCard} 
              className="cursor-pointer perspective-1000 transition-all duration-500 h-64 sm:h-80"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={showBack ? 'back' : 'front'}
                  initial={{ rotateY: showBack ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: showBack ? 90 : -90, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full"
                >
                  <Card className="w-full h-full flex items-center justify-center p-4">
                    <CardContent className="p-0 w-full text-center">
                      {showBack ? (
                        <div>
                          <h2 className="text-3xl font-bold mb-4">{cards[currentCardIndex].back}</h2>
                          {cards[currentCardIndex].pronunciation && (
                            <p className="text-lg mb-2 text-muted-foreground">{cards[currentCardIndex].pronunciation}</p>
                          )}
                          {cards[currentCardIndex].example && (
                            <div className="mt-4 p-2 bg-muted rounded text-left">
                              <p className="text-sm">{cards[currentCardIndex].example}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <h2 className="text-4xl font-bold">{cards[currentCardIndex].front}</h2>
                      )}
                      <div className="mt-4 text-sm text-muted-foreground">
                        Nhấp để lật thẻ
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
          
          {/* Nút đánh giá */}
          {showBack && (
            <div className="flex justify-center gap-4">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 flex items-center justify-center border-red-500 hover:bg-red-500/10" 
                onClick={() => handleAnswer(false)}
              >
                <ThumbsDown className="mr-2 h-5 w-5" />
                Chưa nhớ
              </Button>
              <Button 
                size="lg" 
                className="flex-1 flex items-center justify-center bg-green-600 hover:bg-green-700" 
                onClick={() => handleAnswer(true)}
              >
                <ThumbsUp className="mr-2 h-5 w-5" />
                Đã nhớ
              </Button>
            </div>
          )}
        </>
      ) : (
        /* Màn hình hoàn thành */
        <Card className="p-6 text-center">
          <h2 className="text-2xl font-bold mb-4">Ôn tập hoàn thành!</h2>
          <div className="mb-6">
            <p className="text-lg mb-2">Bạn đã trả lời đúng {correctAnswers} trên {cards.length} thẻ</p>
            <p className="text-3xl font-bold text-green-600">
              {Math.round((correctAnswers / cards.length) * 100)}%
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={restartReview} className="flex items-center gap-2">
              <RotateCcw size={16} />
              Ôn tập lại
            </Button>
            <Button variant="outline" asChild>
              <Link href="/flashcards">Quay lại bộ thẻ</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
} 