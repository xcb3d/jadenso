"use client";

import { JapaneseCharacter } from "@/models/JapaneseAlphabet";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { motion } from "framer-motion";

interface CharacterCardProps {
  character: JapaneseCharacter;
  size?: "sm" | "md" | "lg";
}

export function CharacterCard({ character, size = "md" }: CharacterCardProps) {
  const sizeClasses = {
    sm: "w-20 h-24",
    md: "w-28 h-32",
    lg: "w-36 h-40",
  };

  const charSizeClasses = {
    sm: "text-3xl",
    md: "text-4xl",
    lg: "text-5xl",
  };

  // Different background colors based on character type
  const getBgColor = () => {
    switch (character.type.toLowerCase()) {
      case 'hiragana':
        return 'bg-blue-50 hover:bg-blue-100 border-blue-200';
      case 'katakana':
        return 'bg-purple-50 hover:bg-purple-100 border-purple-200';
      case 'kanji':
        return 'bg-amber-50 hover:bg-amber-100 border-amber-200';
      default:
        return 'bg-gray-50 hover:bg-gray-100 border-gray-200';
    }
  };

  return (
    <Link href={`/alphabet/character/${character.id}`} className={`block ${sizeClasses[size]}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        className="w-full h-full"
      >
        <Card 
          className={`${getBgColor()} border shadow-sm hover:shadow-md cursor-pointer w-full h-full flex flex-col text-center p-1`}
        >
          {/* Type at top */}
          <div className="text-xs text-gray-600">{character.type.toLowerCase()}</div>
          
          {/* Character in middle */}
          <div className="flex-1 flex items-center justify-center">
            <span className={`${charSizeClasses[size]} font-bold`}>
              {character.character}
            </span>
          </div>
          
          {/* Romanization at bottom */}
          <div className="text-sm text-gray-700 mb-1">{character.romanization}</div>
        </Card>
      </motion.div>
    </Link>
  );
} 