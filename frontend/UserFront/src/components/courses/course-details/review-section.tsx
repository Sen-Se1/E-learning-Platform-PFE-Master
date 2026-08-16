"use client"

import React, { useMemo, memo } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"
import { SectionHeader } from "./shared"

interface ReviewSectionProps {
    rating: number
    reviewCount: number
    distribution?: Record<string, number>
}

/**
 * Section des avis/évaluations avec barres de progression
 */
export const ReviewSection = memo(function ReviewSection({ rating, reviewCount, distribution }: ReviewSectionProps) {
    const distributionData = useMemo(() => {
        if (distribution && Object.keys(distribution).length > 0) return distribution

        // Default empty distribution
        const data = { '5': 0, '4': 0, '3': 0, '2': 0, '1': 0 }

        if (reviewCount <= 0 || rating <= 0) return data

        // If we have very few reviews (like 1), it's better to show 100% on the actual rating
        // instead of a simulated distribution that contradicts the count.
        const roundedRating = Math.max(1, Math.min(5, Math.round(rating))).toString() as keyof typeof data
        data[roundedRating] = 100

        return data
    }, [distribution, rating, reviewCount])

    const bars = [
        { stars: 5, label: '5 Stars', width: distributionData['5'] || 0 },
        { stars: 4, label: '4 Stars', width: distributionData['4'] || 0 },
        { stars: 3, label: '3 Stars', width: distributionData['3'] || 0 },
        { stars: 2, label: '2 Stars', width: distributionData['2'] || 0 },
        { stars: 1, label: '1 Star', width: distributionData['1'] || 0 },
    ]

    return (
        <div className="space-y-4 pt-6 pb-2">
            <SectionHeader
                icon={<Star className="w-5 h-5" />}
                title="Student Feedback"
                accent="amber"
            />

            <div className="relative group overflow-hidden flex flex-col md:flex-row gap-6 items-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 md:p-8 rounded-[1.5rem] shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500">
                {/* Background decorative elements - scaled down */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl -mr-24 -mt-24 group-hover:bg-amber-500/10 transition-colors duration-500" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-500/5 rounded-full blur-3xl -ml-24 -mb-24 group-hover:bg-indigo-500/5 transition-colors duration-500" />

                {/* Score principal - more compact */}
                <div className="relative flex flex-col items-center justify-center text-center space-y-2 min-w-[150px] p-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 ring-1 ring-slate-100 dark:ring-slate-700/50">
                    <div className="relative">
                        <span className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                            {rating > 0 ? rating.toFixed(1) : "0.0"}
                        </span>
                        <div className="absolute -inset-1 bg-amber-500/10 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex text-amber-500 gap-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                className={cn(
                                    "w-4 h-4 transition-transform duration-300 group-hover:scale-110",
                                    s <= Math.round(rating) && rating > 0 ? "fill-amber-500 text-amber-500" : "fill-none text-slate-200 dark:text-slate-700"
                                )}
                                style={{ transitionDelay: `${s * 50}ms` }}
                            />
                        ))}
                    </div>

                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Rating
                        </span>
                        <span className="text-xs font-black text-slate-900 dark:text-indigo-400">
                            {reviewCount > 0
                                ? `${reviewCount.toLocaleString()} ${reviewCount === 1 ? 'review' : 'reviews'}`
                                : "No reviews yet"}
                        </span>
                    </div>
                </div>

                {/* Barres de distribution - tighter spacing */}
                <div className="relative flex-1 w-full space-y-2.5">
                    {bars.map((bar, idx) => (
                        <div key={bar.stars} className="flex items-center gap-3 group/bar">
                            <div className="flex items-center gap-1 w-12 shrink-0">
                                <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 w-3 tabular-nums text-right">
                                    {bar.stars}
                                </span>
                                <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            </div>

                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner ring-1 ring-slate-200/5 dark:ring-slate-700/50">
                                <div
                                    className={cn(
                                        "h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden",
                                        bar.stars >= 4 ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                                            bar.stars === 3 ? "bg-gradient-to-r from-slate-400 to-slate-600" :
                                                "bg-gradient-to-r from-rose-400 to-rose-600"
                                    )}
                                    style={{
                                        width: `${bar.width}%`,
                                        transitionDelay: `${idx * 100}ms`
                                    }}
                                >
                                    <div className="absolute inset-0 bg-white/20 skew-x-[20deg] translate-x-12" />
                                </div>
                            </div>

                            <span className="text-[11px] font-black text-slate-400 w-8 text-right tabular-nums group-hover/bar:text-slate-900 dark:group-hover/bar:text-white transition-colors">
                                {bar.width.toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
})
