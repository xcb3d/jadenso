"use server";

import { japaneseAlphabetData } from "@/data/alphabet-data";
import { AlphabetCategory, AlphabetGroup, AlphabetType, JapaneseCharacter } from "@/models/JapaneseAlphabet";

/**
 * Get all alphabet categories
 */
export async function getAllAlphabets(): Promise<AlphabetCategory[]> {
  return japaneseAlphabetData;
}

/**
 * Get a specific alphabet category by type
 */
export async function getAlphabetByType(type: AlphabetType): Promise<AlphabetCategory | null> {
  const category = japaneseAlphabetData.find(cat => cat.type === type);
  return category || null;
}

/**
 * Get a specific group from an alphabet by its ID
 */
export async function getAlphabetGroupById(groupId: string): Promise<AlphabetGroup | null> {
  for (const category of japaneseAlphabetData) {
    const group = category.groups.find(g => g.id === groupId);
    if (group) {
      return group;
    }
  }
  return null;
}

/**
 * Get a specific character by its ID
 */
export async function getCharacterById(characterId: string): Promise<JapaneseCharacter | null> {
  for (const category of japaneseAlphabetData) {
    for (const group of category.groups) {
      const character = group.characters.find(c => c.id === characterId);
      if (character) {
        return character;
      }
    }
  }
  return null;
}

/**
 * Search characters by query string (matches against character, romanization, or meaning)
 */
export async function searchCharacters(query: string): Promise<JapaneseCharacter[]> {
  const results: JapaneseCharacter[] = [];
  const lowerQuery = query.toLowerCase();

  for (const category of japaneseAlphabetData) {
    for (const group of category.groups) {
      const matchingChars = group.characters.filter(char => 
        char.character.includes(query) || 
        char.romanization.toLowerCase().includes(lowerQuery) ||
        (char.meaning && char.meaning.toLowerCase().includes(lowerQuery))
      );
      results.push(...matchingChars);
    }
  }

  return results;
} 