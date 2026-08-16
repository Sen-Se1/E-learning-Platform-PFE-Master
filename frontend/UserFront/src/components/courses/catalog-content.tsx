"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"
import { getAllCourses, getMyEnrolledCourses, Course } from "@/data/courses"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

interface CatalogContentProps {
    basePath?: string
    enrolledOnly?: boolean
}

export function CatalogContent({ basePath = "/cours", enrolledOnly = false }: CatalogContentProps) {
    const { t } = useLanguage()

    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [paginationData, setPaginationData] = useState<{ totalPages: number; totalDocuments: number } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null)
    const [minPrice, setMinPrice] = useState<number>(0)
    const [maxPrice, setMaxPrice] = useState<number>(1000)
    const [showEnrolledOnly, setShowEnrolledOnly] = useState(enrolledOnly)
    const [allCategories, setAllCategories] = useState<string[]>([])

    // ---------------- HELPER ----------------
    const getInitials = (name: string) => {
        if (!name) return "";
        const parts = name.trim().split(/\s+/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.slice(0, 2).toUpperCase();
    };

    // ---------------- FETCH COURSES ----------------
    const fetchCourses = async () => {
        setLoading(true)
        try {
            if (showEnrolledOnly) {
                const enrolled = await getMyEnrolledCourses()
                setCourses(enrolled)
                setPaginationData({ totalPages: 1, totalDocuments: enrolled.length })
            } else {
                const response = await getAllCourses(page, 12)
                setCourses(response.data)
                setPaginationData({
                    totalPages: response.pagination.totalPages,
                    totalDocuments: response.pagination.totalDocuments,
                })
            }
        } catch (error) {
            console.error("Error fetching courses:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCourses()
    }, [page, showEnrolledOnly])

    const formatDuration = (duration: any) => {
        if (!duration) return "00h:00m"
        const durStr = String(duration).trim().toUpperCase()

        // Handle "1 HEURES 4 MINS" format
        const hourMatch = durStr.match(/(\d+)\s*HEURE/i)
        const minMatch = durStr.match(/(\d+)\s*MIN/i)

        if (hourMatch || minMatch) {
            const h = hourMatch ? hourMatch[1].padStart(2, '0') : "00"
            const m = minMatch ? minMatch[1].padStart(2, '0') : "00"
            return `${h}h:${m}m`
        }

        // Handle HH:MM:SS or HH:MM format
        if (durStr.includes(':')) {
            const parts = durStr.split(':')
            const h = parts[0].padStart(2, '0')
            const m = parts[1].padStart(2, '0')
            return `${h}h:${m}m`
        }

        return durStr
    }

    // ---------------- FETCH CATEGORIES ----------------
    const fetchCategories = async () => {
        try {
            const response = await getAllCourses(1, 100)
            const categories = Array.from(new Set(response.data.map(c => c.category).filter(Boolean)))
            setAllCategories(categories)
        } catch (error) {
            console.error("Error fetching categories:", error)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    // ---------------- FILTERED COURSES ----------------
    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesSearch =
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.description.toLowerCase().includes(searchTerm.toLowerCase())

            const matchesCategory = !selectedCategory || course.category === selectedCategory
            const matchesLevel = !selectedLevel || course.level === selectedLevel
            const matchesPrice = course.price >= minPrice && course.price <= maxPrice

            return matchesSearch && matchesCategory && matchesLevel && matchesPrice
        })
    }, [courses, searchTerm, selectedCategory, selectedLevel, minPrice, maxPrice])

    // ---------------- CATEGORY META ----------------
    const getCategoryMeta = (name: string) => {
        const n = name.toLowerCase()
        if (n.includes("cloud")) return { icon: "cloud", color: "text-blue-500 bg-blue-50 dark:bg-blue-500/10" }
        if (n.includes("code") || n.includes("dev")) return { icon: "code", color: "text-purple-500 bg-purple-50 dark:bg-purple-500/10" }
        if (n.includes("data")) return { icon: "database", color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10" }
        if (n.includes("ai")) return { icon: "smart_toy", color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" }
        if (n.includes("security")) return { icon: "shield", color: "text-red-500 bg-red-50 dark:bg-red-500/10" }
        return { icon: "label", color: "text-slate-500 bg-slate-100 dark:bg-slate-800" }
    }

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {}
        courses.forEach(course => {
            if (course.category) counts[course.category] = (counts[course.category] || 0) + 1
        })
        return counts
    }, [courses])

    if (loading && page === 1) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
            </div>
        )
    }

    return (
        <div className="flex flex-col lg:flex-row gap-10 pb-12">
            {/* SIDEBAR */}
            <aside className="hidden lg:flex flex-col w-72 shrink-0 gap-8">
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-7 shadow-sm border border-slate-200 dark:border-slate-800 sticky top-24 max-h-[calc(100vh-100px)] overflow-y-auto custom-scrollbar overscroll-contain">
                    <h2 className="font-black text-xl tracking-tight flex items-center gap-2 mb-8">
                        <span className="size-2 bg-primary rounded-full animate-pulse" />
                        Filtres
                    </h2>

                    <div className="mb-10">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1 flex items-center gap-2">
                            <span className="size-1.5 bg-primary/40 rounded-full" />
                            {t("catalog.categories")}
                        </h3>
                        <Select
                            value={selectedCategory || "all"}
                            onValueChange={(val) => setSelectedCategory(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="w-full h-12 rounded-2xl border-2 font-bold text-slate-700 bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800 focus:ring-primary transition-all">
                                <SelectValue placeholder={t("catalog.all_courses")} />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl p-2 border-2 shadow-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                                <SelectGroup>
                                    <SelectItem value="all" className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:bg-slate-50 dark:focus:bg-slate-800">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-[18px] text-primary">apps</span>
                                            <span>{t("catalog.all_courses")}</span>
                                        </div>
                                    </SelectItem>
                                    {allCategories.map(cat => (
                                        <SelectItem key={cat} value={cat} className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors focus:bg-slate-50 dark:focus:bg-slate-800">
                                            <div className="flex items-center justify-between w-full min-w-[200px]">
                                                <div className="flex items-center gap-3">
                                                    <span className="material-symbols-outlined text-[18px] text-primary">
                                                        {getCategoryMeta(cat).icon}
                                                    </span>
                                                    <span>{cat}</span>
                                                </div>
                                                <Badge variant="secondary" className="ml-4 text-[9px] bg-indigo-50 dark:bg-indigo-900/30 text-primary border-none">
                                                    {categoryCounts[cat] || 0}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* LEVEL FILTER */}
                    <div className="mb-6">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 ml-1 flex items-center gap-2">
                            <span className="size-1.5 bg-emerald-400/40 rounded-full" />
                            Niveau
                        </h3>
                        <Select
                            value={selectedLevel || "all"}
                            onValueChange={(val) => setSelectedLevel(val === "all" ? null : val)}
                        >
                            <SelectTrigger className="w-full h-11 rounded-2xl border-2 font-bold text-slate-700 bg-white dark:bg-slate-900 shadow-sm border-slate-100 dark:border-slate-800 focus:ring-primary transition-all">
                                <SelectValue placeholder="Tous les niveaux" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl p-2 border-2 shadow-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800">
                                <SelectGroup>
                                    <SelectItem value="all" className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800">Tout</SelectItem>
                                    <SelectItem value="Beginner" className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-emerald-600">Débutant</SelectItem>
                                    <SelectItem value="Intermediate" className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-amber-600">Intermédiaire</SelectItem>
                                    <SelectItem value="Advanced" className="rounded-xl p-3 font-bold cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 text-rose-600">Avancé</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* PRICE RANGE FILTER */}
                    <div className="mb-10">
                        <div className="flex items-center justify-between mb-4 ml-1">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <span className="size-1.5 bg-amber-400/40 rounded-full" />
                                Gamme de Prix
                            </h3>
                        </div>

                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Min</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={minPrice}
                                        onChange={(e) => setMinPrice(Math.max(0, parseInt(e.target.value) || 0))}
                                        className="w-full h-10 pl-3 pr-2 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold outline-none focus:border-primary transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">$</span>
                                </div>
                            </div>
                            <div className="flex-1 space-y-1.5">
                                <label className="text-[9px] font-black text-slate-400 uppercase ml-1">Max</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(Math.max(minPrice, parseInt(e.target.value) || 0))}
                                        className="w-full h-10 pl-3 pr-2 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold outline-none focus:border-primary transition-all"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-bold">$</span>
                                </div>
                            </div>
                        </div>

                        <div className="relative h-12 flex items-center px-1">
                            {/* Base Track */}
                            <div className="absolute w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full" />

                            {/* Progress Track */}
                            <div
                                className="absolute h-1.5 bg-primary rounded-full"
                                style={{
                                    left: `${(minPrice / 1000) * 100}%`,
                                    right: `${100 - (maxPrice / 1000) * 100}%`
                                }}
                            />

                            {/* Dual Range Sliders */}
                            {/* We use pointer-events-none on the range inputs and pointer-events-auto on the thumbs specifically */}
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="10"
                                value={minPrice}
                                onChange={(e) => setMinPrice(Math.min(maxPrice - 50, parseInt(e.target.value) || 0))}
                                className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none z-30 
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                            />
                            <input
                                type="range"
                                min="0"
                                max="1000"
                                step="10"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(Math.max(minPrice + 50, parseInt(e.target.value) || 0))}
                                className="absolute pointer-events-none appearance-none bg-transparent w-full h-1.5 outline-none z-20
                                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md hover:[&::-webkit-slider-thumb]:scale-110 active:[&::-webkit-slider-thumb]:scale-125 transition-transform"
                            />
                        </div>

                        <div className="flex justify-between mt-2 px-1">
                            <span className="text-[9px] font-bold text-slate-400">0$</span>
                            <span className="text-[9px] font-bold text-slate-400">1000$+</span>
                        </div>
                    </div>

                    <button
                        onClick={() => {
                            setSelectedCategory(null);
                            setSelectedLevel(null);
                            setMinPrice(0);
                            setMaxPrice(1000);
                            setSearchTerm("")
                        }}
                        className="w-full py-4 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary hover:text-white transition-all duration-300"
                    >
                        {t("catalog.reset")}
                    </button>
                    <div className="h-6" /> {/* Extra bottom padding for scroll */}
                </div>
            </aside>

            {/* MAIN */}
            <div className="flex-1 min-w-0">
                <div className="mb-12">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                                {t("catalog.title")}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-medium">{t("catalog.subtitle")}</p>
                        </div>
                        <div className="w-full md:w-80">
                            <div className="relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">search</span>
                                <input
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 shadow-sm focus:border-primary outline-none transition-all placeholder:text-slate-400"
                                    placeholder={t("catalog.search_placeholder")}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mb-6">
                        {selectedCategory && (
                            <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-none px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                <span>Catégorie: {selectedCategory}</span>
                                <button onClick={() => setSelectedCategory(null)}>
                                    <span className="material-symbols-outlined text-sm leading-none">close</span>
                                </button>
                            </Badge>
                        )}
                        {selectedLevel && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-none px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                <span>Niveau: {selectedLevel}</span>
                                <button onClick={() => setSelectedLevel(null)}>
                                    <span className="material-symbols-outlined text-sm leading-none">close</span>
                                </button>
                            </Badge>
                        )}
                        {(minPrice > 0 || maxPrice < 1000) && (
                            <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-none px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">
                                <span>Prix: {minPrice}$ - {maxPrice}$</span>
                                <button onClick={() => { setMinPrice(0); setMaxPrice(1000); }}>
                                    <span className="material-symbols-outlined text-sm leading-none">close</span>
                                </button>
                            </Badge>
                        )}
                    </div>
                </div>

                {/* COURSES GRID */}
                {
                    filteredCourses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredCourses.map(course => (
                                <Link
                                    key={course._id || course.id}
                                    href={`${basePath}/${course.id}`}
                                    className="group bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-500 flex flex-col h-full"
                                >
                                    {/* IMAGE + BADGES */}
                                    <div className="relative h-52 overflow-hidden">
                                        <img
                                            src={course.image || course.imageCover || "/course-placeholder.png"}
                                            alt={course.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                        {/* CATEGORY (TOP LEFT) */}
                                        <div className="absolute top-2 left-2 z-10">
                                            {course.category && (
                                                <span className="bg-white/95 text-slate-900 text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 rounded shadow-sm">
                                                    {course.category}
                                                </span>
                                            )}
                                        </div>

                                        {/* SOCIAL METRICS (TOP RIGHT) */}
                                        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
                                            <div className={cn(
                                                "flex items-center gap-0.5 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm scale-95 group-hover:scale-100 transition-transform",
                                                course.rating > 0 ? "bg-yellow-400 text-black" : "bg-blue-600 text-white"
                                            )}>
                                                <span className="material-symbols-outlined text-[10px] fill-current">
                                                    {course.rating > 0 ? "star" : "auto_awesome"}
                                                </span>
                                                {course.rating > 0
                                                    ? (typeof course.rating === 'number' ? course.rating.toFixed(1) : (course.rating || "0.0"))
                                                    : "NEW"
                                                }
                                            </div>
                                            <div className="flex items-center gap-0.5 bg-slate-900/90 backdrop-blur-md text-white/90 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm scale-95 group-hover:scale-100 transition-transform">
                                                <span className="material-symbols-outlined text-[10px]">group</span>
                                                {course.students || 0}
                                            </div>
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                                        {/* INFO BAR */}
                                        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-white text-[9px] font-black uppercase tracking-tight">
                                                <span className="material-symbols-outlined text-[12px] text-blue-400">schedule</span>
                                                {formatDuration(course.duration)}
                                            </div>
                                            {course.level && (
                                                <div className={cn(
                                                    "px-2 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-md shadow-lg",
                                                    course.level.toLowerCase() === 'beginner' ? "bg-emerald-500/30 text-emerald-200" :
                                                        course.level.toLowerCase() === 'intermediate' ? "bg-amber-500/30 text-amber-200" :
                                                            "bg-rose-500/30 text-rose-200"
                                                )}>
                                                    {course.level}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* CONTENT */}
                                    <div className="p-4 flex flex-col flex-1">
                                        <h3
                                            className="font-black text-sm mb-4 leading-tight group-hover:text-primary transition-colors line-clamp-2 min-h-[2.5rem]"
                                            dangerouslySetInnerHTML={{ __html: course.title.replace(/&amp;/g, '&') }}
                                        />

                                        <div className="mt-auto pt-3 border-t border-slate-100/60 dark:border-slate-800/60">
                                            <div className="flex items-center justify-between">
                                                {/* Instructor */}
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="size-6 shrink-0 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                                                        <AvatarImage
                                                            src={course.avatar}
                                                            alt={course.instructor}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <AvatarFallback className="bg-indigo-100 text-indigo-700 font-black text-[9px]">
                                                            {getInitials(course.instructor)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-[11px] font-black text-slate-900 dark:text-white leading-none truncate max-w-[90px]">
                                                        {course.instructor}
                                                    </span>
                                                </div>

                                                {/* Price */}
                                                <div className="flex flex-col items-end shrink-0">
                                                    {course.discount > 0 ? (
                                                        <div className="flex flex-col items-end">
                                                            <span className="text-[9px] text-slate-400 line-through font-bold">{course.originalPrice}$</span>
                                                            <span className="text-[14px] font-black text-primary leading-none tracking-tight">{course.price}$</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-[15px] font-black text-slate-900 dark:text-white tracking-tight">
                                                            {course.price > 0 ? `${course.price}$` : 'Free'}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                            <span className="material-symbols-outlined text-6xl text-slate-300 mb-4">search_off</span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No courses found</h3>
                            <p className="text-slate-500">Try adjusting your search or filters</p>
                        </div>
                    )
                }
            </div >
        </div >
    )
}