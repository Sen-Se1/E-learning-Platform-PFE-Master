"use client"

import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { CourseFormData, ModuleData, LessonData } from "../../types"
import { Folder, ChevronRight, FileText, Play, Code, File, Plus, Trash2, ClipboardCheck } from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface LessonSidebarProps {
    data: CourseFormData
    activeId: string | null
    setActiveId: (id: string) => void
    onAddLesson: (moduleId: string, type?: string) => void
    onAddModule: () => void
    onRemoveModule: (id: string) => void
    onRemoveLesson: (id: string) => void
    onRemoveExercise: (parentId: string, exerciseId: string) => void
    onSelectExercise?: (lessonId: string, exerciseId: string) => void
}

export const LessonSidebar = ({
    data,
    activeId,
    setActiveId,
    onAddLesson,
    onAddModule,
    onRemoveModule,
    onRemoveLesson,
    onRemoveExercise,
    onSelectExercise
}: LessonSidebarProps) => {
    const { t } = useLanguage()
    const [expandedModules, setExpandedModules] = useState<string[]>(data.modules.map(m => m.id))

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Play className="w-2.5 h-2.5" />
            case 'code': return <Code className="w-2.5 h-2.5" />
            case 'file':
            case 'resource': return <File className="w-2.5 h-2.5" />
            case 'lab': return <Code className="w-2.5 h-2.5" />
            case 'quiz': return <ClipboardCheck className="w-2.5 h-2.5" />
            case 'exercise': return <ClipboardCheck className="w-2.5 h-2.5" />
            default: return <FileText className="w-2.5 h-2.5" />
        }
    }

    return (
        <div className="w-full lg:w-72 flex flex-col shrink-0 border-r-2 border-slate-200 dark:border-white/20 bg-slate-50/50 dark:bg-[#0f172a] p-5">
            <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 dark:text-indigo-400/70 tracking-[0.2em] pl-1">
                    {t('instructor_upload.chapters_pipeline_title')}
                </h3>

                <div className="flex flex-col gap-2">
                    {data.modules.map((module: ModuleData, moduleIndex: number) => {
                        const isExpanded = expandedModules.includes(module.id)
                        return (
                            <div key={module.id} className="space-y-1.5 group/module">
                                <div className="flex items-center gap-2 group">
                                    <button
                                        onClick={() => {
                                            if (!isExpanded) toggleModule(module.id);
                                            setActiveId(module.id);
                                        }}
                                        className={cn(
                                            "flex-1 flex items-center gap-2 px-2 py-2 rounded-2xl border-2 transition-all text-left",
                                            activeId === module.id
                                                ? "bg-indigo-700 border-indigo-500 shadow-xl shadow-indigo-500/30"
                                                : "bg-slate-200/30 dark:bg-card/60 border-slate-300/40 dark:border-white/20 hover:border-indigo-500/50 backdrop-blur-xl"
                                        )}
                                    >
                                        <div className={cn(
                                            "size-7 rounded-xl flex items-center justify-center transition-all",
                                            activeId === module.id ? "bg-white text-indigo-700 shadow-md" : "bg-slate-200 dark:bg-slate-800 text-indigo-500"
                                        )}>
                                            <Folder className="w-3.5 h-3.5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <span className={cn(
                                                "text-[8px] font-black uppercase tracking-widest block leading-none mb-0.5",
                                                activeId === module.id ? "text-indigo-100" : "text-slate-500 dark:text-slate-500"
                                            )}>
                                                {t('instructor_upload.modules')} {moduleIndex + 1}
                                            </span>
                                            <span className={cn(
                                                "text-[10px] font-black uppercase truncate block max-w-[180px]",
                                                activeId === module.id ? "text-white" : "text-slate-800 dark:text-slate-300"
                                            )}>
                                                {module.title || t('instructor_upload.new_module_default')}
                                            </span>
                                        </div>
                                        <ChevronRight onClick={(e) => { e.stopPropagation(); toggleModule(module.id); }} className={cn("w-3.5 h-3.5 text-slate-500 transition-transform duration-300 hover:text-indigo-500", isExpanded && "rotate-90")} />
                                    </button>

                                    <button
                                        onClick={() => onRemoveModule(module.id)}
                                        className="size-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover/module:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                {isExpanded && (
                                    <div className="ml-5 flex flex-col gap-1.5 border-l-2 border-slate-300 dark:border-slate-800 pl-3 animate-in slide-in-from-top-1 duration-300">
                                        {module.lessons.map((lesson: LessonData, lessonIndex: number) => {
                                            const isExercise = lesson.type === 'exercise'
                                            return (
                                                <div key={lesson.id} className={cn("group/lesson flex flex-col gap-1", isExercise && "ml-4 border-l-2 border-emerald-500/20 pl-2")}>
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => setActiveId(lesson.id)}
                                                            className={cn(
                                                                "flex-1 text-left p-2 rounded-xl transition-all duration-300 text-[10px] font-bold flex items-center gap-2 relative overflow-hidden",
                                                                activeId === lesson.id
                                                                    ? (isExercise ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20")
                                                                    : "bg-slate-200/20 dark:bg-white/5 text-slate-700 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-white/10"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "size-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                                activeId === lesson.id
                                                                    ? "bg-white/20 rotate-6"
                                                                    : (isExercise ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200 dark:bg-slate-800")
                                                            )}>
                                                                {getIcon(lesson.type)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="truncate block leading-tight max-w-[150px]">{lesson.title || t('instructor_upload.untitled_lesson_default')}</span>
                                                                <span className={cn(
                                                                    "text-[8px] uppercase tracking-widest block mt-0.5 font-black leading-none",
                                                                    activeId === lesson.id ? "text-white/60" : "text-slate-500"
                                                                )}>
                                                                    {isExercise ? "Activité" : lesson.type} {lesson.duration && !isExercise && `• ${lesson.duration}`}
                                                                </span>
                                                            </div>
                                                        </button>

                                                        <button
                                                            onClick={() => onRemoveLesson(lesson.id)}
                                                            className="size-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover/lesson:opacity-100 transition-all font-black"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>

                                                    {/* Nested Exercises (Sub-content) */}
                                                    {lesson.exercises && lesson.exercises.length > 0 && (
                                                        <div className="flex flex-col gap-1 mt-1">
                                                            {lesson.exercises.map((ex, exIdx) => (
                                                                <div
                                                                    key={ex.id || exIdx}
                                                                    onClick={() => onSelectExercise && onSelectExercise(lesson.id, ex.id)}
                                                                    className={cn(
                                                                        "ml-10 flex items-center py-1.5 border-l-2 pl-3 group/sub-ex gap-2 cursor-pointer transition-all hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded-r-lg",
                                                                        activeId === ex.id
                                                                            ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10"
                                                                            : "border-emerald-500/30"
                                                                    )}
                                                                >
                                                                    <div className="flex-1 min-w-0 flex items-center gap-2">
                                                                        <div className={cn(
                                                                            "size-5 rounded-lg flex items-center justify-center transition-all shrink-0",
                                                                            activeId === ex.id
                                                                                ? "bg-emerald-500 text-white"
                                                                                : "bg-emerald-500/10 text-emerald-500 group-hover/sub-ex:bg-emerald-500 group-hover/sub-ex:text-white"
                                                                        )}>
                                                                            <ClipboardCheck className="w-2.5 h-2.5" />
                                                                        </div>
                                                                        <span className={cn(
                                                                            "text-[9px] font-black uppercase tracking-tight truncate block max-w-[120px]",
                                                                            activeId === ex.id ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                                                                        )}>
                                                                            {ex.title || "Exercice"}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onRemoveExercise(lesson.id, ex.id);
                                                                        }}
                                                                        className="size-6 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 opacity-0 group-hover/sub-ex:opacity-100 transition-all shrink-0"
                                                                    >
                                                                        <Trash2 className="w-2.5 h-2.5" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}

                                        <div className="mt-1 flex gap-1.5">
                                            <button
                                                onClick={() => onAddLesson(module.id, 'video')}
                                                className="flex-1 text-left p-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/20 text-[8px] font-black text-slate-500 dark:text-indigo-400/70 uppercase tracking-tight hover:border-indigo-500/60 hover:text-indigo-600 hover:bg-white dark:hover:bg-[#1e293b] transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <Plus className="w-2.5 h-2.5" /> Leçon
                                            </button>
                                            <button
                                                onClick={() => onAddLesson(module.id, 'exercise')}
                                                className="flex-1 text-left p-2 rounded-xl border-2 border-dashed border-emerald-300 dark:border-emerald-500/20 text-[8px] font-black text-emerald-600 dark:text-emerald-400/70 uppercase tracking-tight hover:border-emerald-500/60 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-[#1e293b] transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <ClipboardCheck className="w-2.5 h-2.5" /> Activité
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}

                    <button
                        onClick={onAddModule}
                        className="w-full py-2 px-3 rounded-xl border-2 border-dashed border-slate-300 dark:border-white/30 text-slate-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest hover:bg-white dark:hover:bg-[#1e293b] hover:border-indigo-500/60 hover:text-indigo-600 transition-all flex items-center justify-center gap-2 mt-2 shadow-sm bg-transparent dark:bg-[#0f172a]/50"
                    >
                        <div className="size-5 rounded-md bg-slate-300 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                            <Plus className="w-3 h-3" />
                        </div>
                        {t('instructor_upload.add_chapter_btn')}
                    </button>
                </div>
            </div>
        </div>
    )
}
