"use client"

import React, { use, useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { getAllCourses, getCourseById, Course, Lesson } from "@/data/courses"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"

// Extracted Components
import { PlayerSidebar } from "@/components/player/player-sidebar"
import { VideoArea } from "@/components/player/video-area"
import { ContentTabs } from "@/components/player/content-tabs"
import { CurriculumOverview } from "@/components/player/curriculum-overview"
import { useUserStore } from "@/lib/store"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, PlayCircle, Trophy, PartyPopper, Sparkles, CheckCircle2, X } from "lucide-react"
import { CourseRating } from "@/components/courses/course-rating"

export default function VideoPlayerPage({
    params,
    searchParams
}: {
    params: Promise<{ lessonId: string }>,
    searchParams: Promise<{ courseId?: string }>
}) {
    const { lessonId: initialLessonId } = use(params)
    const { courseId } = use(searchParams)
    const router = useRouter()

    const [course, setCourse] = useState<Course | null>(null)
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null)
    const [loading, setLoading] = useState(true)
    const [showPlayer, setShowPlayer] = useState(true)
    const [completedItems, setCompletedItems] = useState<string[]>([])
    const [showCongrats, setShowCongrats] = useState(false)
    const [totalItemsCount, setTotalItemsCount] = useState(0)
    const [congratsState, setCongratsState] = useState(0) // 0: not shown, 1: shown/dismissed

    // Load completed items from backend (fallback to local if not logged in)
    const stableCourseId = course?._id || courseId;
    useEffect(() => {
        const fetchProgress = async () => {
            const stableId = course?._id || courseId || 'default';
            const user = useUserStore.getState().user;

            if (user && (user.id || (user as any)._id) && stableId !== 'default') {
                try {
                    const userId = user.id || (user as any)._id;
                    const token = localStorage.getItem('user-token');
                    const res = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/course-progress/${stableId}?userId=${userId}`, {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        if (data && data.data) {
                            setCompletedItems(data.data);
                            return;
                        }
                    }
                } catch (e) {
                    console.error("Failed to load progress from backend", e);
                }
            }

            // Fallback to local storage
            const saved = localStorage.getItem(`progress_${stableId}`);
            if (saved) {
                setCompletedItems(JSON.parse(saved));
            }
        };
        fetchProgress();
    }, [stableCourseId, courseId]);

    // Effect to calculate total items and check for completion
    useEffect(() => {
        if (course) {
            const allLessonsInCourse = course.modules.flatMap(m => m.lessons);
            const allExercisesInCourse = course.modules.flatMap(m => [
                ...m.lessons.flatMap(l => l.exercises || []),
                ...(m.exercises || [])
            ]);

            const total = allLessonsInCourse.length + allExercisesInCourse.length;
            setTotalItemsCount(total);

            // Re-calculate completion for the modal trigger
            const doneVideos = allLessonsInCourse.filter(l =>
                (l.id && completedItems.includes(l.id)) || (l._id && completedItems.includes(l._id))
            ).length;
            const doneExs = allExercisesInCourse.filter(ex =>
                (ex.id && completedItems.includes(ex.id)) || (ex._id && completedItems.includes(ex._id))
            ).length;

            const totalDone = doneVideos + doneExs;

            if (congratsState === 0 && totalDone === totalItemsCount && totalItemsCount > 0) {
                const timer = setTimeout(() => {
                    setShowCongrats(true);
                    setCongratsState(1);
                }, 2500);
                return () => clearTimeout(timer);
            }
        }
    }, [completedItems, course, congratsState]);

    const markItemAsCompleted = useCallback(async (id: string) => {
        // Collect all IDs that refer to this item
        const allLessons = course?.modules.flatMap(m => m.lessons) || [];
        const allExercises = course?.modules.flatMap(m => [
            ...m.lessons.flatMap(l => l.exercises || []),
            ...(m.exercises || [])
        ]) || [];

        const item = allLessons.find(l => l.id === id || l._id === id) ||
            allExercises.find(e => e.id === id || e._id === id);

        const idsToAdd = item ? [item.id, (item as any)._id].filter(Boolean) as string[] : [id];

        // Ensure we don't try to add empty IDs
        if (idsToAdd.length === 0) return;

        // Local State update immediately for UI responsiveness
        setCompletedItems(prev => {
            const newIds = idsToAdd.filter(newId => !prev.includes(newId));
            if (newIds.length === 0) return prev;
            return [...prev, ...newIds];
        });

        const stableId = course?._id || courseId || 'default';
        const user = useUserStore.getState().user;

        // Sync to backend if logged in
        if (user && (user.id || (user as any)._id) && stableId !== 'default') {
            try {
                const userId = user.id || (user as any)._id;
                const token = localStorage.getItem('user-token');
                await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/course-progress/${stableId}/mark`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ items: idsToAdd, userId: userId })
                });
            } catch (e) {
                console.error("Failed to sync progress to backend", e);
            }
        } else {
            // Fallback for anonymous users
            const saved = JSON.parse(localStorage.getItem(`progress_${stableId}`) || "[]");
            const newSaved = [...new Set([...saved, ...idsToAdd])];
            localStorage.setItem(`progress_${stableId}`, JSON.stringify(newSaved));
        }

        // Log activity
        if (item && course) {
            const itemUniqueId = item.id || (item as any)._id;
            const isLessonType = allLessons.some(l => l.id === itemUniqueId || l._id === itemUniqueId);

            if (user && (user.id || (user as any)._id)) {
                try {
                    const userId = user.id || (user as any)._id;
                    const token = localStorage.getItem('user-token');
                    fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/activities/log`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            userId: userId,
                            actionType: isLessonType ? 'lesson' : 'exercise',
                            itemId: itemUniqueId,
                            title: item.title,
                            courseTitle: course.title,
                            courseId: course.id || course._id
                        })
                    }).catch(e => console.error("Failed to sync activity to backend background task", e));
                } catch (e) {
                    console.error("Failed to dispatch activity sync", e);
                }
            }

            // Fallback for UI / no user
            try {
                const activityLog = JSON.parse(localStorage.getItem('activity_log') || '[]');
                const lastActivity = activityLog[0];
                const isDuplicate = lastActivity &&
                    lastActivity.title === item.title &&
                    lastActivity.courseTitle === course.title &&
                    (Date.now() - new Date(lastActivity.timestamp).getTime() < 5 * 60 * 1000);

                if (!isDuplicate) {
                    const newActivity = {
                        id: Date.now().toString(),
                        itemId: itemUniqueId,
                        title: item.title,
                        courseTitle: course.title,
                        timestamp: new Date().toISOString(),
                        type: isLessonType ? 'lesson' : 'exercise'
                    };
                    const newLog = [newActivity, ...activityLog].slice(0, 10);
                    localStorage.setItem('activity_log', JSON.stringify(newLog));
                }
            } catch (e) {
                console.error("Error logging activity fallback:", e);
            }
        }
    }, [course, courseId]);

    useEffect(() => {
        const fetchCourseData = async () => {
            setLoading(true);
            try {
                if (courseId && courseId !== "undefined") {
                    const c = await getCourseById(courseId);
                    if (c) {
                        setCourse(c);
                        const lesson = c.modules.flatMap(m => m.lessons).find((l: Lesson) => l.id === initialLessonId || l._id === initialLessonId);
                        if (lesson) {
                            setCurrentLesson(lesson);
                            // Save as last viewed lesson
                            const stableId = c._id || c.id;
                            localStorage.setItem(`last_lesson_${stableId}`, lesson.id || lesson._id || "");
                        }
                    }
                } else {
                    const { data: courses } = await getAllCourses(1, 100);
                    for (const c of courses) {
                        const lesson = (c.modules || []).flatMap(m => m.lessons).find(l => l.id === initialLessonId || l._id === initialLessonId);
                        if (lesson) {
                            setCourse(c);
                            setCurrentLesson(lesson);
                            // Save as last viewed lesson
                            const stableId = c._id || c.id;
                            localStorage.setItem(`last_lesson_${stableId}`, lesson.id || lesson._id || "");
                            break;
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching course data:", error);
            }
            setLoading(false);
        };
        fetchCourseData();
    }, [initialLessonId, courseId]);

    const handleSelectLesson = (id: string) => {
        router.push(`/student/player/${id}?courseId=${course?._id || course?.id}`);
        setShowPlayer(true);
    };

    const handleNextLesson = () => {
        if (!course || !currentLesson) return;

        // Use currentLesson IDs to ensure we mark the right thing before leaving
        const currentId = (currentLesson.id || currentLesson._id || "") as string;
        markItemAsCompleted(currentId);

        let found = false;
        const allLessons = course.modules.flatMap(m => m.lessons);
        for (const l of allLessons) {
            const lessonIdStr = (l.id || l._id || "") as string;
            if (found) {
                handleSelectLesson(lessonIdStr);
                return;
            }
            if (l.id === currentId || l._id === currentId) found = true;
        }
    };

    const handleVideoEnded = useCallback(() => {
        markItemAsCompleted(initialLessonId);
    }, [initialLessonId, markItemAsCompleted]);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center bg-white dark:bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                    <span className="text-sm font-bold text-slate-400">Loading Learning Experience</span>
                </div>
            </div>
        );
    }

    if (!currentLesson || !course) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-900 gap-6">
                <h1 className="text-2xl font-bold">Lesson Not Found</h1>
                <Link href="/student/courses">
                    <Button>Back to Catalogue</Button>
                </Link>
            </div>
        );
    }

    const allLessons = course.modules.flatMap(m => m.lessons);
    const allExercises = course.modules.flatMap(m => [
        ...m.lessons.flatMap(l => l.exercises || []),
        ...(m.exercises || [])
    ]);

    // Use unique IDs to avoid double counting items

    // Unified granular counting logic
    const getCompletedCount = () => {
        const doneVideos = allLessons.filter(l =>
            (l.id && completedItems.includes(l.id)) || (l._id && completedItems.includes(l._id))
        ).length;

        const doneExs = allExercises.filter(ex =>
            (ex.id && completedItems.includes(ex.id)) || (ex._id && completedItems.includes(ex._id))
        ).length;

        return doneVideos + doneExs;
    };

    const completedCount = getCompletedCount();
    const progressPercent = totalItemsCount > 0
        ? Math.round((completedCount / totalItemsCount) * 100)
        : 0;
    // Logic to prevent skipping
    const isLessonFinished = (lesson: Lesson) => {
        const videoDone = (lesson.id && completedItems.includes(lesson.id)) ||
            (lesson._id && completedItems.includes(lesson._id));

        const exercisesDone = (lesson.exercises || []).every(ex =>
            (ex.id && completedItems.includes(ex.id)) ||
            (ex._id && completedItems.includes(ex._id))
        );
        return !!videoDone && exercisesDone;
    };

    const currentLessonIndex = allLessons.findIndex(l => l.id === initialLessonId || l._id === initialLessonId);
    const isCurrentLessonFinished = currentLesson ? isLessonFinished(currentLesson) : false;

    // A lesson is locked if any previous lesson is not finished
    const isLocked = (index: number) => {
        if (index <= 0) return false;
        // If already finished, it's not locked anymore
        if (isLessonFinished(allLessons[index])) return false;

        for (let i = 0; i < index; i++) {
            if (!isLessonFinished(allLessons[i])) return true;
        }
        return false;
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#0f172a] overflow-hidden">
            {/* Minimal Header */}


            <div className="flex-1 overflow-hidden relative">
                {/* Curriculum View */}
                {!showPlayer ? (
                    <ScrollArea className="h-full bg-slate-50/30 dark:bg-transparent">
                        <CurriculumOverview
                            course={course}
                            onSelectLesson={handleSelectLesson}
                            completedItems={completedItems}
                        />
                    </ScrollArea>
                ) : (
                    /* Player View */
                    <div className="flex flex-col lg:flex-row h-full min-h-0 overflow-y-auto lg:overflow-hidden">
                        <div className="flex-1 flex flex-col min-w-0">
                            <div className="flex-1 lg:overflow-y-auto custom-scrollbar">
                                <div className="flex flex-col w-full">
                                    <VideoArea
                                        currentLesson={currentLesson}
                                        course={course}
                                        onEnded={handleVideoEnded}
                                    />
                                    <ContentTabs
                                        currentLesson={currentLesson}
                                        course={course}
                                        onExerciseComplete={(exId) => markItemAsCompleted(exId)}
                                        completedItems={completedItems}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="w-full lg:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-slate-200 dark:border-slate-800">
                            <PlayerSidebar
                                course={course}
                                lessonId={initialLessonId}
                                allLessons={allLessons}
                                handleNextLesson={handleNextLesson}
                                completedItems={completedItems}
                                totalItemsCount={totalItemsCount}
                                isNextDisabled={!isCurrentLessonFinished}
                                isLessonLocked={isLocked}
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Congratulations Modal */}
            {showCongrats && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-900/80 backdrop-blur-xl animate-in fade-in duration-500">
                    <div className="bg-white dark:bg-slate-950 w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-white/20 dark:border-slate-800/50 animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-out relative">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowCongrats(false)}
                            className="absolute top-6 right-6 sm:top-8 sm:right-8 size-10 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors z-10"
                        >
                            <X className="size-5" />
                        </button>
                        <div className="relative p-10 text-center space-y-8">
                            {/* Decorative Elements */}
                            <div className="absolute top-10 left-10 opacity-20 animate-bounce">
                                <Sparkles className="size-8 text-amber-500" />
                            </div>
                            <div className="absolute bottom-10 right-10 opacity-20 animate-bounce delay-300">
                                <PartyPopper className="size-8 text-blue-500" />
                            </div>

                            {/* Centered Icon */}
                            <div className="flex justify-center">
                                <div className="size-28 rounded-[2.5rem] bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center shadow-2xl shadow-orange-500/30 relative group">
                                    <Trophy className="size-14 text-white group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 rounded-[2.5rem] bg-white opacity-20 animate-ping pointer-events-none" />
                                </div>
                            </div>

                            {/* Content */}
                            <div className="space-y-4">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Bravo, {course.title}! 🏆
                                </h2>
                                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-600 mt-0.5">
                                    {completedCount} / {totalItemsCount} items completed
                                </span>
                                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-sm mx-auto">
                                    Vous avez complété 100% du cours avec succès. Votre détermination est exemplaire !
                                </p>
                            </div>

                            {/* Stats Summary */}
                            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Items Mastery</p>
                                    <p className="text-xl font-black text-slate-900 dark:text-white">{completedCount}/{totalItemsCount}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Final Status</p>
                                    <div className="flex items-center justify-center gap-1.5 text-emerald-500 font-black">
                                        <CheckCircle2 className="size-4" />
                                        <span>CERTIFIED</span>
                                    </div>
                                </div>
                            </div>

                            {/* Rating Section */}
                            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                                <CourseRating
                                    courseId={course._id || course.id}
                                    onSuccess={() => {
                                        // Optional: Do something when rated
                                    }}
                                />
                            </div>

                            {/* Buttons */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                                <Button
                                    onClick={() => setShowCongrats(false)}
                                    className="h-14 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest"
                                >
                                    Continue Exploring
                                </Button>
                                <Link href={`/student/certificates/${course._id || course.id}`}>
                                    <Button
                                        className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 w-full"
                                    >
                                        View Certificate
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
