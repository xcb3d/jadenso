import { Metadata } from "next";
import { MainLayout } from "@/components/layout/main-layout";

export const metadata: Metadata = {
  title: "Flashcards | Japanese Learning App",
  description: "Học và ghi nhớ từ vựng tiếng Nhật với flashcards",
};

export default function FlashcardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
} 