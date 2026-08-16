"use client"

import React, { ChangeEvent } from "react"
import { Code, Terminal, CheckCircle, Zap } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface CodingConfigProps {
    language: string
    initialCode: string
    solution: string
    assertions: string
    onChange: (updates: Partial<{ language: string, initialCode: string, solution: string, assertions: string }>) => void
}

export const CodingConfig = ({
    language,
    initialCode,
    solution,
    assertions,
    onChange
}: CodingConfigProps) => {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Code className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">Coding Environment</h4>
                        <p className="text-xs text-slate-500">Configure language and templates</p>
                    </div>
                </div>

                <Select value={language} onValueChange={(val) => onChange({ language: val })}>
                    <SelectTrigger className="w-[180px] h-10 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 font-semibold text-xs shadow-sm">
                        <SelectValue placeholder="Select Language" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="BASH / SHELL">BASH / SHELL</SelectItem>
                        <SelectItem value="PYTHON">PYTHON</SelectItem>
                        <SelectItem value="JAVASCRIPT">JAVASCRIPT</SelectItem>
                        <SelectItem value="DOCKERFILE">DOCKERFILE</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-6">
                {/* Initial Code */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between ml-1">
                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5" />
                            Starter Code
                        </label>
                    </div>
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1e1e1e] shadow-lg">
                        <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10 bg-[#252526]">
                            <div className="flex gap-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                            </div>
                            <span className="text-[10px] items-center font-mono text-slate-400 ml-2">main.{language.toLowerCase().split(' ')[0]}</span>
                        </div>
                        <textarea
                            value={initialCode}
                            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ initialCode: e.target.value })}
                            className="w-full min-h-[200px] bg-transparent text-slate-300 font-mono text-xs p-4 outline-none resize-none leading-relaxed"
                            spellCheck={false}
                            placeholder="# Write starter code here..."
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Solution */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 ml-1">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                            Reference Solution
                        </label>
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1e1e1e] shadow-lg">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#252526]">
                                <span className="text-[10px] font-mono text-emerald-400">solution</span>
                            </div>
                            <textarea
                                value={solution}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ solution: e.target.value })}
                                className="w-full min-h-[300px] bg-transparent text-emerald-100/80 font-mono text-xs p-4 outline-none resize-none leading-relaxed"
                                spellCheck={false}
                                placeholder="# Correct implementation..."
                            />
                        </div>
                    </div>

                    {/* Assertions */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 flex items-center gap-2 ml-1">
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            Test Cases (Assertions)
                        </label>
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-[#1e1e1e] shadow-lg">
                            <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-[#252526]">
                                <span className="text-[10px] font-mono text-amber-400">tests</span>
                            </div>
                            <textarea
                                value={assertions}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange({ assertions: e.target.value })}
                                className="w-full min-h-[300px] bg-transparent text-amber-100/80 font-mono text-xs p-4 outline-none resize-none leading-relaxed"
                                spellCheck={false}
                                placeholder="# Write assertions..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
