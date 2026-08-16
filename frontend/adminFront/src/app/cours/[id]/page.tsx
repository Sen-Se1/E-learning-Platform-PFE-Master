'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { courses, Course } from '@/data/courses';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/context/language-context';

export default function CourseDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const courseId = params.id as string;
    const { t } = useLanguage();

    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourse = () => {
            try {
                setLoading(true);
                setError(null);

                if (!courseId) {
                    throw new Error('Course ID is required');
                }

                // Accès direct avec courses[id]
                const courseData = courses[courseId];

                if (!courseData) {
                    throw new Error('Course not found');
                }

                setCourse(courseData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load course');
                console.error('Error loading course:', err);
            } finally {
                setLoading(false);
            }
        };

        loadCourse();
    }, [courseId]);

    // Gestion du chargement
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Gestion des erreurs
    if (error || !course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
                <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-8 text-center shadow-lg">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-red-600 dark:text-red-400 text-3xl">
                            error_outline
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {error || t('course_details.course_not_found')}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                        {error || t('course_details.course_not_found_desc')}
                    </p>
                    <button
                        onClick={() => router.push('/cours/catalogue')}
                        className="bg-primary hover:bg-primary/90 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg shadow-primary/20"
                    >
                        {t('course_details.browse_courses')}
                    </button>
                </div>
            </div>
        );
    }

    return <CourseContent course={course} t={t} />;
}

// Composant Page réutilisable
interface CourseContentProps {
    course: Course;
    t: (key: string) => string;
}

