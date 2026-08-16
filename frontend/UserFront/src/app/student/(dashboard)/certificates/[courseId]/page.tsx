"use client"

import React, { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUserStore } from "@/lib/store"
import { getCourseById, Course } from "@/data/courses"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Download, Award, Share2, Printer } from "lucide-react"

export default function CertificatePage() {
    const params = useParams()
    const router = useRouter()
    const { user } = useUserStore()
    const courseId = params.courseId as string

    const [course, setCourse] = useState<Course | null>(null)
    const [loading, setLoading] = useState(true)
    const certificateRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await getCourseById(courseId)
                setCourse(data || null)
            } catch (e) {
                console.error("Failed to fetch course data", e)
            } finally {
                setLoading(false)
            }
        }
        if (courseId) {
            fetchCourse()
        }
    }, [courseId])

    const handlePrint = () => {
        window.print()
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 font-medium">Loading certificate...</p>
                </div>
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
                <div className="size-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                    <Award className="size-10" />
                </div>
                <h2 className="text-2xl font-bold">Certificate Not Found</h2>
                <p className="text-slate-500">We couldn't load the course details for this certificate.</p>
                <Button onClick={() => router.back()} variant="outline">
                    Go Back
                </Button>
            </div>
        )
    }

    const today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const instructorName = course.instructor || course.instructorDetails?.name || "E-Learning Instructor";


    return (
        <div className="max-w-6xl mx-auto pb-20 space-y-8">
            {/* Action Bar (hidden in print) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/student/certificates`)}
                    className="text-slate-500 hover:text-slate-900"
                >
                    <ArrowLeft className="mr-2 size-4" />
                    Back to Certificates
                </Button>
                <div className="flex gap-3 w-full sm:w-auto">
                    <Button onClick={handlePrint} className="flex-1 sm:flex-none">
                        <Printer className="mr-2 size-4" />
                        Print Certificate
                    </Button>
                </div>
            </div>

            {/* Certificate Container */}
            <div className="flex justify-center overflow-x-auto overflow-y-hidden print:overflow-visible pb-10">
                <div
                    ref={certificateRef}
                    className="certificate-paper relative w-[1000px] h-[750px] bg-white text-slate-900 border-[16px] border-slate-900 shadow-2xl shrink-0 print:border-8 print:shadow-none"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%239CA3AF' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`
                    }}
                >
                    {/* Inner gold border */}
                    <div className="absolute inset-4 border-2 border-amber-500/50 outline outline-4 outline-offset-4 outline-amber-500/20" />

                    {/* Corner Embellishments */}
                    <div className="absolute top-8 left-8 size-16 border-t-4 border-l-4 border-amber-500" />
                    <div className="absolute top-8 right-8 size-16 border-t-4 border-r-4 border-amber-500" />
                    <div className="absolute bottom-8 left-8 size-16 border-b-4 border-l-4 border-amber-500" />
                    <div className="absolute bottom-8 right-8 size-16 border-b-4 border-r-4 border-amber-500" />

                    <div className="h-full flex flex-col items-center justify-center p-12 text-center z-10 relative">
                        {/* Certificate Header */}
                        <div className="space-y-4 mb-6">
                            <div className="flex justify-center mb-6">
                                <div className="size-20 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center shadow-lg">
                                    <Award className="size-10 text-amber-500" />
                                </div>
                            </div>
                            <h1 className="text-5xl font-serif text-slate-900 tracking-widest uppercase">
                                Certificate of Completion
                            </h1>
                            <p className="text-amber-600 tracking-widest font-semibold uppercase text-sm">
                                This is to certify that
                            </p>
                        </div>

                        <div className="mb-6 w-full">
                            <h2 className="text-6xl font-black text-slate-800 border-b-2 border-slate-200 pb-6 w-3/4 mx-auto font-serif italic">
                                {user?.name || (user as any)?.firstName || "Student"}
                            </h2>
                        </div>

                        {/* Course Info */}
                        <div className="space-y-4 mb-8 max-w-3xl">
                            <p className="text-xl text-slate-600">
                                has successfully completed the extensive requirements for the course
                            </p>
                            <h3 className="text-4xl font-bold text-indigo-900 font-serif">
                                {course.title}
                            </h3>
                            <p className="text-sm text-slate-500 max-w-2xl mx-auto line-clamp-2">
                                {course.description || "A comprehensive learning track covering essential topics and providing hands-on practical experience."}
                            </p>
                        </div>

                        {/* Signatures & Footer */}
                        <div className="flex justify-between w-full px-20 mt-auto items-end pb-4">
                            {/* Date */}
                            <div className="text-center w-64">
                                <p className="text-xl font-bold text-slate-800 border-b border-slate-300 pb-2 mb-2 font-serif">
                                    {today}
                                </p>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                                    Date of Completion
                                </p>
                            </div>

                            {/* Seal */}
                            <div className="size-32 rounded-full border-4 border-amber-500 flex items-center justify-center relative -bottom-4">
                                <div className="absolute inset-2 border-2 border-dashed border-amber-400 rounded-full animate-[spin_20s_linear_infinite]" />
                                <div className="text-center">
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Official</p>
                                    <Award className="size-8 text-amber-500 mx-auto my-1" />
                                    <p className="text-[10px] uppercase tracking-widest font-bold text-amber-600">Verified</p>
                                </div>
                            </div>

                            {/* Signature */}
                            <div className="text-center w-64">
                                <p className="text-2xl text-slate-800 border-b border-slate-300 pb-2 mb-2 font-['Brush_Script_MT',cursive,serif] italic">
                                    {instructorName}
                                </p>
                                <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
                                    Course Instructor
                                </p>
                            </div>
                        </div>

                        <div className="absolute bottom-6 text-slate-300 text-[10px] uppercase tracking-widest">
                            Certificate ID: {courseId}-{user?.id?.slice(0, 6) || "USER"}
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    body {
                        background: white !important;
                    }
                    /* Hide header, navigation, layout wrappers except main content */
                    header, nav, aside, .sidebar {
                        display: none !important;
                    }
                    /* Ensure orientation is landscape and no margins */
                    @page {
                        size: landscape;
                        margin: 0;
                    }
                    /* Center exactly on the page */
                    .max-w-6xl {
                        max-width: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Transform scale might be needed if elements too big, but usually handles it ok */
                    .certificate-paper {
                        transform: scale(0.95);
                        transform-origin: top center;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>
        </div>
    )
}
