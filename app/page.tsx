'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Strukturovaná data pro SEO (Schema.org JSON-LD)
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "EvidujCas.cz",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CZK"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "5",
      "ratingCount": "1"
    },
    "description": "Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním. Sledujte odpracované hodiny, spravujte projekty a generujte faktury.",
    "url": "https://evidujcas.cz",
    "screenshot": "https://evidujcas.cz/front-image.png",
    "featureList": [
      "Časovač v reálném čase",
      "Detailní statistiky",
      "End-to-end šifrování",
      "Správa projektů",
      "Responzivní design",
      "Fakturace projektů"
    ],
    "inLanguage": "cs-CZ"
  };

  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "EvidujCas.cz",
    "url": "https://evidujcas.cz",
    "logo": "https://evidujcas.cz/front-image.png",
    "description": "Moderní aplikace pro evidenci pracovní doby",
    "sameAs": []
  };

  const webSiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EvidujCas.cz",
    "url": "https://evidujcas.cz",
    "description": "Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním",
    "inLanguage": "cs-CZ",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://evidujcas.cz/?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

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
    <>
      {/* Strukturovaná data pro SEO */}
      <Script
        id="structured-data-software"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Script
        id="structured-data-organization"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <Script
        id="structured-data-website"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteData) }}
      />

      <div className="min-h-screen bg-purple-50">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-sm border-b border-purple-200 sticky top-0 z-50" aria-label="Hlavní navigace">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 max-w-7xl mx-auto">
            <div className="flex items-center">
              <Link href="/" aria-label="EvidujCas.cz - Domovská stránka">
                <span className="text-xl sm:text-2xl font-bold text-purple-600">
                  EvidujCas.cz
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href="/auth"
                className="px-3 sm:px-6 py-2 text-sm sm:text-base text-purple-600 font-semibold hover:text-purple-700 transition-colors"
                aria-label="Přihlásit se do aplikace"
              >
                Přihlásit se
              </Link>
              <Link
                href="/auth"
                className="px-3 sm:px-6 py-2 text-sm sm:text-base bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all shadow-md hover:shadow-lg"
                aria-label="Začít používat aplikaci zdarma"
              >
                Začít zdarma
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 md:pt-20 pb-8 sm:pb-12 md:pb-16" aria-labelledby="hero-heading">
        <div className="text-center">
          <motion.h1 
            id="hero-heading" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6"
          >
            Sledujte své odpracované hodiny
            <span className="block text-purple-600">
              jednoduše a bezpečně
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4"
          >
            Moderní aplikace pro evidenci pracovní doby s end-to-end šifrováním.
            Vaše data vidíte pouze vy.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4" 
            role="group" 
            aria-label="Hlavní akce"
          >
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/auth"
                className="block px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
                aria-label="Začít používat aplikaci zdarma"
              >
                Začít zdarma
              </Link>
            </motion.div>
            <motion.a
              href="#features"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-purple-600 rounded-xl font-semibold hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl text-base sm:text-lg border-2 border-purple-600"
              aria-label="Zjistit více o funkcích aplikace"
            >
              Zjistit více
            </motion.a>
          </motion.div>
        </div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-8 sm:mt-12 md:mt-16 relative px-4"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl p-2 sm:p-4 max-w-5xl mx-auto border border-purple-100">
            <Image
              src="/front-image.png"
              alt="EvidujCas.cz - Ukázka aplikace pro evidenci pracovní doby s časovačem a přehledem projektů"
              width={1200}
              height={800}
              priority
              className="w-full h-auto rounded-lg sm:rounded-xl"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20" aria-labelledby="features-heading">
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8 sm:mb-12 md:mb-16"
        >
          <h2 id="features-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Vše, co potřebujete pro evidenci času
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600">
            Jednoduché, bezpečné a efektivní
          </p>
        </motion.header>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8" role="list">
          {/* Feature 1 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">⏱️</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Časovač v reálném čase
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Spusťte časovač jedním kliknutím a sledujte odpracovaný čas na jednotlivých projektech.
            </p>
          </motion.article>

          {/* Feature 2 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">📊</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Detailní statistiky
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Měsíční a denní přehledy odpracovaných hodin a vydělaných částek pro každý projekt.
            </p>
          </motion.article>

          {/* Feature 3 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">🔒</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              End-to-end šifrování
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Vaše citlivá data jsou šifrována na vašem zařízení. Nikdo jiný je nemůže přečíst.
            </p>
          </motion.article>

          {/* Feature 4 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">💼</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Správa projektů
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Vytvářejte projekty s hodinovou sazbou, barvami a poznámkami. Vše přehledně na jednom místě.
            </p>
          </motion.article>

          {/* Feature 5 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">📱</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Responzivní design
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Funguje perfektně na počítači, tabletu i mobilu. Evidujte čas odkudkoliv.
            </p>
          </motion.article>

          {/* Feature 6 */}
          <motion.article 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.6 }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 shadow-lg hover:shadow-xl transition-shadow border border-purple-100" 
            role="listitem"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4" aria-hidden="true">
              <span className="text-xl sm:text-2xl">📄</span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">
              Fakturace projektů
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Generujte profesionální faktury s QR platbou přímo z odpracovaných hodin na projektech.
            </p>
          </motion.article>
        </div>
      </section>

      {/* Security Section */}
      <section className="bg-purple-600 py-12 sm:py-16 md:py-20" aria-labelledby="security-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center text-white"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6" 
              aria-hidden="true"
            >
              🔐
            </motion.div>
            <h2 id="security-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              Vaše soukromí je naše priorita
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 mb-6 sm:mb-8 max-w-3xl mx-auto">
              Používáme end-to-end šifrování s PBKDF2 a XSalsa20-Poly1305.
              Názvy projektů, ceny a poznámky jsou šifrovány na vašem zařízení
              ještě před odesláním do cloudu. Ani my jako provozovatelé nemůžeme
              vaše data přečíst.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 md:gap-8 text-left max-w-2xl mx-auto">
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Šifrování na klientu</h4>
                    <p className="text-purple-100 text-xs sm:text-sm">Data šifrována před odesláním</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Izolace uživatelů</h4>
                    <p className="text-purple-100 text-xs sm:text-sm">Každý vidí jen svá data</p>
                  </div>
                </div>
              </div>
              <div className="flex-1 space-y-3 sm:space-y-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Bezpečné přihlášení</h4>
                    <p className="text-purple-100 text-xs sm:text-sm">Email/heslo nebo Google OAuth</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <span className="text-xl sm:text-2xl flex-shrink-0">✓</span>
                  <div>
                    <h4 className="font-semibold mb-1 text-sm sm:text-base">Firestore Security Rules</h4>
                    <p className="text-purple-100 text-xs sm:text-sm">Ochrana na úrovni databáze</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20" aria-labelledby="cta-heading">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="bg-purple-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 text-center border border-purple-200"
        >
          <h2 id="cta-heading" className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Připraveni začít?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8">
            Registrace je zdarma a trvá méně než minutu
          </p>
          <motion.div
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              href="/auth"
              className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg hover:shadow-xl text-base sm:text-lg"
              aria-label="Vytvořit účet zdarma a začít evidovat čas"
            >
              Vytvořit účet zdarma
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">EvidujCas.cz</p>
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4">
              Moderní aplikace pro evidenci pracovní doby
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              © 2025 EvidujCas.cz • Všechna práva vyhrazena
            </p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}
