'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Pokud je uživatel přihlášen, přesměruj na dashboard
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Zobraz loading během kontroly autentizace
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  // Pokud je uživatel přihlášen, nezobrazuj landing page
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-purple-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-purple-600">
                EvidujCas.cz
              </span>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/auth"
                className="px-6 py-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors"
              >
                Přihlásit se
              </Link>
              <Link
                href="/auth"
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
              >
                Začít zdarma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Sledujte své odpracované hodiny
            <span className="block text-purple-600">
              jednoduše a bezpečně
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním.
            Vaše data vidíte pouze vy.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl text-lg"
            >
              Začít zdarma
            </Link>
            <a
              href="#features"
              className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-lg border-2 border-purple-600"
            >
              Zjistit více
            </a>
          </div>
        </div>

        {/* Hero Image */}
        <div className="mt-16 relative">
          <div className="bg-white rounded-2xl shadow-2xl p-4 max-w-5xl mx-auto border border-purple-100">
            <img
              src="/MF6N-3.jpg"
              alt="EvidujCas.cz - Ukázka aplikace"
              className="w-full h-auto rounded-xl"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Vše, co potřebujete pro evidenci času
          </h2>
          <p className="text-xl text-gray-600">
            Jednoduché, bezpečné a efektivní
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">⏱️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Časovač v reálném čase
            </h3>
            <p className="text-gray-600">
              Spusťte časovač jedním kliknutím a sledujte odpracovaný čas na jednotlivých projektech.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Detailní statistiky
            </h3>
            <p className="text-gray-600">
              Měsíční a denní přehledy odpracovaných hodin a vydělaných částek pro každý projekt.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">🔒</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              End-to-end šifrování
            </h3>
            <p className="text-gray-600">
              Vaše citlivá data jsou šifrována na vašem zařízení. Nikdo jiný je nemůže přečíst.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">💼</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Správa projektů
            </h3>
            <p className="text-gray-600">
              Vytvářejte projekty s hodinovou sazbou, barvami a poznámkami. Vše přehledně na jednom místě.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Responzivní design
            </h3>
            <p className="text-gray-600">
              Funguje perfektně na počítači, tabletu i mobilu. Evidujte čas odkudkoliv.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <span className="text-2xl">☁️</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Cloud synchronizace
            </h3>
            <p className="text-gray-600">
              Vaše data jsou automaticky synchronizována v cloudu. Přístup z jakéhokoliv zařízení.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-white">
            <div className="text-5xl mb-6">🔐</div>
            <h2 className="text-4xl font-bold mb-6">
              Vaše soukromí je naše priorita
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Používáme end-to-end šifrování s PBKDF2 a XSalsa20-Poly1305.
              Názvy projektů, ceny a poznámky jsou šifrovány na vašem zařízení
              ještě před odesláním do cloudu. Ani my jako provozovatelé nemůžeme
              vaše data přečíst.
            </p>
            <div className="flex justify-center gap-8 text-left max-w-2xl mx-auto">
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Šifrování na klientu</h4>
                    <p className="text-purple-100 text-sm">Data šifrována před odesláním</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Izolace uživatelů</h4>
                    <p className="text-purple-100 text-sm">Každý vidí jen svá data</p>
                  </div>
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-start gap-3 mb-4">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Bezpečné přihlášení</h4>
                    <p className="text-purple-100 text-sm">Email/heslo nebo Google OAuth</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1">Firestore Security Rules</h4>
                    <p className="text-purple-100 text-sm">Ochrana na úrovni databáze</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-purple-50 rounded-3xl p-12 text-center border border-purple-200">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Připraveni začít?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Registrace je zdarma a trvá méně než minutu
          </p>
          <Link
            href="/auth"
            className="inline-block px-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl text-lg"
          >
            Vytvořit účet zdarma
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-2xl font-bold mb-4">EvidujCas.cz</p>
            <p className="text-gray-400 mb-4">
              Moderní aplikace pro evidenci pracovní doby
            </p>
            <p className="text-gray-500 text-sm">
              © 2025 EvidujCas.cz • Všechna práva vyhrazena
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
