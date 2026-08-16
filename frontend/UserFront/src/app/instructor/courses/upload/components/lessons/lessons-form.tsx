"use client"

import React, { useState } from "react"
import { useLanguage } from "@/context/language-context"
import { CourseFormData, ModuleData, LessonData } from "../../types"
import { LessonSidebar } from "./lesson-sidebar"
import { LessonEditor } from "./lesson-editor"
import { ModuleEditor } from "./module-editor"
import { ExerciseEditor } from "../exercises/exercise-editor"
import { Sparkles } from "lucide-react"
import { deleteExercise } from "@/data/courses"
import { toast } from "sonner"

const isMongoId = (id: string) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

interface LessonsFormProps {
    data: CourseFormData
    setFormData: React.Dispatch<React.SetStateAction<CourseFormData>>
}

export const LessonsForm = ({ data, setFormData }: LessonsFormProps) => {
    const { t } = useLanguage()
    const [activeId, setActiveId] = useState<string | null>(
        data.modules[0]?.id || null
    )

    // Check if activeId is a lesson or a module
    const activeModule = data.modules.find((m: ModuleData) => m.id === activeId)
    const activeLesson = data.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.id === activeId)

    // Check if activeId is an exercise
    const activeExercise = data.modules
        .flatMap((m) => m.lessons)
        .flatMap((l) => l.exercises || [])
        .find((ex) => ex.id === activeId)

    const activeExerciseLesson = data.modules
        .flatMap((m) => m.lessons)
        .find((l) => l.exercises?.some((ex) => ex.id === activeId))

    const handleUpdateLesson = (updatedLesson: LessonData) => {
        setFormData((prev) => ({
            ...prev,
            modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) =>
                    l.id === updatedLesson.id ? { ...l, ...updatedLesson } : l
                )
            }))
        }))
    }

    const handleUpdateModule = (updatedModule: ModuleData) => {
        setFormData((prev) => ({
            ...prev,
            modules: prev.modules.map((m) =>
                m.id === updatedModule.id ? updatedModule : m
            )
        }))
    }

    const handleUpdateExercise = (updatedExercise: any) => {
        setFormData((prev) => ({
            ...prev,
            modules: prev.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) => ({
                    ...l,
                    exercises: l.exercises?.map((ex) =>
                        ex.id === updatedExercise.id ? updatedExercise : ex
                    )
                }))
            }))
        }))
    }

    const handleAddLesson = (moduleId: string, type: string = 'video') => {
        const id = Math.random().toString(36).substr(2, 9)
        const newLesson: LessonData = {
            id,
            title: type === 'exercise' ? 'Nouvel Exercice' : t('instructor_upload.untitled_lesson_default'),
            type,
            duration: type === 'exercise' ? '0' : '15:00'
        }

        setFormData((prev: CourseFormData) => ({
            ...prev,
            modules: prev.modules.map((m: ModuleData) =>
                m.id === moduleId
                    ? { ...m, lessons: [...m.lessons, newLesson] }
                    : m
            )
        }))
        setActiveId(id)
    }

    const handleAddModule = () => {
        const id = Math.random().toString(36).substr(2, 9)
        const nextNum = data.modules.length + 1
        const newModule: ModuleData = {
            id,
            title: `${t('instructor_upload.modules')} ${nextNum}`,
            lessons: []
        }

        setFormData((prev: CourseFormData) => ({
            ...prev,
            modules: [...prev.modules, newModule]
        }))
        setActiveId(id)
    }

    const handleRemoveModule = (moduleId: string) => {
        setFormData((prev: CourseFormData) => ({
            ...prev,
            modules: prev.modules.filter(m => m.id !== moduleId)
        }))
    }

    const handleRemoveLesson = (lessonId: string) => {
        setFormData((prev: CourseFormData) => ({
            ...prev,
            modules: prev.modules.map(m => ({
                ...m,
                lessons: m.lessons.filter(l => l.id !== lessonId)
            }))
        }))
        if (activeId === lessonId) {
            setActiveId(null)
        }
    }

    const handleRemoveExercise = async (lessonId: string, exerciseId: string) => {
        try {
            // Delete from DB if it's already persisted
            if (isMongoId(exerciseId)) {
                await deleteExercise(exerciseId);
                toast.success("Exercice supprimé de la base de données");
            }

            setFormData((prev: CourseFormData) => ({
                ...prev,
                modules: prev.modules.map((m: ModuleData) => ({
                    ...m,
                    lessons: m.lessons.map((l: LessonData) => {
                        if (l.id === lessonId) {
                            return {
                                ...l,
                                exercises: l.exercises?.filter(ex => ex.id !== exerciseId)
                            }
                        }
                        return l
                    })
                }))
            }))
        } catch (error) {
            if (error instanceof Error) {
                toast.error("Échec de la suppression de l'exercice: " + error.message);
            }
        }
    }

    const handleSelectExercise = (lessonId: string, exerciseId: string) => {
        setActiveId(exerciseId)
    }

    return (
        <div className="flex flex-col lg:flex-row gap-0 min-h-[650px] animate-in fade-in duration-700 bg-slate-50/30 dark:bg-transparent">
            <LessonSidebar
                data={data}
                activeId={activeId}
                setActiveId={setActiveId}
                onAddLesson={handleAddLesson}
                onAddModule={handleAddModule}
                onRemoveModule={handleRemoveModule}
                onRemoveLesson={handleRemoveLesson}
                onRemoveExercise={handleRemoveExercise}
                onSelectExercise={handleSelectExercise}
            />

            {activeExercise && activeExerciseLesson ? (
                <ExerciseEditor
                    lesson={activeExerciseLesson}
                    exercise={activeExercise}
                    onChange={handleUpdateExercise}
                    onDelete={() => handleRemoveExercise(activeExerciseLesson.id, activeExercise.id)}
                    t={t}
                />
            ) : activeLesson ? (
                <LessonEditor
                    lesson={activeLesson}
                    onUpdate={handleUpdateLesson}
                />
            ) : activeModule ? (
                <ModuleEditor
                    module={activeModule}
                    onUpdate={handleUpdateModule}
                />
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center bg-slate-200/20 dark:bg-[#0f172a] backdrop-blur-xl rounded-[48px] border-2 border-dashed border-slate-300 dark:border-white/30 p-20 text-center gap-8 relative overflow-hidden group shadow-[inset_0_0_60px_rgba(0,0,0,0.1)]">
                    <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <div className="size-24 bg-indigo-50 dark:bg-indigo-500/10 rounded-[32px] flex items-center justify-center text-indigo-500 shadow-inner group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                        <Sparkles className="w-10 h-10" />
                    </div>
                    <div className="max-w-xs space-y-3 relative">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                            Prêt à <span className="text-indigo-600 dark:text-indigo-400">Éditer</span>
                        </h3>
                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest leading-relaxed italic">
                            Sélectionnez un chapitre ou une leçon dans le pipeline pour commencer la configuration.
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}
