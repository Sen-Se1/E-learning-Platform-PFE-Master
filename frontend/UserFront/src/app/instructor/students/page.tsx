"use client"

import React, { useEffect, useState, useMemo } from "react"
import { useUserStore } from "@/lib/store"
import { getInstructorCourses, getCourseStudents, Course } from "@/data/courses"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import {
    Users, Search, Filter, Mail, Calendar, GraduationCap, ChevronRight, CheckCircle2
} from "lucide-react"

export default function StudentsPage() {
    const { user } = useUserStore()
    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
    const [students, setStudents] = useState<any[]>([])
    const [loadingCourses, setLoadingCourses] = useState(true)
    const [loadingStudents, setLoadingStudents] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")

    const [expandedStudentEmail, setExpandedStudentEmail] = useState<string | null>(null)

    useEffect(() => {
        const fetchCourses = async () => {
            if (!user) return;
            try {
                const instructorId = user.id || (user as any)._id;
                const fetchedCourses = await getInstructorCourses(instructorId);
                setCourses(fetchedCourses);
                // Set to 'all' by default instead of the first course
                setSelectedCourseId("all");
            } catch (err) {
                console.error("Failed to fetch courses", err);
            } finally {
                setLoadingCourses(false);
            }
        };
        fetchCourses();
    }, [user]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!selectedCourseId) {
                setStudents([]);
                return;
            }
            setLoadingStudents(true);
            try {
                if (selectedCourseId === "all") {
                    // Fetch students for ALL courses in parallel
                    const allPromises = courses.map(c => getCourseStudents(c._id || c.id));
                    const results = await Promise.all(allPromises);
                    
                    // Flatten and inject courseTitle from the courses array
                    const flattenedWithTitles = results.flatMap((list, idx) => 
                        list.map(s => ({ ...s, courseTitle: courses[idx].title }))
                    );
                    
                    // Group by Email to avoid duplicates
                    const studentMap: Record<string, any> = {};

                    flattenedWithTitles.forEach((s) => {
                        const emailKey = s.email?.toLowerCase().trim();
                        if (!emailKey || emailKey === "n/a") return;

                        if (!studentMap[emailKey]) {
                            studentMap[emailKey] = {
                                ...s,
                                courseTitles: [s.courseTitle],
                                totalInvestment: s.pricePaid || 0,
                                enrollmentCount: 1
                            };
                        } else {
                            // Already exists, update stats
                            studentMap[emailKey].totalInvestment += (s.pricePaid || 0);
                            studentMap[emailKey].enrollmentCount += 1;
                            
                            if (s.courseTitle && !studentMap[emailKey].courseTitles.includes(s.courseTitle)) {
                                studentMap[emailKey].courseTitles.push(s.courseTitle);
                            }
                            // Keep the most recent enrollment date
                            if (new Date(s.enrolledAt) > new Date(studentMap[emailKey].enrolledAt)) {
                                studentMap[emailKey].enrolledAt = s.enrolledAt;
                            }
                        }
                    });

                    const grouped = Object.values(studentMap);
                    grouped.sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime());
                    setStudents(grouped);
                } else {
                    const fetchedStudents = await getCourseStudents(selectedCourseId);
                    setStudents(fetchedStudents);
                }
            } catch (err) {
                console.error("Failed to fetch students", err);
            } finally {
                setLoadingStudents(false);
            }
        };
        fetchStudents();
    }, [selectedCourseId, courses]);

    const filteredStudents = useMemo(() => {
        if (!searchQuery) return students;
        const query = searchQuery.toLowerCase();
        return students.filter(s =>
            s.name.toLowerCase().includes(query) ||
            s.email.toLowerCase().includes(query)
        );
    }, [students, searchQuery]);

    if (loadingCourses) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Users className="size-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1 relative">
                    <div className="absolute -left-4 -top-4 size-24 bg-indigo-500/10 rounded-full blur-2xl -z-10" />
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Student Network
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Manage and track the progress of all enrolled learners.
                    </p>
                </div>
            </div>

            {/* Content Area */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none min-h-[500px] flex flex-col relative overflow-hidden">
                <div className="absolute -right-20 -top-20 size-64 bg-indigo-500/5 rounded-full blur-3xl" />

                {/* Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-8 relative z-10">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search students by name or email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-400"
                        />
                    </div>
                </div>

                {/* Student List */}
                <div className="flex-1 overflow-x-auto pb-4 relative z-10">
                    <div className="min-w-[800px]">
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 dark:border-slate-800/60 mb-4">
                            <div className="col-span-4 text-[10px] font-black uppercase text-slate-400 tracking-widest">Learner</div>
                            <div className="col-span-3 text-[10px] font-black uppercase text-slate-400 tracking-widest">Enrolled Date</div>
                            <div className="col-span-2 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Status</div>
                            <div className="col-span-2 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Investment</div>
                            <div className="col-span-1"></div>
                        </div>

                        {/* Table Body */}
                        {loadingStudents ? (
                            <div className="space-y-4">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-20 bg-slate-50 dark:bg-slate-800/30 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : filteredStudents.length > 0 ? (
                            <div className="space-y-3">
                                {filteredStudents.map((student, idx) => {
                                    const isExpanded = expandedStudentEmail === student.email;
                                    return (
                                        <div 
                                            key={student.id || idx} 
                                            className={cn(
                                                "flex flex-col bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-transparent transition-all overflow-hidden",
                                                isExpanded ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg" : "hover:bg-white dark:hover:bg-slate-900 hover:border-slate-200 dark:hover:border-slate-800"
                                            )}
                                        >
                                            <div 
                                                className="grid grid-cols-12 gap-4 items-center px-6 py-4 cursor-pointer group"
                                                onClick={() => setExpandedStudentEmail(isExpanded ? null : student.email)}
                                            >
                                                {/* Learner */}
                                                <div className="col-span-4 flex items-center gap-4">
                                                    <Avatar className="size-12 rounded-xl border-2 border-white dark:border-slate-800 shadow-sm relative group-hover:scale-105 transition-transform">
                                                        <AvatarImage src={student.avatar} alt={student.name} />
                                                        <AvatarFallback className="bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/30 dark:to-violet-900/30 text-indigo-700 dark:text-indigo-400 font-bold">
                                                            {student.name.charAt(0)}
                                                        </AvatarFallback>
                                                        <div className="absolute -bottom-1 -right-1 size-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-900 dark:text-white text-sm">{student.name}</span>
                                                        <div className="flex flex-col gap-0.5">
                                                            <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1.5 line-clamp-1"><Mail className="size-3" /> {student.email}</span>
                                                            <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-tight line-clamp-1">
                                                                {student.courseTitles?.length || 1} Course{(student.courseTitles?.length || 1) > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Enrolled */}
                                                <div className="col-span-3 flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm">
                                                    <Calendar className="size-4 opacity-50" />
                                                    {new Date(student.enrolledAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </div>

                                                {/* Status */}
                                                <div className="col-span-2 flex justify-center">
                                                    <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-none uppercase font-black text-[9px] tracking-wider px-2 py-0.5">
                                                        <CheckCircle2 className="size-3 mr-1" /> Active
                                                    </Badge>
                                                </div>

                                                {/* Investment */}
                                                <div className="col-span-2 text-right">
                                                    <span className="font-black text-slate-900 dark:text-white">${student.totalInvestment !== undefined ? student.totalInvestment.toFixed(2) : (student.pricePaid || 0).toFixed(2)}</span>
                                                </div>

                                                {/* Action */}
                                                <div className="col-span-1 flex justify-end">
                                                    <div className={cn(
                                                        "size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 transition-all",
                                                        isExpanded ? "bg-indigo-600 text-white rotate-90" : "group-hover:bg-indigo-50 dark:group-hover:bg-indigo-900/30 group-hover:text-indigo-600"
                                                    )}>
                                                        <ChevronRight className="size-4" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Content */}
                                            {isExpanded && student.courseTitles && (
                                                <div className="px-6 pb-6 pt-2 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="pl-16 space-y-3">
                                                        <div className="h-px bg-slate-100 dark:bg-slate-800 mb-4" />
                                                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Enrolled Courses</p>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                            {student.courseTitles.map((title: string, cidx: number) => (
                                                                <div key={cidx} className="flex items-center gap-2 p-3 bg-slate-100/50 dark:bg-slate-800/30 rounded-xl border border-slate-200/50 dark:border-slate-800/50">
                                                                    <GraduationCap className="size-4 text-indigo-500" />
                                                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1">{title}</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="size-20 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
                                    <Users className="size-8 text-slate-300 dark:text-slate-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">No students found</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-sm">No learners matched your search, or this course doesn't have any enrollments yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
