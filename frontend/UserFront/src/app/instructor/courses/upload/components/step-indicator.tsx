import React from "react"
import { useLanguage } from "@/context/language-context"
import { cn } from "@/lib/utils"
import { Check, Info, Layers, BookOpen, ClipboardCheck, Sparkles } from "lucide-react"

export const StepIndicator = ({ currentStep, onStepClick }: { currentStep: number, onStepClick: (step: number) => void }) => {
    const { t } = useLanguage()

    const steps = [
        { id: 1, label: t('instructor_upload.step1_label'), icon: Info },
        { id: 2, label: t('instructor_upload.step3_label'), icon: BookOpen },
        { id: 3, label: "Aperçu", icon: Layers },
    ]

    return (
        <div className="w-full max-w-2xl mx-auto px-4">
            <div className="relative flex items-center justify-between">
                {/* Background Connecting Line - Compact */}
                <div className="absolute left-0 top-5 right-0 h-0.5 bg-slate-100 dark:bg-slate-800/50 rounded-full -z-10 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 transition-all duration-1000 ease-in-out"
                        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                {steps.map((s, idx) => {
                    const isActive = currentStep === s.id
                    const isCompleted = currentStep > s.id
                    const isPending = currentStep < s.id
                    const Icon = s.icon

                    return (
                        <div key={s.id} className="flex flex-col items-center group relative flex-1">
                            <button
                                onClick={() => (isCompleted || s.id < currentStep) && onStepClick(s.id)}
                                disabled={isPending}
                                className={cn(
                                    "relative size-10 rounded-xl flex items-center justify-center border-2 transition-all duration-500 outline-none group",
                                    isActive ? "bg-white dark:bg-slate-900 border-indigo-500 shadow-md scale-110 z-10" :
                                        isCompleted ? "bg-indigo-500 border-indigo-500 text-white shadow-sm" :
                                            "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300"
                                )}
                            >
                                {isCompleted ? (
                                    <Check className="w-5 h-5 animate-in zoom-in duration-300" strokeWidth={3} />
                                ) : (
                                    <div className="relative">
                                        <Icon className={cn(
                                            "w-4 h-4 transition-all duration-500",
                                            isActive ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600"
                                        )} strokeWidth={isActive ? 2.5 : 2} />
                                    </div>
                                )}

                                {/* Step Number Badge - Compact */}
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 size-4 rounded-full flex items-center justify-center text-[8px] font-black border-2 transition-all",
                                    isActive ? "bg-indigo-500 border-white dark:border-slate-900 text-white" :
                                        isCompleted ? "bg-white dark:bg-slate-900 border-indigo-500 text-indigo-500" :
                                            "bg-slate-100 dark:bg-slate-800 border-white dark:border-slate-900 text-slate-400"
                                )}>
                                    {s.id}
                                </div>
                            </button>

                            {/* Label - Compact */}
                            <div className="absolute top-12 whitespace-nowrap text-center">
                                <span className={cn(
                                    "text-[8px] font-black uppercase tracking-[0.15em] transition-all duration-500 block",
                                    isActive ? "text-indigo-600 dark:text-indigo-400" :
                                        isCompleted ? "text-slate-800 dark:text-slate-200" :
                                            "text-slate-400"
                                )}>
                                    {s.label}
                                </span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
