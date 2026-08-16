"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { useLanguage } from "@/context/language-context"

export default function LandingPage() {
  const { t } = useLanguage()

  return (
    <div className="bg-background-light dark:bg-background-dark min-h-screen text-foreground transition-colors duration-300" suppressHydrationWarning>
      {/* Navigation */}
      <Navbar />

      <main className="max-w-[1200px] mx-auto overflow-x-hidden">
        {/* Hero Section */}
        <section className="px-6 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 md:gap-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                {t('hero.tagline')}
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-6xl font-black leading-tight tracking-tight">
                  {t('hero.title_prefix')} <span className="text-primary">{t('hero.title_highlight')}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                  {t('hero.description')}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-7 rounded-xl text-base font-bold shadow-lg shadow-primary/25 transition-all">
                  {t('hero.explore')}
                </Button>
                <Button variant="outline" className="px-8 py-7 rounded-xl text-base font-bold hover:bg-accent transition-all h-auto">
                  {t('hero.pricing')}
                </Button>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground text-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-accent bg-cover bg-center" style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${i}')` }}></div>
                  ))}
                </div>
                <span>{t('hero.join_community')}</span>
              </div>
            </div>
            <div className="relative">
              <div
                className="w-full aspect-square md:aspect-video lg:aspect-square bg-accent rounded-3xl overflow-hidden shadow-2xl relative z-10 bg-cover bg-center"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop')" }}
              >
              </div>
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </section>

        {/* Trust Section */}
        <section className="px-6 py-8 border-y border-border mb-16">
          <h4 className="text-muted-foreground text-[10px] uppercase font-bold tracking-[0.2em] text-center mb-8">{t('trust.partners')}</h4>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12 items-center opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {['AWS', 'Google Cloud', 'Microsoft Azure', 'Kubernetes', 'Docker', 'Terraform'].map((partner) => (
              <div key={partner} className="text-xl font-bold text-muted-foreground">{partner}</div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-12 md:py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">{t('features.title')}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{t('features.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: t('features.f1_title'), desc: t('features.f1_desc'), icon: "terminal" },
              { title: t('features.f2_title'), desc: t('features.f2_desc'), icon: "school" },
              { title: t('features.f3_title'), desc: t('features.f3_desc'), icon: "work" },
            ].map((f, i) => (
              <div key={i} className="p-8 rounded-2xl bg-accent border border-transparent hover:border-primary/20 hover:bg-card transition-all">
                <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                  <span className="material-symbols-outlined">{f.icon}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
