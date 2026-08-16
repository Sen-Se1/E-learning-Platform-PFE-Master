'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUserStore } from '@/lib/store';
import Link from 'next/link';
import { getCourseById, Course } from '@/data/courses';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { useLanguage } from '@/context/language-context';

import { CourseDetailsContent } from '@/components/courses/course-details-content';

export default function CourseDetailsPage() {
    const params = useParams();
    const courseId = params.id as string;
    const { t } = useLanguage();
    const router = useRouter();
    const { user } = useUserStore();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.role === 'student') {
            router.push(`/student/courses/${courseId}`);
            return;
        }

        const fetchCourse = async () => {
            const data = await getCourseById(courseId);
            if (data) setCourse(data);
            setLoading(false);
        };
        fetchCourse();
    }, [courseId, user, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
                    <h1 className="text-2xl font-black mb-4">Course Not Found</h1>
                    <Link href="/cours/catalogue" className="bg-primary text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs">
                        {t('course_details.browse_courses')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                    <CourseDetailsContent course={course} />
                </div>
            </div>
            <Footer />
        </div>
    );
}
