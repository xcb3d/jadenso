"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { CharacterCard } from "./CharacterCard";
import { JapaneseCharacter } from "@/models/JapaneseAlphabet";
import { searchCharacters } from "@/app/actions/alphabet";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, X, Filter } from "lucide-react";

export function AlphabetSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JapaneseCharacter[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [showFilterOptions, setShowFilterOptions] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    
    if (value.trim().length > 0) {
      setIsSearching(true);
      const searchResults = await searchCharacters(value);
      // Apply type filter if not "all"
      const filteredResults = typeFilter === "all" 
        ? searchResults 
        : searchResults.filter(char => char.type.toLowerCase() === typeFilter);
      setResults(filteredResults);
      setIsSearching(false);
    } else {
      setResults([]);
    }
  };

  const handleFilterChange = async (value: string) => {
    setTypeFilter(value);
    
    // Re-apply search with new filter if there's a query
    if (query.trim().length > 0) {
      setIsSearching(true);
      const searchResults = await searchCharacters(query);
      const filteredResults = value === "all" 
        ? searchResults 
        : searchResults.filter(char => char.type.toLowerCase() === value);
      setResults(filteredResults);
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setTypeFilter("all");
  };

  return (
    <div className="w-full">
      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <Input
              id="search-alphabet"
              type="text"
              placeholder="Tìm kiếm theo ký tự, cách đọc, hoặc ý nghĩa..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10"
            />
            {query.length > 0 && (
              <button 
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={handleClear}
              >
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          <Button 
            variant="outline"
            size="icon"
            onClick={() => setShowFilterOptions(!showFilterOptions)}
            className={showFilterOptions ? "bg-blue-50" : ""}
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {showFilterOptions && (
          <div className="flex flex-wrap items-center gap-3 p-3 bg-gray-50 rounded-md">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Loại:</span>
              <Select value={typeFilter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="hiragana">Hiragana</SelectItem>
                  <SelectItem value="katakana">Katakana</SelectItem>
                  <SelectItem value="kanji">Kanji</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4">
        {isSearching ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Đang tìm kiếm...</span>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-600">Tìm thấy {results.length} kết quả{typeFilter !== "all" ? ` cho ${typeFilter}` : ""}</p>
              <Button variant="ghost" size="sm" onClick={handleClear} className="text-sm">
                Xóa kết quả
              </Button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {results.map((character) => (
                <CharacterCard key={character.id} character={character} size="sm" />
              ))}
            </div>
          </div>
        ) : query.trim().length > 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Không tìm thấy kết quả phù hợp</p>
            <p className="text-sm text-gray-400 mt-1">
              Hãy thử tìm kiếm với từ khóa khác hoặc điều chỉnh bộ lọc
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
} 