'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  return (
    <nav className="bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/">
                <span className="text-xl font-bold cursor-pointer">InternProject</span>
            </Link>
          </div>
            <div className="hidden md:block ml-10">
              <div className="flex items-baseline space-x-4">
                <Link 
                  href="/" 
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/') && !isActive('/vocabulary') && !isActive('/exercises') && !isActive('/alphabet') && !isActive('/reading')
                      ? 'bg-slate-700' 
                      : 'hover:bg-slate-700'
                  }`}
                >
                  Home
                </Link>
              <Link 
                  href="/vocabulary" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/vocabulary') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                  Vocabulary
              </Link>
              <Link 
                  href="/alphabet" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/alphabet') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                  Alphabet
              </Link>
              <Link 
                  href="/reading" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/reading') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                  Reading
              </Link>
              <Link 
                  href="/exercises" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/exercises') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                  Exercises
              </Link>
              <Link 
                  href="/exercises/sessions" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive('/exercises/sessions') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                  Sessions
              </Link>
              <Link 
                href="/exercises/generate" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/exercises/generate') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                Generate
              </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="flex items-center space-x-2">
              <Link 
                href="/profile" 
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/profile') ? 'bg-slate-700' : 'hover:bg-slate-700'
                }`}
              >
                Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 