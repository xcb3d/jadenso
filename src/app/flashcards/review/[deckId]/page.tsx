import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getFlashcardDeck, getDueCards } from '@/app/actions/flashcard';
import { notFound } from 'next/navigation';
import FlashcardReviewClient from './components/flashcard-review-client';

interface ReviewPageProps {
  params: {
    deckId: string;
  };
}

export default async function ReviewPage({ params }: ReviewPageProps) {
  try {
    // Lấy thông tin bộ thẻ và danh sách thẻ cần ôn tập
    const deck = await getFlashcardDeck(params.deckId);
    const dueCards = await getDueCards(params.deckId);
    
    if (dueCards.length === 0) {
      // Nếu không có thẻ cần ôn tập, hiển thị thông báo
      return (
        <>
          <div className="mb-8 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 rounded-xl blur-3xl"></div>
            <div className="relative px-6 py-8 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-white border border-cyan-100 shadow-lg shadow-cyan-100/20">
              <div className="flex items-center mb-2">
                <Button variant="outline" className="mr-2 border-cyan-200 hover:bg-cyan-50" asChild>
                  <Link href={`/flashcards/decks/${params.deckId}`}>
                    <ArrowLeft className="mr-2 h-4 w-4 text-cyan-700" />
                    Quay lại
                  </Link>
                </Button>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                  Ôn tập: {deck.name}
                </h1>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-24 h-24 bg-cyan-50 rounded-full flex items-center justify-center mb-6 border border-cyan-100">
              <svg className="w-12 h-12 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Không có thẻ cần ôn tập!</h2>
            <p className="text-slate-600 mb-8 max-w-md">
              Bạn đã ôn tập tất cả các thẻ trong bộ này. Hãy quay lại sau hoặc thêm thẻ mới để tiếp tục học tập!
            </p>
            <div className="flex gap-4">
              <Button variant="outline" className="border-cyan-200 hover:bg-cyan-50" asChild>
                <Link href={`/flashcards/decks/${params.deckId}`}>
                  Quay lại bộ thẻ
                </Link>
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30" asChild>
                <Link href={`/flashcards/decks/${params.deckId}/add-card`}>
                  Thêm thẻ mới
                </Link>
              </Button>
            </div>
          </div>
        </>
      );
    }
    
    return (
      <>
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 rounded-xl blur-3xl"></div>
          <div className="relative px-6 py-8 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-white border border-cyan-100 shadow-lg shadow-cyan-100/20">
            <div className="flex items-center mb-2">
              <Button variant="outline" className="mr-2 border-cyan-200 hover:bg-cyan-50" asChild>
                <Link href={`/flashcards/decks/${params.deckId}`}>
                  <ArrowLeft className="mr-2 h-4 w-4 text-cyan-700" />
                  Quay lại
                </Link>
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                Ôn tập: {deck.name}
              </h1>
            </div>
            
            <p className="text-slate-600 mt-1">
              {dueCards.length} thẻ cần ôn tập
            </p>
          </div>
        </div>
        
        <Suspense fallback={<div>Đang tải...</div>}>
          <FlashcardReviewClient deckId={params.deckId} initialCards={dueCards} />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Lỗi khi tải thông tin ôn tập:', error);
    notFound();
  }
} 