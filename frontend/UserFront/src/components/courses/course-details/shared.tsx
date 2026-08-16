"use client"

import React, { memo } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

/**
 * Affiche un élément de métadonnée (icône + label)
 */
export const MetaItem = memo(function MetaItem({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Icon className="w-4 h-4" />
            <span>{label}</span>
        </div>
    )
})

/**
 * Carte de fonctionnalité avec icône personnalisée
 */
export const FeatureCard = memo(function FeatureCard({ icon, label, variant = "blue" }: {
    icon: string
    label: string
    variant?: "blue" | "indigo" | "emerald"
}) {
    const variants: Record<string, string> = {
        blue: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
        indigo: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/30",
        emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    }

    return (
        <div className={cn(
            "flex items-center gap-4 p-4 rounded-2xl border transition-colors",
            variants[variant],
            "hover:shadow-md"
        )}>
            <div className={cn(
                "size-10 rounded-xl flex items-center justify-center font-black text-xs tracking-tighter",
                "bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700"
            )}>
                {icon}
            </div>
            <span className="font-bold text-sm uppercase tracking-tight text-slate-700 dark:text-slate-200">
                {label}
            </span>
        </div>
    )
})

/**
 * Section d'en-tête avec barre d'accent et badge optionnel
 */
export const SectionHeader = memo(function SectionHeader({
    icon,
    title,
    accent = "blue",
    badge
}: {
    icon: React.ReactNode
    title: string
    accent?: "blue" | "indigo" | "amber" | "purple" | "emerald"
    badge?: string
}) {
    const accentColors: Record<string, string> = {
        blue: "bg-blue-600",
        indigo: "bg-indigo-500",
        amber: "bg-amber-500",
        purple: "bg-purple-600",
        emerald: "bg-emerald-500",
    }

    return (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className={cn("w-1.5 h-8 rounded-full", accentColors[accent])} />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {title}
                </h3>
            </div>
            {badge && (
                <Badge variant="outline" className="font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    {badge}
                </Badge>
            )}
        </div>
    )
})