const CourseContent: React.FC<CourseContentProps> = ({ course, t }) => {
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev =>
            prev.includes(moduleId)
                ? prev.filter(id => id !== moduleId)
                : [...prev, moduleId]
        );
    };

    const totalModules = course.modules.length;
    const totalLessons = course.modules.reduce((sum, module) => sum + module.lessons.length, 0);

    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display min-h-screen">
            <Navbar />

            {/* Breadcrumbs */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex text-sm text-slate-500 dark:text-slate-400 items-center gap-2">
                    <Link href="/" className="hover:text-primary">{t('course_details.breadcrumb_home')}</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <Link href="/cours/catalogue" className="hover:text-primary">{t('course_details.breadcrumb_courses')}</Link>
                    <span className="material-symbols-outlined text-xs">chevron_right</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium">{t(`courses_data.${course.id.replace(/-/g, '_')}.title`) || course.title}</span>
                </nav>
            </div>

            {/* Hero Section */}
            <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-12 mb-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        <div className="lg:col-span-2">
                            <div className="flex flex-wrap gap-2 mb-4">
                                <span className="bg-primary/20 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase">
                                    {t(`catalog.${course.level.toLowerCase()}`)}
                                </span>
                                {course.rating >= 4.8 && (
                                    <span className="bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                                        {t('course_details.bestseller')}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
                                {t(`courses_data.${course.id.replace(/-/g, '_')}.title`) || course.title}
                            </h1>

                            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">
                                {t(`courses_data.${course.id.replace(/-/g, '_')}.subtitle`) || course.subtitle}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5 text-amber-500">
                                    <span className="material-symbols-outlined text-lg">star</span>
                                    <span className="font-bold text-slate-900 dark:text-slate-200">{course.rating}</span>
                                    <span>({course.reviews} {t('course_details.ratings')})</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-lg">group</span>
                                    <span>{course.students.toLocaleString()} {t('course_details.students')}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-lg">schedule</span>
                                    <span>{course.duration}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <span className="material-symbols-outlined text-lg">update</span>
                                    <span>{t('course_details.last_updated')} {course.lastUpdated}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Description */}
                        <section aria-labelledby="description-heading">
                            <h2 id="description-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                                {t('course_details.about_course')}
                            </h2>
                            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed space-y-4">
                                <p>
                                    {t(`courses_data.${course.id.replace(/-/g, '_')}.description`) || course.description}
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6 list-none p-0">
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                        <span>{t('course_details.hands_on')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                        <span>{t('course_details.real_world')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                        <span>{t('course_details.certificate')}</span>
                                    </li>
                                    <li className="flex items-start gap-3">
                                        <span className="material-symbols-outlined text-primary text-xl">check_circle</span>
                                        <span>{t('course_details.instructor_qa')}</span>
                                    </li>
                                </ul>
                            </div>
                        </section>

                        {/* Prerequisites */}
                        <section aria-labelledby="prerequisites-heading">
                            <h2 id="prerequisites-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                                {t('course_details.prerequisites')}
                            </h2>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                                    {course.prerequisites.map((prereq, index) => {
                                        const prereqKey = prereq.icon === 'terminal' ? 'cli' : prereq.icon === 'cloud' ? 'aws' : prereq.icon === 'code' ? 'git' : 'docker';
                                        const translatedPrereq = t(`courses_data.${course.id.replace(/-/g, '_')}.prerequisites.${prereqKey}`);
                                        return (
                                            <div key={index} className="flex flex-col items-center text-center p-4 rounded-lg bg-background-light dark:bg-background-dark/50">
                                                <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-3">
                                                    <span className="material-symbols-outlined text-primary">{prereq.icon}</span>
                                                </div>
                                                <h4 className="font-bold text-sm mb-1">
                                                    {typeof translatedPrereq === 'object' && translatedPrereq !== null ? (translatedPrereq as Record<string, string>).title : prereq.title}
                                                </h4>
                                                <p className="text-xs text-slate-500">
                                                    {typeof translatedPrereq === 'object' && translatedPrereq !== null ? (translatedPrereq as Record<string, string>).desc : prereq.description}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>

                        {/* Instructor Bio */}
                        <section aria-labelledby="instructor-heading">
                            <h2 id="instructor-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <span className="w-1.5 h-8 bg-primary rounded-full"></span>
                                {t('course_details.your_instructor')}
                            </h2>
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 flex flex-col md:flex-row gap-8 items-start">
                                <Image
                                    src={course.instructorDetails.avatar}
                                    alt={course.instructorDetails.name}
                                    width={96}
                                    height={96}
                                    className="w-24 h-24 rounded-full object-cover border-4 border-primary/20"
                                    loading="lazy"
                                />
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{course.instructorDetails.name}</h3>
                                            <p className="text-primary font-medium text-sm">
                                                {course.instructorDetails.title} @ {course.instructorDetails.company}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                                        {course.instructorDetails.bio}
                                    </p>
                                    <div className="flex gap-6">
                                        <div className="text-center">
                                            <div className="text-lg font-bold">{course.instructorDetails.courses}+</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t('course_details.courses_count')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold">{(course.instructorDetails.students / 1000).toFixed(1)}k</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t('course_details.students')}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-lg font-bold">{course.instructorDetails.rating}</div>
                                            <div className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">{t('course_details.avg_rating')}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Enrollment Card */}
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xl">
                                <div className="relative h-48">
                                    <Image
                                        src={course.image}
                                        alt="Course Preview"
                                        fill
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </div>

                                <div className="p-6">
                                    <div className="flex items-baseline gap-2 mb-6">
                                        <span className="text-3xl font-bold text-slate-900 dark:text-white">
                                            ${course.price.toFixed(2)}
                                        </span>
                                        <span className="text-slate-400 line-through text-lg font-medium">
                                            ${course.originalPrice.toFixed(2)}
                                        </span>
                                        <span className="text-emerald-500 text-sm font-bold ml-auto">
                                            {course.discount}% {t('course_details.off')}
                                        </span>
                                    </div>

                                    <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl mb-4">
                                        {t('course_details.enroll_now')}${course.price.toFixed(2)}
                                    </button>

                                    <button className="w-full border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-bold py-3 rounded-xl mb-6">
                                        {t('course_details.free_preview')}
                                    </button>

                                    <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t('course_details.included_course')}</p>
                                        <ul className="space-y-3">
                                            {course.features.map((feature, index) => {
                                                const featureKey = feature.icon.includes('video') ? 'video' : feature.icon.includes('terminal') ? 'labs' : feature.icon.includes('download') ? 'resources' : 'certificate';
                                                const translatedFeature = t(`courses_data.${course.id.replace(/-/g, '_')}.features.${featureKey}`);
                                                return (
                                                    <li key={index} className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
                                                        <span className="material-symbols-outlined text-primary text-lg">{feature.icon}</span>
                                                        <span>{translatedFeature || feature.description}</span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            {/* Course Content Accordion */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="font-bold text-lg">{t('course_details.course_content')}</h3>
                                    <span className="text-xs text-slate-500 font-medium">
                                        {totalModules} {t('course_details.modules')} • {totalLessons} {t('course_details.lessons')}
                                    </span>
                                </div>

                                {course.modules.map((module) => (
                                    <div
                                        key={module.id}
                                        className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => toggleModule(module.id)}
                                            className={`w-full flex items-center justify-between p-4 ${expandedModules.includes(module.id)
                                                ? 'bg-slate-50 dark:bg-slate-800/50'
                                                : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                                                } transition-colors`}
                                        >
                                            <div className="flex items-center gap-3 text-left">
                                                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${expandedModules.includes(module.id)
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                                                    }`}>
                                                    {course.modules.indexOf(module) + 1}
                                                </span>
                                                <span className="font-bold text-sm">{module.title}</span>
                                            </div>
                                            <span className="material-symbols-outlined text-slate-400">
                                                {expandedModules.includes(module.id) ? 'expand_less' : 'expand_more'}
                                            </span>
                                        </button>

                                        {expandedModules.includes(module.id) && (
                                            <div className="p-2 space-y-1 bg-slate-50 dark:bg-slate-800/30">
                                                {module.lessons.map((lesson) => (
                                                    <div
                                                        key={lesson.id}
                                                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                                    >
                                                        <span className="material-symbols-outlined text-slate-500 text-xl">
                                                            {lesson.type === 'video' ? 'play_circle' : 'quiz'}
                                                        </span>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium">{lesson.title}</p>
                                                            <p className="text-[10px] text-slate-500">
                                                                {lesson.type === 'quiz'
                                                                    ? `${t('course_details.quiz')} • ${lesson.questions} ${t('course_details.questions')}`
                                                                    : `${lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)} • ${lesson.duration}`}
                                                            </p>
                                                        </div>
                                                        {lesson.isPreview && (
                                                            <span className="text-[10px] font-bold text-primary uppercase">{t('course_details.preview')}</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};
