import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getUnitWithLessons } from '@/app/actions/unit';
import { startReview } from '@/app/actions/review';
import { MainLayout } from '@/components/layout/main-layout';
import { ReviewClient } from '../../review-client';

interface UnitReviewPageProps {
  params: {
    unitId: string;
  };
}

export default async function UnitReviewPage({ params }: UnitReviewPageProps) {
  const { unitId } = params;
  
  // Lấy thông tin unit
  const { unit } = await getUnitWithLessons(unitId);
  
  // Nếu không tìm thấy unit, chuyển đến trang 404
  if (!unit) {
    notFound();
  }
  
  // Lấy danh sách các bài tập để ôn tập
  // Giả sử rằng chúng ta có bài tập từ tất cả các kỹ năng trong unit
  const skills = ['vocabulary', 'grammar']; // Có thể tùy chỉnh theo unit
  const reviewData = await startReview(skills);
  
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
              Ôn tập: {unit.title}
            </h1>
          </div>
          
          <div className="bg-yellow-50 p-6 rounded-lg text-yellow-700">
            <h3 className="text-lg font-semibold mb-2">Không có bài tập nào để ôn tập</h3>
            <p className="mb-4">
              Hiện tại không có bài tập nào trong đơn vị này để ôn tập.
              Hãy hoàn thành các bài học trong đơn vị này trước.
            </p>
            <Link href={`/units/${unitId}`} className="text-blue-600 hover:underline">
              Đi đến đơn vị học
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
            Ôn tập: {unit.title}
          </h1>
          
          <p className="text-gray-600">
            Hoàn thành các bài tập sau để ôn tập kiến thức từ đơn vị học này.
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