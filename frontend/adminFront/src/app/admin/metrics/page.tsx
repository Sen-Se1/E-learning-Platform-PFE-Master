"use client";

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function CourseMetricsPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [counts, setCounts] = useState<any[]>([]);
    const [uniqueStudents, setUniqueStudents] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    const COURSE_BASE = process.env.NEXT_PUBLIC_COURSE_API_URL as string;
    const INSCRIPTION_BASE = process.env.NEXT_PUBLIC_INSCRIPTION_API_URL as string;

    const COURSE_API = `${COURSE_BASE}/courses`;
    const INSCRIPTION_API = `${INSCRIPTION_BASE}/inscriptions`;

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const token = localStorage.getItem('admin-token');
                const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}` } : {};

                // Fetch courses and counts first
                const [coursesRes, countsRes] = await Promise.all([
                    fetch(COURSE_API, { headers }),
                    fetch(`${INSCRIPTION_API}/counts`, { headers })
                ]);
                
                let fetchedCourses: any[] = [];
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    fetchedCourses = coursesData.data || [];
                    setCourses(fetchedCourses);
                }
                
                if (countsRes.ok) {
                    const countsData = await countsRes.json();
                    // Backend returns an object { courseId: count } in data
                    const countsObj = countsData.data || {};
                    const countsArray = Object.keys(countsObj).map(key => ({
                        course: key,
                        count: countsObj[key]
                    }));
                    setCounts(countsArray);
                }

                // Now fetch unique counts using the retrieved course IDs
                if (fetchedCourses.length > 0) {
                    const courseIds = fetchedCourses.map(c => c._id);
                    const uniqueRes = await fetch(`${INSCRIPTION_API}/unique-count`, { 
                        method: 'POST',
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ courseIds })
                    }).catch(() => null);

                    if (uniqueRes && uniqueRes.ok) {
                        const uniqueData = await uniqueRes.json();
                        // Backend returns uniqueUsers.length in data
                        setUniqueStudents(uniqueData.data || 0);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch course metrics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, []);

    // Derived Metrics
    const totalCourses = courses.length;
    const totalInscriptions = counts.reduce((acc: number, curr: any) => acc + curr.count, 0);
    const avgRating = totalCourses > 0 
        ? (courses.reduce((acc: number, curr: any) => acc + (curr.rating || 0), 0) / totalCourses).toFixed(1) 
        : "0.0";

    // Chart Data Formatting
    const getCourseInscriptions = (courseId: string) => {
        const countObj = counts.find(c => c.course === courseId);
        return countObj ? countObj.count : 0;
    };

    const topCoursesData = courses.map(c => ({
        name: c.title.length > 20 ? c.title.substring(0, 20) + "..." : c.title,
        inscriptions: getCourseInscriptions(c._id)
    })).sort((a, b) => b.inscriptions - a.inscriptions).slice(0, 5);

    const levelDistribution = courses.reduce((acc: any, curr: any) => {
        const level = curr.level || "Unspecified";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
    }, {});

    const pieData = Object.keys(levelDistribution).map(key => ({
        name: key,
        value: levelDistribution[key]
    }));

    const categoryDistribution = courses.reduce((acc: any, curr: any) => {
        const cat = curr.category || "General";
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
    }, {});

    const categoryData = Object.keys(categoryDistribution).map(key => ({
        name: key,
        courses: categoryDistribution[key]
    })).sort((a, b) => b.courses - a.courses);

    const COLORS = ['#137fec', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

    return (
        <div className="flex flex-col gap-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <span className="material-symbols-outlined text-xs text-muted-foreground">chevron_right</span>
                <span className="font-bold">Course Metrics</span>
            </div>

            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Course Metrics & Engagement</h1>
                <p className="text-muted-foreground">Overview of course performance, student enrollments, and platform content.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Courses", value: totalCourses.toString(), icon: "library_books", sub: "Published courses", color: "primary" },
                    { label: "Total Inscriptions", value: totalInscriptions.toString(), icon: "how_to_reg", sub: "Global course enrollments", color: "success" },
                    { label: "Unique Students", value: uniqueStudents.toString() || "...", icon: "group", sub: "Active learners", color: "primary" },
                    { label: "Global Avg Rating", value: `${avgRating} ⭐`, icon: "star", sub: "Across all courses", color: "warning" },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                            <span className="material-symbols-outlined text-primary/40">{stat.icon}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-muted-foreground text-[10px]">{stat.sub}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top 5 Courses Chart */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-base">Top 5 Most Popular Courses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[280px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={topCoursesData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="name" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} angle={-25} textAnchor="end" />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                    />
                                    <Bar dataKey="inscriptions" name="Total Inscriptions" fill="#137fec" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Level Distribution Pie Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">Course Levels</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[280px] flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b">
                    <div>
                        <CardTitle className="text-base">Course Inventory</CardTitle>
                        <p className="text-sm text-muted-foreground">List of all available courses and their metrics</p>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Course Details</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Level</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Category</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground text-center">Inscriptions</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground text-center">Rating</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading courses...</TableCell>
                                </TableRow>
                            ) : courses.length > 0 ? (
                                courses.map((course: any, i: number) => (
                                    <TableRow key={course._id || i} className="hover:bg-muted/30">
                                        <TableCell className="px-6 py-4">
                                            <p className="font-bold text-sm truncate max-w-[300px]" title={course.title}>{course.title}</p>
                                            <p className="text-[10px] text-muted-foreground">ID: {course._id}</p>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <Badge variant="outline">{course.level}</Badge>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-sm">
                                            {course.category}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center font-bold">
                                            {getCourseInscriptions(course._id)}
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="text-sm font-medium">{course.rating?.toFixed(1) || "0.0"}</span>
                                                <span className="material-symbols-outlined text-[14px] text-amber-500">star</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right">
                                            {course.isArchived ? (
                                                <Badge variant="secondary" className="bg-slate-500/20 text-slate-400">Archived</Badge>
                                            ) : (
                                                <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20">Active</Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No courses available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
