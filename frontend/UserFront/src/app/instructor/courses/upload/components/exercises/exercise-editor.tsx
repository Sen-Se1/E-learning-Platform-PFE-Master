"use client"

import React, { useState } from "react"
import { ClipboardList, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Exercise, LessonData } from "../../types"
import { ExerciseTypeSelector } from "./exercise-type-selector"
import { ExerciseFormFields } from "./exercise-form-fields"
import { CodingConfig } from "./coding-config"
import { QuizConfig } from "./quiz-config"
import { BooleanConfig } from "./boolean-config"


interface ExerciseEditorProps {
    lesson: LessonData
    exercise: Exercise
    onChange: (exercise: Exercise) => void
    onDelete?: () => void
    t: (key: string) => string
}

export const ExerciseEditor = ({ lesson, exercise, onChange, onDelete, t }: ExerciseEditorProps) => {

    const updateExercise = (updates: Partial<Exercise>) => {
        onChange({ ...exercise, ...updates })
    }

    const handleReset = () => {
        onChange({
            id: exercise.id,
            type: 'coding',
            title: "",
            instructions: "",
            maxScore: 100,
            language: "BASH / SHELL",
            initialCode: "",
            solution: "",
            assertions: "",
            options: [],
            correctAnswer: true
        })
    }

    return (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-right-4 duration-700 p-8 pb-10">
            <div className="relative bg-white/60 dark:bg-[#0f172a] backdrop-blur-2xl rounded-[32px] border-2 border-slate-300 dark:border-white/20 p-4 lg:p-6 shadow-2xl overflow-hidden group">
                <div className="absolute -top-24 -right-24 size-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 size-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />

                <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-300/50 dark:border-white/5 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-lg">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                    {exercise.title || "New Exercise"} <span className="text-emerald-500">Config</span>
                                </h1>
                                <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">
                                    {lesson.title}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2"></div>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-5">

                        {/* Section 1: Type Selection */}
                        <div className="space-y-4" id="exercise-type-section">
                            <ExerciseTypeSelector
                                selectedType={exercise.type}
                                onChange={(type: 'coding' | 'quiz' | 'boolean') => updateExercise({ type })}
                            />
                        </div>

                        <div className="w-full h-px bg-slate-300/50 dark:bg-white/5" />

                        {/* Section 2: Basic Details */}
                        <div className="space-y-4" id="exercise-basic-details">
                            <ExerciseFormFields
                                title={exercise.title}
                                instructions={exercise.instructions}
                                maxScore={exercise.maxScore}
                                timeLimit={exercise.timeLimit}
                                onChange={updateExercise}
                                t={t}
                            />
                        </div>

                        <div className="w-full h-px bg-slate-300/50 dark:bg-white/5" />

                        {/* Section 3: Configuration */}
                        <div className="bg-white/40 dark:bg-white/5 rounded-[24px] border border-slate-200 dark:border-white/10 p-4 shadow-sm" id="exercise-config-section">
                            {exercise.type === 'coding' && (
                                <CodingConfig
                                    language={exercise.language || ""}
                                    initialCode={exercise.initialCode || ""}
                                    solution={exercise.solution || ""}
                                    assertions={exercise.assertions || ""}
                                    onChange={updateExercise}
                                />
                            )}

                            {exercise.type === 'quiz' && (
                                <QuizConfig
                                    options={exercise.options || []}
                                    onChange={updateExercise}
                                />
                            )}

                            {exercise.type === 'boolean' && (
                                <BooleanConfig
                                    correctAnswer={exercise.correctAnswer ?? true}
                                    onChange={(updates: Partial<Exercise>) => updateExercise(updates)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-300/50 dark:border-white/5">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                onClick={handleReset}
                                className="h-10 px-6 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-all"
                            >
                                Reset Fields
                            </Button>
                            {onDelete && (
                                <Button
                                    variant="ghost"
                                    onClick={onDelete}
                                    className="h-10 px-4 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                                Auto-sauvegarde active
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
