"use client"

import React, { useEffect, useState } from "react"
import { useUserStore } from "@/lib/store"
import { getMyEnrolledCourses, getCourseById, Course } from "@/data/courses"
import { Award, ChevronRight, Download, GraduationCap, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CourseWithProgress extends Course {
    progressPercent: number
    completedIds: string[]
}

export default function CertificatesPage() {
    const { user } = useUserStore()
    const [courses, setCourses] = useState<CourseWithProgress[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchCertificatesData = async () => {
            try {
                // fetch enrolled courses
                const basicCourses = await getMyEnrolledCourses()
                // fetch full courses
                const fullCoursesResults = await Promise.all(
                    basicCourses.map(async (c) => {
                        const detail = await getCourseById(c._id || c.id).catch(() => null);
                        return detail || c;
                    })
                );

                const fullCourses = fullCoursesResults.filter(Boolean) as Course[];
                const coursesWithProgress: CourseWithProgress[] = [];

                for (const course of fullCourses) {
                    const courseId = course._id || course.id;

                    let rawCompletedIds: string[] = [];
                    try {
                        const token = localStorage.getItem('user-token');
                        const res = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/course-progress/${courseId}?userId=${user.id || (user as any)._id}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.data && data.data.length > 0) {
                                rawCompletedIds = data.data;
                            }
                        }
                    } catch (e) {
                        console.error("Failed to load progress from backend", e);
                    }

                    if (rawCompletedIds.length === 0) {
                        const saved1 = localStorage.getItem(`progress_${course.id}`);
                        const saved2 = localStorage.getItem(`progress_${course._id}`);
                        rawCompletedIds = Array.from(new Set([
                            ...(saved1 ? JSON.parse(saved1) : []),
                            ...(saved2 ? JSON.parse(saved2) : [])
                        ]));
                    }

                    const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
                    const allExercises = course.modules?.flatMap(m => [
                        ...(m.lessons || []).flatMap(l => l.exercises || []),
                        ...(m.exercises || [])
                    ]) || [];

                    const completedCount =
                        allLessons.filter(l => rawCompletedIds.includes(l.id) || (l._id && rawCompletedIds.includes(l._id))).length +
                        allExercises.filter(ex => rawCompletedIds.includes(ex.id) || (ex._id && rawCompletedIds.includes(ex._id))).length;

                    const totalCount = allLessons.length + allExercises.length;

                    const percent = totalCount > 0
                        ? Math.round((completedCount / totalCount) * 100)
                        : 0;

                    coursesWithProgress.push({
                        ...course,
                        progressPercent: percent,
                        completedIds: rawCompletedIds
                    });
                }

                setCourses(coursesWithProgress)
            } catch (error) {
                console.error("Failed to fetch certs data:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchCertificatesData()
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">
                        Loading your achievements...
                    </p>
                </div>
            </div>
        )
    }

    const graduatedCourses = courses.filter(c => c.progressPercent === 100)

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">

            {/* Header */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-600 via-yellow-600 to-orange-700 p-12 text-white shadow-xl">
                <div className="absolute right-0 top-0 h-72 w-72 bg-white/10 blur-3xl rounded-full" />
                <div className="relative flex flex-col md:flex-row justify-between gap-10">
                    <div className="space-y-4 max-w-xl">
                        <Badge className="bg-white/10 border-white/20 text-white">
                            <Award className="size-3 mr-2" />
                            Your Achievements
                        </Badge>
                        <h1 className="text-4xl font-bold tracking-tight">
                            My Certifications
                        </h1>
                        <p className="text-amber-100">
                            View, download, and share the certificates you've earned by successfully completing your courses.
                        </p>
                    </div>

                    <div className="flex gap-6">
                        <div className="bg-white/20 backdrop-blur rounded-2xl p-6 text-center w-32 border border-white/10">
                            <GraduationCap className="size-8 mx-auto mb-2 text-white" />
                            <p className="text-3xl font-bold">{graduatedCourses.length}</p>
                            <p className="text-xs text-amber-200">Earned</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Layout */}
            {graduatedCourses.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-20 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
                    <div className="mx-auto size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <ShieldCheck className="size-10 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                        No Certificates Yet
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8 text-lg">
                        You haven't completed any courses yet. Finish all lessons and labs in a course to earn your first certificate!
                    </p>
                    <Link href="/student/courses">
                        <Button className="h-12 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20">
                            Explore Courses
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {graduatedCourses.map(course => (
                        <div
                            key={course._id || course.id}
                            className="group relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                        >
                            <div className="aspect-[4/3] bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-bl-full" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-500/10 rounded-tr-full" />

                                <div className="size-20 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xl shadow-slate-200/50 dark:shadow-none mb-6 z-10 border border-slate-100 dark:border-slate-700">
                                    <Award className="size-10 text-amber-500" />
                                </div>
                                <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white line-clamp-2 z-10 leading-tight">
                                    {course.title}
                                </h3>
                            </div>

                            <div className="p-6 bg-white dark:bg-slate-900">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">Status</span>
                                        <span className="text-emerald-600 font-bold flex items-center gap-1.5 text-sm mt-0.5">
                                            <ShieldCheck className="size-4" />
                                            Certified
                                        </span>
                                    </div>
                                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none font-black uppercase text-[10px] tracking-wider">
                                        Completed
                                    </Badge>
                                </div>

                                <Link
                                    href={`/student/certificates/${course._id || course.id}`}
                                    className="block"
                                >
                                    <Button className="w-full rounded-xl bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-6" variant="default">
                                        View Certificate
                                        <ChevronRight className="ml-2 size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
