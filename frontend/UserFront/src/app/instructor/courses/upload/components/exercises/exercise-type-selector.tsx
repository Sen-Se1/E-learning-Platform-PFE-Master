"use client"

import React from "react"
import { Code, HelpCircle, ToggleLeft, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ExerciseTypeSelectorProps {
    selectedType: 'coding' | 'quiz' | 'boolean'
    onChange: (type: 'coding' | 'quiz' | 'boolean') => void
}

export const ExerciseTypeSelector = ({ selectedType, onChange }: ExerciseTypeSelectorProps) => {
    const types = [
        {
            id: 'coding',
            title: 'Coding Challenge',
            desc: 'Défis de code auto-évalués',
            icon: Code,
            color: 'text-indigo-500',
            bg: 'bg-indigo-500/10',
            border: 'hover:border-indigo-500/20',
            active: 'border-indigo-500 ring-indigo-500/10'
        },
        {
            id: 'quiz',
            title: 'Multiple Choice',
            desc: 'QCM à choix unique ou multiple',
            icon: HelpCircle,
            color: 'text-amber-500',
            bg: 'bg-amber-500/10',
            border: 'hover:border-amber-500/20',
            active: 'border-amber-500 ring-amber-500/10'
        },
        {
            id: 'boolean',
            title: 'True / False',
            desc: 'Questions binaires (Vrai/Faux)',
            icon: ToggleLeft,
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/10',
            border: 'hover:border-emerald-500/20',
            active: 'border-emerald-500 ring-emerald-500/10'
        }
    ]

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Assessment Type</h4>
                    <p className="text-xs text-slate-500">Choose how the student will be evaluated</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {types.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => onChange(t.id as 'coding' | 'quiz' | 'boolean')}
                        className={cn(
                            "relative flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left gap-3 group overflow-hidden",
                            selectedType === t.id
                                ? cn(t.active, "bg-white dark:bg-slate-900 shadow-lg ring-2 ring-offset-2 dark:ring-offset-slate-900")
                                : cn("border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900", t.border, "hover:bg-slate-50 dark:hover:bg-slate-800/50")
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300",
                            selectedType === t.id ? cn(t.bg, t.color) : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-700"
                        )}>
                            <t.icon className="w-5 h-5" />
                        </div>

                        <div className="space-y-1 relative z-10">
                            <div className={cn(
                                "text-xs font-bold transition-colors",
                                selectedType === t.id ? "text-slate-900 dark:text-white" : "text-slate-500"
                            )}>
                                {t.title}
                            </div>
                            <div className="text-[10px] font-medium text-slate-400 leading-tight">
                                {t.desc}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    )
}
