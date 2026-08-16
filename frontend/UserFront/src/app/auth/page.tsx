'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import LoginForm from './login/login-form';
import RegisterForm from './inscription/register-form';
import { useLanguage } from '@/context/language-context';
import { LanguageSwitcher } from '@/components/language-switcher';

function AuthContent() {
    const searchParams = useSearchParams();
    const { t, dir } = useLanguage();
    const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    // State to toggle between 'login' and 'register'
    const [mode, setMode] = useState<'login' | 'register'>(initialMode);

    const handleModeChange = (newMode: 'login' | 'register') => {
        setMode(newMode);
    };

    return (
        <div className="flex min-h-screen flex-col lg:flex-row" dir={dir}>
            {/* Left Side: Hero / Branding */}
            <div
                className="relative hidden w-1/2 flex-col justify-between p-16 lg:flex overflow-hidden"
            >
                {/* Background Image with Overlay */}
                <div
                    className="absolute inset-0 bg-cover bg-center z-0 scale-105"
                    style={{
                        backgroundImage: "url('https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=2000&auto=format&fit=crop')"
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-br from-primary/95 via-primary/80 to-slate-900/90 z-10" />

                <div className="relative z-20 flex items-center gap-3 text-white">
                    <div className="size-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 shadow-xl">
                        <svg className="size-6" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black tracking-tighter uppercase italic">CloudMaster</h2>
                </div>

                <div className="relative z-20 max-w-lg">
                    <h1 className="text-white text-6xl font-black leading-[1.1] tracking-tighter mb-8 drop-shadow-2xl">
                        {mode === 'login' ? t('auth.hero_login_title') : t('auth.hero_register_title')}
                    </h1>
                    <p className="text-white/80 text-xl font-medium leading-relaxed mb-10 max-w-md">
                        {mode === 'login'
                            ? t('auth.hero_login_desc')
                            : t('auth.hero_register_desc')}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="size-10 bg-white/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">{mode === 'login' ? 'verified_user' : 'school'}</span>
                            </div>
                            <span className="text-sm font-bold text-white/90">{mode === 'login' ? t('auth.hero_certified') : t('auth.hero_instructors')}</span>
                        </div>
                        <div className="flex items-center gap-4 bg-white/5 backdrop-blur-sm p-4 rounded-2xl border border-white/10">
                            <div className="size-10 bg-white/10 rounded-full flex items-center justify-center">
                                <span className="material-symbols-outlined text-white text-xl">{mode === 'login' ? 'support_agent' : 'workspace_premium'}</span>
                            </div>
                            <span className="text-sm font-bold text-white/90">{mode === 'login' ? t('auth.hero_support') : t('auth.hero_certifications')}</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-20 text-white/40 text-sm font-bold tracking-widest uppercase">
                    © 2026 CloudMaster Academy
                </div>
            </div>

            {/* Right Side: Auth Form Shell */}
            <div className="relative flex w-full flex-col justify-center bg-background-light dark:bg-slate-950 px-6 py-12 lg:w-1/2 lg:px-20 overflow-y-auto">
                <div className="absolute top-0 right-0 p-8 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl z-0" />
                <div className="absolute bottom-0 left-0 p-8 w-96 h-96 bg-primary/10 rounded-full -ml-48 -mb-48 blur-3xl z-0" />

                {/* Language Switcher - Absolute positioned */}
                <div className="absolute top-6 right-6 z-30">
                    <LanguageSwitcher />
                </div>

                <div className="relative z-10 mx-auto w-full max-w-xl">
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
                            {mode === 'login' ? t('auth.welcome_back') : t('auth.create_account')}
                        </h2>
                        <p className="text-[#4c739a] dark:text-slate-400">
                            {mode === 'login'
                                ? t('auth.login_desc')
                                : t('auth.register_desc')}
                        </p>
                    </div>

                    {/* Auth Tabs Switcher */}
                    <div className="mb-8 grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl">
                        <button
                            onClick={() => handleModeChange('login')}
                            className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'login'
                                ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('auth.sign_in_tab')}
                        </button>
                        <button
                            onClick={() => handleModeChange('register')}
                            className={`py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${mode === 'register'
                                ? 'bg-white dark:bg-primary shadow-sm text-primary dark:text-white'
                                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                                }`}
                        >
                            {t('auth.register_tab')}
                        </button>
                    </div>

                    {/* Render Component Dynamically */}
                    <div className="transition-all duration-300 min-h-[600px]">
                        {mode === 'login' ? <LoginForm /> : <RegisterForm />}
                    </div>

                </div>
            </div>
        </div>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <AuthContent />
        </Suspense>
    );
}
