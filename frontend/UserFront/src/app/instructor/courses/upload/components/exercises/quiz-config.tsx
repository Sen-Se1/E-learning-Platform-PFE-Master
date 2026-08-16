"use client"

import React from "react"
import { Plus, Trash2, CheckCircle2, Circle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface QuizConfigProps {
    options: { id: string; text: string; isCorrect: boolean }[]
    onChange: (updates: Partial<{ options: { id: string; text: string; isCorrect: boolean }[] }>) => void
}

export const QuizConfig = ({ options = [], onChange }: QuizConfigProps) => {
    const addOption = () => {
        const newOption = {
            id: Math.random().toString(36).substr(2, 9),
            text: "",
            isCorrect: false
        }
        onChange({ options: [...options, newOption] })
    }

    const removeOption = (id: string) => {
        onChange({ options: options.filter(o => o.id !== id) })
    }

    const updateOption = (id: string, text: string) => {
        onChange({
            options: options.map(o => o.id === id ? { ...o, text } : o)
        })
    }

    const toggleCorrect = (id: string) => {
        onChange({
            options: options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)
        })
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Multiple Choice Setup</h4>
                    <p className="text-xs text-slate-500">Add options and mark the correct answer(s)</p>
                </div>
                <Button
                    variant="outline"
                    onClick={addOption}
                    className="h-9 px-4 rounded-xl text-xs font-semibold border-dashed border-2 hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                >
                    <Plus className="w-3.5 h-3.5 mr-2" /> Add Option
                </Button>
            </div>

            <div className="space-y-3">
                {options.map((option, index) => (
                    <div
                        key={option.id}
                        className={cn(
                            "group flex items-center gap-3 p-2 pl-3 rounded-xl border transition-all",
                            option.isCorrect
                                ? "border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/10"
                        )}
                    >
                        <div className="flex items-center justify-center w-6 text-[10px] font-bold text-slate-400">
                            {String(index + 1).padStart(2, '0')}
                        </div>

                        <button
                            onClick={() => toggleCorrect(option.id)}
                            className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0",
                                option.isCorrect
                                    ? "bg-emerald-500 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-300 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/20"
                            )}
                            title="Mark as correct"
                        >
                            {option.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        </button>

                        <Input
                            value={option.text}
                            onChange={(e) => updateOption(option.id, e.target.value)}
                            placeholder={`Option ${index + 1} text...`}
                            className="flex-1 bg-transparent border-none focus-visible:ring-0 font-medium text-sm h-10 px-2"
                        />

                        <button
                            onClick={() => removeOption(option.id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                            title="Remove option"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}

                {options.length === 0 && (
                    <div className="py-10 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl gap-2 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400">
                        <Plus className="w-6 h-6 opacity-50" />
                        <p className="text-xs font-semibold">No options added yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
