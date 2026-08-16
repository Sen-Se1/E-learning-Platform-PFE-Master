"use client"

import React, { useEffect, useState } from "react"
import { useUserStore } from "@/lib/store"
import {
    Code2,
    Layout,
    Activity,
    ChevronRight,
    History,
    Lock
} from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import { getMyEnrolledCourses, getCourseById, Course } from "@/data/courses"

interface Exercise {
    _id: string
    id?: string
    title: string
    type: "coding" | "quiz" | "boolean"
    lessonId: string
    courseId?: string
    courseTitle?: string
    moduleTitle?: string
    lessonTitle?: string
    maxScore: number
    instructions?: string
    isLocked?: boolean
}

interface Stat {
    exerciseId: string
    attempts: number
    isCompleted: boolean
}

export default function ActivitiesPage() {
    const { user } = useUserStore()

    const [exercises, setExercises] = useState<Exercise[]>([])
    const [stats, setStats] = useState<Record<string, Stat>>({})
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!user) return

        const fetchData = async () => {
            try {
                // Fetch stats as before
                const token = localStorage.getItem('user-token');
                const statsResponse = await fetch(
                    `${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/submissions/user-stats/${user.id || (user as any)._id}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                )
                const statsData = await statsResponse.json()
                const statsMap: Record<string, Stat> = {}

                if (statsData.data) {
                    statsData.data.forEach((s: Stat) => {
                        statsMap[s.exerciseId] = s
                    })
                }

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

                const builtExercises: Exercise[] = [];

                for (const course of fullCourses) {
                    const courseId = course._id || course.id;
                    const courseTitle = course.title;

                    // 获取用户的课程进度
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

                    const completedSet = new Set(rawCompletedIds);

                    // Flatten curriculum logic to determine locks sequentially
                    const curriculum: any[] = [];
                    for (const m of (course.modules || [])) {
                        for (const l of (m.lessons || [])) {
                            curriculum.push({ id: l.id || l._id, type: 'lesson' });
                            for (const ex of (l.exercises || [])) {
                                curriculum.push({
                                    ...ex,
                                    id: ex.id || ex._id,
                                    type: 'exercise',
                                    _id: ex._id || ex.id,
                                    lessonId: l.id || l._id,
                                    courseId: courseId,
                                    courseTitle: courseTitle,
                                    moduleTitle: m.title,
                                    lessonTitle: l.title
                                });
                            }
                        }
                        for (const ex of (m.exercises || [])) {
                            curriculum.push({
                                ...ex,
                                id: ex.id || ex._id,
                                type: 'exercise',
                                _id: ex._id || ex.id,
                                courseId: courseId,
                                courseTitle: courseTitle,
                                moduleTitle: m.title,
                            });
                        }
                    }

                    let isLockedState = false; // By default, 1st item is not locked
                    for (const item of curriculum) {
                        if (item.type === 'exercise') {
                            builtExercises.push({
                                ...item,
                                isLocked: isLockedState
                            } as Exercise);
                        }

                        // Rule: If current item is not completed, EVERYTHING below it is locked!
                        if (!completedSet.has(item.id)) {
                            isLockedState = true;
                        }
                    }
                }

                setExercises(builtExercises)
                setStats(statsMap)
            } catch (error) {
                console.error("Failed to fetch exercises:", error)
                toast.error("Erreur lors du chargement des activités")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [user])

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse">
                        Chargement de vos activités...
                    </p>
                </div>
            </div>
        )
    }

    const completedCount = exercises.filter(
        (ex) => stats[ex._id]?.isCompleted
    ).length

    const attemptedCount = exercises.filter(
        (ex) => stats[ex._id] && !stats[ex._id].isCompleted
    ).length

    const notStartedCount =
        exercises.length - completedCount - attemptedCount

    const progress = exercises.length
        ? Math.round((completedCount / exercises.length) * 100)
        : 0

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "coding":
                return <Code2 className="size-6" />
            case "quiz":
                return <Layout className="size-6" />
            case "boolean":
                return <Activity className="size-6" />
            default:
                return <Code2 className="size-6" />
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "coding":
                return "Lab"
            case "quiz":
                return "Quiz"
            case "boolean":
                return "True / False"
            default:
                return "Exercise"
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 pb-20">

            {/* Header */}

            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-indigo-900 p-12 text-white shadow-xl">

                <div className="absolute right-0 top-0 h-72 w-72 bg-white/10 blur-3xl rounded-full" />

                <div className="relative flex flex-col md:flex-row justify-between gap-10">

                    <div className="space-y-4 max-w-xl">

                        <Badge className="bg-white/10 border-white/20 text-white">
                            <History className="size-3 mr-2" />
                            Training Activities
                        </Badge>

                        <h1 className="text-4xl font-bold tracking-tight">
                            Learning Activities
                        </h1>

                        <p className="text-indigo-100">
                            Track your exercises, quizzes and coding labs. Review your
                            attempts and improve your development skills.
                        </p>
                    </div>

                    <div className="flex gap-6">

                        <div className="bg-white/10 backdrop-blur rounded-2xl p-6 text-center w-32">
                            <p className="text-3xl font-bold">{exercises.length}</p>
                            <p className="text-xs text-indigo-200">Activities</p>
                        </div>

                        <div className="bg-white text-indigo-700 rounded-2xl p-6 text-center w-32">
                            <p className="text-3xl font-bold">{completedCount}</p>
                            <p className="text-xs text-gray-500">Completed</p>
                        </div>

                    </div>
                </div>
            </div>

            {/* Progress */}

            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border">

                <div className="flex justify-between mb-2 text-sm font-medium">
                    <span>Overall Progress</span>
                    <span>{progress}%</span>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                        className="bg-indigo-600 h-3 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Layout */}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

                {/* Sidebar */}

                <div className="lg:col-span-3 space-y-6">

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border">

                        <h3 className="font-semibold mb-4">
                            Activity Status
                        </h3>

                        <div className="space-y-4">

                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="size-2 bg-indigo-500 rounded-full" />
                                    Not Started
                                </span>
                                <span>{notStartedCount}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="size-2 bg-rose-500 rounded-full" />
                                    Incorrect
                                </span>
                                <span>{attemptedCount}</span>
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2">
                                    <div className="size-2 bg-emerald-500 rounded-full" />
                                    Completed
                                </span>
                                <span>{completedCount}</span>
                            </div>

                        </div>
                    </div>

                </div>

                {/* Activities List */}

                <div className="lg:col-span-9 space-y-6">

                    {exercises.length === 0 && (
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-20 border text-center">
                            <Activity className="size-16 text-slate-300 mx-auto mb-6" />
                            <h3 className="text-xl font-bold">
                                Aucune activité
                            </h3>
                            <p className="text-slate-500 mt-2">
                                Commencez vos cours pour voir les exercices ici.
                            </p>
                        </div>
                    )}

                    {exercises.map((exercise) => {

                        const stat = stats[exercise._id]
                        const attempts = stat?.attempts || 0
                        const isCompleted = stat?.isCompleted

                        return (
                            <div
                                key={exercise._id}
                                className={`group bg-white dark:bg-slate-900 border rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between transition ${exercise.isLocked ? "opacity-60" : "hover:shadow-lg"}`}
                            >

                                <div className="flex items-center gap-5 w-full md:w-auto mb-4 md:mb-0">

                                    <div
                                        className={`p-4 rounded-xl shrink-0 ${isCompleted
                                            ? "bg-emerald-100 text-emerald-600"
                                            : exercise.isLocked
                                                ? "bg-slate-100 text-slate-400"
                                                : attempts > 0
                                                    ? "bg-rose-100 text-rose-600"
                                                    : "bg-indigo-50 text-indigo-500"
                                            }`}
                                    >
                                        {exercise.isLocked ? <Lock className="size-6" /> : getTypeIcon(exercise.type)}
                                    </div>

                                    <div className="flex-1">

                                        <div className="flex flex-wrap items-center gap-2 mb-2">

                                            <Badge variant="secondary" className="text-[10px] uppercase tracking-wider">
                                                {getTypeLabel(exercise.type)}
                                            </Badge>

                                            {exercise.courseTitle && (
                                                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200 bg-slate-50">
                                                    {exercise.courseTitle}
                                                </Badge>
                                            )}

                                            {exercise.moduleTitle && (
                                                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                                                    {exercise.moduleTitle}
                                                </Badge>
                                            )}

                                            {exercise.lessonTitle && (
                                                <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">
                                                    {exercise.lessonTitle}
                                                </Badge>
                                            )}

                                            {isCompleted && (
                                                <Badge className="bg-emerald-100 text-emerald-700">
                                                    Completed
                                                </Badge>
                                            )}

                                            {!isCompleted && attempts > 0 && (
                                                <Badge className="bg-rose-100 text-rose-700">
                                                    Incorrect
                                                </Badge>
                                            )}

                                        </div>

                                        <h3 className={`font-semibold text-lg transition ${!exercise.isLocked && 'group-hover:text-indigo-600'}`}>
                                            {exercise.title}
                                        </h3>

                                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                                            {exercise.isLocked ? "Vous devez d'abord compléter les leçons précédentes pour débloquer cette activité." : exercise.instructions?.replace(/<[^>]*>?/gm, "")}
                                        </p>

                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">

                                    <div className="text-center">
                                        <p className="font-semibold">{attempts}</p>
                                        <p className="text-xs text-slate-500">
                                            Attempts
                                        </p>
                                    </div>

                                    {exercise.isLocked ? (
                                        <Button className="rounded-xl bg-slate-100 text-slate-400 hover:bg-slate-100 cursor-not-allowed">
                                            Locked
                                            <Lock className="ml-2 size-4" />
                                        </Button>
                                    ) : (
                                        <Link
                                            href={`/student/player/${exercise.lessonId}?${exercise.courseId
                                                ? `courseId=${exercise.courseId}&`
                                                : ""
                                                }exerciseId=${exercise._id || exercise.id}`}
                                        >
                                            <Button className="rounded-xl">
                                                {isCompleted
                                                    ? "Review"
                                                    : attempts
                                                        ? "Retry"
                                                        : "Start"}
                                                <ChevronRight className="ml-1 size-4" />
                                            </Button>
                                        </Link>
                                    )}

                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}