'use client';

import { Suspense } from 'react';
import LoginForm from './login/login-form';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

export default function AuthPage() {
    const { t, dir } = useLanguage();

    return (
        <div className="flex min-h-screen flex-col lg:flex-row" dir={dir}>
            {/* Left Side: Hero / Branding */}
            <div
                className="relative hidden w-1/2 flex-col justify-between p-12 lg:flex bg-cover bg-center"
                style={{
                    backgroundImage: "linear-gradient(rgba(19, 127, 236, 0.85), rgba(16, 25, 34, 0.9)), url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop')"
                }}
            >
                <div className="flex items-center gap-3 text-white">
                    <div className="size-8">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold leading-tight tracking-tight">CloudMaster DevOps</h2>
                </div>

                <div className="max-w-md">
                    <h1 className="text-white text-5xl font-black leading-tight tracking-[-0.033em] mb-6">
                        {t('auth.hero_login_title')}
                    </h1>
                    <p className="text-white/90 text-lg font-light leading-relaxed mb-8">
                        {t('auth.hero_login_desc')}
                    </p>

                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-sm font-medium">{t('auth.hero_certified')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80">
                            <span className="material-symbols-outlined text-sm">check_circle</span>
                            <span className="text-sm font-medium">{t('auth.hero_support')}</span>
                        </div>
                    </div>
                </div>

                <div className="text-white/60 text-sm">
                    © 2026 CloudMaster Academy. All rights reserved.
                </div>
            </div>

            {/* Right Side: Auth Form Shell */}
            <div className="relative flex w-full flex-col justify-center bg-background-light dark:bg-background-dark px-6 py-12 lg:w-1/2 lg:px-24">

                {/* Language Switcher - Absolute positioned */}
                <div className="absolute top-6 right-6 z-10">
                    <LanguageSwitcher />
                </div>

                <div className="mx-auto w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="mb-10 flex items-center gap-3 lg:hidden">
                        <div className="size-6 text-primary">
                            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">CloudMaster</h2>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-[#0d141b] dark:text-white text-3xl font-bold tracking-tight mb-2">
                            {t('auth.welcome_back')}
                        </h2>
                        <p className="text-[#4c739a] dark:text-slate-400">
                            {t('auth.login_desc')}
                        </p>
                    </div>

                    {/* Render Component Dynamically */}
                    <div className="transition-all duration-300 min-h-[600px]">
                        <Suspense fallback={<div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
                            <LoginForm />
                        </Suspense>
                    </div>

                </div>
            </div>
        </div>
    );
}
