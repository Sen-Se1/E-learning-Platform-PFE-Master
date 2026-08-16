"use client"

import React, { useState, useEffect } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { Course, Lesson } from "@/data/courses"
import { cn } from "@/lib/utils"
import {
    Play,
    CheckCircle2,
    Lock,
    ChevronDown,
    ChevronUp,
    ArrowRight,
    Trophy
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { Badge } from "@/components/ui/badge"

interface PlayerSidebarProps {
    course: Course;
    lessonId: string;
    allLessons: Lesson[];
    handleNextLesson: () => void;
    completedItems: string[];
    totalItemsCount: number;
    isNextDisabled: boolean;
    isLessonLocked: (index: number) => boolean;
}

export function PlayerSidebar({
    course,
    lessonId,
    allLessons,
    handleNextLesson,
    completedItems,
    totalItemsCount,
    isNextDisabled,
    isLessonLocked
}: PlayerSidebarProps) {
    const router = useRouter();
    const [expandedModules, setExpandedModules] = useState<string[]>(
        course.modules.map((m, i) => i === 0 ? (m.id || "0") : "").filter(Boolean)
    );

    useEffect(() => {
        const currentModuleIndex = course.modules.findIndex(m =>
            m.lessons.some(l => String(l.id) === String(lessonId) || String(l._id) === String(lessonId))
        );
        if (currentModuleIndex !== -1) {
            const mId = course.modules[currentModuleIndex].id || currentModuleIndex.toString();
            setExpandedModules(prev => prev.includes(mId) ? prev : [...prev, mId]);

            // Auto-scroll to current lesson
            setTimeout(() => {
                const element = document.getElementById('current-lesson-item');
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 500);
        }
    }, [lessonId, course.modules]);

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        );
    };

    // Granular logic for counting every video and exercise separately
    const getCompletedCount = () => {
        const completedVideos = allLessons.filter(l =>
            (l.id && completedItems.includes(l.id)) || (l._id && completedItems.includes(l._id))
        ).length;

        const allExercises = course.modules.flatMap(m => [
            ...(m.lessons.flatMap(l => l.exercises || [])),
            ...(m.exercises || [])
        ]);

        const completedExercises = allExercises.filter(ex =>
            (ex.id && completedItems.includes(ex.id)) || (ex._id && completedItems.includes(ex._id))
        ).length;

        return completedVideos + completedExercises;
    };

    const completedCount = getCompletedCount();
    const progressPercent = totalItemsCount > 0
        ? Math.round((completedCount / totalItemsCount) * 100)
        : 0;

    return (
        <aside className="w-full lg:w-[380px] bg-white dark:bg-[#0f172a] flex flex-col h-full relative lg:border-l border-slate-200 dark:border-slate-800">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Course Curriculum</h3>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-0.5">
                            {completedCount} / {totalItemsCount} items completed
                        </span>
                    </div>
                    <Badge className="bg-blue-600/10 text-blue-600 dark:text-blue-400 border-none text-[10px] font-black">
                        {progressPercent}%
                    </Badge>
                </div>
                <Progress value={progressPercent} className="h-1.5 bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="flex-1 min-h-0 relative">
                <ScrollArea className="h-full">
                    <div className="flex flex-col">
                        {course.modules.map((m, i) => {
                            const mId = m.id || i.toString();
                            const isExpanded = expandedModules.includes(mId);
                            const containsCurrent = m.lessons.some(l =>
                                String(l.id) === String(lessonId) ||
                                String(l._id) === String(lessonId)
                            );

                            return (
                                <div key={mId} className="border-b border-slate-50 dark:border-slate-800/30 last:border-0">
                                    <button
                                        onClick={() => toggleModule(mId)}
                                        className={cn(
                                            "w-full px-5 py-4 flex items-center justify-between transition-colors text-left group",
                                            isExpanded || containsCurrent ? "bg-slate-50/50 dark:bg-slate-800/20" : "hover:bg-slate-50/30 dark:hover:bg-slate-800/10"
                                        )}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-2">
                                                <span className={cn(
                                                    "text-[10px] font-bold uppercase tracking-tight",
                                                    containsCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
                                                )}>
                                                    Module {i + 1}
                                                </span>
                                            </div>
                                            <span className={cn(
                                                "text-[13px] font-black leading-tight truncate block max-w-[280px]",
                                                containsCurrent ? "text-slate-900 dark:text-white" : "text-slate-800 dark:text-slate-200"
                                            )}>{m.title}</span>
                                        </div>
                                        <div className={cn("transition-transform duration-300", isExpanded && "rotate-180")}>
                                            <ChevronDown className="w-4 h-4 text-slate-400" />
                                        </div>
                                    </button>

                                    {isExpanded && (
                                        <div className="bg-white dark:bg-[#0f172a]">
                                            {m.description && (
                                                <div className="px-5 py-3 border-b border-slate-50 dark:border-slate-800/20 bg-slate-50/20 dark:bg-slate-800/5">
                                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 italic">
                                                        {m.description}
                                                    </p>
                                                </div>
                                            )}
                                            {/* Lesson List */}
                                            {m.lessons.map((l, j) => {
                                                // Fix: Ensure we check both id and _id for current and completed status
                                                // Robust ID comparison
                                                const currentIdStr = String(lessonId);
                                                const isCurrent = (String(l.id) === currentIdStr || String(l._id) === currentIdStr);

                                                // Check for exercises in this lesson
                                                const lessonExercises = l.exercises || [];
                                                const completedExercisesInLesson = lessonExercises.filter(ex =>
                                                    (ex.id && completedItems.includes(ex.id)) || (ex._id && completedItems.includes(ex._id))
                                                );
                                                const hasExercises = lessonExercises.length > 0;
                                                const allExercisesDone = !hasExercises || (completedExercisesInLesson.length === lessonExercises.length);

                                                // A lesson is truly completed only if both video and all exercises are done
                                                const videoDone = !!((l.id && completedItems.includes(l.id)) || (l._id && completedItems.includes(l._id)));
                                                const isCompleted = videoDone && allExercisesDone;

                                                // Find global index in allLessons
                                                const globalIndex = allLessons.findIndex(al => (al.id || al._id) === (l.id || l._id));
                                                const isLocked = isLessonLocked(globalIndex);

                                                return (
                                                    <div
                                                        key={l.id || j}
                                                        id={isCurrent ? "current-lesson-item" : undefined}
                                                        onClick={() => !isLocked && router.push(`/student/player/${l.id || l._id}?courseId=${course._id || course.id}`)}
                                                        className={cn(
                                                            "px-5 py-3.5 flex items-start gap-4 transition-all border-l-[3px] relative",
                                                            isLocked ? "cursor-not-allowed opacity-50 grayscale" : "cursor-pointer",
                                                            isCurrent
                                                                ? "bg-blue-600/10 dark:bg-blue-600/20 border-blue-600 shadow-md z-10"
                                                                : "border-transparent",
                                                            !isLocked && !isCurrent && "hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
                                                        )}
                                                    >
                                                        <div className="shrink-0 mt-0.5">
                                                            {isCompleted ? (
                                                                <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                            ) : isCurrent ? (
                                                                <div className="size-5 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/40 animate-pulse">
                                                                    <Play className="w-2 h-2 fill-current ml-0.5" />
                                                                </div>
                                                            ) : isLocked ? (
                                                                <Lock className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700" />
                                                            ) : (
                                                                <div className="size-4 rounded-full border-2 border-slate-200 dark:border-slate-800" />
                                                            )}
                                                        </div>

                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-0.5">
                                                                <p className={cn(
                                                                    "text-[13px] font-bold leading-tight truncate block max-w-[220px]",
                                                                    isCurrent ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400",
                                                                    isLocked && "text-slate-400 dark:text-slate-700"
                                                                )}>
                                                                    {l.title}
                                                                </p>
                                                                {isCurrent && (
                                                                    <Badge className="h-4 px-2 text-[9px] font-black bg-blue-600 text-white border-none uppercase tracking-tighter shrink-0 shadow-lg shadow-blue-500/40">
                                                                        Current
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-tighter">
                                                                    {l.type === 'video' ? 'Video' : 'Technical Lab'}
                                                                </span>
                                                                <span className="text-slate-200 dark:text-slate-800">•</span>
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold tabular-nums">
                                                                    {l.duration || '12:45'}
                                                                </span>
                                                                {hasExercises && (
                                                                    <>
                                                                        <span className="text-slate-200 dark:text-slate-800">•</span>
                                                                        <span className={cn(
                                                                            "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                                                            allExercisesDone
                                                                                ? "bg-emerald-500/10 text-emerald-600"
                                                                                : "bg-amber-500/10 text-amber-600"
                                                                        )}>
                                                                            {completedExercisesInLesson.length}/{lessonExercises.length} Quiz
                                                                        </span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {/* Module-level Exercises */}
                                            {m.exercises && m.exercises.map((ex, k) => {
                                                const exId = ex.id || ex._id;
                                                const isExCompleted = completedItems.includes(exId || "");
                                                return (
                                                    <div
                                                        key={`mod-ex-${exId || k}`}
                                                        className="px-5 py-3 flex items-start gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/30 border-l-[3px] border-transparent"
                                                    >
                                                        <div className="shrink-0 mt-0.5">
                                                            {isExCompleted ? (
                                                                <div className="size-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                                                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                                                                </div>
                                                            ) : (
                                                                <div className="size-4 rounded-full border-2 border-indigo-200 dark:border-indigo-900" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-bold text-slate-600 dark:text-slate-400 leading-tight">
                                                                {ex.title}
                                                            </p>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter bg-indigo-500/10 text-indigo-600">
                                                                    {ex.type} Challenge
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </ScrollArea>
            </div>

            <div className="p-5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                <Button
                    onClick={() => {
                        if (isNextDisabled) return;
                        if (progressPercent === 100) {
                            router.push("/student/dashboard");
                        } else {
                            handleNextLesson();
                        }
                    }}
                    disabled={isNextDisabled}
                    className={cn(
                        "w-full rounded-xl h-12 font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 transition-all",
                        isNextDisabled
                            ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                            : progressPercent === 100
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-slate-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white shadow-xl shadow-slate-200 dark:shadow-none active:scale-95"
                    )}
                >
                    {isNextDisabled
                        ? "Finish Required Items"
                        : progressPercent === 100
                            ? "Course Finished"
                            : "Next Session"}
                    {progressPercent === 100 ? <Trophy className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </Button>
            </div>
        </aside>
    )
}
