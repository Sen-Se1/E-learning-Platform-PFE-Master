"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { getInstructorCourses, getUniqueStudentCount, Course, deleteCourse, update as updateCourse } from "@/data/courses"
import { useUserStore } from "@/lib/store"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { Trash2, Eye, AlertTriangle } from "lucide-react"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function InstructorCoursesPage() {
    const { user } = useUserStore()
    const [courses, setCourses] = useState<Course[]>([])
    const [allInstructorCourses, setAllInstructorCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [page, setPage] = useState(1)
    const [paginationData, setPaginationData] = useState<{ totalPages: number, totalDocuments: number } | null>(null)
    const [courseToDelete, setCourseToDelete] = useState<string | null>(null)
    const [totalUniqueStudents, setTotalUniqueStudents] = useState(0)

    const fetchCourses = React.useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const instructorId = user.id || (user as any)._id
            if (!instructorId) return

            const allCourses = await getInstructorCourses(instructorId);
            setAllInstructorCourses(allCourses);

            // Filter out archived courses for display
            const activeCourses = allCourses.filter(c => !c.isArchived);

            // Fetch accurate unique student count
            const courseIds = allCourses.map(c => c._id || c.id).filter(id => id);
            if (courseIds.length > 0) {
                const uniqueCount = await getUniqueStudentCount(courseIds);
                setTotalUniqueStudents(uniqueCount);
            }

            // Manual pagination for now as getInstructorCourses returns up to 100
            const itemsPerPage = 9;
            const start = (page - 1) * itemsPerPage;
            const paginatedItems = activeCourses.slice(start, start + itemsPerPage);

            setCourses(paginatedItems);
            setPaginationData({
                totalPages: Math.ceil(activeCourses.length / itemsPerPage),
                totalDocuments: activeCourses.length
            });
        } catch (err) {
            console.error("Failed to fetch courses", err);
        } finally {
            setLoading(false);
        }
    }, [user, page]);

    useEffect(() => {
        fetchCourses();
    }, [user, page, fetchCourses]);

    const handleDelete = async () => {
        if (!courseToDelete) return;

        const targetCourse = allInstructorCourses.find(c => (c._id || c.id) === courseToDelete);

        try {
            if (targetCourse && (targetCourse.students || 0) > 0) {
                await updateCourse(courseToDelete, { isArchived: true });
                toast.success("Course archived successfully.", { description: "Enrolled students will retain access." });
            } else {
                await deleteCourse(courseToDelete);
                toast.success("Course permanently deleted.");
            }
            fetchCourses(); // Refresh list
        } catch (error) {
            if (error instanceof Error) {
                toast.error("Action failed", {
                    description: error.message
                });
            }
        } finally {
            setCourseToDelete(null);
        }
    };


    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-20">
            {/* Header Section with Gradient Background */}
            <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 md:p-12">
                <div className="absolute top-0 right-0 p-12 w-96 h-96 bg-primary/20 rounded-full blur-3xl -mr-48 -mt-48 z-0"></div>
                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2 bg-primary/20 text-primary rounded-xl">
                                <span className="material-symbols-outlined">school</span>
                            </span>
                            <span className="text-primary font-bold tracking-wider uppercase text-xs">Instructor Portal</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-2">
                            My Courses
                        </h1>
                        <p className="text-slate-400 max-w-xl text-lg">
                            Manage your curriculum, track performance, and create new learning experiences.
                        </p>
                    </div>
                    <Link href="/instructor/courses/upload">
                        <Button className="h-12 px-6 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                            <span className="material-symbols-outlined mr-2">add_circle</span>
                            Create New Course
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-card/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                            <span className="material-symbols-outlined text-2xl">library_books</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Total Courses</p>
                            <h3 className="text-2xl font-black">{paginationData?.totalDocuments || courses.length}</h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <span className="material-symbols-outlined text-2xl">group</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Active Students</p>
                            <h3 className="text-2xl font-black">
                                {totalUniqueStudents || (() => {
                                    let totalEnrollments = 0;
                                    allInstructorCourses.forEach(c => {
                                        totalEnrollments += Number(c.students || 0);
                                    });
                                    return totalEnrollments > 0 ? 1 : 0;
                                })()}
                            </h3>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-slate-200 dark:border-slate-800">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="size-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <span className="material-symbols-outlined text-2xl">star</span>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Avg. Rating</p>
                            <div className="flex items-center gap-2">
                                <h3 className="text-2xl font-black">
                                    {(() => {
                                        let totalRating = 0;
                                        let ratedCoursesCount = 0;
                                        allInstructorCourses.forEach(c => {
                                            if ((c.rating || 0) > 0) {
                                                totalRating += (c.rating || 0);
                                                ratedCoursesCount++;
                                            }
                                        });
                                        const avg = ratedCoursesCount > 0 ? (totalRating / ratedCoursesCount) : 0;
                                        return avg.toFixed(1);
                                    })()}
                                </h3>
                                <div className="flex text-amber-400">
                                    {(() => {
                                        let totalRating = 0;
                                        let ratedCoursesCount = 0;
                                        allInstructorCourses.forEach(c => {
                                            if ((c.rating || 0) > 0) {
                                                totalRating += (c.rating || 0);
                                                ratedCoursesCount++;
                                            }
                                        });
                                        const avg = ratedCoursesCount > 0 ? (totalRating / ratedCoursesCount) : 0;
                                        return Array.from({ length: 5 }).map((_, i) => (
                                            <span key={i} className="material-symbols-outlined text-lg" style={{ fontVariationSettings: i < Math.floor(avg) ? "'FILL' 1" : "'FILL' 0" }}>
                                                {i < Math.floor(avg) ? 'star' : (i < avg ? 'star_half' : 'star_outline')}
                                            </span>
                                        ));
                                    })()}
                                </div>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">
                                    ({allInstructorCourses.reduce((acc, c) => {
                                        const count = Number(c.ratingsQuantity || (c as any).reviewsCount || (c as any).ratingsCount || c.reviews || 0);
                                        return acc + (count > 0 ? count : (c.rating > 0 ? 1 : 0));
                                    }, 0)} reviews)
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Content Controls */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground material-symbols-outlined text-sm">search</span>
                    <input
                        type="text"
                        placeholder="Search your courses..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <span className="material-symbols-outlined mr-2 text-sm">filter_list</span>
                        Filter
                    </Button>
                    <Button variant="outline" size="sm" className="hidden md:flex">
                        <span className="material-symbols-outlined mr-2 text-sm">sort</span>
                        Sort
                    </Button>
                </div>
            </div>

            {/* Content Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-muted-foreground font-medium animate-pulse">Loading your curriculum...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <Card className="border-dashed bg-slate-50/50 dark:bg-slate-900/20">
                    <CardContent className="flex flex-col items-center justify-center py-20 text-center gap-6">
                        <div className="size-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                            <span className="material-symbols-outlined text-5xl">school</span>
                        </div>
                        <div className="max-w-md space-y-2">
                            <h3 className="text-xl font-bold text-foreground">No courses found</h3>
                            <p className="text-muted-foreground">
                                {searchQuery ? `No results for "${searchQuery}"` : "You haven't created any courses yet. Start sharing your knowledge!"}
                            </p>
                        </div>
                        {!searchQuery && (
                            <Link href="/instructor/courses/upload">
                                <Button className="font-bold mt-2">
                                    Create Your First Course
                                </Button>
                            </Link>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCourses.map((course) => (
                            <Card key={course.id} className="group overflow-hidden border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 bg-background">
                                {/* Card Image Area */}
                                <div className="relative aspect-video bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <Image
                                        src={course.image || course.imageCover || '/course-placeholder.jpg'}
                                        alt={course.title}
                                        fill
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <Badge className={cn("backdrop-blur-md shadow-sm border-0 font-bold", course.price > 0 ? "bg-white/90 text-slate-900" : "bg-emerald-500 text-white")}>
                                            {course.price > 0 ? `$${course.price}` : 'Free'}
                                        </Badge>
                                    </div>

                                    <div className="absolute bottom-4 left-4 right-4">
                                        <Badge variant="outline" className="text-xs font-bold text-white border-white/20 bg-white/10 mb-2 backdrop-blur-sm">
                                            {course.category}
                                        </Badge>
                                        <h3 className="font-bold text-lg text-white leading-tight line-clamp-2 drop-shadow-md">
                                            {course.title}
                                        </h3>
                                    </div>
                                </div>

                                {/* Card Body */}
                                <CardContent className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-center text-xs font-medium text-muted-foreground border-b border-border pb-4">
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">group</span>
                                            {course.students || 0} Students
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm text-amber-500 fill-1">star</span>
                                            <span className="text-foreground">{course.rating || 0}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {course.duration || '0h'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-3">
                                        <Link href={`/instructor/courses/${course.id}`} className="col-span-4">
                                            <Button variant="outline" className="w-full rounded-xl font-bold text-xs h-10 hover:bg-slate-50 dark:hover:bg-slate-800 gap-2">
                                                <Eye className="w-3.5 h-3.5" /> Preview
                                            </Button>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="col-span-1 rounded-xl h-10 w-full shrink-0 text-slate-400 hover:text-white hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300"
                                            onClick={() => setCourseToDelete(course._id || course.id)}
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>

                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {paginationData && paginationData.totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-12 py-4 border-t border-slate-100 dark:border-slate-800">
                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-xl h-10 px-4 font-bold gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                <span className="material-symbols-outlined text-sm">chevron_left</span>
                                Previous
                            </Button>

                            <div className="flex items-center gap-2">
                                {[...Array(paginationData.totalPages)].map((_, i) => (
                                    <Button
                                        key={i}
                                        variant={page === i + 1 ? "default" : "outline"}
                                        onClick={() => setPage(i + 1)}
                                        className={cn(
                                            "size-10 rounded-xl font-black text-sm transition-all",
                                            page === i + 1
                                                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-lg shadow-indigo-500/10"
                                                : "text-slate-500 hover:text-indigo-600"
                                        )}
                                    >
                                        {i + 1}
                                    </Button>
                                ))}
                            </div>

                            <Button
                                variant="outline"
                                onClick={() => setPage(p => Math.min(paginationData.totalPages, p + 1))}
                                disabled={page === paginationData.totalPages}
                                className="rounded-xl h-10 px-4 font-bold gap-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                            >
                                Next
                                <span className="material-symbols-outlined text-sm">chevron_right</span>
                            </Button>
                        </div>
                    )}
                </>
            )}

            {/* Premium Delete Confirmation Dialog */}
            <AlertDialog open={!!courseToDelete} onOpenChange={(open) => !open && setCourseToDelete(null)}>
                <AlertDialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-0 overflow-hidden">
                    <div className="bg-red-500/10 p-6 flex items-center gap-4 border-b border-red-500/10">
                        <div className="size-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <AlertDialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                                Delete Course?
                            </AlertDialogTitle>
                            <p className="text-sm text-red-600 font-bold dark:text-red-400">This action is permanent</p>
                        </div>
                    </div>

                    <div className="p-6">
                        <AlertDialogDescription className="text-slate-600 dark:text-slate-400 text-base leading-relaxed">
                            Are you sure you want to remove this course from your curriculum?
                            <span className="block mt-2 font-medium text-slate-900 dark:text-slate-200">
                                This will permanently delete all associated:
                            </span>
                            <ul className="mt-2 space-y-1 text-sm font-medium">
                                <li className="flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-red-500" /> Modules and chapters
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-red-500" /> Lesson content and videos
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="size-1.5 rounded-full bg-red-500" /> Student progress and ratings
                                </li>
                            </ul>
                        </AlertDialogDescription>
                    </div>

                    <AlertDialogFooter className="p-6 pt-0 flex gap-3">
                        <AlertDialogCancel className="flex-1 h-12 rounded-xl font-bold border-slate-200 hover:bg-slate-50 transition-all">
                            Keep Course
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="flex-1 h-12 rounded-xl font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        >
                            Delete Forever
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
