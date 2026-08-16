"use client"

import React, { useMemo, useCallback, memo } from "react"
import { useRouter } from "next/navigation"
import {
    PlayCircle, FileText, FlaskConical, HelpCircle,
    ChevronDown, Code2, CheckSquare
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Module, Lesson, Exercise } from '@/data/courses'

interface ModuleAccordionProps {
    module: Module
    index: number
    isExpanded: boolean
    onToggle: (moduleId: string, index: number) => void
    courseId: string
    lessons: Lesson[]
}

interface LessonItemProps {
    lesson: Lesson
    courseId: string
}

interface ExerciseItemProps {
    exercise: Exercise
}

/**
 * Item d'exercice avec badge de type
 */
export const ExerciseItem = memo(function ExerciseItem({ exercise }: ExerciseItemProps) {
    const Icon = exercise.type === 'coding' ? Code2 : CheckSquare

    return (
        <div className="flex items-center gap-3 p-2 rounded-lg border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group/ex cursor-pointer">
            <div className="text-indigo-400 dark:text-indigo-500 group-hover/ex:scale-110 transition-transform shrink-0">
                <Icon className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 group-hover/ex:text-indigo-600 dark:group-hover/ex:text-indigo-400 transition-colors flex-1 line-clamp-1">
                {exercise.title}
            </span>
            <Badge variant="outline" className="h-4 px-1.5 text-[8px] uppercase font-black border-indigo-100 text-indigo-400 bg-white dark:bg-slate-900 shrink-0">
                {exercise.type}
            </Badge>
        </div>
    )
})

/**
 * Item de leçon avec icône dynamique et navigation
 */
export const LessonItem = memo(function LessonItem({ lesson, courseId }: LessonItemProps) {
    const router = useRouter()
    const lessonId = lesson.id || lesson._id

    const handleClick = useCallback(() => {
        if (lessonId) {
            router.push(`/student/player/${lessonId}?courseId=${courseId}`)
        }
    }, [lessonId, courseId, router])

    const LessonIcon = useMemo(() => {
        switch (lesson.type) {
            case 'video': return PlayCircle
            case 'resource': return FileText
            case 'lab': return FlaskConical
            case 'quiz': return HelpCircle
            default: return FileText
        }
    }, [lesson.type])

    return (
        <>
            <button
                onClick={handleClick}
                className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer group/lesson transition-colors text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-label={`Lire la leçon: ${lesson.title}`}
            >
                <div className="text-slate-300 group-hover/lesson:text-blue-500 transition-colors shrink-0">
                    <LessonIcon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-400 line-clamp-1 block">
                        {lesson.title}
                    </span>
                    {lesson.description && (
                        <span className="text-[10px] text-slate-400 line-clamp-1 hidden sm:block">
                            {lesson.description}
                        </span>
                    )}
                </div>
                <span className="text-[10px] text-slate-400 font-medium tabular-nums bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded shrink-0">
                    {lesson.duration || "15:00"}
                </span>
                <PlayCircle className="w-4 h-4 text-blue-600 opacity-0 group-hover/lesson:opacity-100 transition-opacity shrink-0" />
            </button>

            {/* Exercices imbriqués */}
            {(lesson.exercises?.length ?? 0) > 0 && (
                <div className="pl-7 pr-2 py-1 space-y-1">
                    {lesson.exercises?.map((exercise, exIdx) => (
                        <ExerciseItem key={exercise.id || exIdx} exercise={exercise} />
                    ))}
                </div>
            )}
        </>
    )
})

/**
 * Module accordéon avec liste de leçons collapsible
 */
export const ModuleAccordion = memo(function ModuleAccordion({
    module,
    index,
    isExpanded,
    onToggle,
    courseId,
    lessons,
}: ModuleAccordionProps) {
    const uniqueId = `${module.id}-${index}`
    const lessonCount = lessons?.length || 0
    const exerciseCount = (module.exercises?.length || 0) +
        (lessons?.reduce((acc, l) => acc + (l.exercises?.length || 0), 0) || 0)

    return (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden group transition-all hover:shadow-md">
            <button
                onClick={() => onToggle(module.id, index)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                aria-expanded={isExpanded}
                aria-controls={`module-content-${uniqueId}`}
            >
                <div className="flex items-center gap-3.5">
                    <div className="size-6 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 flex items-center justify-center text-[10px] font-black shrink-0">
                        {index + 1}
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {module.title}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {lessonCount} leçon{lessonCount > 1 ? 's' : ''} • {exerciseCount} exercice{exerciseCount > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
                <ChevronDown
                    className={cn(
                        "w-4 h-4 text-slate-400 transition-transform duration-200",
                        isExpanded && "rotate-180"
                    )}
                />
            </button>

            {/* Contenu collapsible */}
            <div
                id={`module-content-${uniqueId}`}
                role="region"
                className={cn(
                    "grid transition-all duration-200 ease-in-out overflow-hidden",
                    isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                )}
            >
                <div className="min-h-0">
                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                        <div className="p-2 space-y-1">
                            {lessons?.map((lesson, lessonIdx) => (
                                <LessonItem
                                    key={lesson.id || lessonIdx}
                                    lesson={lesson}
                                    courseId={courseId}
                                />
                            ))}
                        </div>

                        {/* Exercices au niveau du module */}
                        {(module.exercises?.length ?? 0) > 0 && (
                            <div className="p-2 pt-0 space-y-1 border-t border-slate-100 dark:border-slate-800">
                                <div className="px-2 py-1.5 flex items-center gap-2">
                                    <div className="w-1.5 h-3 bg-indigo-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        Exercices du module
                                    </span>
                                </div>
                                {module.exercises?.map((exercise, modExIdx) => (
                                    <ExerciseItem key={exercise.id || modExIdx} exercise={exercise} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
})
