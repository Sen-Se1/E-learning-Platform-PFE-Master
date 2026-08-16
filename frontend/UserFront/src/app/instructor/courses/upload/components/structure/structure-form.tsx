import React, { useState } from "react"
import { useLanguage } from "@/context/language-context"
import { Button } from "@/components/ui/button"
import { Layers, Plus, BookOpen, CheckCircle2, GripVertical, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { CourseFormData } from "../../types"

interface StructureFormProps {
    data: CourseFormData
    setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>
}

export const StructureForm = ({ data, setFormData }: StructureFormProps) => {
    const { t } = useLanguage()
    const addModule = () => {
        const id = Math.random().toString(36).substr(2, 9)
        const nextNum = data.modules.length + 1
        const defaultTitle = `${t('instructor_upload.modules')} ${nextNum}: ${t('instructor_upload.new_module_default')}`
        setFormData((p) => ({ ...p, modules: [...p.modules, { id, title: defaultTitle, lessons: [] }] }))
    }

    const removeModule = (id: string) => {
        setFormData((p) => ({ ...p, modules: p.modules.filter((m) => m.id !== id) }))
    }

    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const handleDragStart = (index: number) => {
        setDraggedIndex(index)
    }

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault()
    }

    const handleDrop = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return

        const newModules = [...data.modules]
        const draggedItem = newModules[draggedIndex]
        newModules.splice(draggedIndex, 1)
        newModules.splice(index, 0, draggedItem)

        setFormData((p) => ({ ...p, modules: newModules }))
        setDraggedIndex(null)
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div className="flex flex-col gap-1">
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-500" /> {t('instructor_upload.chapters_pipeline_title')}
                    </h3>
                    <p className="text-[11px] font-bold text-slate-400/80 max-w-md">{t('instructor_upload.chapters_pipeline_desc')}</p>
                </div>
                <Button
                    onClick={addModule}
                    className="rounded-2xl bg-indigo-500 text-white h-11 px-6 font-black text-[10px] uppercase tracking-[0.2em] gap-2 hover:bg-indigo-600 shadow-lg shadow-indigo-500/20 active:scale-95 transition-all"
                >
                    <Plus className="w-4 h-4" /> {t('instructor_upload.append_stage_btn')}
                </Button>
            </div>

            <div className="space-y-4">
                {data.modules.map((m, i) => (
                    <div
                        key={m.id}
                        draggable
                        onDragStart={() => handleDragStart(i)}
                        onDragOver={(e) => handleDragOver(e, i)}
                        onDrop={() => handleDrop(i)}
                        className={cn(
                            "group relative bg-white dark:bg-slate-800/40 backdrop-blur-md border border-slate-200 dark:border-white/5 p-6 rounded-[32px] flex items-center gap-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 hover:border-indigo-500/40 transition-all duration-500",
                            draggedIndex === i ? "opacity-40 scale-95 border-dashed border-indigo-500" : "opacity-100"
                        )}
                    >
                        {/* Focus/Active Indicator Line */}
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-indigo-500 rounded-r-full opacity-0 group-hover:opacity-100 transition-all duration-500 -translate-x-1 group-hover:translate-x-0" />

                        <div className="size-14 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-[14px] font-black text-slate-400 border border-slate-100 dark:border-slate-800 shadow-inner group-hover:scale-110 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-500 group-hover:border-indigo-500/20 transition-all duration-500">
                            {String(i + 1).padStart(2, '0')}
                        </div>

                        <div className="flex-1 flex flex-col gap-1.5">
                            <input
                                value={m.title}
                                onChange={(e) => {
                                    setFormData((p) => ({ ...p, modules: p.modules.map((mod) => mod.id === m.id ? { ...mod, title: e.target.value } : mod) }))
                                }}
                                className="w-full bg-transparent font-black text-slate-800 dark:text-white outline-none text-xl placeholder:text-slate-300 focus:text-indigo-600 dark:focus:text-indigo-400 transition-colors"
                                placeholder={t('instructor_upload.new_module_default')}
                            />
                            <div className="flex items-center gap-5">
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-slate-50 dark:bg-slate-800">
                                        <BookOpen className="w-3 h-3 text-slate-400" />
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        {m.lessons.length} {t('course_details.lessons').toLowerCase()}
                                    </span>
                                </div>
                                <div className="h-1 w-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <div className="flex items-center gap-2">
                                    <div className="p-1 rounded-md bg-emerald-50 dark:bg-emerald-500/10">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                    </div>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        {t('instructor_upload.live_sync_active')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="size-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all cursor-grab active:cursor-grabbing border border-transparent hover:border-indigo-500/20">
                                <GripVertical className="w-5 h-5" />
                            </div>
                            <button
                                onClick={() => removeModule(m.id)}
                                className="size-12 rounded-2xl flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all border border-transparent hover:border-red-500/20"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {data.modules.length === 0 && (
                <div className="text-center py-24 bg-slate-50/50 dark:bg-slate-800/30 rounded-[40px] border border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center gap-4">
                    <div className="size-16 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 shadow-sm">
                        <Layers className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{t('instructor_upload.architecture_empty_desc')}</p>
                </div>
            )}
        </div>
    )
}
