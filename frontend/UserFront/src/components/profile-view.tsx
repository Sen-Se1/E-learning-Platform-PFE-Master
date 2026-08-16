"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '@/context/language-context';
import { useUserStore } from '@/lib/store';
import { countries } from '@/lib/countries';
import {
    User, MapPin, Save, Key, Mail,
    AlertCircle, CheckCircle2, ChevronDown, Search,
    Pencil, Phone, Calendar, Globe, Hash,
    Trash2, AlertTriangle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfileView() {
    const { t, dir } = useLanguage();
    const { user, setUser, logout } = useUserStore();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        dateOfBirth: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        password: '',
        passwordConfirm: '',
    });

    const [loading, setLoading] = useState(false);
    const [pwdLoading, setPwdLoading] = useState(false);
    const [emailData, setEmailData] = useState({ newEmail: '', currentPassword: '' });
    const [emailLoading, setEmailLoading] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);

    useEffect(() => {
        if (user) {
            // Fetch latest user data from backend to ensure we have address/profile
            fetchUserData();
        }
    }, [user]);

    const fetchUserData = async () => {
        const userToken = localStorage.getItem('user-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const result = await response.json();
            if (response.ok && result.data) {
                const u = result.data;
                const fetchedData = {
                    firstName: u.profile?.firstName || '',
                    lastName: u.profile?.lastName || '',
                    phone: u.profile?.phone || '',
                    dateOfBirth: u.profile?.dateOfBirth ? u.profile.dateOfBirth.split('T')[0] : '',
                    street: u.address?.street || '',
                    city: u.address?.city || '',
                    state: u.address?.state || '',
                    country: u.address?.country || '',
                    zipCode: u.address?.zipCode || '',
                };
                setFormData(fetchedData);

                const foundCountry = countries.find(c => c.code === u.address?.country);
                if (foundCountry) setCountrySearch(foundCountry.name);
            }
        } catch (err) {
            console.error("Failed to fetch user data", err);
        }
    };

    const handleProfileSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const userToken = localStorage.getItem('user-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/update-me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.errors
                    ? result.errors.map((e: any) => e.msg).join(', ')
                    : (result.message || 'Update failed');
                throw new Error(errorMsg);
            }

            toast.success(t('profile_page.success_update'));
            setIsEditing(false);

            // Update local store with new data name
            if (user) {
                setUser({
                    ...user,
                    name: `${formData.firstName} ${formData.lastName}`.trim()
                });
            }
        } catch (err: any) {
            toast.error(err.message || t('profile_page.error_update'));
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.password !== passwordData.passwordConfirm) {
            toast.error('Passwords do not match');
            return;
        }

        setPwdLoading(true);

        const userToken = localStorage.getItem('user-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/update-my-password`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    password: passwordData.password,
                    passwordConfirm: passwordData.passwordConfirm
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.errors
                    ? result.errors.map((e: any) => e.msg).join(', ')
                    : (result.message || 'Password update failed');
                throw new Error(errorMsg);
            }

            toast.success(t('profile_page.password_success'));
            setPasswordData({ currentPassword: '', password: '', passwordConfirm: '' });

            // Update localStorage with new token from backend
            if (result.token) {
                localStorage.setItem('user-token', result.token);
            }
        } catch (err: any) {
            toast.error(err.message || 'Failed to change password');
        } finally {
            setPwdLoading(false);
        }
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setEmailLoading(true);

        const userToken = localStorage.getItem('user-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/request-email-update`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(emailData),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMsg = result.errors
                    ? result.errors.map((e: any) => e.msg).join(', ')
                    : (result.message || 'Email update request failed');
                throw new Error(errorMsg);
            }

            toast.success(t('profile_page.email_request_success'));
            setEmailData({ newEmail: '', currentPassword: '' });
        } catch (err: any) {
            toast.error(err.message || 'Failed to request email change');
        } finally {
            setEmailLoading(false);
        }
    };

    const handleDeactivateAccount = async () => {
        setDeleteLoading(true);
        const userToken = localStorage.getItem('user-token');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/delete-me`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${userToken}`
                },
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to deactivate account');
            }

            // Success
            toast.success(t('profile_page.delete_success'));

            // Logout and redirect
            setTimeout(() => {
                logout();
                localStorage.removeItem('user-token');
                document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
                window.location.href = "/";
            }, 2000);
        } catch (err: any) {
            toast.error(err.message || 'Error deactivating account');
            setShowDeleteConfirm(false);
        } finally {
            setDeleteLoading(false);
        }
    };

    const DisplayField = ({ label, value, icon: Icon }: { label: string, value: string, icon: any }) => (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800/50 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 mb-1">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{value || '---'}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12" dir={dir}>
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white">{t('profile_page.title')}</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">{t('profile_page.subtitle')}</p>
                </div>
                {!isEditing && (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:bg-primary/90 transition shadow-lg shadow-primary/20"
                    >
                        <Pencil className="h-4 w-4" />
                        {t('profile_page.edit_profile')}
                    </button>
                )}
            </div>

            {/* Profile Form */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">

                {!isEditing ? (
                    <div className="space-y-10">
                        {/* Personal Info Display */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.personal_info')}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <DisplayField label={t('auth.first_name_label')} value={formData.firstName} icon={User} />
                                <DisplayField label={t('auth.last_name_label')} value={formData.lastName} icon={User} />
                                <DisplayField label={t('auth.phone_label')} value={formData.phone} icon={Phone} />
                                <DisplayField label={t('auth.dob_label')} value={formData.dateOfBirth} icon={Calendar} />
                            </div>
                        </div>

                        {/* Address Info Display */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.address_info')}</h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="sm:col-span-2 lg:col-span-1">
                                    <DisplayField label={t('auth.street_label')} value={formData.street} icon={MapPin} />
                                </div>
                                <DisplayField label={t('auth.city_label')} value={formData.city} icon={MapPin} />
                                <DisplayField label={t('auth.state_label')} value={formData.state} icon={MapPin} />
                                <DisplayField label={t('auth.country_label')} value={countrySearch} icon={Globe} />
                                <DisplayField label={t('auth.zip_label')} value={formData.zipCode} icon={Hash} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleProfileSubmit} className="space-y-8 animate-in fade-in duration-300">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <User className="h-5 w-5" />
                                </div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.personal_info')}</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.first_name_label')}</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.last_name_label')}</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.phone_label')}</label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.dob_label')}</label>
                                    <input
                                        type="date"
                                        value={formData.dateOfBirth}
                                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.address_info')}</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.street_label')}</label>
                                    <input
                                        type="text"
                                        value={formData.street}
                                        onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.city_label')}</label>
                                        <input
                                            type="text"
                                            value={formData.city}
                                            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.state_label')}</label>
                                        <input
                                            type="text"
                                            value={formData.state}
                                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2 relative">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.country_label')}</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={countrySearch}
                                                onFocus={() => setShowCountryDropdown(true)}
                                                onChange={(e) => {
                                                    setCountrySearch(e.target.value);
                                                    setShowCountryDropdown(true);
                                                }}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                                placeholder="Search country..."
                                            />
                                            {showCountryDropdown && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setShowCountryDropdown(false)} />
                                                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-60 overflow-y-auto">
                                                        {countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                                                            <button
                                                                key={c.code}
                                                                type="button"
                                                                onClick={() => {
                                                                    setFormData({ ...formData, country: c.code });
                                                                    setCountrySearch(c.name);
                                                                    setShowCountryDropdown(false);
                                                                }}
                                                                className="w-full px-4 py-3 text-left hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-bold"
                                                            >
                                                                {c.name} ({c.code})
                                                            </button>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('auth.zip_label')}</label>
                                        <input
                                            type="text"
                                            value={formData.zipCode}
                                            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex items-center gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex items-center gap-2 bg-primary text-white px-8 py-3.5 rounded-xl font-black hover:bg-primary/90 transition shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                                <Save className="h-5 w-5" />
                                {loading ? t('profile_page.saving') : t('profile_page.save_changes')}
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setIsEditing(false);
                                    fetchUserData(); // Reset to backend data
                                }}
                                className="px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                            >
                                {t('profile_page.cancel')}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Password Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Key className="h-5 w-5" />
                    </div>
                    <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.security')} - {t('profile_page.change_password')}</h2>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-2 max-w-sm">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_page.current_password')}</label>
                        <input
                            type="password"
                            required
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_page.new_password')}</label>
                            <input
                                type="password"
                                required
                                minLength={8}
                                value={passwordData.password}
                                onChange={(e) => setPasswordData({ ...passwordData, password: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_page.confirm_new_password')}</label>
                            <input
                                type="password"
                                required
                                value={passwordData.passwordConfirm}
                                onChange={(e) => setPasswordData({ ...passwordData, passwordConfirm: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={pwdLoading}
                        className="bg-slate-900 dark:bg-slate-100 dark:text-slate-900 text-white px-8 py-3.5 rounded-xl font-black hover:opacity-90 transition shadow-lg disabled:opacity-50"
                    >
                        {pwdLoading ? t('profile_page.saving') : t('profile_page.change_password')}
                    </button>
                </form>
            </div>

            {/* Email Section */}
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 space-y-8">
                <div className="flex items-center gap-3 pb-2 border-b border-slate-50 dark:border-slate-800">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Mail className="h-5 w-5" />
                    </div>
                    <h2 className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-xs">{t('profile_page.security')} - {t('profile_page.change_email')}</h2>
                </div>

                <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400 text-sm">
                    <p className="font-bold flex items-center gap-2 mb-1">
                        <AlertCircle className="h-4 w-4" />
                        Note
                    </p>
                    {t('verify_email.verifying')} (L'e-mail actuel est: <span className="font-bold">{user?.email}</span>)
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_page.new_email')}</label>
                        <input
                            type="email"
                            required
                            value={emailData.newEmail}
                            onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="example@email.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">{t('profile_page.current_password')}</label>
                        <input
                            type="password"
                            required
                            value={emailData.currentPassword}
                            onChange={(e) => setEmailData({ ...emailData, currentPassword: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={emailLoading}
                        className="bg-primary text-white px-8 py-3.5 rounded-xl font-black hover:opacity-90 transition shadow-lg disabled:opacity-50"
                    >
                        {emailLoading ? t('profile_page.saving') : t('profile_page.request_email_btn')}
                    </button>
                </form>
            </div>

            {/* Danger Zone Section */}
            <div className="bg-red-50/50 dark:bg-red-900/10 rounded-3xl p-8 border border-red-100 dark:border-red-900/30 space-y-6">
                <div className="flex items-center gap-3 pb-2 border-b border-red-100 dark:border-red-900/20">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
                        <Trash2 className="h-5 w-5" />
                    </div>
                    <h2 className="font-black text-red-900 dark:text-red-400 uppercase tracking-wider text-xs">{t('profile_page.danger_zone')}</h2>
                </div>

                {!showDeleteConfirm ? (
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-red-900 dark:text-red-400">{t('profile_page.delete_account')}</p>
                            <p className="text-xs text-red-700/60 dark:text-red-400/60 font-medium">{t('profile_page.delete_confirm_desc')}</p>
                        </div>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition shadow-md whitespace-nowrap"
                        >
                            {t('profile_page.delete_account')}
                        </button>
                    </div>
                ) : (
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border-2 border-red-200 dark:border-red-900/50 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('profile_page.delete_confirm_title')}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{t('profile_page.delete_confirm_desc')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleDeactivateAccount}
                                disabled={deleteLoading}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-red-700 transition shadow-md disabled:opacity-50 flex items-center gap-2"
                            >
                                {deleteLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                {t('profile_page.delete_account')}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleteLoading}
                                className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                            >
                                {t('profile_page.cancel')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
