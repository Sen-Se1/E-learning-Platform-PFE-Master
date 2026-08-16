"use client"

import * as React from "react"
import { CheckIcon, GlobeIcon, ChevronDownIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import Image from 'next/image'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

import { useLanguage } from "@/context/language-context"
import { Language } from "@/lib/translations"

const languages = [
    { code: "en", name: "English", native: "English", flag: "https://flagcdn.com/w40/us.png", region: "United States" },
    { code: "fr", name: "French", native: "Français", flag: "https://flagcdn.com/w40/fr.png", region: "France" },
]

export function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage()
    const [isOpen, setIsOpen] = React.useState(false)

    return (
        <DropdownMenu onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                        "rounded-full gap-2 px-3 h-10 border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all duration-300",
                        isOpen && "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-800"
                    )}
                >
                    <div className="bg-primary/10 p-1.5 rounded-full">
                        <GlobeIcon className={cn(
                            "h-4 w-4 text-primary transition-transform duration-500",
                            isOpen && "rotate-180"
                        )} />
                    </div>
                    <span className="text-sm font-semibold hidden lg:inline-block">
                        {languages.find(l => l.code === language)?.native.substring(0, 3)}
                    </span>
                    <ChevronDownIcon className={cn(
                        "h-3 w-3 text-slate-400 transition-transform duration-300",
                        isOpen && "rotate-180"
                    )} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-[280px] p-0 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden mt-2"
            >
                <div className="bg-slate-50/50 dark:bg-slate-900/50 p-4 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                        Select Language
                    </p>
                    <p className="text-xs text-slate-500 font-medium">
                        Choose your preferred region for localized content.
                    </p>
                </div>

                <div className="p-2 space-y-1">
                    {languages.map((lang) => (
                        <DropdownMenuItem
                            key={lang.code}
                            onClick={() => setLanguage(lang.code as Language)}
                            className={cn(
                                "relative flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 group overflow-hidden border border-transparent",
                                language === lang.code
                                    ? "bg-primary/5 border-primary/10 shadow-sm"
                                    : "hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-slate-100 dark:hover:border-slate-800"
                            )}
                        >
                            {/* Selection Indicator Bar */}
                            {language === lang.code && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-primary rounded-r-full" />
                            )}

                            <div className="relative h-6 w-8 shadow-sm rounded-sm overflow-hidden ring-1 ring-slate-100 dark:ring-slate-800 group-hover:scale-110 transition-transform duration-300">
                                <Image
                                    src={lang.flag}
                                    alt={lang.name}
                                    width={32}
                                    height={24}
                                    className="object-cover w-full h-full"
                                    loading="lazy"
                                />
                            </div>

                            <div className="flex flex-col flex-1 z-10">
                                <span className={cn(
                                    "text-sm font-bold transition-colors",
                                    language === lang.code ? "text-primary" : "text-slate-900 dark:text-slate-100"
                                )}>
                                    {lang.native}
                                </span>
                                <span className="text-[11px] text-slate-500 font-medium">
                                    {lang.region}
                                </span>
                            </div>

                            {language === lang.code && (
                                <div className="bg-primary text-white p-1 rounded-full shadow-lg shadow-primary/30 animate-in zoom-in spin-in-90 duration-300">
                                    <CheckIcon className="h-3 w-3" strokeWidth={3} />
                                </div>
                            )}
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="bg-slate-50 dark:bg-slate-900/50 p-3 text-center border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 font-medium">
                        More languages coming soon
                    </span>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
