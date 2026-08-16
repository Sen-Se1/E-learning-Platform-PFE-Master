"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/language-context';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
    const { t, dir } = useLanguage();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgotPassword`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            setSuccess(true);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message || 'Failed to send reset link');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark p-6" dir={dir}>
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-slate-100 dark:border-slate-800">
                {!success ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                                <Mail className="h-8 w-8" />
                            </div>
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                                {t('forgot_password_page.title')}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400">
                                {t('forgot_password_page.desc')}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    {t('auth.email_label')}
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder={t('forgot_password_page.email_placeholder')}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? t('forgot_password_page.sending_btn') : t('forgot_password_page.send_link_btn')}
                            </button>
                        </form>

                        <div className="mt-8 text-center text-sm">
                            <Link
                                href="/auth?mode=login"
                                className="inline-flex items-center gap-2 text-slate-500 hover:text-primary transition-colors font-medium px-4 py-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                {t('forgot_password_page.back_to_login')}
                            </Link>
                        </div>
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500">
                            <CheckCircle2 className="h-8 w-8" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                            {t('forgot_password_page.success_title')}
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                            {t('forgot_password_page.success_desc')}
                        </p>
                        <Link
                            href="/auth?mode=login"
                            className="inline-block w-full bg-slate-900 dark:bg-primary text-white py-3.5 rounded-xl font-bold hover:opacity-90 transition shadow-lg"
                        >
                            {t('forgot_password_page.back_to_login')}
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
