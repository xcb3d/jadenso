"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Home, Layers, PenTool, User, LogOut, Menu, X, AlignLeft, Bell, BookOpen as BookIcon, Search, Sparkles, Mic, Book } from "lucide-react"
import { Badge } from "../ui/badge"

export function Header() {
  const { data: session, status } = useSession()
  const isLoading = status === "loading"
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`)
  }

  const navigationItems = [
    { href: "/", label: "Trang chủ", icon: Home },
    { href: "/units", label: "Units", icon: Layers },
    { href: "/alphabet", label: "Bảng chữ cái", icon: AlignLeft },
    { href: "/reading", label: "Đọc", icon: BookIcon },
    { href: "/exercises", label: "Bài tập", icon: PenTool },
    { href: "/speaking", label: "Luyện phát âm", icon: Mic },
    { href: "/flashcards", label: "Flashcards", icon: Book },
  ]

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-200/30 bg-gradient-to-r from-white/90 via-cyan-50/80 to-blue-50/90 backdrop-blur-xl shadow-lg shadow-cyan-100/20">
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-teal-500/5 wave-bg"></div>
      <div className="container mx-auto px-4 py-3 relative">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 blur-md opacity-60 pulse-glow"></div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-300/20 via-blue-300/20 to-teal-300/20 animate-ping"></div>
                <div className="relative h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 flex items-center justify-center floating shadow-lg shadow-cyan-300/50">
                  <span className="text-white font-bold text-lg drop-shadow-sm">J</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                  JadeNSO
                </span>
                <div className="text-xs text-cyan-600/80 font-medium">Learn Japanese</div>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex">
            <ul className="flex space-x-1">
              {navigationItems.map((item) => {
                const active =
                  isActive(item.href) &&
                  !(
                    item.href === "/" &&
                    (isActive("/units") || isActive("/alphabet") || isActive("/reading") || isActive("/exercises") || isActive("/flashcards"))
                  )

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center ${
                        active 
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-200/30" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-cyan-50/50"
                      }`}
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* User Section */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <Button variant="ghost" size="icon" className="rounded-full bg-cyan-50/80 text-cyan-700 hover:bg-cyan-100/80 hover:text-cyan-800">
              <Search className="h-4 w-4" />
            </Button>
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="rounded-full bg-cyan-50/80 text-cyan-700 hover:bg-cyan-100/80 hover:text-cyan-800 relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-cyan-500 to-blue-500 border-0 text-white">3</Badge>
            </Button>

            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-cyan-200/50 animate-pulse rounded-full"></div>
                <div className="h-8 w-20 bg-cyan-200/50 animate-pulse rounded"></div>
              </div>
            ) : session ? (
              <div className="flex items-center space-x-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2 hover:bg-cyan-50/50 rounded-full p-1 h-auto">
                      <Avatar className="h-8 w-8 ring-2 ring-cyan-200/60 ring-offset-2 ring-offset-white floating-slow shadow-lg shadow-cyan-200/30">
                        <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 text-white text-sm">
                          {session.user?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium mr-2 text-slate-700">
                        {session.user?.name || "User"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 border-cyan-100 bg-white/95 backdrop-blur-sm">
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center space-x-2 cursor-pointer">
                        <User className="h-4 w-4 text-cyan-600" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="flex items-center space-x-2 cursor-pointer text-rose-500 focus:text-rose-500"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Đăng xuất</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={() => signIn()}
                className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white shadow-md shadow-cyan-200/30 font-medium rounded-full"
                size="sm"
              >
                <Sparkles className="mr-2 h-3.5 w-3.5" />
                Đăng nhập
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-full bg-cyan-50/80 text-cyan-700 hover:bg-cyan-100/80 hover:text-cyan-800"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-cyan-100/50 bg-white/80 backdrop-blur-sm rounded-lg shadow-lg">
            <nav>
              <ul className="space-y-1 p-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const active =
                    isActive(item.href) &&
                    !(
                      item.href === "/" &&
                      (isActive("/units") || isActive("/alphabet") || isActive("/reading") || isActive("/exercises") || isActive("/flashcards"))
                    )

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          active 
                            ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md shadow-cyan-200/30" 
                            : "text-slate-600 hover:text-slate-900 hover:bg-cyan-50/50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
