"use client"

import React, { memo } from "react"
import { CheckCircle2, PlayCircle, Loader2, Shield, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLanguage } from '@/context/language-context'

interface EnrollmentCardProps {
    price: number
    originalPrice?: number
    isEnrolled: boolean
    isLoading: boolean
    isPreview?: boolean
    onEnroll: () => void
    onStartLearning: () => void
}

/**
 * Carte d'inscription avec prix, bouton d'action et garanties
 */
export const EnrollmentCard = memo(function EnrollmentCard({
    price,
    originalPrice,
    isEnrolled,
    isLoading,
    isPreview = false,
    onEnroll,
    onStartLearning,
}: EnrollmentCardProps) {
    const { t } = useLanguage()

    return (
        <div className="sticky top-24 z-10">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                <div className="flex flex-col gap-6">
                    {/* Badge offre limitée */}
                    <Badge className="w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-0 text-[10px] font-black uppercase tracking-wider">
                        Limited Offer
                    </Badge>

                    {/* Prix */}
                    <div className="space-y-1">
                        <div className="flex items-baseline gap-3">
                            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
                                ${price}
                            </span>
                            {originalPrice && originalPrice > price && (
                                <span className="text-slate-400 line-through text-lg font-medium">
                                    ${originalPrice}
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            One-time payment. Lifetime access.
                        </p>
                    </div>

                    {/* Bouton d'action principal */}
                    <Button
                        onClick={isEnrolled ? onStartLearning : onEnroll}
                        disabled={isLoading || (isPreview && !isEnrolled)}
                        className={cn(
                            "w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                            isEnrolled
                                ? "bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
                                : "bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20"
                        )}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Processing...
                            </>
                        ) : (isEnrolled) ? (
                            <>
                                <PlayCircle className="w-4 h-4 mr-2" />
                                {t("course_details.continue_learning") || "Continue Learning"}
                            </>
                        ) : (
                            t("course_details.enroll_now") || "Enroll Now"
                        )}
                    </Button>

                    {/* Liste des avantages */}
                    <ul className="flex flex-col gap-3 pt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {[
                            "Full lifetime access",
                            "Access on mobile and TV",
                            "Certificate of completion",
                        ].map((feature, idx) => (
                            <li key={idx} className="flex items-center gap-2">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                                <span>{feature}</span>
                            </li>
                        ))}
                    </ul>

                    {/* Badges de confiance */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400">
                            <div className="flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                <span>Secure Payment</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <RefreshCw className="w-3 h-3" />
                                <span>30-day refund</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})
