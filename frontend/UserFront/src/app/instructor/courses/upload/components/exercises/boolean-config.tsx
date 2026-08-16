"use client"

import React from "react"
import { Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface BooleanConfigProps {
    correctAnswer: boolean
    onChange: (updates: Partial<{ correctAnswer: boolean }>) => void
}

export const BooleanConfig = ({ correctAnswer, onChange }: BooleanConfigProps) => {
    return (
        <div className="space-y-6 text-center">
            <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Correct Answer</h4>
                <p className="text-xs text-slate-500">Select the valid statement for this question</p>
            </div>

            <div className="flex justify-center gap-6">
                <button
                    type="button"
                    onClick={() => onChange({ correctAnswer: true })}
                    className={cn(
                        "group relative w-36 h-40 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3",
                        correctAnswer === true
                            ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-emerald-500/50 hover:bg-emerald-50/50"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        correctAnswer === true ? "bg-emerald-500 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                        <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <div className={cn(
                            "text-sm font-bold transition-colors",
                            correctAnswer === true ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500"
                        )}>True</div>
                        <div className="text-[10px] font-medium text-slate-400">Correct Statement</div>
                    </div>
                </button>

                <button
                    type="button"
                    onClick={() => onChange({ correctAnswer: false })}
                    className={cn(
                        "group relative w-36 h-40 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center justify-center gap-3",
                        correctAnswer === false
                            ? "border-red-500 bg-red-50 dark:bg-red-500/10 shadow-lg shadow-red-500/10"
                            : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-red-500/50 hover:bg-red-50/50"
                    )}
                >
                    <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                        correctAnswer === false ? "bg-red-500 text-white shadow-md" : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                    )}>
                        <X className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <div className={cn(
                            "text-sm font-bold transition-colors",
                            correctAnswer === false ? "text-red-700 dark:text-red-400" : "text-slate-500"
                        )}>False</div>
                        <div className="text-[10px] font-medium text-slate-400">Incorrect Statement</div>
                    </div>
                </button>
            </div>
        </div>
    )
}
