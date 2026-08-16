"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Star, Clock, Calendar, Users, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

// UI Components
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

// Data & Hooks
import { Course, enrollInCourse, checkEnrollment, createCheckoutSession } from '@/data/courses'
import { useLanguage } from '@/context/language-context'
import { useUserStore } from '@/lib/store'

// Internal Sub-components
import { MetaItem, FeatureCard, SectionHeader } from "./course-details/shared"
import { ModuleAccordion } from "./course-details/curriculum"
import { ReviewSection } from "./course-details/review-section"
import { InstructorCard } from "./course-details/instructor-card"
import { EnrollmentCard } from "./course-details/enrollment-card"

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface CourseDetailsContentProps {
    course: Course
    isInstructorView?: boolean
    isDashboard?: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CourseDetailsContent({
    course,
    isInstructorView = false,
    isDashboard = false
}: CourseDetailsContentProps) {
    const { t } = useLanguage()
    const router = useRouter()
    const { user } = useUserStore()
    const courseId = useMemo(() => course._id || course.id, [course._id, course.id])

    // State
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [isEnrolling, setIsEnrolling] = useState(false)

    // Calculs mémoïsés
    const courseStats = useMemo(() => {
        const rating = typeof course.rating === 'number' ? course.rating : 0
        const reviews = Math.max(
            Number(course.reviews || 0),
            Number(course.ratingsQuantity || 0),
            rating > 0 ? 1 : 0
        )
        const totalModules = course.modules?.length || 0
        const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0

        return { rating, reviews, totalModules, totalLessons }
    }, [course.modules, course.rating, course.reviews, course.ratingsQuantity])

    const isOwner = useMemo(() => {
        if (!user) return false
        const userId = user.id || (user as any)._id
        return userId === course.instructorId
    }, [user, course.instructorId])

    const firstLesson = useMemo(() => {
        return course.modules?.[0]?.lessons?.[0]
    }, [course.modules])

    const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
        try {
            const key = `progress_${courseId}`
            return JSON.parse(localStorage.getItem(key) || "[]") as string[]
        } catch {
            return []
        }
    })

    // Vérification de l'inscription au montage & Chargement de la progression
    useEffect(() => {
        const fetchEnrollmentAndProgress = async () => {
            const currentUser = useUserStore.getState().user
            if (!currentUser || !courseId) return

            try {
                const enrolled = await checkEnrollment(courseId)
                setIsEnrolled(enrolled)

                if (enrolled) {
                    const userId = currentUser.id || (currentUser as any)._id;
                    const token = localStorage.getItem('user-token');
                    const res = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/course-progress/${courseId}?userId=${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.data) {
                            setCompletedLessons(data.data);
                        }
                    }
                }
            } catch (error) {
                console.warn("Failed to check enrollment or progress:", error)
            }
        }
        fetchEnrollmentAndProgress()
    }, [courseId])

    // Navigation vers la première leçon non complétée
    const handleStartLearning = useCallback(() => {
        const allLessons = (course.modules || []).flatMap(m => m.lessons || [])

        // 1. Trouver la première leçon non complétée
        const nextLesson = allLessons.find(l => {
            const id = l.id || l._id
            return id && !completedLessons.includes(id)
        }) || firstLesson

        if (nextLesson) {
            const lessonId = nextLesson.id || nextLesson._id
            router.push(`/student/player/${lessonId}?courseId=${courseId}`)
        } else {
            // 2. Fallback: dernière leçon visitée
            const lastLessonId = localStorage.getItem(`last_lesson_${courseId}`)
            if (lastLessonId) {
                router.push(`/student/player/${lastLessonId}?courseId=${courseId}`)
                return
            }
            // 3. Fallback ultime: page du cours
            router.push(`/student/courses/${courseId}`)
        }
    }, [course.modules, completedLessons, firstLesson, courseId, router])

    // Gestion de l'inscription
    const handleEnroll = useCallback(async () => {
        const currentUser = useUserStore.getState().user

        if (!currentUser) {
            toast.error(t("auth.please_login") || "Please login to enroll")
            router.push(`/auth?redirect=/student/courses/${courseId}`)
            return
        }

        setIsEnrolling(true)

        try {
            if (course.price > 0) {
                // 💳 Cours payant → Stripe
                const { session } = await createCheckoutSession(courseId, course.title, course.price)

                if (session?.url) {
                    window.location.href = session.url
                    return
                }
                throw new Error("Could not create checkout session")
            } else {
                // 🎁 Cours gratuit → Inscription directe
                await enrollInCourse(courseId)
                setIsEnrolled(true)
                toast.success(t("course_details.enroll_success") || "Successfully enrolled!")
                router.push(`/student/courses/${courseId}/success`)
            }
        } catch (error: any) {
            const msg = error.message?.toLowerCase() || ""

            if (msg.includes("already enrolled") || msg.includes("duplicate")) {
                toast.success("You are already enrolled! Redirecting...")
                setIsEnrolled(true)
                handleStartLearning()
            } else {
                console.error("Enrollment error:", error)
                toast.error(error.message || t("errors.enrollment_failed") || "Failed to process enrollment")
            }
        } finally {
            setIsEnrolling(false)
        }
    }, [courseId, course.title, course.price, router, t, handleStartLearning])

    // Toggle module accordéon
    const toggleModule = useCallback((moduleId: string, index: number) => {
        const key = `${moduleId}-${index}`
        setExpandedModules(prev => ({ [key]: !prev[key] }))
    }, [])

    // Expand premier module par défaut
    useEffect(() => {
        if (course.modules?.[0]?.id && Object.keys(expandedModules).length === 0) {
            setExpandedModules({ [`${course.modules[0].id}-0`]: true })
        }
    }, [course.modules, expandedModules])

    // Modif: Si c'est la vue instructeur, on affiche tout mais on désactive ou cache certaines parties
    const actualInstructorView = isInstructorView || isOwner

    return (
        <div className={cn(
            "max-w-7xl mx-auto space-y-10",
            isDashboard ? "px-0 py-0" : "px-4 sm:px-6 lg:px-8 py-8"
        )}>
            {/* HERO SECTION */}
            <section className="bg-white dark:bg-slate-900 rounded-3xl p-6 lg:p-10 shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
                    {/* Thumbnail */}
                    <div className="w-full lg:w-[420px] shrink-0">
                        <div className="relative aspect-video rounded-2xl overflow-hidden shadow-lg ring-1 ring-slate-100 dark:ring-slate-700 bg-slate-50 dark:bg-slate-800 group">
                            <Image
                                src={course.image || "/images/course-placeholder.jpg"}
                                alt={course.title}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/course-placeholder.jpg"
                                }}
                                priority
                            />
                            {course.bestseller && (
                                <Badge className="absolute top-4 left-4 bg-amber-500 hover:bg-amber-600 border-0 text-white">
                                    Bestseller
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 space-y-6 pt-2">
                        <div className="space-y-4">
                            <Badge variant="secondary" className="px-3 py-1 bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 hover:bg-blue-100 border-none font-semibold tracking-wide uppercase text-[11px]">
                                {t(`catalog.${course.level?.toLowerCase() || 'beginner'}`)}
                            </Badge>

                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight">
                                {course.title}
                            </h1>

                            {/* Meta Row */}
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                {courseStats.rating > 0 ? (
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                        <span className="font-bold text-slate-700 dark:text-slate-200">
                                            {courseStats.rating.toFixed(1)}
                                        </span>
                                        <span className="text-slate-400 text-sm">
                                            ({courseStats.reviews} {courseStats.reviews === 1 ? t("course_details.review") : t("course_details.reviews")})
                                        </span>
                                    </div>
                                ) : (
                                    <Badge className="bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-0 text-[10px] uppercase tracking-wider">
                                        {t("course_details.new_course") || "Nouveau"}
                                    </Badge>
                                )}

                                <MetaItem icon={Clock} label={course.duration || "24h"} />
                                <MetaItem icon={Calendar} label={course.lastUpdated || "Recently updated"} />
                                <MetaItem icon={Users} label={`${course.students || 0} ${t("course_details.students") || "students"}`} />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* MAIN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
                {/* LEFT COLUMN: Content */}
                <div className="lg:col-span-8 flex flex-col gap-10">
                    {/* About Section */}
                    <div>
                        <SectionHeader
                            icon={<BookOpen className="w-5 h-5" />}
                            title={t("course_details.about_course") || "About this course"}
                            accent="blue"
                        />
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-base">
                                {course.description}
                            </p>
                        </div>

                        {/* Feature Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
                            <FeatureCard icon="🛠️" label={t("course_details.hands_on") || "Hands-on Projects"} variant="blue" />
                            <FeatureCard icon="🎓" label={t("course_details.certificate") || "Certificate"} variant="indigo" />
                        </div>
                    </div>

                    {/* Curriculum */}
                    <div>
                        <SectionHeader
                            icon={<BookOpen className="w-5 h-5" />}
                            title={t("course_details.course_content") || "Course Content"}
                            accent="indigo"
                            badge={`${courseStats.totalModules} Modules`}
                        />
                        <div className="space-y-3">
                            {course.modules?.map((module, idx) => (
                                <ModuleAccordion
                                    key={module.id || idx}
                                    module={module}
                                    index={idx}
                                    isExpanded={!!expandedModules[`${module.id}-${idx}`]}
                                    onToggle={toggleModule}
                                    courseId={courseId}
                                    lessons={module.lessons || []}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Reviews */}
                    <ReviewSection
                        rating={courseStats.rating}
                        reviewCount={courseStats.reviews}
                        distribution={course.ratingDistribution}
                    />

                    {/* Instructor */}
                    {!actualInstructorView && <InstructorCard instructor={course.instructorDetails} />}
                </div>

                {/* RIGHT COLUMN: Enrollment Card */}
                <div className="lg:col-span-4">
                    <EnrollmentCard
                        price={course.price}
                        originalPrice={course.originalPrice}
                        isEnrolled={isEnrolled || actualInstructorView}
                        isLoading={isEnrolling}
                        isPreview={actualInstructorView}
                        onEnroll={handleEnroll}
                        onStartLearning={handleStartLearning}
                    />
                </div>
            </div>
        </div>
    )
}