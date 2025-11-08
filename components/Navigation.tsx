'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { useState } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const links = [
    { href: '/dashboard', label: 'Časovač', icon: '⏱️' },
    { href: '/projects', label: 'Projekty', icon: '📁' },
    { href: '/history', label: 'Historie', icon: '📊' },
    { href: '/invoicing', label: 'Fakturace', icon: '📄' },
    { href: '/todo', label: 'TODO', icon: '✅' },
  ];

  const handleLogout = async () => {
    await logout();
    setShowMobileMenu(false);
    router.push('/');
  };

  // Don't show navigation on auth page or landing page
  if (pathname === '/auth' || pathname === '/') {
    return null;
  }

  return (
    <nav className="bg-gray-100 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-lg sm:text-2xl font-bold text-purple-600 flex-shrink-0">
            EvidujCas.cz
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-1 lg:gap-2 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-2 lg:px-4 py-2 rounded-lg transition-colors flex items-center gap-1 lg:gap-2 text-sm lg:text-base ${
                  pathname === link.href
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-base lg:text-lg">{link.icon}</span>
                <span className="hidden lg:inline">{link.label}</span>
              </Link>
            ))}

            {user && (
              <div className="relative ml-2 lg:ml-4">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-2 lg:px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-1 lg:gap-2"
                >
                  <span>👤</span>
                  <span className="hidden lg:inline text-sm truncate max-w-[150px]">{user.email}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                    >
                      🚪 Odhlásit se
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {showMobileMenu ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    pathname === link.href
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </Link>
              ))}

              {user && (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-200 mt-2 pt-4">
                    {user.email}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-3 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-3 font-medium"
                  >
                    <span className="text-xl">🚪</span>
                    <span>Odhlásit se</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
