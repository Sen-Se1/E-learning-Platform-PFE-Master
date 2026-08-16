'use client';

import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/context/language-context';
import { CatalogContent } from '@/components/courses/catalog-content';

const CourseCatalog: React.FC = () => {

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen font-display">
      <Navbar />

      <main className="max-w-[1440px] mx-auto px-6 md:px-10 py-8">
        <CatalogContent />
      </main>

      <Footer />
    </div>
  );
};

export default CourseCatalog;