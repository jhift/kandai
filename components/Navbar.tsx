"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "ホーム" },
  { href: "/courses", label: "授業一覧" },
  { href: "/notices", label: "通知" },
  { href: "/settings", label: "設定" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="bg-red-700 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-xl">🎓</span>
            <span>KU Portal</span>
          </Link>
          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? "bg-red-900 text-white"
                    : "text-red-100 hover:bg-red-600"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
