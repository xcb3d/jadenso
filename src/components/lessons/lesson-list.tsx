import React from 'react';
import { LessonCard } from '@/components/lessons/lesson-card';
import { Lesson } from '@/models/Lesson';
import { UserProgress } from '@/models/UserProgress';

interface LessonListProps {
  lessons: Lesson[];
  userProgress?: UserProgress;
}

export function LessonList({ lessons, userProgress }: LessonListProps) {
  // Sắp xếp bài học theo thứ tự
  const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
  
  // Hàm kiểm tra xem lesson có thể truy cập không
  const canAccessLesson = (lesson: Lesson) => {
    const lessonId = lesson._id?.toString();
    if (!lessonId) return false;
    
    // Nếu là bài học đầu tiên, luôn cho phép truy cập
    if (lesson.order === 1) return true;
    
    // Nếu không có tiến độ người dùng, chỉ cho phép truy cập bài đầu tiên
    if (!userProgress) return false;
    
    // Tìm bài học trước đó
    const previousLesson = lessons.find(l => l.order === lesson.order - 1);
    if (!previousLesson) return true; // Nếu không tìm thấy bài trước đó, cho phép truy cập
    
    const previousLessonId = previousLesson._id?.toString();
    if (!previousLessonId) return false;
    
    // Kiểm tra xem bài học trước đó đã hoàn thành chưa
    const previousLessonProgress = userProgress.lessonProgress.find(
      (progress) => progress.lessonId.toString() === previousLessonId
    );
    
    // Cho phép truy cập nếu bài học trước đã hoàn thành
    return previousLessonProgress?.status === 'completed';
  };
  
  // Hàm lấy progress cho lesson
  const getLessonProgress = (lesson: Lesson) => {
    if (!userProgress) return undefined;
    
    const lessonId = lesson._id?.toString();
    if (!lessonId) return undefined;
    
    const progress = userProgress.lessonProgress.find(
      (progress) => progress.lessonId.toString() === lessonId
    );
    
    return progress;
  };
  
  return (
    <div className="flex flex-col gap-0">
      {sortedLessons.map((lesson) => (
        <LessonCard
          key={lesson._id?.toString()}
          lesson={lesson}
          progress={getLessonProgress(lesson)}
          isLocked={!canAccessLesson(lesson)}
        />
      ))}
      
      {lessons.length === 0 && (
        <div className="py-4 text-center">
          <p className="text-gray-500">Không có bài học nào trong đơn vị này.</p>
        </div>
      )}
    </div>
  );
} 