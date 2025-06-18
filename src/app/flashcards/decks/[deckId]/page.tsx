import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus } from 'lucide-react';
import Link from 'next/link';
import { getFlashcardDeck, getFlashcards } from '@/app/actions/flashcard';
import { notFound } from 'next/navigation';
import DeckDetailClient from './components/deck-detail-client';

interface DeckDetailPageProps {
  params: {
    deckId: string;
  };
}

export default async function DeckDetailPage({ params }: DeckDetailPageProps) {
  try {
    // Lấy thông tin bộ thẻ và danh sách thẻ
    const deck = await getFlashcardDeck(params.deckId);
    const cards = await getFlashcards(params.deckId);
    
    return (
      <>
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 rounded-xl blur-3xl"></div>
          <div className="relative px-6 py-8 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-white border border-cyan-100 shadow-lg shadow-cyan-100/20">
            <div className="flex items-center mb-2">
              <Button variant="outline" className="mr-2 border-cyan-200 hover:bg-cyan-50" asChild>
                <Link href="/flashcards">
                  <ArrowLeft className="mr-2 h-4 w-4 text-cyan-700" />
                  Quay lại
                </Link>
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                {deck.name}
              </h1>
            </div>
            
            <p className="text-slate-600 mt-1">{deck.description || 'Không có mô tả'}</p>
            
            <div className="flex justify-between items-center mt-6">
              <div className="flex items-center space-x-4">
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-cyan-700">{deck.cardCount}</span> thẻ
                </div>
                <div className="text-sm text-slate-600">
                  <span className="font-medium text-cyan-700">{deck.tags.length}</span> thẻ gắn nhãn
                </div>
              </div>
              
              <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
                <Link href={`/flashcards/decks/${params.deckId}/add-card`}>
                  <Plus size={16} />
                  Thêm thẻ mới
                </Link>
              </Button>
            </div>
          </div>
        </div>
        
        <Suspense fallback={<div>Đang tải...</div>}>
          <DeckDetailClient deck={deck} initialCards={cards} />
        </Suspense>
      </>
    );
  } catch (error) {
    console.error('Lỗi khi tải thông tin bộ thẻ:', error);
    notFound();
  }
} 