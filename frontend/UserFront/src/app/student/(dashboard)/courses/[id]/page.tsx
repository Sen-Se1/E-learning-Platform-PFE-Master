"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { getCourseById, Course } from "@/data/courses"
import { CourseDetailsContent } from "@/components/courses/course-details-content"
import { useLanguage } from "@/context/language-context"

export default function StudentCourseDetailsPage() {
    const params = useParams()
    const router = useRouter()
    const { t } = useLanguage()
    const courseId = params.id as string

    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCourse = async () => {
            if (courseId) {
                const data = await getCourseById(courseId);
                if (data) setCourse(data);
            }
            setLoading(false);
        };
        fetchCourse();
    }, [courseId])

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 m-8">
                <h1 className="text-2xl font-black mb-4">{t('course_details.course_not_found')}</h1>
                <button
                    onClick={() => router.push('/student/courses')}
                    className="bg-primary text-white font-black px-6 py-3 rounded-xl uppercase tracking-widest text-xs"
                >
                    {t('course_details.browse_courses')}
                </button>
            </div>
        )
    }

    return (
        <div className="md:p-2 lg:p-4">
            <CourseDetailsContent course={course} isDashboard={true} />
        </div>
    )
}
