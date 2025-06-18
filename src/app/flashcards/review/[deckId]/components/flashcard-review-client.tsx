'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CustomProgress } from '@/components/ui/custom-progress';
import { ThumbsUp, ThumbsDown, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { Flashcard, updateFlashcardProgress } from '@/app/actions/flashcard';
import { toast } from 'sonner';

interface FlashcardReviewClientProps {
  deckId: string;
  initialCards: Flashcard[];
}

export default function FlashcardReviewClient({ deckId, initialCards }: FlashcardReviewClientProps) {
  // Trạng thái
  const [cards] = useState<Flashcard[]>(initialCards);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showBack, setShowBack] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewComplete, setIsReviewComplete] = useState(false);
  const [results, setResults] = useState<Record<string, boolean>>({});

  // Các hàm xử lý
  function flipCard() {
    setShowBack(!showBack);
  }

  async function handleAnswer(isCorrect: boolean) {
    if (!cards[currentCardIndex]._id) return;
    
    setIsSubmitting(true);
    
    try {
      // Cập nhật tiến độ học tập
      const cardIdStr = typeof cards[currentCardIndex]._id === 'string' ? 
        cards[currentCardIndex]._id! : 
        cards[currentCardIndex]._id!.toString();
      
      await updateFlashcardProgress(cardIdStr, isCorrect);
      
      // Lưu kết quả
      setResults(prev => ({
        ...prev,
        [cardIdStr]: isCorrect
      }));
      
      // Chuyển sang thẻ tiếp theo
      if (currentCardIndex < cards.length - 1) {
        setTimeout(() => {
          setShowBack(false);
          setCurrentCardIndex(prev => prev + 1);
          setIsSubmitting(false);
        }, 300);
      } else {
        // Đã xem hết các thẻ
        setIsReviewComplete(true);
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Lỗi khi cập nhật tiến độ:', error);
      toast.error('Có lỗi xảy ra khi cập nhật tiến độ học tập');
      setIsSubmitting(false);
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
  
  if (!cards.length) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-16 h-16 bg-cyan-50 rounded-full flex items-center justify-center mb-4 border border-cyan-100">
          <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <h3 className="text-lg font-medium mb-2 text-slate-800">Không có thẻ cần ôn tập</h3>
        <p className="text-sm text-slate-600 mb-6">Thêm các thẻ mới để bắt đầu học</p>
        <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
          <Link href={`/flashcards/decks/${deckId}/add-card`}>
            Thêm thẻ mới
          </Link>
        </Button>
      </div>
    );
  }
  
  return (
    <>
      {/* Thanh tiến độ */}
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm">
          <span className="text-cyan-800">{currentCardIndex + 1} / {cards.length}</span>
          <span className="text-cyan-800">
            Đúng: {correctAnswers} ({cards.length > 0 ? Math.round((correctAnswers / Object.keys(results).length) * 100) || 0 : 0}%)
          </span>
        </div>
        <CustomProgress 
          value={progress} 
          className="h-2 bg-cyan-100" 
          indicatorClassName="bg-gradient-to-r from-cyan-500 to-blue-500" 
        />
      </div>
      
      {!isReviewComplete ? (
        <div className="flex flex-col items-center">
          {/* Thẻ flashcard */}
          <div className="mb-8 w-full max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/10 via-cyan-200/10 to-teal-200/10 rounded-xl blur-md transform -rotate-1"></div>
            <div 
              onClick={flipCard} 
              className="cursor-pointer perspective-1000 transition-all duration-500 h-80 sm:h-96 relative"
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
                  <Card className="w-full h-full flex items-center justify-center p-4 border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 transform hover:scale-[1.01] transition-transform">
                    <div className="absolute -bottom-1 -right-1 w-24 h-24 bg-gradient-to-br from-blue-200/20 to-cyan-200/20 rounded-full z-0"></div>
                    <div className="absolute -top-1 -left-1 w-24 h-24 bg-gradient-to-tl from-cyan-200/20 to-teal-200/20 rounded-full z-0"></div>
                    <CardContent className="p-0 w-full text-center z-10">
                      {showBack ? (
                        <div>
                          <h2 className="text-3xl font-bold mb-4 text-cyan-800">{cards[currentCardIndex].back}</h2>
                          {cards[currentCardIndex].pronunciation && (
                            <p className="text-lg mb-2 text-slate-600">{cards[currentCardIndex].pronunciation}</p>
                          )}
                          {cards[currentCardIndex].example && (
                            <div className="mt-6 p-3 bg-cyan-50/80 rounded-lg border border-cyan-100 text-left">
                              <p className="text-sm text-slate-700">{cards[currentCardIndex].example}</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <h2 className="text-4xl font-bold text-blue-700 font-japanese">{cards[currentCardIndex].front}</h2>
                      )}
                      <div className="mt-6 text-sm text-cyan-600/80">
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
            <div className="flex justify-center gap-4 w-full max-w-md">
              <Button 
                variant="outline" 
                size="lg" 
                className="flex-1 flex items-center justify-center border-red-300 bg-gradient-to-br from-white to-red-50/80 hover:bg-red-50 text-red-700" 
                onClick={() => handleAnswer(false)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">◌</span>
                ) : (
                  <ThumbsDown className="mr-2 h-5 w-5" />
                )}
                Chưa nhớ
              </Button>
              <Button 
                size="lg" 
                className="flex-1 flex items-center justify-center bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-md shadow-emerald-200/30" 
                onClick={() => handleAnswer(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="animate-spin mr-2">◌</span>
                ) : (
                  <ThumbsUp className="mr-2 h-5 w-5" />
                )}
                Đã nhớ
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Màn hình hoàn thành */
        <div className="max-w-xl mx-auto">
          <Card className="border-0 bg-gradient-to-br from-white to-cyan-50/50 shadow-lg shadow-cyan-100/20 overflow-hidden text-center">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full -translate-y-16 translate-x-16"></div>
            <div className="p-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-200/40">
                  <ThumbsUp className="h-8 w-8 text-white" />
                </div>
              </div>
              
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-cyan-700 to-teal-700 bg-clip-text text-transparent">Ôn tập hoàn thành!</h2>
              <div className="mb-8">
                <p className="text-lg mb-2 text-slate-700">Bạn đã trả lời đúng {correctAnswers} trên {cards.length} thẻ</p>
                <div className="bg-cyan-50 rounded-full p-4 w-24 h-24 mx-auto flex items-center justify-center">
                  <p className="text-3xl font-bold text-emerald-600">
                    {Math.round((correctAnswers / cards.length) * 100)}%
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={restartReview} 
                  className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30"
                >
                  <RotateCcw size={16} />
                  Ôn tập lại
                </Button>
                <Button variant="outline" className="border-cyan-200 hover:bg-cyan-50 text-slate-700" asChild>
                  <Link href={`/flashcards/decks/${deckId}`}>Quay lại bộ thẻ</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
} 