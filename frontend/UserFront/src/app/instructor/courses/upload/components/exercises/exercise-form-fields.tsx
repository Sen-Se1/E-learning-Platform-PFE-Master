"use client"

import React, { ChangeEvent } from "react"
import { Input } from "@/components/ui/input"

interface ExerciseFormFieldsProps {
    title: string
    instructions: string
    maxScore: number
    timeLimit?: number
    onChange: (updates: Partial<ExerciseFormFieldsProps>) => void
    t: (key: string) => string
}

export const ExerciseFormFields = ({ title, instructions, maxScore, timeLimit, onChange, t }: ExerciseFormFieldsProps) => {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 ml-1">Exercise Title <span className="text-red-500">*</span></label>
                <Input
                    value={title}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ title: e.target.value })}
                    className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-4 font-semibold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    placeholder="e.g. Dockerfile Optimization Task"
                />
            </div>

            <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-500 ml-1">Instructions <span className="text-red-500">*</span></label>
                <textarea
                    value={instructions}
                    onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ instructions: e.target.value })}
                    className="w-full min-h-[120px] rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-4 text-sm font-medium outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all font-sans resize-y shadow-sm"
                    placeholder="Describe the task for the student..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Maximum Score</label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={maxScore}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ maxScore: parseInt(e.target.value) || 0 })}
                            className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-4 pr-12 font-semibold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">pts</span>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-500 ml-1">Time Limit</label>
                    <div className="relative">
                        <Input
                            type="number"
                            value={timeLimit || ""}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => onChange({ timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                            className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 px-4 pr-12 font-semibold text-sm focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                            placeholder="No limit"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">min</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
