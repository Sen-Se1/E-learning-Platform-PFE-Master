"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export function ThemeSwitcher() {
    const { setTheme, theme } = useTheme()
    const [mounted, setMounted] = React.useState(false)

    // Wait until mounted on client to avoid hydration mismatch
    React.useEffect(() => {
        setMounted(true)
    }, [])

    if (!mounted) {
        return (
            <Button variant="ghost" size="icon" className="w-10 h-10 rounded-xl">
                <span className="material-symbols-outlined text-slate-400">circle</span>
            </Button>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10 rounded-xl transition-all duration-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
                >
                    <div className="relative w-6 h-6 flex items-center justify-center">
                        <span className="material-symbols-outlined absolute transition-all duration-500 transform dark:rotate-90 dark:scale-0 text-amber-500 scale-100 rotate-0">
                            light_mode
                        </span>
                        <span className="material-symbols-outlined absolute transition-all duration-500 transform rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-primary">
                            dark_mode
                        </span>
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 p-2 rounded-2xl border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-2xl animate-in fade-in zoom-in-95 duration-200"
            >
                <div className="px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">Appearance</p>
                </div>

                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1",
                        theme === "light" ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                >
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        theme === "light" ? "bg-primary/20" : "bg-slate-100 dark:bg-slate-800"
                    )}>
                        <span className="material-symbols-outlined text-[20px]">light_mode</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Light</span>
                        <span className="text-[10px] opacity-70">Best for daytime</span>
                    </div>
                    {theme === "light" && (
                        <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 mb-1",
                        theme === "dark" ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                >
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        theme === "dark" ? "bg-primary/20" : "bg-slate-100 dark:bg-slate-800"
                    )}>
                        <span className="material-symbols-outlined text-[20px]">dark_mode</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">Dark</span>
                        <span className="text-[10px] opacity-70">Easy on the eyes</span>
                    </div>
                    {theme === "dark" && (
                        <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                    )}
                </DropdownMenuItem>

                <DropdownMenuItem
                    onClick={() => setTheme("system")}
                    className={cn(
                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                        theme === "system" ? "bg-primary/10 text-primary" : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}
                >
                    <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                        theme === "system" ? "bg-primary/20" : "bg-slate-100 dark:bg-slate-800"
                    )}>
                        <span className="material-symbols-outlined text-[20px]">desktop_windows</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-sm font-bold">System</span>
                        <span className="text-[10px] opacity-70">Auto-sync with OS</span>
                    </div>
                    {theme === "system" && (
                        <span className="material-symbols-outlined text-sm ml-auto">check_circle</span>
                    )}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
