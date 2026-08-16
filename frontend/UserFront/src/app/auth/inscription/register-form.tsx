"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/language-context';
import {
    CheckCircle2,
    ChevronDown,
    User,
    Mail,
    Lock,
    Phone,
    Calendar,
    MapPin,
    ArrowRight,
    ArrowLeft,
    ShieldCheck,
    Briefcase
} from 'lucide-react';
import { countries } from '@/lib/countries';
import { phoneCodes } from '@/lib/phone-codes';

export default function RegisterForm() {
    const router = useRouter();
    const { dir } = useLanguage();
    const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        passwordConfirm: '',
        phonePrefix: '',
        phoneNumber: '',
        dateOfBirth: '',
        street: '',
        city: '',
        state: '',
        country: '',
        zipCode: '',
        role: 'student' as 'student' | 'instructor',
        terms: false,
    });
    
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [countrySearch, setCountrySearch] = useState('');
    const [showCountryDropdown, setShowCountryDropdown] = useState(false);
    const [phonePrefixSearch, setPhonePrefixSearch] = useState('');
    const [showPhonePrefixDropdown, setShowPhonePrefixDropdown] = useState(false);

    const validateStep = (step: number) => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            // Account Basics
            if (!formData.email.trim()) {
                newErrors.email = 'Email is required';
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newErrors.email = 'Invalid email format';
            }

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,}$/;
            if (!formData.password) {
                newErrors.password = 'Password is required';
            } else if (formData.password.length < 8) {
                newErrors.password = 'Password must be at least 8 characters';
            } else if (!passwordRegex.test(formData.password)) {
                newErrors.password = 'Must contain uppercase, lowercase, number and symbol';
            }

            if (formData.password !== formData.passwordConfirm) {
                newErrors.passwordConfirm = 'Passwords do not match';
            }
        }

        if (step === 2) {
            // Personal Info
            if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
            if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';

            if (!formData.phonePrefix.trim()) newErrors.phonePrefix = 'Required';
            if (!formData.phoneNumber.trim()) {
                newErrors.phoneNumber = 'Phone number is required';
            } else if (!/^\d+$/.test(formData.phoneNumber)) {
                newErrors.phoneNumber = 'Numbers only';
            }

            if (formData.dateOfBirth) {
                const dob = new Date(formData.dateOfBirth);
                if (dob >= new Date()) {
                    newErrors.dateOfBirth = 'Date of birth must be in the past';
                }
            }
        }

        if (step === 3) {
            // Address
            if (!formData.street.trim()) newErrors.street = 'Street is required';
            if (!formData.city.trim()) newErrors.city = 'City is required';
            if (!formData.country.trim()) newErrors.country = 'Country is required';
            if (!formData.zipCode.trim()) newErrors.zipCode = 'Zip code is required';
            if (!formData.terms) newErrors.terms = 'You must accept the terms';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const prevStep = () => {
        setCurrentStep(prev => prev - 1);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateStep(3)) return;

        setLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    password: formData.password,
                    passwordConfirm: formData.passwordConfirm,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phone: `${formData.phonePrefix}${formData.phoneNumber}`,
                    dateOfBirth: formData.dateOfBirth,
                    street: formData.street,
                    city: formData.city,
                    state: formData.state,
                    country: formData.country,
                    zipCode: formData.zipCode,
                    role: formData.role,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                if (result.errors && Array.isArray(result.errors)) {
                    const validationErrors: Record<string, string> = {};
                    result.errors.forEach((err: any) => {
                        if (err.path) {
                            validationErrors[err.path] = err.msg;
                        }
                    });
                    const errorMessages = result.errors.map((err: any) => err.msg || 'Validation error').join(' | ');
                    validationErrors.submit = errorMessages || 'Registration failed';
                    setErrors(validationErrors);

                    // Redirect to the step where the first error occurred
                    const firstErrorPath = result.errors[0]?.path;
                    if (firstErrorPath) {
                        if (['email', 'password', 'passwordConfirm', 'role'].includes(firstErrorPath)) {
                            setCurrentStep(1);
                        } else if (['firstName', 'lastName', 'phone', 'dateOfBirth'].includes(firstErrorPath)) {
                            setCurrentStep(2);
                        } else if (['street', 'city', 'state', 'country', 'zipCode'].includes(firstErrorPath)) {
                            setCurrentStep(3);
                        }
                    }
                    return;
                }
                throw new Error(result.message || 'Registration failed');
            }

            setSuccessMessage('Account created! Verification email sent.');
            setCurrentStep(4); // Success step

        } catch (err) {
            if (err instanceof Error) {
                setErrors({ submit: err.message || 'Registration failed. Please try again.' });
            }
        } finally {
            setLoading(false);
        }
    };
    const steps = [
        { id: 1, title: 'Account', icon: Lock },
        { id: 2, title: 'Personal', icon: User },
        { id: 3, title: 'Address', icon: MapPin },
    ];

    return (
        <div className="w-full max-w-xl mx-auto">
            {/* Multi-step Header */}
            {currentStep < 4 && (
                <div className="mb-10">
                    <div className="flex justify-between items-center relative">
                        {/* Progress Line */}
                        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 z-0"></div>
                        <div
                            className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500"
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                        ></div>

                        {steps.map((step) => {
                            const Icon = step.icon;
                            const isActive = currentStep === step.id;
                            const isCompleted = currentStep > step.id;

                            return (
                                <div key={step.id} className="relative z-10 flex flex-col items-center">
                                    <div className={`
                                        size-10 rounded-full flex items-center justify-center transition-all duration-300 border-4
                                        ${isActive ? 'bg-primary text-white border-primary/20 scale-110' :
                                            isCompleted ? 'bg-primary text-white border-primary/20' :
                                                'bg-white dark:bg-slate-800 text-slate-400 border-slate-100 dark:border-slate-700'}
                                    `}>
                                        {isCompleted ? <CheckCircle2 className="size-5" /> : <Icon className="size-4" />}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-2 uppercase tracking-tighter ${isActive ? 'text-primary' : 'text-slate-400'}`}>
                                        {step.title}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Error Message */}
            {errors.submit && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm animate-shake">
                    {errors.submit}
                </div>
            )}

            {/* Step 4: Success View */}
            {currentStep === 4 ? (
                <div className="text-center py-12 animate-in zoom-in duration-500">
                    <div className="size-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 className="size-10" />
                    </div>
                    <h2 className="text-2xl font-black mb-3">Welcome to CloudMaster!</h2>
                    <p className="text-muted-foreground mb-8 text-lg">{successMessage}</p>
                    <button
                        onClick={() => router.push('/auth')}
                        className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-primary/25"
                    >
                        Go to Login
                    </button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Step 1: Account Basics */}
                    {currentStep === 1 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Mail className="size-4 text-primary" /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 transition-all`}
                                    placeholder="your@email.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <Lock className="size-4 text-primary" /> Password
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 transition-all`}
                                        placeholder="••••••••"
                                    />
                                    {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                        <ShieldCheck className="size-4 text-primary" /> Confirm
                                    </label>
                                    <input
                                        type="password"
                                        value={formData.passwordConfirm}
                                        onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${errors.passwordConfirm ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 transition-all`}
                                        placeholder="••••••••"
                                    />
                                    {errors.passwordConfirm && <p className="text-red-500 text-xs font-medium">{errors.passwordConfirm}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Briefcase className="size-4 text-primary" /> I am a...
                                </label>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'student' })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'student' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-500'}`}
                                    >
                                        <User className="size-6" />
                                        <span className="text-xs font-bold uppercase">Student</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: 'instructor' })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${formData.role === 'instructor' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 text-slate-500'}`}
                                    >
                                        <Briefcase className="size-6" />
                                        <span className="text-xs font-bold uppercase">Instructor</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personal Details */}
                    {currentStep === 2 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">First Name</label>
                                    <input
                                        type="text"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="John"
                                    />
                                    {errors.firstName && <p className="text-red-500 text-xs font-medium">{errors.firstName}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Last Name</label>
                                    <input
                                        type="text"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Doe"
                                    />
                                    {errors.lastName && <p className="text-red-500 text-xs font-medium">{errors.lastName}</p>}
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Phone className="size-4 text-primary" /> Phone Number
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative w-32">
                                        <div
                                            onClick={() => setShowPhonePrefixDropdown(!showPhonePrefixDropdown)}
                                            className="flex items-center justify-between w-full px-3 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 cursor-pointer font-bold text-sm"
                                        >
                                            <span>{formData.phonePrefix}</span>
                                            <ChevronDown className="size-3 text-slate-400" />
                                        </div>

                                        {showPhonePrefixDropdown && (
                                            <div className="absolute top-full left-0 w-64 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-64 overflow-y-auto">
                                                <div className="sticky top-0 p-2 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
                                                    <input
                                                        type="text"
                                                        placeholder="Search country..."
                                                        value={phonePrefixSearch}
                                                        onChange={(e) => setPhonePrefixSearch(e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                        className="w-full px-3 py-2 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-1 focus:ring-primary dark:text-white dark:placeholder:text-slate-500"
                                                    />
                                                </div>
                                                <div className="py-1">
                                                    {phoneCodes
                                                        .filter(c =>
                                                            c.name.toLowerCase().includes(phonePrefixSearch.toLowerCase()) ||
                                                            c.dial_code.includes(phonePrefixSearch)
                                                        )
                                                        .map(c => (
                                                            <div
                                                                key={`${c.code}-${c.dial_code}`}
                                                                onClick={() => {
                                                                    setFormData({ ...formData, phonePrefix: c.dial_code });
                                                                    setShowPhonePrefixDropdown(false);
                                                                    setPhonePrefixSearch('');
                                                                }}
                                                                className="px-4 py-2 text-xs hover:bg-primary/10 cursor-pointer transition-colors flex justify-between items-center"
                                                            >
                                                                <span className="truncate mr-2">{c.name}</span>
                                                                <span className="font-bold text-primary shrink-0">{c.dial_code}</span>
                                                            </div>
                                                        ))
                                                    }
                                                </div>
                                            </div>
                                        )}
                                        {/* Click outside to close */}
                                        {showPhonePrefixDropdown && (
                                            <div
                                                className="fixed inset-0 z-40"
                                                onClick={() => setShowPhonePrefixDropdown(false)}
                                            />
                                        )}
                                    </div>
                                    <input
                                        type="tel"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        className={`flex-1 px-4 py-3.5 rounded-xl border ${errors.phone || errors.phoneNumber ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 transition-all focus:ring-2 focus:ring-primary/20`}
                                        placeholder="12345678"
                                    />
                                </div>
                                {(errors.phonePrefix || errors.phoneNumber || errors.phone) && <p className="text-red-500 text-xs font-medium">{errors.phone || errors.phoneNumber || errors.phonePrefix}</p>}
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <Calendar className="size-4 text-primary" /> Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 transition-all"
                                />
                                {errors.dateOfBirth && <p className="text-red-500 text-xs font-medium">{errors.dateOfBirth}</p>}
                            </div>
                        </div>
                    )}

                    {/* Step 3: Address Details */}
                    {currentStep === 3 && (
                        <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                    <MapPin className="size-4 text-primary" /> Street Address
                                </label>
                                <input
                                    type="text"
                                    value={formData.street}
                                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 transition-all"
                                    placeholder="123 DevOps Avenue"
                                />
                                {errors.street && <p className="text-red-500 text-xs font-medium">{errors.street}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2 relative">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Country</label>
                                    <div
                                        onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                                        className={`flex items-center justify-between w-full px-4 py-3.5 rounded-xl border ${errors.country ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 cursor-pointer`}
                                    >
                                        <span className={formData.country ? 'text-foreground' : 'text-slate-400'}>
                                            {formData.country ? countries.find(c => c.code === formData.country)?.name : 'Select country'}
                                        </span>
                                        <ChevronDown className="size-4 text-slate-400 transition-transform" />
                                    </div>
                                    {errors.country && <p className="text-red-500 text-xs font-medium">{errors.country}</p>}

                                    {showCountryDropdown && (
                                        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
                                            <div className="sticky top-0 p-2 bg-white dark:bg-slate-900 border-b dark:border-slate-800">
                                                <input
                                                    type="text"
                                                    placeholder="Search..."
                                                    value={countrySearch}
                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border-none focus:ring-1 focus:ring-primary dark:text-white dark:placeholder:text-slate-500"
                                                />
                                            </div>
                                            {countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())).map(c => (
                                                <div
                                                    key={c.code}
                                                    onClick={() => {
                                                        setFormData({ ...formData, country: c.code });
                                                        setShowCountryDropdown(false);
                                                    }}
                                                    className="px-4 py-2.5 text-sm hover:bg-primary/10 cursor-pointer transition-colors"
                                                >
                                                    {c.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">City</label>
                                    <input
                                        type="text"
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${errors.city ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 transition-all`}
                                        placeholder="Paris"
                                    />
                                    {errors.city && <p className="text-red-500 text-xs font-medium">{errors.city}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">State / Province</label>
                                    <input
                                        type="text"
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${errors.state ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 transition-all`}
                                        placeholder="Ile-de-France"
                                    />
                                    {errors.state && <p className="text-red-500 text-xs font-medium">{errors.state}</p>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Zip Code</label>
                                    <input
                                        type="text"
                                        value={formData.zipCode}
                                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                                        className={`w-full px-4 py-3.5 rounded-xl border ${errors.zipCode ? 'border-red-500 bg-red-50/10' : 'border-slate-200 dark:border-slate-700'} bg-white dark:bg-slate-800/50 transition-all`}
                                        placeholder="75000"
                                    />
                                    {errors.zipCode && <p className="text-red-500 text-xs font-medium">{errors.zipCode}</p>}
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={formData.terms}
                                    onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                                    className="size-5 rounded border-slate-300 text-primary focus:ring-primary mt-0.5"
                                />
                                <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed italic cursor-pointer">
                                    I agree to the <span className="text-primary font-bold hover:underline">Terms of Service</span> and <span className="text-primary font-bold hover:underline">Privacy Policy</span>.
                                </label>
                            </div>
                            {errors.terms && <p className="text-red-500 text-xs font-bold">{errors.terms}</p>}
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-4 pt-4">
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="flex-1 flex items-center justify-center gap-2 h-14 rounded-xl border-2 border-slate-100 dark:border-slate-800 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                            >
                                <ArrowLeft className="size-4" /> Back
                            </button>
                        )}

                        {currentStep < 3 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex-[2] flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all"
                            >
                                Continue <ArrowRight className="size-4" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-[2] flex items-center justify-center gap-2 h-14 rounded-xl bg-primary text-white font-black shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>Join CloudMaster <ArrowRight className="size-4" /></>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            )}

            {/* Bottom Links */}
            {currentStep < 4 && (
                <div className="mt-12 text-center text-sm font-medium text-slate-400">
                    Already part of the community?{' '}
                    <button
                        onClick={() => router.push('/auth')}
                        className="text-primary font-bold hover:underline"
                    >
                        Sign in here
                    </button>
                </div>
            )}
        </div>
    );
}
