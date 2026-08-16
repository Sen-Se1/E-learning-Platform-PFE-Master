"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store"
import { useLanguage } from "@/context/language-context"
import { toast } from "sonner"
import {
    Check,
    BookOpen,
    Eye,
    ChevronRight,
    ChevronLeft,
    CheckCircle2,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"

// --- Components ---
import { StepIndicator } from "./components/step-indicator"
import { CourseDetailsContent } from "@/components/courses/course-details-content"
import { CourseCardPreview } from "./components/preview/course-card-preview"
import { BasicInfoForm } from "./components/basic-info/basic-info-form"
import { LessonsForm } from "./components/lessons/lessons-form"

// --- Types & Constants ---
import { CourseFormData, ModuleData, LessonData } from "./types"
import { IMAGE_BASE_URL } from "@/data/courses"
import {
    cours, createModule, createLesson, createExercise,
    getCourseById, update, updateModule, updateLesson, updateExercise
} from "@/data/courses"

const isMongoId = (id: string) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

function CourseUploadContent() {
    const { t } = useLanguage()
    const router = useRouter()
    const searchParams = useSearchParams()
    const editCourseId = searchParams.get('edit')
    const { user } = useUserStore()
    const topRef = useRef<HTMLDivElement>(null)

    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [realMongoId, setRealMongoId] = useState<string | null>(null)

    const [formData, setFormData] = useState<CourseFormData>({
        title: "",
        slug: "",
        subtitle: "",
        description: "",
        category: "Cloud Computing",
        level: "Beginner",
        price: "",
        imageCover: "",
        tags: "",
        modules: []
    })

    useEffect(() => {
        if (!editCourseId && formData.modules.length === 0 && t) {
            setFormData((prev) => ({
                ...prev,
                modules: [
                    {
                        id: "1",
                        title: `${t('instructor_upload.modules')} 1`,
                        lessons: [
                            { id: "1-1", title: t('instructor_upload.untitled_lesson_default'), type: "video", duration: "05:00", isPreview: true }
                        ]
                    }
                ]
            }))
        }
    }, [t, formData.modules.length, editCourseId])

    useEffect(() => {
        if (editCourseId) {
            setLoading(true)
            getCourseById(editCourseId).then(course => {
                if (course) {
                    setRealMongoId(course._id || null)
                    setFormData({
                        title: course.title,
                        slug: course.id,
                        subtitle: course.subtitle || '',
                        description: course.description,
                        category: course.category,
                        level: course.level,
                        price: course.price.toString(),
                        imageCover: course.imageCover || '',
                        tags: (course.tags || []).join(', '),
                        modules: (course.modules || []).map((mod: any) => {
                            const { _id: mBackId, id: mId, lessons: mLessons, exercises: mEx, ...mRest } = mod;
                            return {
                                ...mRest,
                                id: mBackId || mId,
                                lessons: (mLessons || []).map((less: any) => {
                                    const { _id: lBackId, id: lId, exercises: lEx, ...lRest } = less;
                                    return {
                                        ...lRest,
                                        id: lBackId || lId,
                                        exercises: (lEx || []).map((ex: any) => ({
                                            ...ex,
                                            id: ex._id || ex.id
                                        }))
                                    };
                                }),
                                exercises: (mEx || []).map((ex: any) => ({
                                    ...ex,
                                    id: ex._id || ex.id
                                }))
                            };
                        })
                    })
                }
            }).catch(err => {
                toast.error("Failed to load course for editing")
                console.error(err)
            }).finally(() => setLoading(false))
        }
    }, [editCourseId])

    useEffect(() => {
        if (formData.title && step === 1) {
            const slug = formData.title
                .toLowerCase()
                .replace(/[^a-z0-9 ]/g, "")
                .replace(/\s+/g, "-")
            setFormData((prev) => ({ ...prev, slug }))
        }
    }, [formData.title, step])

    useEffect(() => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
        }
    }, [step])

    const validateStep1 = () => {
        const { title, description, category, level, price, imageCover } = formData;
        if (!title.trim()) { toast.error("Course title is required"); return false; }
        if (!description.trim()) { toast.error("Course description is required"); return false; }
        if (!category) { toast.error("Please select a category"); return false; }
        if (!level) { toast.error("Please select a difficulty level"); return false; }
        if (!price || parseFloat(price) < 0) { toast.error("Valid price is required"); return false; }
        if (!imageCover) { toast.error("Course cover image is required"); return false; }
        return true;
    }

    const validateStep2 = () => {
        if (!formData.modules || formData.modules.length === 0) {
            toast.error("Please add at least one module");
            return false;
        }
        for (const mod of formData.modules) {
            if (!mod.title.trim()) {
                toast.error("All modules must have a title");
                return false;
            }
            if (!mod.lessons || mod.lessons.length === 0) {
                toast.error(`Module "${mod.title}" must have at least one lesson`);
                return false;
            }
            for (const lesson of mod.lessons) {
                if (!lesson.title.trim()) {
                    toast.error("All lessons must have a title");
                    return false;
                }
            }
        }
        return true;
    }

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setStep(s => Math.min(s + 1, 3))
    }
    const handlePrev = () => setStep(s => Math.max(s - 1, 1))

    const handleCancel = () => {
        if (editCourseId) {
            router.push(`/instructor/courses/${editCourseId}`)
        } else {
            router.push('/instructor/courses')
        }
    }

    const handleChange = (field: keyof CourseFormData, value: CourseFormData[keyof CourseFormData]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError("")

        if (!user) {
            setError("You must be logged in to create a course.")
            setLoading(false)
            return
        }

        try {
            // 1. Create/Update Course Basic Info
            const coursePayload = {
                title: formData.title,
                slug: formData.slug,
                subtitle: formData.subtitle,
                description: formData.description,
                category: formData.category,
                level: formData.level,
                price: parseFloat(formData.price) || 0,
                originalPrice: (parseFloat(formData.price) || 0) * 1.2,
                discount: 0,
                tags: formData.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
                imageCover: formData.imageCover,
                instructorId: user.id,
            }

            let courseId = editCourseId;

            const cleanupPayload = (obj: Record<string, any>) => {
                const {
                    id, _id, __v, createdAt, updatedAt,
                    lessons, lessonsID, modules, chaptersId, exercises, exercisesID,
                    ...clean
                } = obj;
                return clean;
            };

            if (editCourseId) {
                // Update existing course
                const targetId = realMongoId || editCourseId;
                await update(targetId, coursePayload);
                courseId = targetId; // Set current courseId for structure updates
            } else {
                // Create new course
                const newCourse = await cours(coursePayload) as any;
                courseId = newCourse._id || null;
            }

            // 2. Create or Update Modules, Lessons, and Exercises sequentially
            if (formData.modules && courseId) {
                for (const mod of formData.modules) {
                    let moduleId;
                    const modFrontId = mod.id;
                    const modulePayload = cleanupPayload(mod);
                    modulePayload.courseId = courseId;

                    if (isMongoId(modFrontId)) {
                        delete modulePayload.courseId; // Avoid re-triggering parent logic
                        await updateModule(modFrontId, modulePayload);
                        moduleId = modFrontId;
                    } else {
                        const moduleResponse = await createModule(modulePayload);
                        moduleId = moduleResponse._id;
                    }

                    if (mod.lessons && moduleId) {
                        for (const less of mod.lessons) {
                            let lessonId;
                            const lessFrontId = less.id;
                            const lessonPayload = cleanupPayload(less);
                            lessonPayload.moduleId = moduleId;

                            if (isMongoId(lessFrontId)) {
                                delete lessonPayload.moduleId; // Avoid re-triggering parent logic
                                await updateLesson(lessFrontId, lessonPayload);
                                lessonId = lessFrontId;
                            } else {
                                const lessonResponse = await createLesson(lessonPayload);
                                lessonId = lessonResponse._id;
                            }

                            // Create or Update exercises linked to this lesson
                            if (less.exercises && less.exercises.length > 0 && lessonId) {
                                for (const ex of less.exercises) {
                                    const exFrontId = ex.id;
                                    const exercisePayload = cleanupPayload(ex);
                                    exercisePayload.lessonId = lessonId;

                                    if (isMongoId(exFrontId)) {
                                        delete exercisePayload.lessonId; // Avoid re-triggering parent logic
                                        await updateExercise(exFrontId, exercisePayload);
                                    } else {
                                        await createExercise(exercisePayload);
                                    }
                                }
                            }
                        }
                    }

                    // Independent Exercises (linked to module)
                    if (mod.exercises && mod.exercises.length > 0 && moduleId) {
                        for (const ex of mod.exercises) {
                            const exFrontId = ex.id;
                            const exercisePayload = cleanupPayload(ex);
                            exercisePayload.moduleId = moduleId;

                            if (isMongoId(exFrontId)) {
                                await updateExercise(exFrontId, exercisePayload);
                            } else {
                                await createExercise(exercisePayload);
                            }
                        }
                    }
                }
            }

            toast.success(editCourseId ? "Course & Curriculum Updated!" : "Deployment Successful!", {
                description: editCourseId ? "All changes have been saved." : "Your course has been published to the academy.",
            })

            setSuccess(true)
            setTimeout(() => router.push('/instructor/courses'), 2000)
        } catch (err) {
            if (err instanceof Error) {
                toast.error("Deployment Failed", {
                    description: err.message,
                })
                setError(err.message)
            }
        } finally {
            setLoading(false)
        }
    }

    const calculateStats = () => {
        let totalSeconds = 0
        let totalLessons = 0
        let totalQuizzes = 0
        let totalResources = 0
        let totalLabs = 0

        formData.modules.forEach(module => {
            module.lessons.forEach(lesson => {
                totalLessons++
                if (lesson.type === 'quiz') totalQuizzes++
                if (lesson.type === 'resource') totalResources++
                if (lesson.type === 'lab') totalLabs++

                if (lesson.duration) {
                    const parts = lesson.duration.split(':').map(Number)
                    if (parts.length === 2) {
                        totalSeconds += parts[0] * 60 + parts[1]
                    } else if (parts.length === 1) {
                        totalSeconds += parts[0] * 60
                    }
                }
            })
        })

        const hours = Math.floor(totalSeconds / 3600)
        const minutes = Math.floor((totalSeconds % 3600) / 60)

        const durationString = hours > 0
            ? `${hours}h ${minutes}m`
            : `${minutes}m`

        return { durationString, totalLessons, totalQuizzes, totalResources, totalLabs }
    }

    const stats = calculateStats()

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 animate-in fade-in duration-700">
                <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-[32px] p-8 text-center shadow-2xl border border-slate-100 dark:border-slate-700">
                    <div className="size-20 bg-emerald-100 dark:bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-500 animate-in zoom-in duration-500 delay-150">
                        <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 dark:text-white mb-2">
                        {t('instructor_upload.course_created_success')}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed mb-8">
                        Your course "{formData.title}" has been successfully {editCourseId ? 'updated' : 'published'}.
                    </p>
                    <Button
                        onClick={() => router.push('/instructor/courses')}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background font-sans selection:bg-indigo-100 selection:text-indigo-900 course-upload-container pb-24">
            {/* Premium Integrated Header - Compact */}

            <div className="max-w-[1440px] mx-auto px-8 py-6 flex items-center justify-between" ref={topRef}>
                <div className="flex items-center gap-4">
                    <div className="size-8 rounded-xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <BookOpen className="w-4 h-4" />
                    </div>
                    <h1 className="text-lg font-black text-slate-800 dark:text-white tracking-tighter uppercase leading-none">
                        {editCourseId ? 'Edit Course' : t('instructor_upload.title_prefix')} <span className="text-indigo-500">{editCourseId ? 'Details' : t('instructor_upload.title_highlight')}</span>
                    </h1>
                </div>

                <Button
                    variant="ghost"
                    onClick={handleCancel}
                    className="h-10 px-4 rounded-xl font-bold text-xs hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400 text-slate-500 transition-all gap-2"
                >
                    <X className="w-4 h-4" /> Cancel
                </Button>
            </div>


            <main className="max-w-[1440px] mx-auto px-6 mt-2">
                {/* Connected Step Protocol - Compact */}
                <div className="mb-8">
                    <StepIndicator currentStep={step} onStepClick={setStep} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Form Section */}
                    <div className="space-y-4 transition-all duration-500 lg:col-span-12">
                        <div className={cn(
                            "rounded-[32px] border-2 shadow-2xl overflow-hidden transition-all duration-700 bg-white dark:bg-card border-slate-200/60 dark:border-white/20",
                            (step === 1 || step === 2) && "bg-slate-100 dark:bg-[#0f172a]"
                        )}>
                            {/* Step Header Ribbon - Compact */}
                            <div className={cn(
                                "px-8 py-5 border-b-2 transition-colors duration-700 flex items-center justify-between",
                                (step === 1 || step === 2)
                                    ? "bg-white/50 dark:bg-[#0f172a] border-slate-200/60 dark:border-white/20"
                                    : "bg-slate-50/50 dark:bg-[#0f172a] border-slate-100 dark:border-white/20"
                            )}>
                                <div className="space-y-2">
                                    <h2 className="text-base font-black text-slate-800 dark:text-indigo-400 tracking-tighter uppercase leading-none">
                                        {step === 1 && (editCourseId ? 'Edit Basic Info' : t('instructor_upload.step1_label'))}
                                        {step === 2 && (editCourseId ? 'Edit Curriculum (View Only)' : t('instructor_upload.step3_label'))}
                                        {step === 3 && (editCourseId ? 'Review & Update' : "Récapitulatif & Publication")}
                                    </h2>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                                        {step === 1 && "Configuration des informations de base"}
                                        {step === 2 && "Organisation et contenu pédagogique"}
                                        {step === 3 && "Vérifiez et publiez votre cours"}
                                    </p>
                                </div>
                                <div className="size-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                            </div>

                            <div className="p-0">
                                {step === 1 && <BasicInfoForm data={formData} update={handleChange} />}
                                {step === 2 && <LessonsForm data={formData} setFormData={setFormData} />}
                                {step === 3 && (
                                    <div className="animate-in fade-in duration-700 bg-slate-50 dark:bg-[#0f172a]/40 p-4 lg:p-8 rounded-b-[32px]">
                                        <div className="bg-white dark:bg-card border border-slate-200 dark:border-white/5 rounded-2xl p-6 lg:p-10 shadow-sm flex flex-col items-center">
                                            <div className="w-full flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
                                                <div className="size-10 bg-indigo-50 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                    <Eye className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{t('instructor_upload.live_student_preview')}</h3>
                                                    <p className="text-xs text-slate-500 font-medium">This is how your course card will appear in the catalog.</p>
                                                </div>
                                            </div>

                                            <div className="py-8">
                                                <CourseCardPreview data={formData} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>


                            {/* Control Bar - Integrated */}
                            <div className="px-8 py-6 bg-slate-50/50 dark:bg-[#0f172a] border-t-2 border-slate-200/60 dark:border-white/20 flex items-center">
                                {step > 1 && (
                                    <Button
                                        variant="ghost"
                                        onClick={handlePrev}
                                        disabled={loading}
                                        className="h-11 px-6 rounded-xl font-bold text-xs dark:hover:bg-slate-800 hover:bg-slate-100 transition-all gap-2 text-slate-500"
                                    >
                                        <ChevronLeft className="w-3.5 h-3.5" /> {t('instructor_upload.back_to_prev')}
                                    </Button>
                                )}

                                <div className="flex items-center gap-3 ml-auto">
                                    {step < 3 ? (
                                        <Button
                                            onClick={handleNext}
                                            className="group h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-500 gap-3"
                                        >
                                            {t('instructor_upload.verify_continue')}
                                            <ChevronRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1" />
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="group h-12 px-10 rounded-2xl font-black text-xs uppercase tracking-widest bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-2xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-500 gap-3"
                                        >
                                            {loading ? t('instructor_upload.initializing') : (editCourseId ? 'Update Course' : t('instructor_upload.publish_catalog'))}
                                            <Check className={cn("w-4 h-4 transition-all duration-500", loading ? "animate-spin" : "group-hover:scale-125")} />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default function CreateCoursePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        }>
            <CourseUploadContent />
        </Suspense>
    )
}
