import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { getFlashcardDecks } from '@/app/actions/flashcard';
import ClientFlashcardsList from './components/client-flashcards-list';

export default async function FlashcardsPage() {
  // Lấy danh sách bộ thẻ từ server action
  const decks = await getFlashcardDecks();
  
  return (
    <>
      <div className="mb-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-200/30 via-cyan-200/30 to-teal-200/30 rounded-xl blur-3xl"></div>
        <div className="relative px-6 py-8 rounded-xl bg-gradient-to-r from-blue-50/80 via-cyan-50/80 to-white border border-cyan-100 shadow-lg shadow-cyan-100/20">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                Flashcards
              </h1>
              <p className="text-slate-600 mt-1">Quản lý và ôn tập từ vựng tiếng Nhật của bạn</p>
            </div>
            <Button asChild className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30">
              <Link href="/flashcards/create-deck">
                <Plus size={16} />
                Tạo bộ thẻ mới
              </Link>
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm bộ flashcard..."
              className="pl-9 border-cyan-100 focus-visible:ring-cyan-400"
            />
          </div>
        </div>
      </div>
      
      <Suspense fallback={<div>Đang tải...</div>}>
        <ClientFlashcardsList initialDecks={decks} />
      </Suspense>
    </>
  );
} 