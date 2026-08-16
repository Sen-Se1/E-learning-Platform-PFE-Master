"use client"

import React, { useCallback, memo } from "react"
import { Users } from "lucide-react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { SectionHeader } from "./shared"

interface InstructorCardProps {
    instructor: {
        name: string
        title: string
        bio: string
        avatar?: string
    }
}

/**
 * Carte de l'instructeur avec avatar et informations
 */
export const InstructorCard = memo(function InstructorCard({ instructor }: InstructorCardProps) {
    const getInitials = useCallback((name: string) => {
        if (!name) return "?"
        const parts = name.trim().split(/\s+/)
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        }
        return name.slice(0, 2).toUpperCase()
    }, [])

    return (
        <div className="space-y-6 pt-6 border-t border-slate-200 dark:border-slate-800">
            <SectionHeader
                icon={<Users className="w-5 h-5" />}
                title="Your Instructor"
                accent="purple"
            />
            <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="relative shrink-0">
                    <Avatar className="size-24 rounded-2xl shadow-md ring-4 ring-slate-50 dark:ring-slate-800">
                        <AvatarImage
                            src={instructor.avatar}
                            alt={instructor.name}
                            className="object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/images/avatar-placeholder.jpg"
                            }}
                        />
                        <AvatarFallback className="rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 font-black text-2xl">
                            {getInitials(instructor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-2 -right-2 bg-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider border-2 border-white dark:border-slate-900 shadow-sm">
                        Pro
                    </div>
                </div>
                <div className="space-y-2 flex-1 min-w-0">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        {instructor.name}
                    </h4>
                    <p className="text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-widest">
                        {instructor.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {instructor.bio}
                    </p>
                </div>
            </div>
        </div>
    )
})
