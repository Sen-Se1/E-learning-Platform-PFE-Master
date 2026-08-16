"use client"

import React, { useState, useEffect, use } from "react"
import { getCourseById, Course } from "@/data/courses"
import { EnrollmentSuccessContent } from "@/components/courses/enrollment-success-content"
import { useRouter } from "next/navigation"

interface SuccessPageProps {
    params: Promise<{ id: string }>;
}

export default function EnrollmentSuccessPage({ params }: SuccessPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            if (id) {
                const data = await getCourseById(id);
                if (data) {
                    setCourse(data);
                } else {
                    router.push('/student/courses');
                }
            }
            setLoading(false);
        };
        fetchCourse();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!course) return null;

    return (
        <main className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 p-4 md:p-8">
            <EnrollmentSuccessContent course={course} />
        </main>
    );
}
