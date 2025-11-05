'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Časovač', icon: '⏱️' },
    { href: '/projects', label: 'Projekty', icon: '📁' },
    { href: '/history', label: 'Historie', icon: '📊' },
    { href: '/todo', label: 'TODO', icon: '✅' },
  ];

  return (
    <nav className="bg-gray-100 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Počítadlo
          </Link>

          <div className="flex gap-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  pathname === link.href
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{link.icon}</span>
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
