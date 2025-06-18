import React from 'react';
import Link from 'next/link';
import { Github, Twitter, Instagram, Mail, Heart } from 'lucide-react';
import { Button } from '../ui/button';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 text-slate-700 py-16 overflow-hidden border-t border-cyan-100/50">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-100/30 via-blue-100/30 to-teal-100/30 wave-bg"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-200/20 via-transparent to-blue-200/20 ocean-wave"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="particle-system">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full bg-gradient-to-r from-cyan-400/40 to-blue-400/40 particle-drift`}
              style={{
                left: `${10 + i * 12}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 2}s`,
                animationDuration: `${8 + i}s`,
              }}
            ></div>
          ))}
        </div>
      </div>

      <div className="container mx-auto px-6 relative">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-teal-500 blur-sm opacity-60 pulse-glow"></div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-400 via-blue-500 to-teal-600 flex items-center justify-center floating shadow-lg shadow-cyan-300/50">
                  <span className="text-white font-bold">J</span>
                </div>
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-cyan-700 via-blue-700 to-teal-700 bg-clip-text text-transparent">
                  JadeNSO
                </span>
                <div className="text-xs text-cyan-600">Learn Japanese</div>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Học tiếng Nhật thật vui vẻ và hiệu quả với phương pháp học tương tác và cộng đồng hỗ trợ.
            </p>
            <div className="flex gap-3">
              {[
                { icon: Github, path: "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" },
                { icon: Twitter, path: "M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" },
                { icon: Instagram, path: "M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z M17.5 6.5h.01" },
                { icon: Mail, path: "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z M22 6l-10 7L2 6" },
              ].map((item, i) => (
                <Button
                  key={i}
                  variant="ghost"
                  size="icon"
                  className="text-slate-500 hover:text-cyan-600 hover:bg-gradient-to-r hover:from-cyan-100/50 hover:to-blue-100/50 rounded-full ripple-effect transition-all duration-300 group"
                >
                  <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-300" />
                </Button>
              ))}
            </div>
          </div>
          
          {/* Links */}
          <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-8">
            {[
              { 
                title: "Học tập", 
                items: [
                  { label: "Bảng chữ cái", href: "/alphabet" },
                  { label: "Bài tập", href: "/exercises" },
                ] 
              },
              { 
                title: "Cộng đồng", 
                items: [
                  { label: "Diễn đàn", href: "/community" },
                  { label: "Câu hỏi thường gặp", href: "/faq" },
                  { label: "Góp ý", href: "/feedback" },
                  { label: "Nhóm học tập", href: "/groups" },
                ] 
              },
              { 
                title: "Thông tin", 
                items: [
                  { label: "Về chúng tôi", href: "/about" },
                  { label: "Liên hệ", href: "/contact" },
                  { label: "Chính sách bảo mật", href: "/privacy" },
                  { label: "Điều khoản sử dụng", href: "/terms" },
                ] 
              }
            ].map((section, i) => (
              <div key={i} className={`slide-in-left stagger-${i + 1}`}>
                <h3 className="text-slate-800 font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-3">
                  {section.items.map((item, j) => (
                    <li key={j}>
                      <Link
                        href={item.href}
                        className="text-sm text-slate-600 hover:text-cyan-600 transition-all duration-300 hover:translate-x-1 inline-block relative group"
                      >
                        {item.label}
                        <div className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-400 group-hover:w-full transition-all duration-300"></div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        
        <div className="border-t border-cyan-200/60 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-slate-500">
            © {currentYear} JadeNSO. Đã đăng ký bản quyền.
          </p>
          <p className="text-sm text-slate-500 mt-4 md:mt-0 flex items-center">
            Được phát triển với <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" /> bởi JadeNSO Team
          </p>
        </div>
      </div>
    </footer>
  );
} 