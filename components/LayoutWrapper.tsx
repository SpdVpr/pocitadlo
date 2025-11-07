'use client';

import { usePathname } from 'next/navigation';

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Landing page má plnou šířku bez paddingu
  const isLandingPage = pathname === '/';
  
  if (isLandingPage) {
    return <>{children}</>;
  }
  
  // Ostatní stránky mají omezení šířky a padding
  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      {children}
    </main>
  );
}

