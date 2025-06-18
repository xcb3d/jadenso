"use client"

import { CourseCard } from "./course-card";
import { Unit } from "@/models/Unit";
import { UserProgress } from "@/models/UserProgress";
import { ObjectId } from "mongodb";

interface LearningPathSectionProps {
  units: Unit[];
  userProgress?: UserProgress;
}

export const LearningPathSection = ({ units, userProgress }: LearningPathSectionProps) => {
  // Helper function to get unit progress
  const getUnitProgress = (unitId: string): number => {
    if (!userProgress) return 0;
    
    // Find the unit progress
    const progress = userProgress.unitProgress.find(p => 
      p.unitId.toString() === unitId || 
      (typeof unitId === 'object' && p.unitId.toString() === (unitId as unknown as { _id?: ObjectId })._id?.toString())
    );
    
    // If completed, return 100%
    if (progress?.completed) return 100;
    
    // If no progress found or not completed, check lesson progress
    const unitLessons = units.find(u => 
      u._id?.toString() === unitId || 
      (typeof unitId === 'object' && u._id?.toString() === (unitId as unknown as { _id?: ObjectId })._id?.toString())
    )?.lessons || [];
    
    if (unitLessons.length === 0) return 0;
    
    // Count completed lessons
    const completedLessons = userProgress.lessonProgress.filter(lp => 
      unitLessons.some(ul => ul.toString() === lp.lessonId.toString()) && 
      lp.status === 'completed'
    ).length;
    
    return Math.round((completedLessons / unitLessons.length) * 100);
  };

  // Find the active unit (in progress)
  const activeUnitIndex = units.findIndex(unit => {
    const progress = getUnitProgress(unit._id?.toString() || '');
    return progress > 0 && progress < 100;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Đơn vị học</h2>
        <span className="text-sm text-muted-foreground">
          {userProgress ? userProgress.unitProgress.filter(p => p.completed).length : 0}/{units.length} hoàn thành
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {units.slice(0, 3).map((unit, index) => (
          <CourseCard
            key={unit._id?.toString()}
            title={unit.title}
            description={unit.description}
            progress={getUnitProgress(unit._id?.toString() || '')}
            level={unit.difficulty.toUpperCase()}
            duration={`${unit.lessons.length} bài học`}
            rating={4.5}
            isActive={index === activeUnitIndex}
          />
        ))}
      </div>
    </div>
  );
}; 