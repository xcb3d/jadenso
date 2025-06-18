"use client";

import { useState } from "react";
import { AlphabetCategory as AlphabetCategoryType } from "@/models/JapaneseAlphabet";
import { CharacterGroup } from "./CharacterGroup";
import { GroupSelector } from "./GroupSelector";

interface AlphabetCategoryProps {
  category: AlphabetCategoryType;
}

export function AlphabetCategory({ category }: AlphabetCategoryProps) {
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  
  // Lọc các nhóm hiển thị dựa trên nhóm được chọn
  const visibleGroups = activeGroupId 
    ? category.groups.filter(group => group.id === activeGroupId)
    : category.groups;

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-3xl font-bold mb-2">{category.name}</h2>
        <p className="text-gray-600">{category.description}</p>
      </div>
      
      {/* Hiển thị bộ lọc nhóm khi có nhiều hơn 1 nhóm */}
      {category.groups.length > 1 && (
        <GroupSelector 
          groups={category.groups}
          activeGroupId={activeGroupId}
          onSelectGroup={setActiveGroupId}
        />
      )}
      
      <div>
        {visibleGroups.map((group) => (
          <CharacterGroup key={group.id} group={group} />
        ))}
      </div>
    </div>
  );
} 