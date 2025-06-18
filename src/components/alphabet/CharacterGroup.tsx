"use client";

import { AlphabetGroup } from "@/models/JapaneseAlphabet";
import { CharacterCard } from "./CharacterCard";

interface CharacterGroupProps {
  group: AlphabetGroup;
  cardSize?: "sm" | "md" | "lg";
}

export function CharacterGroup({ group, cardSize = "md" }: CharacterGroupProps) {
  return (
    <div className="mb-8">
      <h3 className="text-xl font-semibold mb-4">{group.name}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
        {group.characters.map((character) => (
          <CharacterCard key={character.id} character={character} size={cardSize} />
        ))}
      </div>
    </div>
  );
} 