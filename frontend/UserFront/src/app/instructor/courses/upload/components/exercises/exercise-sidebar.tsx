import React, { useState } from "react"
import { cn } from "@/lib/utils"
import { CourseFormData, ModuleData, LessonData } from "../../types"
import { Folder, ChevronRight, FileText, Play, Code, File, ClipboardCheck } from "lucide-react"
import { useLanguage } from "@/context/language-context"

interface ExerciseSidebarProps {
    data: CourseFormData
    activeLessonId: string | null
    setActiveLessonId: (id: string) => void
}

export const ExerciseSidebar = ({ data, activeLessonId, setActiveLessonId }: ExerciseSidebarProps) => {
    const { t } = useLanguage()
    const [expandedModules, setExpandedModules] = useState<string[]>(
        data.modules.map(m => m.id)
    )

    const toggleModule = (id: string) => {
        setExpandedModules(prev =>
            prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
        )
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <Play className="w-2.5 h-2.5" />
            case 'code': return <Code className="w-2.5 h-2.5" />
            case 'file': return <File className="w-2.5 h-2.5" />
            case 'exercise': return <ClipboardCheck className="w-2.5 h-2.5" />
            default: return <FileText className="w-2.5 h-2.5" />
        }
    }

    return (
        <div className="w-full lg:w-72 flex flex-col shrink-0 border-r border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 p-5">
            <div className="flex flex-col gap-4">
                <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] pl-1">
                    {t('instructor_upload.chapters_pipeline_title')}
                </h3>

                <div className="flex flex-col gap-2">
                    {data.modules.map((module: ModuleData, moduleIndex: number) => {
                        const isExpanded = expandedModules.includes(module.id)
                        return (
                            <div key={module.id} className="space-y-1.5 group/module">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className={cn(
                                        "w-full flex items-center gap-2 px-2 py-2 rounded-2xl border transition-all text-left bg-slate-200/30 dark:bg-black/40 border-slate-300/40 dark:border-slate-800/80 hover:border-indigo-500/50 backdrop-blur-xl"
                                    )}
                                >
                                    <div className={cn(
                                        "size-7 rounded-xl flex items-center justify-center transition-all bg-slate-200 dark:bg-slate-800 text-indigo-500"
                                    )}>
                                        <Folder className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-[8px] font-black uppercase tracking-widest block leading-none mb-0.5 text-slate-500 dark:text-slate-500">
                                            {t('instructor_upload.modules')} {moduleIndex + 1}
                                        </span>
                                        <span className="text-[10px] font-black uppercase truncate block text-slate-800 dark:text-slate-300">
                                            {module.title || t('instructor_upload.new_module_default')}
                                        </span>
                                    </div>
                                    <ChevronRight className={cn("w-3.5 h-3.5 text-slate-500 transition-transform duration-300 hover:text-indigo-500", isExpanded && "rotate-90")} />
                                </button>

                                {isExpanded && (
                                    <div className="ml-5 flex flex-col gap-1.5 border-l-2 border-slate-300 dark:border-slate-800 pl-3 animate-in slide-in-from-top-1 duration-300">
                                        {module.lessons.map((lesson: LessonData) => {
                                            const isActive = activeLessonId === lesson.id
                                            const isExercise = lesson.type === 'exercise'

                                            return (
                                                <button
                                                    key={lesson.id}
                                                    onClick={() => setActiveLessonId(lesson.id)}
                                                    className={cn(
                                                        "w-full text-left p-2 rounded-xl transition-all duration-300 text-[10px] font-bold flex items-center gap-2 relative overflow-hidden group/lesson",
                                                        isActive
                                                            ? (isExercise ? "bg-emerald-600 text-white shadow-xl shadow-emerald-500/20" : "bg-indigo-600 text-white shadow-xl shadow-indigo-500/20")
                                                            : "bg-slate-200/20 dark:bg-black/40 text-slate-700 dark:text-slate-400 hover:bg-slate-200/40 dark:hover:bg-slate-800/80"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "size-6 rounded-lg flex items-center justify-center shrink-0 transition-all",
                                                        isActive
                                                            ? "bg-white/20 rotate-6"
                                                            : (isExercise ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-200 dark:bg-slate-800")
                                                    )}>
                                                        {getIcon(lesson.type)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="truncate block leading-tight">{lesson.title || t('instructor_upload.untitled_lesson_default')}</span>
                                                        <span className={cn(
                                                            "text-[8px] uppercase tracking-widest block mt-0.5 font-black leading-none",
                                                            isActive ? "text-white/60" : "text-slate-500"
                                                        )}>
                                                            {isExercise ? "Activité" : lesson.type}
                                                        </span>
                                                    </div>

                                                    {/* Exercise Count Pill */}
                                                    {lesson.exercises && lesson.exercises.length > 0 && (
                                                        <span className={cn(
                                                            "px-1.5 py-0.5 rounded-md text-[8px] font-black",
                                                            isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                                                        )}>
                                                            {lesson.exercises.length}
                                                        </span>
                                                    )}
                                                </button>
                                            )
                                        })}

                                        {module.lessons.length === 0 && (
                                            <div className="p-3 text-center text-[9px] text-slate-400 italic">
                                                No lessons in this module
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
