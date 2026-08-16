'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getCourseById, getCourseStudents, getStudentProgress, Course, deleteCourse, update as updateCourse } from '@/data/courses';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useLanguage } from '@/context/language-context';
import { cn } from "@/lib/utils";
import { CourseDetailsContent } from '@/components/courses/course-details-content';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from 'sonner';
import {
    Edit3,
    ArrowLeft,
    BarChart,
    Users,
    Globe,
    CheckCircle,
    Clock,
    Settings,
    LayoutDashboard,
    FileText,
    AlertCircle,
    AlertTriangle,
    Circle,
    CheckCircle2,
    X,
    ChevronDown,
    ChevronUp,
    Trophy,
    Calendar,
    Mail,
    Monitor,
    Book
} from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

function EnrollmentChart({ students }: { students: any[] }) {
    // Generate data for the last 30 days, grouped by 5-day intervals
    const chartData = React.useMemo(() => {
        const data = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
            const endDate = new Date();
            endDate.setDate(now.getDate() - i * 5);
            endDate.setHours(23, 59, 59, 999);
            
            const startDate = new Date();
            startDate.setDate(now.getDate() - (i + 1) * 5 + 1);
            startDate.setHours(0, 0, 0, 0);

            const count = students.filter(student => {
                if (!student.enrolledAt) return false;
                const enrollDate = new Date(student.enrolledAt);
                return enrollDate >= startDate && enrollDate <= endDate;
            }).length;

            const label = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
            data.push({ label, count });
        }
        return data;
    }, [students]);

    const maxCount = Math.max(...chartData.map(d => d.count), 4);

    return (
        <div className="w-full h-full flex flex-col justify-end pt-4">
            <div className="flex-1 flex items-end gap-3 px-2 sm:px-6 relative min-h-[140px]">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 dark:opacity-10 py-1">
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                    <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
                </div>

                {chartData.map((data, index) => {
                    const heightPercent = (data.count / maxCount) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col items-end justify-end h-full group relative z-10">
                            {/* Tooltip on Hover */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 scale-0 group-hover:scale-100 transition-all bg-slate-950 dark:bg-slate-50 text-white dark:text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-bold shadow-xl whitespace-nowrap z-20 pointer-events-none">
                                {data.count} {data.count <= 1 ? 'student' : 'students'}
                            </div>

                            {/* Bar */}
                            <div className="w-full max-w-[48px] bg-slate-100/50 dark:bg-slate-800/30 rounded-t-lg overflow-hidden h-full flex items-end justify-center min-h-[6px] mx-auto">
                                <div 
                                    className="w-full bg-gradient-to-t from-violet-600 to-indigo-500 rounded-t-lg transition-all duration-700 ease-out group-hover:from-violet-500 group-hover:to-indigo-400"
                                    style={{ height: `${Math.max(heightPercent, 3)}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {/* X Axis Labels */}
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800/50 pt-3 mt-2 px-2 sm:px-6">
                {chartData.map((data, index) => (
                    <span key={index} className="flex-1 text-center text-[10px] sm:text-xs font-bold text-muted-foreground whitespace-nowrap">
                        {data.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

export default function InstructorCoursePreviewPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const { dir } = useLanguage();
    const [course, setCourse] = useState<Course | null>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [expandedModules, setExpandedModules] = useState<string[]>([]);

    useEffect(() => {
        const fetchCourseData = async () => {
            if (!courseId) return;
            setLoading(true);
            try {
                const data = await getCourseById(courseId);
                if (data) {
                    setCourse(data);
                    // Fetch students
                    setLoadingStudents(true);
                    const studentsData = await getCourseStudents(data._id || data.id || courseId);

                    // Calculate total items in course
                    const allLessons = data.modules?.flatMap((m: any) => m.lessons || []) || [];
                    const allExercises = data.modules?.flatMap((m: any) => [
                        ...(m.lessons?.flatMap((l: any) => l.exercises || []) || []),
                        ...(m.exercises || [])
                    ]) || [];
                    const totalItems = allLessons.length + allExercises.length;

                    // Fetch progress for each student
                    const studentsWithProgress = await Promise.all(studentsData.map(async (student: any) => {
                        try {
                            const completedItems = await getStudentProgress(data._id || data.id || courseId, student.id);
                            const percentage = totalItems > 0 ? Math.round((completedItems.length / totalItems) * 100) : 0;
                            return { ...student, progress: percentage, completedItems };
                        } catch (e) {
                            return { ...student, progress: 0, completedItems: [] };
                        }
                    }));

                    setStudents(studentsWithProgress);
                }
            } catch (err) {
                console.error("Failed to load course details", err);
            } finally {
                setLoading(false);
                setLoadingStudents(false);
            }
        };
        fetchCourseData();
    }, [courseId]);

    const handleDelete = async () => {

        setIsDeleting(true);
        try {
            if ((course?.students || 0) > 0) {
                await updateCourse(course?._id || courseId, { isArchived: true });
                toast.success("Course archived successfully.", { description: "Enrolled students will retain access." });
            } else {
                await deleteCourse(course?._id || courseId);
                toast.success("Course permanently deleted.");
            }
            router.push('/instructor/courses');
        } catch (error) {
            if (error instanceof Error) {
                toast.error("Action failed", { description: error.message });
            }
            setIsDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground font-medium animate-pulse">Loading course data...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="h-[60vh] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="size-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-slate-400">sentiment_dissatisfied</span>
                </div>
                <div>
                    <h1 className="text-2xl font-black mb-2">Course Not Found</h1>
                    <p className="text-muted-foreground max-w-md mx-auto">
                        The course you are looking for does not exist or has been removed.
                    </p>
                </div>
                <Button onClick={() => router.push('/instructor/courses')} variant="default" className="font-bold">
                    Back to My Courses
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-full pb-20 space-y-8 px-6 max-w-[1600px] mx-auto">
            {/* Top Navigation & Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-6 border-b border-border/50">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/instructor/courses')}
                        className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-muted-foreground"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to List
                    </Button>
                    <div className="h-6 w-px bg-border/60 hidden md:block"></div>

                    <div>
                        <h1 className="text-2xl font-black tracking-tight leading-none mb-1">{course.title}</h1>
                        <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-200 uppercase tracking-wider font-bold text-[10px] px-2 py-0.5 gap-1">
                                <CheckCircle className="w-3 h-3" /> Published
                            </Badge>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Public
                            </span>
                            <span className="text-xs text-muted-foreground font-medium flex items-center gap-1 ml-2">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                Last updated: {course.lastUpdated || 'Recently'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link href={`/instructor/courses/upload?edit=${courseId}`}>
                        <Button variant="outline" className="font-bold gap-2 border-primary/20 text-primary hover:bg-primary/5 h-10">
                            <Edit3 className="w-4 h-4" />
                            Edit Course
                        </Button>
                    </Link>

                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full space-y-6">
                <TabsList className="w-full justify-start h-12 bg-transparent p-0 border-b border-slate-200 dark:border-slate-800 rounded-none gap-8">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-slate-500 data-[state=active]:text-primary transition-all"
                    >
                        <LayoutDashboard className="w-4 h-4 mr-2" /> Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="content"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-slate-500 data-[state=active]:text-primary transition-all"
                    >
                        <FileText className="w-4 h-4 mr-2" /> Curriculum Preview
                    </TabsTrigger>
                    <TabsTrigger
                        value="students"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-slate-500 data-[state=active]:text-primary transition-all"
                    >
                        <Users className="w-4 h-4 mr-2" /> Students
                    </TabsTrigger>
                    <TabsTrigger
                        value="settings"
                        className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0 font-bold text-slate-500 data-[state=active]:text-primary transition-all"
                    >
                        <Settings className="w-4 h-4 mr-2" /> Settings
                    </TabsTrigger>
                </TabsList>

                {/* OVERVIEW TAB */}
                <TabsContent value="overview" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Students</p>
                                <p className="text-2xl font-black mt-1">{Number(course.students || 0)}</p>
                            </div>
                        </div>
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="size-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                                <span className="material-symbols-outlined text-2xl">star</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Average Rating</p>
                                <p className="text-2xl font-black mt-1">{Number(course.rating || 0).toFixed(1)}</p>
                            </div>
                        </div>
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600">
                                <span className="material-symbols-outlined text-2xl">payments</span>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Total Revenue</p>
                                <p className="text-2xl font-black mt-1">${(Number(course.students || 0) * Number(course.price || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm flex items-center gap-4 hover:border-primary/20 transition-colors">
                            <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <Clock className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Course Duration</p>
                                <p className="text-2xl font-black mt-1">{course.duration || '0h 0m'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2 border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Enrollments Overview</CardTitle>
                                <CardDescription>Student registrations over the last 30 days</CardDescription>
                            </CardHeader>
                            <CardContent className="h-64 m-6 mt-0">
                                <EnrollmentChart students={students} />
                            </CardContent>
                        </Card>

                        <Card className="border-border shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-bold">Course Details</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground font-medium">Status</span>
                                    <Badge variant="secondary" className="font-bold text-xs bg-emerald-500/10 text-emerald-600">Published</Badge>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground font-medium">Category</span>
                                    <span className="text-sm font-bold">{course.category}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground font-medium">Level</span>
                                    <span className="text-sm font-bold">{course.level}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground font-medium">Language</span>
                                    <span className="text-sm font-bold">English</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-border/50">
                                    <span className="text-sm text-muted-foreground font-medium">Created</span>
                                    <span className="text-sm font-bold">Feb 17, 2026</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* CONTENT PREVIEW TAB */}
                <TabsContent value="content" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">


                    <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 p-2 md:p-8 bg-white dark:bg-slate-950/50">
                        <CourseDetailsContent course={course} isInstructorView={true} />
                    </div>
                </TabsContent>

                {/* STUDENTS TAB */}
                <TabsContent value="students" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-border shadow-sm overflow-hidden">
                        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/20 border-b border-border">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black">Enrolled Students</CardTitle>
                                    <CardDescription>Manage and view students enrolled in this course.</CardDescription>
                                </div>
                                <Badge className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors px-3 py-1 rounded-full font-bold">
                                    {students.length} Total Students
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loadingStudents ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-sm font-medium text-muted-foreground">Loading student roster...</p>
                                </div>
                            ) : students.length === 0 ? (
                                <div className="text-center py-24">
                                    <div className="size-20 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200 dark:border-slate-700">
                                        <Users className="w-10 h-10 text-slate-300" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No students yet</h3>
                                    <p className="text-slate-500 max-w-sm mx-auto">
                                        Invite students or promote your course to see your roster grow here!
                                    </p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                                        <TableRow className="border-border hover:bg-transparent">
                                            <TableHead className="font-bold py-4">Student</TableHead>
                                            <TableHead className="font-bold">Email</TableHead>
                                            <TableHead className="font-bold">Progress</TableHead>
                                            <TableHead className="font-bold">Enrolled Date</TableHead>
                                            <TableHead className="font-bold">Amount Paid</TableHead>
                                            <TableHead className="font-bold text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {students.map((student) => (
                                            <TableRow key={student.id} className="border-border hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors group">
                                                <TableCell className="py-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="size-10 border-2 border-white dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                                                            <AvatarImage src={student.avatar} alt={student.name} />
                                                            <AvatarFallback className="bg-primary/5 text-primary font-bold">
                                                                {student.name.charAt(0)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">{student.name}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium">{student.email}</TableCell>
                                                <TableCell className="min-w-[150px]">
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                                                            <span className={student.progress === 100 ? "text-emerald-500" : "text-blue-500"}>
                                                                {student.progress}% Complete
                                                            </span>
                                                        </div>
                                                        <Progress value={student.progress} className="h-1.5 bg-slate-100 dark:bg-slate-800" indicatorClassName={student.progress === 100 ? "bg-emerald-500" : "bg-blue-500"} />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium">
                                                    {new Date(student.enrolledAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="font-black text-emerald-600 dark:text-emerald-400">
                                                    ${Number(student.pricePaid || 0).toFixed(2)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedStudent(student);
                                                            // Auto-expand first module
                                                            if (course?.modules?.[0]) {
                                                                setExpandedModules([course.modules[0].id || course.modules[0]._id || '']);
                                                            }
                                                        }}
                                                        className="rounded-xl font-bold hover:bg-primary/10 hover:text-primary transition-all"
                                                    >
                                                        Details
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* SETTINGS TAB */}
                <TabsContent value="settings" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <Card className="border-red-100 dark:border-red-900/20 shadow-none">
                        <CardHeader className="border-b border-red-100 dark:border-red-900/20 bg-red-50/50 dark:bg-red-900/5">
                            <CardTitle className="text-red-900 dark:text-red-400 flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                Danger Zone
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white">Delete Course</h3>
                                    <p className="text-sm text-slate-500 mt-1 max-w-lg">
                                        Once you delete a course, there is no going back. Please be certain. All associated modules, lessons, and student progress will be permanently removed.
                                    </p>
                                </div>
                                <Button
                                    variant="destructive"
                                    onClick={() => setShowDeleteDialog(true)}
                                    disabled={isDeleting}
                                    className="font-bold hover:bg-red-600 transition-colors"
                                >
                                    {isDeleting ? 'Deleting...' : 'Delete this Course'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Premium Delete Confirmation Dialog */}
            {/* Student Progress Detail Modal - PREMIUM REDESIGN */}
            {selectedStudent && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-500 cursor-pointer"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) setSelectedStudent(null);
                    }}
                >
                    <Card
                        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-[3rem] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.5)] border-white/20 dark:border-slate-800/50 overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 lg:slide-in-from-bottom-20 duration-700 ease-out relative bg-white/90 dark:bg-slate-950/90 cursor-default"
                        onClick={(e) => e.stopPropagation()}
                    >

                        {/* Interactive Dynamic Header */}
                        <CardHeader className="p-0 border-b border-white/10 relative overflow-hidden shrink-0">
                            {/* Decorative Background Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent -z-10" />
                            <div className="absolute -top-24 -right-24 size-64 bg-indigo-500/10 rounded-full blur-3xl" />

                            <div className="pt-2 px-5 sm:pt-3 sm:px-8 pb-3">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-[2rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                                            <Avatar className="size-16 border-4 border-white dark:border-slate-800 shadow-2xl relative transition-transform duration-500 group-hover:scale-105">
                                                <AvatarImage src={selectedStudent.avatar} alt={selectedStudent.name} />
                                                <AvatarFallback className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 text-indigo-600 dark:text-indigo-400 text-xl font-black">
                                                    {selectedStudent.name.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 size-7 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full shadow-lg" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase text-indigo-600 border-indigo-200 bg-indigo-50/50">Student Profile</Badge>
                                                <span className="text-[10px] font-bold text-slate-400">/ {course?.title}</span>
                                            </div>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400">
                                                {selectedStudent.name}
                                            </h3>
                                            <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 font-medium">
                                                <Mail className="size-3 text-indigo-500/50" />
                                                <span className="text-xs">{selectedStudent.email}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedStudent(null)}
                                        className="rounded-2xl size-10 bg-white/50 dark:bg-slate-800/50 hover:bg-red-500/10 hover:text-red-500 text-slate-500 transition-all border border-transparent hover:border-red-500/20 shadow-sm relative z-50 cursor-pointer"
                                    >
                                        <X className="size-5" />
                                    </Button>
                                </div>

                                {/* Refined Summary Stats */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm p-5 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group/stat overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/stat:opacity-10 transition-opacity">
                                            <Trophy className="size-16 text-indigo-600" />
                                        </div>
                                        <div className="flex flex-col gap-3 relative text-left">
                                            <div className="flex items-center gap-2">
                                                <div className="size-7 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                                    <Trophy className="size-3.5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Mastery Progress</span>
                                            </div>
                                            <div className="flex items-end justify-between">
                                                <span className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {selectedStudent.progress}%
                                                </span>
                                                <div className="w-24 h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={cn(
                                                            "h-full transition-all duration-1000 ease-out rounded-full shadow-[0_0_12px_rgba(0,0,0,0.1)]",
                                                            selectedStudent.progress === 100
                                                                ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
                                                                : "bg-gradient-to-r from-indigo-500 to-violet-600"
                                                        )}
                                                        style={{ width: `${selectedStudent.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-white/50 dark:bg-slate-900/40 backdrop-blur-sm p-5 rounded-[2.5rem] border border-white/20 dark:border-white/5 shadow-xl shadow-slate-200/20 dark:shadow-none group/stat overflow-hidden relative text-left">
                                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/stat:opacity-10 transition-opacity">
                                            <Calendar className="size-16 text-violet-600" />
                                        </div>
                                        <div className="flex flex-col gap-3 relative">
                                            <div className="flex items-center gap-2">
                                                <div className="size-7 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                                                    <Calendar className="size-3.5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Learning Since</span>
                                            </div>
                                            <span className="text-lg font-black text-slate-900 dark:text-white">
                                                {new Date(selectedStudent.enrolledAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-0 overflow-y-auto custom-scrollbar flex-1 bg-white/30 dark:bg-transparent">
                            <div className="p-5 sm:p-6 space-y-5">
                                <div className="flex items-center justify-between px-2 text-left">
                                    <h4 className="text-[11px] font-black uppercase text-slate-400 tracking-[0.3em]">Interactive Curriculum Path</h4>
                                    <div className="flex gap-1.5">
                                        <div className="size-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                        <div className="size-1.5 rounded-full bg-violet-500 animate-pulse delay-75" />
                                        <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse delay-150" />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {course.modules.map((module, mIdx) => {
                                        const moduleId = module.id || module._id || '';
                                        const isExpanded = expandedModules.includes(moduleId);
                                        const completedInModule = (module.lessons?.filter(l => selectedStudent.completedItems?.includes(l.id || l._id || ''))?.length || 0) +
                                            (module.exercises?.filter(e => selectedStudent.completedItems?.includes(e.id || e._id || ''))?.length || 0);
                                        const totalInModule = (module.lessons?.length || 0) + (module.exercises?.length || 0);
                                        const isFinished = completedInModule === totalInModule && totalInModule > 0;

                                        return (
                                            <div
                                                key={moduleId}
                                                className={cn(
                                                    "group/module border transition-all duration-300 rounded-2xl overflow-hidden",
                                                    isFinished
                                                        ? "bg-emerald-50/20 dark:bg-emerald-500/5 border-emerald-100/50 dark:border-emerald-500/10"
                                                        : "bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800"
                                                )}
                                            >
                                                <button
                                                    onClick={() => setExpandedModules(prev =>
                                                        isExpanded ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
                                                    )}
                                                    className="w-full flex items-center justify-between p-4 transition-colors"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "size-9 rounded-xl flex items-center justify-center text-[10px] font-black transition-all shadow-sm",
                                                            isFinished
                                                                ? "bg-emerald-500 text-white shadow-emerald-500/20 rotate-12"
                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover/module:bg-indigo-500 group-hover/module:text-white group-hover/module:rotate-12"
                                                        )}>
                                                            {isFinished ? <CheckCircle2 className="size-4" /> : `${completedInModule}/${totalInModule}`}
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block mb-0">Module {mIdx + 1}</span>
                                                            <span className="font-bold text-sm text-slate-900 dark:text-white tracking-tight leading-tight">{module.title}</span>
                                                        </div>
                                                    </div>
                                                    <div className={cn(
                                                        "size-8 rounded-lg bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center border border-transparent transition-all",
                                                        isExpanded ? "rotate-180 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600" : "text-slate-400"
                                                    )}>
                                                        <ChevronDown className="size-4" />
                                                    </div>
                                                </button>

                                                {isExpanded && (
                                                    <div className="px-4 pb-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {[...(module.lessons || []), ...(module.exercises || [])].map((item: any) => {
                                                            const itemId = item.id || item._id || '';
                                                            const isDone = selectedStudent.completedItems?.includes(itemId);
                                                            const isExercise = !!item.language || !!item.options;

                                                            return (
                                                                <div
                                                                    key={itemId}
                                                                    className={cn(
                                                                        "flex items-center justify-between p-3 rounded-xl transition-all duration-300 border backdrop-blur-sm",
                                                                        isDone
                                                                            ? "bg-white/80 dark:bg-white/5 border-emerald-500/10"
                                                                            : "bg-slate-50/50 dark:bg-slate-900/10 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                                                                    )}
                                                                >
                                                                    <div className="flex items-center gap-3 text-left">
                                                                        <div className={cn(
                                                                            "size-6 rounded-lg flex items-center justify-center transition-all",
                                                                            isDone
                                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                                                                : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-700"
                                                                        )}>
                                                                            {isDone ? <CheckCircle2 className="size-3" /> : (isExercise ? <Book className="size-3" /> : <Circle className="size-3" />)}
                                                                        </div>
                                                                        <div className="flex flex-col">
                                                                            <span className={cn(
                                                                                "text-xs font-bold tracking-tight",
                                                                                isDone ? "text-slate-900 dark:text-white" : "text-slate-400"
                                                                            )}>
                                                                                {item.title}
                                                                            </span>
                                                                            <span className="text-[8px] font-black uppercase text-slate-400 tracking-[0.1em]">{item.type}</span>
                                                                        </div>
                                                                    </div>
                                                                    {isDone && (
                                                                        <Badge className="bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 border-none text-[8px] font-black uppercase tracking-widest px-1.5 py-0">
                                                                            Done
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>

                        <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-950 shrink-0">
                            <Button
                                className="w-full rounded-2xl font-black h-12 text-xs uppercase tracking-widest bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-200 dark:text-slate-900 text-white shadow-2xl transition-all active:scale-[0.98]"
                                onClick={() => setSelectedStudent(null)}
                            >
                                Close Detailed View
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                    <div className="bg-red-500/10 p-6 flex items-center gap-4 border-b border-red-500/10">
                        <div className="size-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                                {(course.students || 0) > 0 ? "Archive Course" : "Permanent Delete"}
                            </AlertDialogTitle>
                            <p className={cn("text-sm font-bold", (course.students || 0) > 0 ? "text-amber-600 dark:text-amber-400" : "text-red-600 dark:text-red-400")}>
                                {(course.students || 0) > 0 ? "Soft Deletion" : "Irreversible Action"}
                            </p>
                        </div>
                    </div>

                    <div className="p-6">
                        <AlertDialogDescription asChild className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                            <div>
                                {(course.students || 0) > 0 ? (
                                    <>You are about to archive <span className="font-bold text-slate-900 dark:text-white">&quot;{course.title}&quot;</span>. It will be hidden from the catalog.</>
                                ) : (
                                    <>Are you absolutely sure? You are about to permanently remove <span className="font-bold text-slate-900 dark:text-white">&quot;{course.title}&quot;</span>.</>
                                )}
                                {(course.students || 0) > 0 && (
                                    <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/20 flex gap-3 text-sm text-amber-800 dark:text-amber-400">
                                        <AlertCircle className="w-5 h-5 shrink-0" />
                                        <p><span className="font-bold">{course.students}</span> students currently enrolled will retain access to the course content via their dashboard.</p>
                                    </div>
                                )}
                            </div>
                        </AlertDialogDescription>
                    </div>

                    <AlertDialogFooter className="p-6 pt-0 flex gap-3">
                        <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className={cn("flex-1 h-12 rounded-xl font-bold text-white shadow-lg transition-all active:scale-95", (course.students || 0) > 0 ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/20" : "bg-red-600 hover:bg-red-700 shadow-red-600/20")}
                        >
                            {(course.students || 0) > 0 ? "Confirm Archive" : "Confirm Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
