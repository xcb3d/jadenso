"use client";

import { AlphabetGroup } from "@/models/JapaneseAlphabet";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface GroupSelectorProps {
  groups: AlphabetGroup[];
  activeGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
}

export function GroupSelector({ groups, activeGroupId, onSelectGroup }: GroupSelectorProps) {
  // Get selected group info
  const selectedGroup = activeGroupId ? groups.find(g => g.id === activeGroupId) : null;
  
  return (
    <div className="mb-6">
      <div className="flex items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700 mr-2">Chọn nhóm:</h3>
        <Badge variant="outline" className="bg-gray-100 text-gray-500 font-normal">
          {groups.length} nhóm
        </Badge>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onSelectGroup(null)}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
            activeGroupId === null
              ? "bg-blue-600 text-white shadow-sm"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Tất cả
        </motion.button>
        
        {groups.map((group) => (
          <motion.button
            key={group.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelectGroup(group.id)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-200 ${
              activeGroupId === group.id
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {group.name}
            {group.characters.length > 0 && (
              <span className="ml-1 text-xs opacity-75">({group.characters.length})</span>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Selected Group Info */}
      {selectedGroup && (
        <div className="mt-3 p-3 bg-gray-50 rounded-md border border-gray-200 text-sm text-gray-600">
          <div className="font-medium">{selectedGroup.name}</div>
          <div className="mt-1">Số ký tự: {selectedGroup.characters.length}</div>
        </div>
      )}
    </div>
  );
} 