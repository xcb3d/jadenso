"use client";

import { AlphabetType } from "@/models/JapaneseAlphabet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter, usePathname } from "next/navigation";

interface AlphabetNavProps {
  activeType?: AlphabetType;
}

export function AlphabetNav({ activeType }: AlphabetNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleTabChange = (value: string) => {
    if (value === "all") {
      router.push("/alphabet");
    } else {
      router.push(`/alphabet/${value}`);
    }
  };

  const currentValue = activeType || (pathname === "/alphabet" ? "all" : pathname.split("/").pop() as AlphabetType);

  return (
    <div className="w-full mb-8">
      <Tabs defaultValue={currentValue} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-md">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="hiragana">Hiragana</TabsTrigger>
          <TabsTrigger value="katakana">Katakana</TabsTrigger>
          <TabsTrigger value="kanji">Kanji</TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
} 