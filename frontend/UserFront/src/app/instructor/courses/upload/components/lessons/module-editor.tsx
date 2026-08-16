"use client"

import React from "react"
import { ModuleData } from "../../types"
import { useLanguage } from "@/context/language-context"
import { Input } from "@/components/ui/input"
import { Folder, FileText } from "lucide-react"

interface ModuleEditorProps {
    module: ModuleData
    onUpdate: (updatedModule: ModuleData) => void
}

export const ModuleEditor = ({ module, onUpdate }: ModuleEditorProps) => {
    const { t } = useLanguage()

    const handleChange = (field: keyof ModuleData, value: ModuleData[keyof ModuleData]) => {
        onUpdate({ ...module, [field]: value })
    }

    return (
        <div className="flex-1 space-y-4 animate-in fade-in slide-in-from-right-4 duration-700 p-8 pb-10">
            {/* Header Section */}
            <div className="relative bg-slate-200/60 dark:bg-[#0f172a] backdrop-blur-2xl rounded-[32px] border-2 border-slate-300 dark:border-white/20 p-6 lg:p-8 shadow-2xl overflow-hidden group">
                {/* Premium Mesh Gradient Blobs */}
                <div className="absolute -top-24 -right-24 size-64 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 size-64 bg-violet-500/5 dark:bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-violet-500/10 transition-all duration-700" />

                <div className="absolute top-0 right-0 p-6 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-700 pointer-events-none">
                    <Folder className="size-32 rotate-12 text-slate-400 dark:text-slate-700" />
                </div>

                <div className="relative space-y-6">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                            <Folder className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900 dark:text-indigo-400 uppercase tracking-tighter leading-none">
                                Paramètres du <span className="bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent">Chapitre</span>
                            </h2>
                            <p className="text-[9px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1.5 leading-none">Configuration de l'unité pédagogique</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {/* Title Input */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <label className="text-[9px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest flex items-center gap-2">
                                    <FileText className="w-3 h-3 text-indigo-500" /> Titre du Chapitre
                                </label>
                            </div>
                            <div className="relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl opacity-0 group-focus-within/input:opacity-20 transition-opacity blur-sm" />
                                <Input
                                    value={module.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                    className="relative h-12 rounded-xl bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/30 px-5 text-sm font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                                    placeholder="ex: Introduction au Cloud Computing..."
                                />
                            </div>
                        </div>

                        {/* Description Input */}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest px-1">Objectifs du Chapitre</label>
                            <div className="relative group/input">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl opacity-0 group-focus-within/input:opacity-20 transition-opacity blur-sm" />
                                <textarea
                                    value={module.description || ""}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="relative w-full min-h-[100px] rounded-2xl bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/30 p-5 text-sm font-medium text-slate-700 dark:text-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none shadow-sm"
                                    placeholder="Décrivez brièvement ce que les étudiants vont accomplir..."
                                />
                            </div>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    )
}
