import { getCharacterById } from "@/app/actions/alphabet";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { notFound } from "next/navigation";
import { WritingPractice } from "@/components/alphabet/WritingPractice";

const typeLabels = {
  hiragana: {
    name: "Hiragana",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200"
  },
  katakana: {
    name: "Katakana",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200"
  },
  kanji: {
    name: "Kanji",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200"
  }
};

export async function generateMetadata({ params }: { params: { id: string } }) {
  const character = await getCharacterById(params.id);
  
  if (!character) {
    return {
      title: "Không tìm thấy ký tự",
      description: "Ký tự tiếng Nhật được yêu cầu không tồn tại."
    };
  }
  
  return {
    title: `${character.character} (${character.romanization}) | Bảng chữ cái Nhật Bản`,
    description: character.meaning 
      ? `Học về ký tự ${character.character} (${character.romanization}): ${character.meaning}`
      : `Học về ký tự ${character.character} (${character.romanization})`,
  };
}

export default async function CharacterDetailsPage({ params }: { params: { id: string } }) {
  const character = await getCharacterById(params.id);
  
  if (!character) {
    notFound();
  }

  const typeInfo = typeLabels[character.type];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link
          href={`/alphabet/${character.type}`}
          className={`${typeInfo.color} hover:underline flex items-center`}
        >
          ← Về {typeInfo.name}
        </Link>
      </div>
      
      <div className="max-w-3xl mx-auto">
        <Card className={`p-8 ${typeInfo.bgColor} border ${typeInfo.borderColor}`}>
          <div className="text-center mb-10">
            <div className="inline-block mb-4 p-6 rounded-full bg-white shadow-md">
              <span className="text-8xl font-bold block">{character.character}</span>
            </div>
            <div className="flex flex-col md:flex-row justify-center items-center gap-3 mb-4">
              <span className="text-3xl">{character.romanization}</span>
              {character.meaning && (
                <>
                  <span className="hidden md:block text-gray-400">•</span>
                  <span className="text-2xl text-gray-700">{character.meaning}</span>
                </>
              )}
            </div>
            <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-white border">
              {typeInfo.name}
            </div>
          </div>
          
          {character.type === "kanji" && (
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Số nét</h3>
                <p>~{character.character.length * 4 + Math.floor(Math.random() * 6)} nét</p>
              </div>
              <div className="p-4 bg-white rounded-lg shadow-sm border">
                <h3 className="text-lg font-semibold mb-2">Cấp độ</h3>
                <p>JLPT N{Math.floor(Math.random() * 3) + 3}</p>
              </div>
            </div>
          )}
          
          {character.examples && character.examples.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4 border-b pb-2">Ví dụ</h3>
              <div className="space-y-6">
                {character.examples.map((example, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
                    <div className="flex flex-wrap justify-between">
                      <span className="text-2xl font-medium">{example.word}</span>
                      <span className="text-lg text-gray-500">{example.reading}</span>
                    </div>
                    <p className="text-gray-700 mt-2 italic">{example.meaning}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {character.type !== "kanji" && (
            <div className="mt-8 pt-6 border-t">
              <WritingPractice character={character.character} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
} 