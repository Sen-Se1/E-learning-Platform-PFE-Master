"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { getAllCourses, getCourseById, Course, getMyEnrolledCourses } from "@/data/courses"
import { useUserStore } from "@/lib/store"
import Link from "next/link"

export default function StudentDashboardPage() {
    const { user } = useUserStore()
    const [courses, setCourses] = useState<Course[]>([])
    const [courseProgress, setCourseProgress] = useState<Record<string, { percent: number, completedCount: number, totalCount: number, completedIds?: string[], lastLessonId?: string }>>({})
    const [loading, setLoading] = useState(true)

    const [activities, setActivities] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")

    // Helper to format "time ago"
    const formatTimeAgo = (dateInput: string) => {
        const now = new Date();
        const past = new Date(dateInput);
        const diffInMs = now.getTime() - past.getTime();
        const diffInMins = Math.floor(diffInMs / (1000 * 60));
        const diffInHours = Math.floor(diffInMins / 60);
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInMins < 1) return "Just now";
        if (diffInMins < 60) return `${diffInMins}m ago`;
        if (diffInHours < 24) return `${diffInHours}h ago`;
        return `${diffInDays}d ago`;
    };

    // Helper to parse duration string (e.g., "15m", "1h 30m") to minutes
    const parseDurationToMinutes = (duration?: string) => {
        if (!duration) return 0;
        let total = 0;
        const hours = duration.match(/(\d+)h/);
        const mins = duration.match(/(\d+)m/);
        if (hours) total += parseInt(hours[1]) * 60;
        if (mins) total += parseInt(mins[1]);
        return total || parseInt(duration) || 0; // Fallback to raw number if no units
    };

    // Helper to calculate streak from activity log
    const calculateStreak = (activityLog: any[]) => {
        if (!activityLog || activityLog.length === 0) return { current: 0, totalDays: 0 };

        // Helper to get YYYY-MM-DD in local time
        const getLocalDateStr = (d: Date | string) => {
            const date = new Date(d);
            return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        // Get unique dates (YYYY-MM-DD) sorted descending
        const dates = Array.from(new Set(activityLog.map(a => getLocalDateStr(a.timestamp))))
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        const totalDays = dates.length;
        const today = getLocalDateStr(new Date());
        const yesterdayDate = new Date();
        yesterdayDate.setDate(yesterdayDate.getDate() - 1);
        const yesterday = getLocalDateStr(yesterdayDate);

        // Check if streak is still alive (activity today or yesterday)
        if (dates[0] !== today && dates[0] !== yesterday) return { current: 0, totalDays };

        let streak = 0;
        const checkDate = new Date(dates[0]);

        for (let i = 0; i < dates.length; i++) {
            const dateStr = dates[i];
            const checkDateStr = getLocalDateStr(checkDate);

            if (dateStr === checkDateStr) {
                streak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }
        return { current: streak, totalDays };
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true)
            try {
                // Fetch ONLY enrolled courses from the new inscriptionService
                const basicCourses = await getMyEnrolledCourses()

                // DISCOVERY PHASE: Scan localStorage for courses with progress not in basicCourses
                const discoveredIds = new Set<string>();
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key?.startsWith('progress_')) {
                        const id = key.replace('progress_', '');
                        if (id !== 'default') discoveredIds.add(id);
                    }
                }

                // Add discovered IDs to basicCourses list if not already there
                const existingIds = new Set(basicCourses.map(c => c._id || c.id));
                const missingIds = Array.from(discoveredIds).filter(id => !existingIds.has(id));

                // Fetch full course details for each to ensure we have all lessons/exercises for counting
                const fullCoursesResults = await Promise.all([
                    ...basicCourses.map(async (c) => {
                        const detail = await getCourseById(c._id || c.id).catch(() => null);
                        return detail || c;
                    }),
                    ...missingIds.map(async (id) => {
                        return await getCourseById(id).catch(() => null);
                    })
                ]);

                const fullCourses = fullCoursesResults.filter(Boolean) as Course[];

                const progressMap: Record<string, any> = {};

                const userObj = useUserStore.getState().user;
                const userId = userObj ? (userObj.id || (userObj as any)._id) : null;

                await Promise.all(fullCourses.map(async (course: Course) => {
                    const stableKey = course._id || course.id;
                    const idKey = course.id;
                    const _idKey = course._id;

                    let rawCompletedIds: string[] = [];

                    if (userId) {
                        try {
                            const token = localStorage.getItem('user-token');
                            const res = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/course-progress/${stableKey}?userId=${userId}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (res.ok) {
                                const data = await res.json();
                                if (data && data.data && data.data.length > 0) {
                                    rawCompletedIds = data.data;
                                }
                            }
                        } catch (e) {
                            console.error("Failed to load progress from backend", e);
                        }
                    }

                    if (rawCompletedIds.length === 0) {
                        const saved1 = idKey ? localStorage.getItem(`progress_${idKey}`) : null;
                        const saved2 = _idKey ? localStorage.getItem(`progress_${_idKey}`) : null;

                        rawCompletedIds = Array.from(new Set([
                            ...(saved1 ? JSON.parse(saved1) : []),
                            ...(saved2 ? JSON.parse(saved2) : [])
                        ]));
                    }

                    const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
                    const allExercises = course.modules?.flatMap(m => [
                        ...(m.lessons || []).flatMap(l => l.exercises || []),
                        ...(m.exercises || [])
                    ]) || [];

                    const completedCount =
                        allLessons.filter(l => rawCompletedIds.includes(l.id) || (l._id && rawCompletedIds.includes(l._id))).length +
                        allExercises.filter(ex => rawCompletedIds.includes(ex.id) || (ex._id && rawCompletedIds.includes(ex._id))).length;

                    const totalCount = allLessons.length + allExercises.length;

                    const percent = totalCount > 0
                        ? Math.round((completedCount / totalCount) * 100)
                        : 0;

                    const firstUncompleted = allLessons.find(l => {
                        const id = l.id || l._id;
                        return id && !rawCompletedIds.includes(id);
                    });

                    progressMap[stableKey] = {
                        percent,
                        completedCount,
                        totalCount,
                        completedIds: rawCompletedIds,
                        lastLessonId: firstUncompleted?.id || firstUncompleted?._id || allLessons[0]?.id || allLessons[0]?._id
                    };
                }));

                setCourseProgress(progressMap);

                // Fetch User Activities Logs
                let activityLog = [];
                if (userId) {
                    try {
                        const token = localStorage.getItem('user-token');
                        const res = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL as string}/activities?userId=${userId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        if (res.ok) {
                            const data = await res.json();
                            if (data && data.data) {
                                activityLog = data.data;
                            }
                        }
                    } catch (e) {
                        console.error('Failed to fetch activity log', e);
                    }
                }

                // Fallback to localStorage if no backend logs
                if (activityLog.length === 0) {
                    const localLog = localStorage.getItem('activity_log');
                    if (localLog) {
                        activityLog = JSON.parse(localLog);
                    }
                }

                setActivities(activityLog);

                // Filter: prioritize courses with progress, then others
                const sortedCourses = [...fullCourses].sort((a, b) => {
                    const pA = progressMap[a.id]?.percent || 0
                    const pB = progressMap[b.id]?.percent || 0
                    return pB - pA
                });

                setCourses(sortedCourses)
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
            }
            setLoading(false)
        }

        fetchDashboardData()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 gap-4">
                <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest text-center">Loading Your Learning Experience...</p>
            </div>
        )
    }

    const totalCompleted = Object.values(courseProgress).reduce((acc, p) => acc + (p.completedCount || 0), 0)
    const totalItems = Object.values(courseProgress).reduce((acc, p) => acc + (p.totalCount || 0), 0)
    const activeCoursesCount = courses.filter(c => (courseProgress[c._id || c.id]?.percent || 0) > 0).length;

    const calculateHoursLearned = () => {
        let totalMins = 0;
        courses.forEach(course => {
            const prog = courseProgress[course._id || course.id];
            const completed = new Set(prog?.completedIds || []);

            // Track time for lessons
            course.modules?.flatMap(m => m.lessons || []).forEach(lesson => {
                const lessonId = lesson.id || lesson._id;
                const realTimeSpent = localStorage.getItem(`time_spent_${lessonId}`);

                if (realTimeSpent) {
                    // time_spent_ is in seconds, convert to minutes
                    totalMins += parseInt(realTimeSpent) / 60;
                } else if (lessonId && completed.has(lessonId)) {
                    // Fallback to static duration only if item is completed but no real-time spent data
                    totalMins += parseDurationToMinutes(lesson.duration);
                }
            });

            // Track time for exercises
            course.modules?.flatMap(m => [
                ...(m.lessons || []).flatMap(l => l.exercises || []),
                ...(m.exercises || [])
            ]).forEach(ex => {
                const exId = ex.id || ex._id;
                const realTimeSpent = localStorage.getItem(`time_spent_${exId}`);

                if (realTimeSpent) {
                    totalMins += parseInt(realTimeSpent) / 60;
                } else if (exId && completed.has(exId)) {
                    totalMins += (ex.timeLimit || 5);
                }
            });
        });

        const h = Math.floor(totalMins / 60);
        const m = Math.round(totalMins % 60);
        return `${h}h:${m < 10 ? '0' + m : m}mn`;
    };

    const streakData = calculateStreak(activities);
    const currentStreak = streakData.current;
    const totalActiveDays = streakData.totalDays;

    // Select featured: highest progress but not finished, else most recently touched or first
    const inProgress = courses
        .filter(c => (courseProgress[c._id || c.id]?.percent || 0) > 0 && (courseProgress[c._id || c.id]?.percent || 0) < 100)

    const continueCourse = inProgress[0] || courses[0]
    const continueProg = continueCourse ? courseProgress[continueCourse._id || continueCourse.id] : null
    const continuePercent = continueProg?.percent || 0

    return (
        <div className="flex flex-col gap-8">
            {/* Page Heading */}
            <div className="mb-4">
                <h1 className="text-3xl font-black tracking-tight text-foreground">Welcome back, {user?.name?.split(' ')[0] || 'Explorer'}</h1>
                <p className="text-muted-foreground mt-1">
                    {activeCoursesCount > 0
                        ? `You're tracking well in ${activeCoursesCount} courses!`
                        : "Ready to start? Select a course to begin your journey."}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Hours Learned", value: calculateHoursLearned(), icon: "schedule", trend: totalCompleted > 0 ? "Productive session!" : "Keep going!" },
                    { label: "Items Completed", value: `${totalCompleted}/${totalItems}`, icon: "terminal", trend: "Real-time sync" },
                    {
                        label: "Current Streak",
                        value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
                        icon: "local_fire_department",
                        trend: currentStreak > 0 ? "You're on fire!" : "Keep learning!",
                        totalInfo: `${totalActiveDays} days active total`
                    },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardContent className="pt-6 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <p className="text-muted-foreground text-sm font-medium">{stat.label}</p>
                                <span className={cn("material-symbols-outlined", i === 2 ? (currentStreak > 0 ? "text-orange-500" : "text-muted-foreground") : "text-primary")}>
                                    {stat.icon}
                                </span>
                            </div>
                            <p className="text-foreground tracking-tight text-3xl font-bold">{stat.value}</p>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-emerald-500 text-sm">
                                    {i === 1 ? 'check_circle' : (i === 2 && currentStreak === 0 ? 'info' : 'trending_up')}
                                </span>
                                <p className="text-emerald-500 text-xs font-bold leading-normal">
                                    {i === 2 ? stat.totalInfo : stat.trend}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Continue Learning Featured Card */}
            {continueCourse && (
                <Card className="relative overflow-hidden border shadow-md">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16"></div>
                    <CardContent className="p-8 flex flex-col md:flex-row gap-8 items-center">
                        <div className="w-full md:w-64 h-40 bg-accent rounded-lg overflow-hidden shrink-0 border">
                            <img
                                src={continueCourse.image}
                                alt={continueCourse.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1 space-y-4">
                            <div>
                                <Badge variant="secondary" className="bg-primary/10 text-primary border-transparent text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                                    {continuePercent === 100 ? "Completed" : continuePercent > 0 ? "In Progress" : "Start New"}
                                </Badge>
                                <h3 className="text-2xl font-extrabold mt-2 tracking-tight">{continueCourse.title}</h3>
                                <p className="text-muted-foreground text-sm mt-1 line-clamp-1">{continueCourse.subtitle || 'Dive back into your learning modules'}</p>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-muted-foreground">Overall Progress</span>
                                    <span className="text-primary">{continuePercent}%</span>
                                </div>
                                <Progress value={continuePercent} className="h-2.5" />
                            </div>
                            <div className="flex flex-wrap gap-4 pt-2">
                                <Link href={`/student/player/${continueProg?.lastLessonId || (continueCourse.modules?.[0]?.lessons?.[0]?.id)}?courseId=${continueCourse.id}`}>
                                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold gap-2 h-11 px-6 shadow-lg shadow-primary/20 active:scale-95 transition-all">
                                        <span className="material-symbols-outlined text-base">play_circle</span>
                                        {continuePercent === 100 ? "Review Material" : continuePercent > 0 ? "Resume Learning" : "Start Module"}
                                    </Button>
                                </Link>
                                <Link href={`/cours/${continueCourse.id}`}>
                                    <Button variant="outline" className="font-bold h-11 px-6">
                                        View Details
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <h2 className="text-xl font-bold text-foreground tracking-tight whitespace-nowrap">Your Enrolled Courses</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <div className="relative flex-1 sm:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Filter courses..."
                                    className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2 text-muted-foreground shrink-0">
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><span className="material-symbols-outlined text-lg">grid_view</span></Button>
                                <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200"><span className="material-symbols-outlined text-lg">list</span></Button>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {courses
                            .filter(course =>
                                course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                course.category?.toLowerCase().includes(searchQuery.toLowerCase())
                            )
                            .map((course, i) => {
                                const prog = courseProgress[course._id || course.id]
                                return (
                                    <Link key={i} href={`/student/player/${prog?.lastLessonId || (course.modules?.[0]?.lessons?.[0]?.id)}?courseId=${course.id}`}>
                                        <Card className="overflow-hidden group hover:shadow-xl transition-all duration-300 cursor-pointer border-slate-100 shadow-sm">
                                            <div
                                                className="h-32 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                                                style={{ backgroundImage: `url(${course.image})` }}
                                            ></div>
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors h-10 line-clamp-2">{course.title}</h4>
                                                </div>
                                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase">
                                                    <Badge variant="outline" className="px-1.5 py-0.5 rounded border-transparent bg-slate-100 text-slate-600 font-black">{course.category || 'COURSE'}</Badge>
                                                    <Badge variant="outline" className="px-1.5 py-0.5 rounded border-transparent bg-slate-100 text-slate-600 font-black">{course.level || 'STUDENT'}</Badge>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <div className="flex justify-between text-[10px] text-muted-foreground font-bold">
                                                        <span>Progress</span>
                                                        <span className="text-primary">{prog?.percent || 0}%</span>
                                                    </div>
                                                    <Progress value={prog?.percent || 0} className="h-1.5 bg-slate-100" />
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        {courses.length > 0 && searchQuery && courses.filter(course =>
                            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            course.category?.toLowerCase().includes(searchQuery.toLowerCase())
                        ).length === 0 && (
                                <div className="col-span-full py-12 text-center">
                                    <span className="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                                    <p className="text-slate-500 font-medium">No courses found matching "{searchQuery}"</p>
                                </div>
                            )}
                    </div>
                </div>

                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-100">
                        <CardHeader className="bg-muted/30 py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">analytics</span>
                                Recommended Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {(() => {
                                const recommendedItems = courses
                                    .filter(c => (courseProgress[c.id]?.percent || 0) < 100)
                                    .slice(0, 3)
                                    .map((course, i) => {
                                        const prog = courseProgress[course._id || course.id];
                                        const completed = new Set(prog?.completedIds || []);

                                        const allItems = (course.modules || []).flatMap(m => [
                                            ...(m.lessons || []).map(l => ({ title: l.title, id: l.id || l._id, type: 'lesson' })),
                                            ...(m.exercises || []).map(e => ({ title: e.title, id: e.id || e._id, type: 'exercise' }))
                                        ]);

                                        const nextItem = allItems.find(item => item.id && !completed.has(item.id as string));
                                        if (!nextItem) return null;

                                        const colors = [
                                            { border: "border-red-500", icon: "priority_high", text: "text-red-500" },
                                            { border: "border-orange-400", icon: "timer", text: "text-orange-400" },
                                            { border: "border-primary", icon: "event", text: "text-primary" }
                                        ][i % 3];

                                        return (
                                            <Link key={i} href={`/student/player/${nextItem.id}?courseId=${course.id}`}>
                                                <div className={cn("flex gap-4 items-start border-l-4 pl-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer group", colors.border)}>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-xs font-bold tracking-tight truncate group-hover:text-primary">{nextItem.title}</p>
                                                        <p className="text-[10px] text-muted-foreground font-medium truncate">{course.title} • Next up</p>
                                                    </div>
                                                    <span className={cn("material-symbols-outlined text-lg", colors.text)}>{colors.icon}</span>
                                                </div>
                                            </Link>
                                        );
                                    }).filter(Boolean);

                                if (recommendedItems.length === 0) {
                                    return (
                                        <div className="py-6 text-center space-y-2">
                                            <div className="size-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-2 text-slate-300">
                                                <span className="material-symbols-outlined text-xl">calendar_today</span>
                                            </div>
                                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No Priority Tasks</p>
                                            <p className="text-[10px] text-slate-400 font-medium px-4">Start your first course to see personalized recommendations.</p>
                                        </div>
                                    );
                                }
                                return recommendedItems;
                            })()}
                            <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 h-8">View My Schedule</Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-100">
                        <CardHeader className="bg-muted/30 py-3 px-4 border-b border-slate-100">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <span className="material-symbols-outlined text-base text-primary">history</span>
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4">
                            {activities.slice(0, 3).map((a, i) => {
                                const isLesson = a.type === 'lesson';
                                const isBadge = a.type === 'badge';

                                return (
                                    <div key={i} className="flex gap-3 items-center">
                                        <div className={cn(
                                            "size-8 rounded-lg flex items-center justify-center shrink-0 shadow-sm",
                                            isLesson ? "bg-blue-100 text-blue-600" : isBadge ? "bg-purple-100 text-purple-600" : "bg-emerald-100 text-emerald-600"
                                        )}>
                                            <span className="material-symbols-outlined text-lg">
                                                {isLesson ? "play_arrow" : isBadge ? "workspace_premium" : "check"}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold truncate">{a.title}</p>
                                            <p className="text-[10px] text-muted-foreground font-medium">
                                                {formatTimeAgo(a.timestamp)} • {a.courseTitle}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                            <Button variant="ghost" className="w-full text-xs font-bold text-muted-foreground hover:bg-muted h-8">View Full History</Button>
                        </CardContent>
                    </Card>

                    <Card className="bg-primary/5 border-primary/10 shadow-sm">
                        <CardContent className="p-4 flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">forum</span>
                                Need help?
                            </h4>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium">Your dedicated mentor is online and ready to assist with any technical issues.</p>
                            <Button variant="outline" className="border-primary/20 text-primary py-2 h-9 text-xs font-bold gap-2 hover:bg-primary/5 rounded-xl transition-all">
                                <span className="material-symbols-outlined text-base">chat</span>
                                Message Mentor
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
