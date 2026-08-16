import React, { useState } from "react"
import { useLanguage } from "@/context/language-context"
import { ClipboardList } from "lucide-react"
import { CourseFormData, Exercise, ModuleData, LessonData } from "../types"
import { ExerciseSidebar } from "./exercises/exercise-sidebar"
import { ExerciseEditor } from "./exercises/exercise-editor"

interface ExerciseFormProps {
    data: CourseFormData
    setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>
}

export const ExerciseForm = ({ data, setFormData }: ExerciseFormProps) => {
    const { t } = useLanguage()
    const [activeLessonId, setActiveLessonId] = useState<string | null>(
        data.modules[0]?.lessons[0]?.id || null
    )

    const activeLesson = data.modules
        .flatMap((m: ModuleData) => m.lessons)
        .find((l: LessonData) => l.id === activeLessonId)

    const handleUpdateExercise = (updatedExercise: Exercise) => {
        if (!activeLessonId) return

        setFormData((prev: CourseFormData) => ({
            ...prev,
            modules: prev.modules.map((m: ModuleData) => ({
                ...m,
                lessons: m.lessons.map((l: LessonData) => {
                    if (l.id !== activeLessonId) return l;

                    const existingExercises = l.exercises || [];
                    const exerciseIndex = existingExercises.findIndex(e => e.id === updatedExercise.id);

                    let newExercises;
                    if (exerciseIndex > -1) {
                        newExercises = [...existingExercises];
                        newExercises[exerciseIndex] = updatedExercise;
                    } else {
                        newExercises = [...existingExercises, updatedExercise];
                    }

                    return { ...l, exercises: newExercises };
                })
            }))
        }))
    }

    const activeExercise = activeLesson?.exercises?.[0] || {
        id: Math.random().toString(36).substr(2, 9),
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
    }

    return (
        <div className="flex flex-col lg:flex-row gap-0 min-h-[650px] animate-in fade-in duration-700 bg-slate-50/30 dark:bg-transparent pb-10">
            <ExerciseSidebar
                data={data}
                activeLessonId={activeLessonId}
                setActiveLessonId={setActiveLessonId}
            />

            {activeLesson ? (
                <div className="flex-1 p-5">
                    <ExerciseEditor
                        lesson={activeLesson}
                        exercise={activeExercise}
                        onChange={handleUpdateExercise}
                        t={t}
                    />
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-200/20 dark:bg-black/80 backdrop-blur-xl rounded-[48px] border-2 border-dashed border-slate-300 dark:border-slate-800/40 p-20 text-center gap-8 relative overflow-hidden group shadow-[inset_0_0_60px_rgba(0,0,0,0.1)] m-8">
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="size-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <ClipboardList className="w-10 h-10" />
                    </div>
                    <div className="max-w-xs space-y-3 relative">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Prêt à <span className="text-indigo-600 dark:text-indigo-400">Configurer</span>
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-relaxed italic">
                            Sélectionnez une leçon dans la liste pour gérer ses exercices et ses quiz.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
