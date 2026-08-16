"use client"

import React, { useEffect, useState } from "react"
import { useUserStore } from "@/lib/store"
import { getInstructorCourses, Course } from "@/data/courses"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    Wallet, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight,
    CreditCard, Calendar, Activity, CheckCircle2
} from "lucide-react"

export default function EarningsPage() {
    const { user } = useUserStore()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    const [stats, setStats] = useState({
        totalEarnings: 0,
        thisMonth: 0,
        totalSales: 0,
        averageCoursePrice: 0
    })

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;
            try {
                const instructorId = user.id || (user as any)._id;
                const fetchedCourses = await getInstructorCourses(instructorId);
                setCourses(fetchedCourses);

                let totalE = 0;
                let totalS = 0;
                let activeCourses = 0;
                let thisMonthE = 0;

                const currentMonth = new Date().getMonth();
                const currentYear = new Date().getFullYear();

                const promises = fetchedCourses.map(async (c: Course) => {
                    const pricePaid = c.price || 0;
                    const students = c.students || 0;
                    totalE += pricePaid * students;
                    totalS += students;
                    if (pricePaid > 0) activeCourses++;

                    if (pricePaid > 0) {
                        try {
                            const INSCRIPTION_API_URL = process.env.NEXT_PUBLIC_INSCRIPTION_API_URL as string;
                            const token = localStorage.getItem('user-token');
                            const res = await fetch(`${INSCRIPTION_API_URL}/inscriptions/course-students/${c._id || c.id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            if (res.ok) {
                                const result = await res.json();
                                const inscriptions = result.data || [];
                                inscriptions.forEach((ins: any) => {
                                    const date = new Date(ins.createdAt);
                                    if (date.getMonth() === currentMonth && date.getFullYear() === currentYear) {
                                        thisMonthE += (ins.price !== undefined && ins.price !== null ? ins.price : pricePaid);
                                    }
                                });
                            }
                        } catch (e) {
                            console.error(e);
                        }
                    }
                });

                await Promise.all(promises);

                setStats({
                    totalEarnings: totalE,
                    thisMonth: thisMonthE,
                    totalSales: totalS,
                    averageCoursePrice: totalS > 0 ? (totalE / totalS) : 0
                });

            } catch (err) {
                console.error("Failed to fetch earnings data", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 animate-pulse">
                <div className="size-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Wallet className="size-8 text-slate-300 dark:text-slate-600" />
                </div>
                <div className="h-4 w-48 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            </div>
        );
    }

    const sortedCourses = [...courses].sort((a, b) => ((b.price || 0) * (b.students || 0)) - ((a.price || 0) * (a.students || 0)));
    const topPerformers = sortedCourses.slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="space-y-1 relative">
                    <div className="absolute -left-4 -top-4 size-24 bg-emerald-500/10 rounded-full blur-2xl -z-10" />
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                        Earnings Dashboard
                    </h1>
                    <p className="text-slate-500 font-medium">
                        Monitor your revenue, sales, and course performance in real-time.
                    </p>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Available to withdraw:</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">${stats.totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <button className="ml-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-black px-4 py-2 rounded-xl transition-all shadow-lg active:scale-95">
                        Withdraw
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-[2rem] p-6 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-6 opacity-20 transform group-hover:scale-110 transition-transform duration-500">
                        <Wallet className="size-24" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="size-12 bg-white/20 rounded-2xl backdrop-blur-md flex items-center justify-center">
                            <DollarSign className="size-6 text-white" />
                        </div>
                        <div>
                            <p className="text-emerald-50 font-semibold tracking-wide text-sm mb-1 uppercase">Total Earnings</p>
                            <h3 className="text-4xl font-black tracking-tight">${stats.totalEarnings.toLocaleString()}</h3>
                        </div>
                    </div>
                </div>

                {/* This Month */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity text-emerald-500">
                        <TrendingUp className="size-32" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="size-12 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center">
                            <Calendar className="size-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold tracking-wide text-sm mb-1 uppercase">This Month</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">${stats.thisMonth.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                                <Badge className="bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 font-bold gap-1 px-2 py-0">
                                    <ArrowUpRight className="size-3" /> 15%
                                </Badge>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Enrollments */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-indigo-500/30 transition-colors">
                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity text-indigo-500">
                        <Activity className="size-32" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="size-12 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center">
                            <CheckCircle2 className="size-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold tracking-wide text-sm mb-1 uppercase">Total Sales</p>
                            <div className="flex items-baseline gap-3">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{stats.totalSales}</h3>
                                <span className="text-sm font-bold text-slate-400">students</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Average Price */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:border-blue-500/30 transition-colors">
                    <div className="absolute -right-6 -bottom-6 opacity-5 group-hover:opacity-10 transition-opacity text-blue-500">
                        <CreditCard className="size-32" />
                    </div>
                    <div className="relative z-10 flex flex-col gap-4">
                        <div className="size-12 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center">
                            <CreditCard className="size-6" />
                        </div>
                        <div>
                            <p className="text-slate-500 font-semibold tracking-wide text-sm mb-1 uppercase">Avg. Sale Price</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">${stats.averageCoursePrice.toFixed(2)}</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Income Distribution (Visual Bars) */}
            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">Earnings by Course</h3>
                        <p className="text-sm text-slate-500 font-medium">Top performing courses driving the revenue</p>
                    </div>
                </div>

                <div className="space-y-6">
                    {topPerformers.map((course, idx) => {
                        const courseEarning = (course.price || 0) * (course.students || 0);
                        const percentage = stats.totalEarnings > 0 ? (courseEarning / stats.totalEarnings) * 100 : 0;

                        return (
                            <div key={course.id || idx} className="group">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="size-10 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden shrink-0 hidden sm:block">
                                            <img src={course.image} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{course.title}</h4>
                                            <p className="text-xs text-slate-500 font-semibold">{course.students} sales</p>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-sm font-black text-slate-900 dark:text-white">${courseEarning.toLocaleString()}</p>
                                        <p className="text-xs font-bold text-emerald-500">{percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out group-hover:scale-y-110"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                    {courses.length === 0 && (
                        <div className="text-center py-10 text-slate-400 font-medium">No sales data available yet.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
