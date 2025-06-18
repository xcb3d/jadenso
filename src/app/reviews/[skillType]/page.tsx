import { notFound } from 'next/navigation';
import { startReview } from '@/app/actions/review';
import { MainLayout } from '@/components/layout/main-layout';
import { ReviewClient } from '../review-client';
import Link from 'next/link';

interface ReviewPageProps {
  params: {
    skillType: string;
  };
}

const VALID_SKILLS = ['vocabulary', 'grammar', 'listening', 'reading'];
const SKILL_LABELS: Record<string, string> = {
  'vocabulary': 'Từ vựng',
  'grammar': 'Ngữ pháp',
  'listening': 'Nghe',
  'reading': 'Đọc',
};

export default async function ReviewPage({ params }: ReviewPageProps) {
  const { skillType } = params;
  
  // Kiểm tra skill type có hợp lệ không
  if (!VALID_SKILLS.includes(skillType)) {
    notFound();
  }
  
  // Lấy các bài tập ôn tập
  const reviewData = await startReview([skillType]);
  
  // Nếu không có dữ liệu ôn tập, trả về thông báo
  if (!reviewData || reviewData.exercises.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/reviews" className="text-blue-600 hover:underline mb-4 inline-block">
              &larr; Quay lại trang ôn tập
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Ôn tập {SKILL_LABELS[skillType]}
            </h1>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700">
            <h3 className="text-lg font-semibold mb-2">Không có bài tập nào để ôn tập</h3>
            <p className="mb-4">
              Hiện tại không có bài tập {SKILL_LABELS[skillType].toLowerCase()} nào để ôn tập.
              Hãy học thêm các bài học hoặc thử ôn tập kỹ năng khác.
            </p>
            <Link href="/reviews" className="text-blue-600 hover:underline">
              Quay lại trang ôn tập
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/reviews" className="text-blue-600 hover:underline mb-4 inline-block">
            &larr; Quay lại trang ôn tập
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ôn tập {SKILL_LABELS[skillType]}
          </h1>
          
          <p className="text-gray-600">
            Hoàn thành các bài tập sau để ôn tập kiến thức {SKILL_LABELS[skillType].toLowerCase()} của bạn.
          </p>
        </div>
        
        {/* Client component để xử lý tương tác ôn tập */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <ReviewClient
            reviewId={reviewData.reviewId}
            exercises={reviewData.exercises}
          />
        </div>
      </div>
    </MainLayout>
  );
} 