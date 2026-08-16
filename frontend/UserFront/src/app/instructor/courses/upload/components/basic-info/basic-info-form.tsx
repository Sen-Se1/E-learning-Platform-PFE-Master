"use client"

import React, { useRef } from "react"
import { useLanguage } from "@/context/language-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Layout, Tag, Sparkles, Layers, DollarSign, BookOpen, Upload, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CourseFormData } from "../../types"
import { CATEGORIES, LEVELS } from "../../constants"
import { Field } from "./field"
import { BarChart3 } from "lucide-react"
import { IMAGE_BASE_URL } from "@/data/courses"
import { toast } from "sonner"
import Image from "next/image"

interface BasicInfoFormProps {
    data: CourseFormData
    update: (field: keyof CourseFormData, value: CourseFormData[keyof CourseFormData]) => void
}

export const BasicInfoForm = ({ data, update }: BasicInfoFormProps) => {
    const { t } = useLanguage()
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Helper to get full image URL
    const getImageUrl = (path: string | File) => {
        if (!path) return ""
        if (path instanceof File) return URL.createObjectURL(path)
        if (path.startsWith('http') || path.startsWith('data:')) return path
        return `${IMAGE_BASE_URL}/${path}`
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            update("imageCover", file) // Store the actual File object
            toast.success("Image sélectionnée")
        }
    }


    return (
        <div className="space-y-8 animate-in fade-in duration-500 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('instructor_upload.course_title_label')} icon={Layout}>
                    <div className="group flex rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/30 h-12 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm">
                        <input
                            placeholder={t('instructor_upload.course_title_placeholder')}
                            value={data.title}
                            onChange={(e) => update("title", e.target.value)}
                            className="flex-1 bg-transparent px-5 font-bold text-slate-800 dark:text-white outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-medium"
                        />
                    </div>
                </Field>

                <Field label={t('instructor_upload.target_path_label')} icon={Tag}>
                    <div className="group flex rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/30 h-12 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm">
                        <div className="px-4 flex items-center text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-50 dark:bg-card border-r border-slate-200 dark:border-white/10 group-focus-within:border-indigo-500/20 group-focus-within:text-indigo-500 transition-colors">
                            {t('instructor_upload.target_path_prefix')}
                        </div>
                        <input
                            value={data.slug}
                            onChange={(e) => update("slug", e.target.value)}
                            className="flex-1 bg-transparent px-4 font-bold text-slate-800 dark:text-white outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600 placeholder:font-medium"
                            placeholder={t('instructor_upload.target_path_placeholder')}
                        />
                    </div>
                </Field>
            </div>

            <Field label={t('instructor_upload.catchy_subtitle_label')} icon={Sparkles}>
                <div className="group flex rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/30 h-12 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm">
                    <input
                        placeholder={t('instructor_upload.catchy_subtitle_placeholder')}
                        value={data.subtitle}
                        onChange={(e) => update("subtitle", e.target.value)}
                        className="flex-1 bg-transparent px-5 font-medium text-slate-800 dark:text-white outline-none text-sm placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                </div>
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label={t('instructor_upload.category_group_label')} icon={Layers}>
                    <Select value={data.category} onValueChange={(v) => update("category", v)}>
                        <SelectTrigger className="h-12 w-full rounded-2xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] border-2 border-slate-200 dark:border-white/30 px-5 font-bold text-sm transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                            <SelectValue placeholder={t('instructor_upload.category_placeholder')} />
                        </SelectTrigger>
                        <SelectContent position="popper" className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-xl max-h-[300px] overflow-y-auto">
                            {CATEGORIES.map(c => <SelectItem key={c} value={c} className="rounded-xl mx-2 my-1 font-medium focus:bg-indigo-50 dark:focus:bg-indigo-500/20 focus:text-indigo-600 dark:focus:text-indigo-300">{c}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label={t('instructor_upload.level_label')} icon={BarChart3}>
                    <Select value={data.level} onValueChange={(v) => update("level", v)}>
                        <SelectTrigger className="h-12 w-full rounded-2xl bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] border-2 border-slate-200 dark:border-white/30 px-5 font-bold text-sm transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 text-slate-700 dark:text-slate-200 outline-none shadow-sm">
                            <SelectValue placeholder={t('instructor_upload.level_placeholder')} />
                        </SelectTrigger>
                        <SelectContent position="popper" className="rounded-2xl border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950 shadow-xl max-h-[300px] overflow-y-auto">
                            {LEVELS.map(l => <SelectItem key={l} value={l} className="rounded-xl mx-2 my-1 font-medium focus:bg-indigo-50 dark:focus:bg-indigo-500/20 focus:text-indigo-600 dark:focus:text-indigo-300">{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </Field>

                <Field label={t('instructor_upload.pricing_protocol_label')} icon={DollarSign}>
                    <div className="group flex rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-white/30 h-12 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm">
                        <div className="px-5 flex items-center text-lg font-black text-slate-400 dark:text-slate-500 border-r border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-card group-focus-within:text-indigo-500 group-focus-within:bg-indigo-50/50 dark:group-focus-within:bg-indigo-500/10 transition-colors">
                            $
                        </div>
                        <input
                            type="number"
                            value={data.price}
                            placeholder="0.00"
                            onChange={(e) => update("price", e.target.value)}
                            className="flex-1 bg-transparent px-5 font-bold text-slate-800 dark:text-white outline-none text-sm"
                        />
                    </div>
                </Field>
            </div>

            <Field label={t('instructor_upload.in_depth_description_label')} icon={BookOpen}>
                <div className="rounded-2xl border-2 border-slate-200 dark:border-white/30 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all overflow-hidden focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm p-1">
                    <textarea
                        value={data.description}
                        onChange={(e) => update("description", e.target.value)}
                        className="w-full min-h-[160px] bg-transparent p-4 font-medium text-slate-700 dark:text-slate-200 outline-none text-sm resize-none placeholder:text-slate-400 dark:placeholder:text-slate-600 leading-relaxed"
                        placeholder={t('instructor_upload.in_depth_description_placeholder')}
                    />
                </div>
            </Field>

            <Field label={t('instructor_upload.visual_identity_label')} icon={Sparkles}>
                <div className="space-y-6">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageUpload}
                        accept="image/*"
                        className="hidden"
                    />
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* URL Input Area */}
                        <div className="group flex-1 rounded-2xl border-2 border-slate-200 dark:border-white/30 h-12 bg-white dark:bg-[#0f172a] hover:bg-slate-50 dark:hover:bg-[#1e293b] transition-all flex items-center relative pr-12 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 shadow-sm">
                            <input
                                placeholder={t('instructor_upload.visual_identity_placeholder')}
                                value={typeof data.imageCover === 'string' ? data.imageCover : (data.imageCover instanceof File ? data.imageCover.name : "")}
                                onChange={(e) => update("imageCover", e.target.value)}
                                className="flex-1 bg-transparent px-5 font-medium text-slate-800 dark:text-white outline-none text-sm placeholder:text-slate-400"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                {data.imageCover ? (
                                    <div className="bg-emerald-500/10 p-1.5 rounded-lg">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500 animate-in zoom-in" />
                                    </div>
                                ) : (
                                    <Tag className="w-4 h-4 text-slate-300 group-focus-within:text-indigo-400 transition-colors" />
                                )}
                            </div>
                        </div>

                        {/* Professional Upload Button */}
                        <Button
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="h-12 px-6 rounded-2xl border-dashed border-2 bg-slate-50 dark:bg-[#0f172a] border-slate-200 dark:border-white/30 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all font-bold text-[11px] uppercase tracking-wider gap-2.5 shrink-0 shadow-sm"
                        >
                            <Upload className="size-4 shrink-0" />
                            {t('instructor_upload.upload_cover_button')}
                        </Button>
                    </div>

                    {/* Dynamic Image Preview Card */}
                    {data.imageCover && (
                        <div className="relative group/preview rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl aspect-video max-w-2xl mx-auto transform hover:scale-[1.02] transition-all duration-700 bg-slate-100 dark:bg-slate-900">
                            <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 animate-pulse" />
                            <Image
                                src={getImageUrl(data.imageCover)}
                                alt="Course Cover Preview"
                                fill
                                className="relative z-10 w-full h-full object-cover transition-transform duration-700 group-hover/preview:scale-105"
                                onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=800&auto=format&fit=crop";
                                }}
                            />

                            <div className="absolute inset-0 z-20 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-end p-6">
                                <div className="space-y-1 transform translate-y-4 group-hover/preview:translate-y-0 transition-transform duration-500">
                                    <span className="text-emerald-400 text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/20">
                                        {t('instructor_upload.preview_on')}
                                    </span>
                                    <p className="text-white font-bold text-shadow-sm">{data.title || "Course Title Preview"}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Field>
        </div>
    )
}
