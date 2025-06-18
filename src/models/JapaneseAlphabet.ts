export type AlphabetType = 'hiragana' | 'katakana' | 'kanji';

export interface JapaneseCharacter {
  id: string;
  character: string;
  romanization: string;
  type: AlphabetType;
  meaning?: string; // For kanji
  examples?: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
}

export interface AlphabetGroup {
  id: string;
  name: string;
  characters: JapaneseCharacter[];
}

export interface AlphabetCategory {
  type: AlphabetType;
  name: string;
  description: string;
  groups: AlphabetGroup[];
} 