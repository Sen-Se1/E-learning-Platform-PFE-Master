import React from "react"
import { useLanguage } from "@/context/language-context"
import { Upload, Clock, BookOpen, PlayCircle, User, Layers, FileCheck } from "lucide-react"
import { CourseFormData } from "../../types"
import { IMAGE_BASE_URL } from "@/data/courses"

export const CourseCardPreview = ({ data }: { data: CourseFormData }) => {
    const { t } = useLanguage()

    const getImageUrl = (path: string | File) => {
        if (!path) return ""
        if (path instanceof File) return URL.createObjectURL(path)
        if (typeof path !== 'string') return ""
        if (path.startsWith('http') || path.startsWith('data:')) return path
        return `${IMAGE_BASE_URL}/${path}`
    }

    // Real-time Stats Calculation
    let totalSeconds = 0
    let totalLessons = 0
    let totalExercises = 0
    const totalChapters = data.modules.length

    data.modules.forEach(m => {
        // Count independent exercises in module
        if (m.exercises) totalExercises += m.exercises.length

        m.lessons.forEach(l => {
            // Count exercises in lesson
            if (l.exercises) totalExercises += l.exercises.length

            if (l.type === 'exercise') {
                totalExercises++
            } else {
                totalLessons++
                if (l.duration) {
                    const parts = l.duration.split(':').map(Number)
                    if (parts.length === 2) totalSeconds += parts[0] * 60 + parts[1]
                    else if (parts.length === 1) totalSeconds += parts[0] * 60
                }
            }
        })
    })
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`

    return (
        <div className="w-full max-w-[380px] group relative select-none font-sans">
            {/* Main Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-all duration-500 hover:-translate-y-2 hover:shadow-indigo-500/10 flex flex-col h-full">

                {/* Image Section */}
                <div className="relative aspect-[16/10] bg-slate-100 dark:bg-slate-950 overflow-hidden">
                    {data.imageCover ? (
                        <img
                            src={getImageUrl(data.imageCover)}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            alt="Course Preview"
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 dark:text-slate-600 gap-3">
                            <Upload className="w-10 h-10 opacity-50" />
                            <span className="text-[9px] font-black uppercase tracking-widest">{t('instructor_upload.no_cover_image')}</span>
                        </div>
                    )}

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                    {/* Level Badge */}
                    <div className="absolute top-4 left-4 flex gap-2 z-10">
                        <span className="px-3 py-1 rounded-full bg-white/90 dark:bg-black/60 backdrop-blur-md text-[10px] font-black uppercase tracking-widest text-slate-800 dark:text-white shadow-lg border border-white/20">
                            {data.level || "Beginner"}
                        </span>
                    </div>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                        <div className="size-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 text-white shadow-xl cursor-pointer hover:bg-white hover:text-indigo-600 transition-colors">
                            <PlayCircle className="w-8 h-8 fill-current" />
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-5 flex-1 flex flex-col">

                    {/* Header: Category & Date */}
                    <div className="flex items-center justify-between">
                        <span className="text-indigo-500 dark:text-indigo-400 text-[10px] font-black uppercase tracking-widest bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                            {data.category || "Development"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Updated Today
                        </span>
                    </div>

                    {/* Title & Subtitle */}
                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                            {data.title || "Untitled Masterclass Course"}
                        </h3>
                        {data.subtitle && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-medium leading-relaxed">
                                {data.subtitle}
                            </p>
                        )}
                    </div>

                    {/* Tags */}
                    {data.tags && (
                        <div className="flex flex-wrap gap-2">
                            {data.tags.split(',').slice(0, 3).map((tag, i) => (
                                <span key={i} className="text-[9px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                                    <span className="text-indigo-400">#</span>{tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Content Stats Grid */}
                    <div className="grid grid-cols-2 gap-2 pb-2">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <Layers className="w-3.5 h-3.5 text-indigo-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{totalChapters} Chapitres</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{totalLessons} Leçons</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <FileCheck className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{totalExercises} Exercices</span>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                            <Clock className="w-3.5 h-3.5 text-rose-500" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300">{durationString}</span>
                        </div>
                    </div>

                    {/* Footer: Instructor & Price */}
                    <div className="pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-3">
                            <div className="size-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm">
                                <User className="w-4 h-4 text-slate-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Instructor</span>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">You</span>
                            </div>
                        </div>

                        <div className="flex flex-col items-end">
                            {data.price && parseFloat(data.price) > 0 && (
                                <span className="text-[9px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 dark:bg-emerald-500/10 px-1.5 py-0.5 rounded ml-auto mb-1 border border-emerald-100 dark:border-emerald-500/20">
                                    -20% Launch
                                </span>
                            )}
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-black text-slate-900 dark:text-white">${data.price || "0.00"}</span>
                                {data.price && parseFloat(data.price) > 0 && (
                                    <span className="text-xs text-slate-400 line-through font-bold decoration-slate-300 dark:decoration-slate-700">
                                        ${(parseFloat(data.price) * 1.2).toFixed(2)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
