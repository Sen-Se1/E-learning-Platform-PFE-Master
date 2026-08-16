import React from "react"
import { HelpCircle, ToggleLeft, Code, LayoutList, ChevronRight, Trophy } from "lucide-react"
import { Exercise } from "../../types"
import { cn } from "@/lib/utils"

interface ExerciseListProps {
    exercises: Exercise[]
}

export const ExerciseList = ({ exercises }: ExerciseListProps) => {
    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            {(!exercises || exercises.length === 0) ? (
                <div className="py-16 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl gap-4 text-center bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-800 flex items-center justify-center text-slate-300 shadow-sm">
                        <LayoutList className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Exercises Yet</h3>
                        <p className="text-xs text-slate-500 max-w-[250px] mx-auto">Create your first exercise to assess student understanding.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-3">
                    {exercises.map((exercise) => (
                        <div
                            key={exercise.id}
                            className="group flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-indigo-500/30 transition-all duration-300 cursor-pointer"
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors",
                                exercise.type === 'coding' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" :
                                    exercise.type === 'quiz' ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" :
                                        "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                            )}>
                                {exercise.type === 'coding' && <Code className="w-6 h-6" />}
                                {exercise.type === 'quiz' && <HelpCircle className="w-6 h-6" />}
                                {exercise.type === 'boolean' && <ToggleLeft className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate pr-4">{exercise.title}</h4>
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                                        <Trophy className="w-3 h-3 text-amber-500" />
                                        {exercise.maxScore} PTS
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wide",
                                        exercise.type === 'coding' ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400" :
                                            exercise.type === 'quiz' ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" :
                                                "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                                    )}>
                                        {exercise.type === 'boolean' ? 'True / False' : exercise.type}
                                    </span>
                                </div>
                            </div>

                            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
