import React from "react"

export const Field = ({ label, children, icon: Icon }: { label: string, children: React.ReactNode, icon?: React.ElementType }) => (
    <div className="space-y-1.5 group/field">
        <label className="text-[10px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-[0.15em] flex items-center gap-2.5 pl-2 transition-colors group-focus-within/field:text-indigo-500">
            <div className="flex items-center justify-center size-5 rounded-lg bg-slate-50 dark:bg-slate-800/50 group-focus-within/field:bg-indigo-50 dark:group-focus-within/field:bg-indigo-500/10 transition-colors">
                {Icon && <Icon className="w-3 h-3 group-focus-within/field:scale-110 transition-transform" />}
            </div>
            {label}
        </label>
        <div className="relative pl-0.5">
            {children}
            {/* Elegant side indicator */}
            <div className="absolute -left-3 top-2 bottom-2 w-1 bg-indigo-500 rounded-full opacity-0 -translate-x-2 group-focus-within/field:opacity-100 group-focus-within/field:translate-x-0 transition-all duration-300 shadow-[0_0_12px_rgba(99,102,241,0.4)]" />
        </div>
    </div>
)
