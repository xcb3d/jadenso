'use client';

import React, { useState, useCallback } from 'react';
import { JapaneseText } from '@/data/reading-data';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Volume2, BookText, GraduationCap, Info } from 'lucide-react';
import './JapaneseReader.css';

interface JapaneseReaderProps {
  text: JapaneseText;
}

const JapaneseReader: React.FC<JapaneseReaderProps> = ({ text }) => {
  const [showAllFurigana, setShowAllFurigana] = useState(false);
  const [hoveredWordId, setHoveredWordId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showGrammar, setShowGrammar] = useState(false);
  const [activeGrammarPoint, setActiveGrammarPoint] = useState<string | null>(null);

  // Kiểm tra xem từ có phải là kanji hay không
  const hasKanji = (word: string): boolean => {
    // Khoảng mã Unicode cho kanji
    const kanjiRegex = /[\u4e00-\u9faf\u3400-\u4dbf]/;
    return kanjiRegex.test(word);
  };

  // Kiểm tra từ có nghĩa hay không
  const hasMeaning = (meaning?: string): boolean => {
    return !!meaning && meaning.trim().length > 0;
  };

  // Kiểm tra từ có điểm ngữ pháp không
  const hasGrammarPoint = (grammarPoint?: string): boolean => {
    return !!grammarPoint && grammarPoint.trim().length > 0;
  };

  // Tạo ID duy nhất cho mỗi từ
  const getWordId = (word: string, index: number): string => {
    return `word-${index}-${word}`;
  };

  // Phát âm từ tiếng Nhật khi được nhấp vào
  const speakJapanese = useCallback((text: string) => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Dừng phát âm hiện tại nếu có
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; // Thiết lập ngôn ngữ là tiếng Nhật
    utterance.rate = 0.9; // Tốc độ phát âm (0.1 - 10)
    
    window.speechSynthesis.speak(utterance);
  }, []);

  // Phát âm toàn bộ đoạn văn
  const speakFullText = useCallback(() => {
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported in this browser');
      return;
    }

    // Nếu đang phát, dừng lại
    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    // Tạo chuỗi văn bản từ tất cả các từ
    const fullText = text.content
      .map(word => hasKanji(word.word) && word.reading !== word.word ? word.reading : word.word)
      .join(' ');

    // Dừng phát âm hiện tại nếu có
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'ja-JP'; // Thiết lập ngôn ngữ là tiếng Nhật
    utterance.rate = 0.9; // Tốc độ phát âm (0.1 - 10)
    
    // Thêm sự kiện khi kết thúc phát âm
    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };
    
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
  }, [text.content, isPlaying]);

  // Xử lý khi nhấp vào điểm ngữ pháp
  const handleGrammarPointClick = useCallback((grammarPoint: string) => {
    setActiveGrammarPoint(activeGrammarPoint === grammarPoint ? null : grammarPoint);
  }, [activeGrammarPoint]);

  // Tìm từ có điểm ngữ pháp
  const findWordWithGrammarPoint = useCallback((grammarPoint: string) => {
    return text.content.find(word => word.grammarPoint === grammarPoint);
  }, [text.content]);

  return (
    <Card className="overflow-hidden border-2 border-gray-100 shadow-lg transition-all duration-300 hover:shadow-xl">
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-100 opacity-50"></div>
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-indigo-100 opacity-50"></div>
        
        <div className="relative z-10 flex items-center justify-between mb-6">
          <div className="flex items-center">
            <BookOpen className="mr-3 h-6 w-6 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-800">{text.title}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="px-3 py-1 text-xs font-medium">
              JLPT {text.jlptLevel || 'N?'}
            </Badge>
            <Button
              onClick={() => setShowAllFurigana(!showAllFurigana)}
              variant={showAllFurigana ? "default" : "outline"}
              size="sm"
              className="transition-all duration-300"
            >
              {showAllFurigana ? 'Ẩn furigana' : 'Hiện tất cả furigana'}
            </Button>
            <Button
              onClick={() => {
                setShowGrammar(!showGrammar);
                if (!showGrammar) {
                  setActiveGrammarPoint(null);
                }
              }}
              variant={showGrammar ? "default" : "outline"}
              size="sm"
              className="transition-all duration-300 flex items-center space-x-1"
            >
              <GraduationCap className="h-4 w-4 mr-1" />
              <span>{showGrammar ? 'Ẩn ngữ pháp' : 'Phân tích ngữ pháp'}</span>
            </Button>
          </div>
        </div>

        <div className="relative z-10 rounded-xl bg-white p-8 shadow-sm">
          <div className="japanese-text">
            {text.content.map((word, index) => {
              const isKanji = hasKanji(word.word) && word.reading !== word.word;
              const showMeaning = hasMeaning(word.meaning);
              const hasGrammar = hasGrammarPoint(word.grammarPoint);
              const wordId = getWordId(word.word, index);
              const isActiveGrammar = showGrammar && hasGrammar && 
                (activeGrammarPoint === word.grammarPoint || activeGrammarPoint === null);
              
              return (
                <span
                  key={wordId}
                  className={`japanese-word ${isKanji ? 'kanji' : ''} 
                            ${showMeaning ? 'has-meaning' : ''} 
                            ${showAllFurigana && isKanji ? 'show-all' : ''}
                            ${isActiveGrammar ? 'grammar-highlight' : ''}
                            ${showGrammar && hasGrammar && activeGrammarPoint === word.grammarPoint ? 'active-grammar' : ''}`}
                  onMouseEnter={() => setHoveredWordId(wordId)}
                  onMouseLeave={() => setHoveredWordId(null)}
                  onClick={() => {
                    if (showGrammar && hasGrammar) {
                      handleGrammarPointClick(word.grammarPoint!);
                    } else {
                      speakJapanese(isKanji ? word.reading : word.word);
                    }
                  }}
                >
                  <span className="word">{word.word}</span>
                  {isKanji && (
                    <span className="furigana">{word.reading}</span>
                  )}
                  {showMeaning && !showGrammar && (
                    <span className={`meaning ${hoveredWordId === wordId || (showAllFurigana && isKanji) ? 'show' : ''}`}>
                      {word.meaning}
                    </span>
                  )}
                  {showGrammar && hasGrammar && (
                    <span className={`grammar-point ${activeGrammarPoint === word.grammarPoint || hoveredWordId === wordId ? 'show' : ''}`}>
                      {word.grammarPoint}
                    </span>
                  )}
                </span>
              );
            })}
          </div>
          
          <div className="mt-6 flex justify-center space-x-4">
            <Button
              onClick={speakFullText}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Volume2 className="h-4 w-4" />
              <span>{isPlaying ? 'Dừng đọc' : 'Đọc cả đoạn'}</span>
            </Button>
          </div>

          {showGrammar && activeGrammarPoint && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-100 px-4 py-3 flex items-center">
                <BookText className="h-5 w-5 mr-2 text-indigo-700" />
                <h3 className="text-lg font-semibold text-indigo-800">
                  {activeGrammarPoint}
                </h3>
              </div>
              
              <div className="p-4">
                {findWordWithGrammarPoint(activeGrammarPoint) && (
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-start">
                      <div className="bg-indigo-100 text-indigo-800 font-medium rounded-full h-6 w-6 flex items-center justify-center mr-2 mt-0.5">
                        <Info className="h-3.5 w-3.5" />
                      </div>
                      <div className="text-gray-700">
                        {findWordWithGrammarPoint(activeGrammarPoint)?.grammarExplanation}
                      </div>
                    </div>
                    
                    {findWordWithGrammarPoint(activeGrammarPoint)?.grammarType && (
                      <div className="flex items-center mt-2">
                        <Badge variant="outline" className="bg-white border-indigo-200 text-indigo-700">
                          {findWordWithGrammarPoint(activeGrammarPoint)?.grammarType}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {showGrammar && text.grammarPoints && text.grammarPoints.length > 0 && !activeGrammarPoint && (
            <div className="mt-6 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 overflow-hidden">
              <div className="bg-indigo-100 px-4 py-3 flex items-center">
                <GraduationCap className="h-5 w-5 mr-2 text-indigo-700" />
                <h3 className="text-lg font-semibold text-indigo-800">
                  Điểm ngữ pháp trong bài đọc
                </h3>
              </div>
              
              <div className="p-4">
                <div className="flex flex-wrap gap-2">
                  {text.grammarPoints.map((point, index) => {
                    const wordWithGrammar = findWordWithGrammarPoint(point);
                    return (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer bg-white hover:bg-indigo-100 transition-colors duration-200 py-2 px-3"
                        onClick={() => handleGrammarPointClick(point)}
                      >
                        <div className="flex items-center">
                          {wordWithGrammar?.grammarType && (
                            <span className="text-xs px-1 py-0.5 bg-indigo-100 text-indigo-700 rounded mr-2">
                              {wordWithGrammar.grammarType}
                            </span>
                          )}
                          {point}
                        </div>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-100 bg-gray-50 p-6">
        <h3 className="mb-3 text-lg font-semibold text-gray-800">Hướng dẫn:</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">1</span>
            Di chuột vào các từ để hiển thị nghĩa
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">2</span>
            Di chuột vào kanji để hiển thị phiên âm hiragana
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">3</span>
            Nhấn &quot;Hiện tất cả furigana&quot; để hiển thị phiên âm cho tất cả các từ kanji
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">4</span>
            Nhấn vào từ để nghe phát âm
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">5</span>
            Nhấn &quot;Đọc cả đoạn&quot; để nghe phát âm toàn bộ đoạn văn
          </li>
          <li className="flex items-center">
            <span className="mr-2 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 text-indigo-800">6</span>
            Nhấn &quot;Phân tích ngữ pháp&quot; để xem các điểm ngữ pháp trong bài đọc
          </li>
        </ul>
      </div>
    </Card>
  );
};

export default JapaneseReader; 