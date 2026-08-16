// src/app/auth/login/login-form.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import { useUserStore } from '@/lib/store';

export default function LoginForm() {
    const router = useRouter();
    const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
    const { t } = useLanguage();
    const setUser = useUserStore((state) => state.setUser);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'admin' as const,
        remember: false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isProd = process.env.NODE_ENV === 'production';
    const demoUsers = isProd ? [] : [
        { email: 'admin@cloudmaster.com', password: 'admin123', role: 'admin', name: 'Admin User' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Login failed');
            }

            // Success
            const { data, token } = result;

            setUser({
                id: data._id,
                name: `${data.profile?.firstName || ''} ${data.profile?.lastName || ''}`.trim() || data.email.split('@')[0],
                email: data.email,
                role: data.role,
            });

            // Set cookies/localStorage
            document.cookie = `admin-role=${data.role}; path=/; max-age=86400`;
            localStorage.setItem('admin-token', token);

            // Redirect based on role
            if (data.role === 'admin') router.push('/admin/dashboard');
            else router.push('/');

        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'Email ou mot de passe incorrect');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto">
            {/* Error Message */}
            {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                    {error}
                </div>
            )}

            {/* Form Section */}
            <form onSubmit={handleSubmit} className="space-y-5">

                {/* Email Field */}
                <div className="flex flex-col gap-2">
                    <label className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal">
                        {t('auth.email_label')}
                    </label>
                    <div className="relative">
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="form-input block w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-background-dark/50 p-[15px] text-base font-normal placeholder:text-[#4c739a] focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder={t('auth.email_placeholder')}
                            required
                        />
                    </div>
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <label className="text-[#0d141b] dark:text-slate-200 text-sm font-medium leading-normal">
                            {t('auth.password_label')}
                        </label>
                        <Link href="/auth/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                            {t('auth.forgot_password')}
                        </Link>
                    </div>
                    <div className="relative">
                        <input
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            className="form-input block w-full rounded-lg border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-background-dark/50 p-[15px] text-base font-normal placeholder:text-[#4c739a] focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder={t('auth.password_placeholder')}
                            required
                        />
                    </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="remember"
                        checked={formData.remember}
                        onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                        className="h-4 w-4 rounded border-[#cfdbe7] text-primary focus:ring-primary"
                    />
                    <label htmlFor="remember" className="text-sm text-[#4c739a] dark:text-slate-400">
                        {t('auth.keep_signed_in')}
                    </label>
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg bg-primary h-12 px-5 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? t('auth.signing_in_btn') : t('auth.sign_in_btn')}
                </button>
            </form>

            {!isProd && demoUsers.length > 0 && (
                <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Compte de Démo</p>
                    <div className="space-y-3">
                        {demoUsers.map(user => (
                            <button
                                key={user.role}
                                type="button"
                                onClick={() => setFormData({ ...formData, email: user.email, password: user.password })}
                                className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-white dark:hover:bg-slate-800 transition-colors group text-left"
                            >
                                <div>
                                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                                    <p className="text-[10px] text-slate-500">{user.email}</p>
                                </div>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Divider */}
            <div className="my-8 flex items-center gap-4 text-[#4c739a] dark:text-slate-500">
                <div className="h-px flex-1 bg-[#cfdbe7] dark:bg-slate-700"></div>
                <span className="text-xs font-bold uppercase">{t('auth.or_continue_with')}</span>
                <div className="h-px flex-1 bg-[#cfdbe7] dark:bg-slate-700"></div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 rounded-lg border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-background-dark/50 h-11 px-4 text-sm font-semibold text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
                    </svg>
                    GitHub
                </button>
                <button className="flex items-center justify-center gap-2 rounded-lg border border-[#cfdbe7] dark:border-slate-700 bg-white dark:bg-background-dark/50 h-11 px-4 text-sm font-semibold text-[#0d141b] dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.908 3.152-1.928 4.176-1.224 1.224-3.136 2.568-6.632 2.568-5.392 0-9.496-4.384-9.496-9.76s4.104-9.76 9.496-9.76c2.928 0 5.392 1.168 7.096 2.8l2.312-2.312C18.816 1.344 15.936 0 12.48 0 5.864 0 .416 5.448.416 12.12s5.448 12.12 12.064 12.12c3.592 0 6.312-1.176 8.512-3.464 2.264-2.264 2.984-5.448 2.984-8.096 0-.768-.064-1.504-.184-2.208h-11.336z"></path>
                    </svg>
                    Google
                </button>
            </div>
        </div>
    );
}
