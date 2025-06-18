import React from 'react';
import { MainLayout } from '@/components/layout/main-layout';

export default function AlphabetLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <MainLayout>{children}</MainLayout>;
} 