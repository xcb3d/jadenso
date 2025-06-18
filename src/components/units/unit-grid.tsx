import React from 'react';
import { UnitCard } from './unit-card';
import { Unit } from '@/models/Unit';
import { UserProgress } from '@/models/UserProgress';

interface UnitGridProps {
  units: Unit[];
  userProgress?: UserProgress;
}

export function UnitGrid({ units, userProgress }: UnitGridProps) {
  // Hàm kiểm tra xem unit có bị khóa hay không
  const isUnitLocked = (unit: Unit) => {
    // Nếu không có userProgress, coi như chỉ unit đầu tiên là mở khóa
    if (!userProgress) {
      return unit.order !== 1;
    }
    
    // Kiểm tra xem unit có trong danh sách đã mở khóa không
    const unitProgress = userProgress.unitProgress.find(
      (progress) => progress.unitId.toString() === unit._id?.toString()
    );
    
    return !unitProgress;
  };
  
  // Hàm lấy progress cho unit
  const getUnitProgress = (unit: Unit) => {
    if (!userProgress) return undefined;
    
    return userProgress.unitProgress.find(
      (progress) => progress.unitId.toString() === unit._id?.toString()
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {units.map((unit) => (
        <UnitCard
          key={unit._id?.toString()}
          unit={unit}
          progress={getUnitProgress(unit)}
          isLocked={isUnitLocked(unit)}
          lessonProgress={userProgress?.lessonProgress || []}
        />
      ))}
    </div>
  );
} 