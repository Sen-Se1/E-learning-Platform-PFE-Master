"use client"

import React, { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import {
    CheckCircle2,
    PlayCircle,
    BookOpen,
    Clock,
    Layout,
    Code,
    Layers,
    ChevronDown,
    ChevronUp,
    User
} from "lucide-react"

// UI Components (Assuming Shadcn/UI structure)
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Types
import { Course, Module, Lesson } from "@/data/courses"

interface EnrollmentSuccessContentProps {
    course: Course
}

// --- Sub-Components ---

const StatCard = ({
    icon,
    title,
    value,
}: {
    icon: React.ReactNode
    title: string
    value: number | string
}) => (
    <div className="group relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 transition-all duration-300 hover:shadow-md hover:border-blue-500/20">
        <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {title}
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {value}
                </p>
            </div>
        </div>
    </div>
)

const InstructorCard = ({ course }: { course: Course }) => {
    const getInitials = (name: string) => {
        if (!name) return "?"
        const parts = name.split(" ")
        return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase()
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="size-20 ring-4 ring-slate-50 dark:ring-slate-800">
                <AvatarImage
                    src={course.instructorDetails?.avatar}
                    alt={course.instructor}
                />
                <AvatarFallback className="text-lg bg-blue-100 text-blue-700">
                    {getInitials(course.instructor)}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-2">
                <div>
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">
                        {course.instructor}
                    </h4>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                        {course.instructorDetails?.title || "Instructeur Principal"}
                    </p>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                    {course.instructorDetails?.bio ||
                        "Expert en développement logiciel dédié à l'enseignement des technologies modernes."}
                </p>
            </div>
        </div>
    )
}

const ModuleSection = ({
    module,
    index,
    isExpanded,
    onToggle,
}: {
    module: Module
    index: number
    isExpanded: boolean
    onToggle: () => void
}) => {
    return (
        <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 transition-all duration-300">
            {/* Module Header */}
            <button
                onClick={onToggle}
                className="w-full p-6 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                aria-expanded={isExpanded}
            >
                <div className="flex items-center gap-4">
                    <div className="size-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                        {index + 1}
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">
                            {module.title}
                        </h4>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            {module.lessons?.length || 0} leçons •{" "}
                            {module.exercises?.length || 0} exercices
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="hidden sm:inline-flex">
                        Module
                    </Badge>
                    {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                </div>
            </button>

            {/* Lessons List (Collapsible) */}
            {isExpanded && (
                <div className="divide-y divide-slate-100 dark:divide-slate-800 animate-in slide-in-from-top-2 duration-200">
                    {module.lessons?.map((lesson, lIdx) => (
                        <div
                            key={lesson.id || lIdx}
                            className="flex justify-between items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                                    <Layout className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium text-slate-700 dark:text-slate-200 truncate">
                                        {lesson.title}
                                    </p>
                                    {lesson.description && (
                                        <p className="text-xs text-slate-500 truncate hidden sm:block">
                                            {lesson.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 shrink-0">
                                <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
                                    <Clock className="w-3 h-3" />
                                    {lesson.duration || "15:00"}
                                </span>
                                <PlayCircle className="w-5 h-5 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

// --- Main Component ---

export function EnrollmentSuccessContent({
    course,
}: EnrollmentSuccessContentProps) {
    const router = useRouter()
    const [expandedModules, setExpandedModules] = useState<Record<number, boolean>>(
        {}
    )

    // Optimized Calculations
    const stats = useMemo(() => {
        const totalModules = course.modules?.length || 0
        const totalLessons =
            course.modules?.reduce(
                (acc, mod) => acc + (mod.lessons?.length || 0),
                0
            ) || 0
        const totalExercises =
            course.modules?.reduce((acc, mod) => {
                const lessonEx =
                    mod.lessons?.reduce(
                        (lAcc, less) => lAcc + (less.exercises?.length || 0),
                        0
                    ) || 0
                const modEx = mod.exercises?.length || 0
                return acc + lessonEx + modEx
            }, 0) || 0

        return { totalModules, totalLessons, totalExercises }
    }, [course.modules])

    const handleStartLearning = () => {
        const firstModule = course.modules?.[0]
        const firstLesson = firstModule?.lessons?.[0]

        if (firstLesson) {
            const courseId = course._id || course.id
            const lessonId = firstLesson.id || firstLesson._id
            router.push(`/student/player/${lessonId}?courseId=${courseId}`)
        }
    }

    const toggleModule = (index: number) => {
        setExpandedModules((prev) => ({
            ...prev,
            [index]: !prev[index],
        }))
    }

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = "/course.jpg" // Fallback image
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12 pb-20">
            {/* HERO SECTION */}
            <section className="relative rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xl">
                <div className="absolute inset-0">
                    <Image
                        src={course.imageCover || "/course.jpg"}
                        alt={course.title}
                        fill
                        className="object-cover"
                        onError={handleImageError}
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/95 via-slate-900/80 to-slate-900/40" />
                </div>

                <div className="relative z-10 p-8 md:p-14 flex flex-col md:flex-row gap-10 items-start">
                    <div className="flex flex-col gap-6 text-white max-w-2xl">
                        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                            <div className="size-16 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center backdrop-blur-sm">
                                <CheckCircle2 className="text-green-400 w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-green-400">
                                    Inscription Réussie
                                </p>
                                <h1 className="text-xl font-semibold text-white/90">
                                    Bienvenue dans la formation
                                </h1>
                            </div>
                        </div>

                        <h2 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight text-white">
                            {course.title}
                        </h2>

                        <p className="text-lg text-slate-300 leading-relaxed">
                            Vous avez maintenant un accès complet à toutes les leçons, projets
                            et laboratoires. Commencez dès maintenant et développez des
                            compétences concrètes.
                        </p>

                        <div className="flex flex-wrap gap-4 pt-4">
                            <Button
                                onClick={handleStartLearning}
                                className="bg-blue-600 hover:bg-blue-500 text-white h-14 px-8 rounded-xl text-base font-semibold shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.02]"
                            >
                                Commencer l'apprentissage
                                <PlayCircle className="w-5 h-5 ml-2" />
                            </Button>
                            <Button
                                variant="secondary"
                                className="h-14 px-8 rounded-xl text-base font-semibold bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                                onClick={() =>
                                    document.getElementById("curriculum")?.scrollIntoView({
                                        behavior: "smooth",
                                    })
                                }
                            >
                                Voir le programme
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS GRID */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Layers className="w-6 h-6" />}
                    title="Modules"
                    value={stats.totalModules}
                />
                <StatCard
                    icon={<BookOpen className="w-6 h-6" />}
                    title="Leçons"
                    value={stats.totalLessons}
                />
                <StatCard
                    icon={<Code className="w-6 h-6" />}
                    title="Laboratoires"
                    value={stats.totalExercises}
                />
                <StatCard
                    icon={<Clock className="w-6 h-6" />}
                    title="Durée Totale"
                    value={course.duration || "24h"}
                />
            </section>

            {/* PROGRESS SECTION */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                            Votre Progression
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Suivez votre avancement en temps réel
                        </p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                        0% Complété
                    </span>
                </div>
                <Progress value={0} className="h-3 bg-slate-100 dark:bg-slate-800" />
            </section>

            {/* INSTRUCTOR */}
            <section>
                <InstructorCard course={course} />
            </section>

            {/* CURRICULUM */}
            <section id="curriculum" className="space-y-8">
                <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-6">
                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                        Programme du Cours
                    </h3>
                </div>

                <div className="space-y-4">
                    {course.modules?.map((module, idx) => (
                        <ModuleSection
                            key={module.id || idx}
                            module={module}
                            index={idx}
                            isExpanded={!!expandedModules[idx]}
                            onToggle={() => toggleModule(idx)}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}