"use client"

import React from "react"
import { Badge } from "@/components/ui/badge"
import { Course, Lesson } from "@/data/courses"
import {
    Play,
    CheckCircle2,
    Lock,
    Clock,
    BookOpen,
    PlayCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CurriculumOverviewProps {
    course: Course;
    onSelectLesson: (lessonId: string) => void;
    completedItems: string[];
}

export function CurriculumOverview({ course, onSelectLesson, completedItems }: CurriculumOverviewProps) {
    return (
        <div className="max-w-5xl mx-auto py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="mb-12 text-center">
                <Badge variant="outline" className="mb-4 border-blue-200 text-blue-600 dark:border-blue-900 dark:text-blue-400 font-bold px-4 py-1">
                    {course.category}
                </Badge>
                <h1 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                    {course.title}
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    {course.description}
                </p>

                <div className="flex items-center justify-center gap-8 mt-10">
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{course.modules.length}</span>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Modules</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">
                            {course.modules.reduce((acc, m) => acc + m.lessons.length, 0)}
                        </span>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Lessons</span>
                    </div>
                    <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-black text-slate-900 dark:text-white">{course.duration}</span>
                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Duration</span>
                    </div>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="space-y-6">
                {course.modules.map((module, i) => (
                    <div
                        key={module.id || i}
                        className="bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900/50 transition-all duration-500 group"
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <span className="size-8 rounded-xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-lg shadow-blue-500/20">
                                            {i + 1}
                                        </span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                            {module.title}
                                        </h3>
                                    </div>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm pl-11 max-w-2xl">
                                        {module.description}
                                    </p>
                                </div>
                                <Badge variant="secondary" className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 font-bold">
                                    {module.lessons.length} Sessions
                                </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-11">
                                {module.lessons.map((lesson, j) => (
                                    <button
                                        key={lesson.id || j}
                                        onClick={() => onSelectLesson(lesson.id || lesson._id || "")}
                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 dark:bg-slate-800/20 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 hover:bg-white dark:hover:bg-slate-800 transition-all text-left group/lesson"
                                    >
                                        <div className={cn(
                                            "size-10 rounded-xl flex items-center justify-center shadow-sm transition-colors",
                                            completedItems.includes(lesson.id || lesson._id || "")
                                                ? "bg-emerald-500 text-white"
                                                : "bg-white dark:bg-slate-900 group-hover/lesson:bg-blue-600 group-hover/lesson:text-white"
                                        )}>
                                            {completedItems.includes(lesson.id || lesson._id || "") ? (
                                                <CheckCircle2 className="size-5" />
                                            ) : lesson.type === 'video' ? (
                                                <PlayCircle className="size-5" />
                                            ) : (
                                                <BookOpen className="size-5" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate group-hover/lesson:text-blue-600 dark:group-hover/lesson:text-blue-400 transition-colors">
                                                {lesson.title}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                                                    {lesson.type}
                                                </span>
                                                <span className="text-slate-200 dark:text-slate-800 h-1 w-1 rounded-full bg-current" />
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {lesson.duration || "10:00"}
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 text-center">
                <p className="text-slate-400 dark:text-slate-600 text-sm font-medium">
                    Select any lesson above to start your learning journey.
                </p>
            </div>
        </div>
    )
}
