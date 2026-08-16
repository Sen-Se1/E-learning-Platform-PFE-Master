"use client"

import React, { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { LessonData } from "../../types"
import { useLanguage } from "@/context/language-context"
import { ExerciseEditor } from "../exercises/exercise-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Play,
    FileText,
    Code,
    File as FileIcon,
    Clock,
    Trash2,
    Bold,
    Italic,
    Link,
    Image as ImageIcon,
    Layout,
    Info,
    ChevronDown,
    ExternalLink,
    Upload,
    Type,
    Sparkles,
    Palette,
    Type as TypeIcon,
    Heading1,
    Columns,
    Square,
    ImagePlus,
    Maximize2,
    Minimize2,
    MoveHorizontal,
    Terminal,
    Settings,
    Search,
    Wand2,
    Plus,
    X,
    ClipboardCheck,
    CheckCircle2,
    ArrowLeft
} from "lucide-react"
import { deleteExercise } from "@/data/courses"
import { toast } from "sonner"

const isMongoId = (id: string) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id);

const getYoutubeId = (url: string) => {
    if (!url) return null;
    if (url.includes('v=')) return url.split('v=')[1].split('&')[0];
    if (url.includes('youtu.be/')) return url.split('youtu.be/')[1].split('?')[0];
    return null;
};

const loadYoutubeIframeApi = (): Promise<any> => {
    return new Promise((resolve) => {
        if ((window as any).YT && (window as any).YT.Player) {
            resolve((window as any).YT);
            return;
        }

        const previousOnCallback = (window as any).onYouTubeIframeAPIReady;
        (window as any).onYouTubeIframeAPIReady = () => {
            if (previousOnCallback) previousOnCallback();
            resolve((window as any).YT);
        };

        if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }
    });
};

const getYoutubeDurationClient = (videoId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        loadYoutubeIframeApi().then((YT) => {
            const tempDiv = document.createElement('div');
            tempDiv.style.position = 'absolute';
            tempDiv.style.width = '0px';
            tempDiv.style.height = '0px';
            tempDiv.style.opacity = '0';
            tempDiv.style.pointerEvents = 'none';
            tempDiv.id = `temp-yt-player-${Date.now()}`;
            document.body.appendChild(tempDiv);

      const timeout = setTimeout(() => {
    cleanup();
    reject(new Error('Timeout waiting for YouTube player'));
}, 8000);

const cleanup = () => {
    clearTimeout(timeout);
    try {
        player.destroy();
    } catch {
        // Ignore cleanup errors
    }
    tempDiv.remove();
};

            let checkInterval: NodeJS.Timeout;
            const player = new YT.Player(tempDiv.id, {
                videoId: videoId,
                playerVars: {
                    autoplay: 0,
                    mute: 1,
                    controls: 0,
                    showinfo: 0,
                    rel: 0
                },
                events: {
                    onReady: () => {
                        let attempts = 0;
                        checkInterval = setInterval(() => {
                            attempts++;
                            const d = player.getDuration();
                            if (d > 0) {
                                clearInterval(checkInterval);
                                const h = Math.floor(d / 3600);
                                const m = Math.floor((d % 3600) / 60);
                                const s = Math.floor(d % 60);
                                const durationStr = h > 0 
                                    ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
                                    : `${m}:${s < 10 ? '0' : ''}${s}`;
                                cleanup();
                                resolve(durationStr);
                            } else if (attempts > 5) {
                                player.playVideo();
                            }
                        }, 500);
                    },
                    onStateChange: (event: any) => {
                        if (event.data === YT.PlayerState.PLAYING) {
                            clearInterval(checkInterval);
                            const d = player.getDuration();
                            if (d > 0) {
                                const h = Math.floor(d / 3600);
                                const m = Math.floor((d % 3600) / 60);
                                const s = Math.floor(d % 60);
                                const durationStr = h > 0 
                                    ? `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
                                    : `${m}:${s < 10 ? '0' : ''}${s}`;
                                player.pauseVideo();
                                cleanup();
                                resolve(durationStr);
                            }
                        }
                    },
                    onError: (err: any) => {
                        clearInterval(checkInterval);
                        cleanup();
                        reject(err);
                    }
                }
            });
        }).catch(reject);
    });
};

const PRESET_COLORS = [
    { name: 'Slate', value: '#64748b' },
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Rose', value: '#f43f5e' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Violet', value: '#8b5cf6' },
    { name: 'White', value: '#ffffff' },
    { name: 'Black', value: '#000000' },
]

const PRESET_SIZES = [
    { name: 'Petit', value: '2', label: '13px' },
    { name: 'Normal', value: '3', label: '16px' },
    { name: 'Grand', value: '5', label: '24px' },
    { name: 'Énorme', value: '7', label: '48px' },
]


interface LessonEditorProps {
    lesson: LessonData
    onUpdate: (updatedLesson: LessonData) => void
}

export const LessonEditor = ({ lesson, onUpdate }: LessonEditorProps) => {
    const { t } = useLanguage()
    const editorRef = useRef<HTMLDivElement>(null)
    const contentRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const videoFileInputRef = useRef<HTMLInputElement>(null)
    const pdfFileInputRef = useRef<HTMLInputElement>(null)

    // UI States
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [showSizePicker, setShowSizePicker] = useState(false)
    const [isBoldActive, setIsBoldActive] = useState(false)
    const [isItalicActive, setIsItalicActive] = useState(false)
    const [isNoteOpen, setIsNoteOpen] = useState(false)

    const [videoUploading, setVideoUploading] = useState(false)
    const [pdfUploading, setPdfUploading] = useState(false)
    const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)

    // Image Resizing State
    const [selectedImg, setSelectedImg] = useState<HTMLImageElement | null>(null)
    const [isResizing, setIsResizing] = useState(false)
    const [resizeStart, setResizeStart] = useState({ x: 0, width: 0 })

    const handleFieldChange = (field: keyof LessonData, value: LessonData[keyof LessonData]) => {
        onUpdate({ id: lesson.id, [field]: value } as any)
    }

    const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFieldChange('videoFile', file)
            toast.success("Vidéo sélectionnée")

            // Auto-detect duration
            const video = document.createElement('video')
            video.preload = 'metadata'
            video.onloadedmetadata = () => {
                window.URL.revokeObjectURL(video.src)
                const h = Math.floor(video.duration / 3600)
                const m = Math.floor((video.duration % 3600) / 60)
                const s = Math.floor(video.duration % 60)

                let durationStr = ""
                if (h > 0) {
                    durationStr = `${h}:${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`
                } else {
                    durationStr = `${m}:${s < 10 ? '0' : ''}${s}`
                }

                handleFieldChange('duration', durationStr)
                toast.success(`Durée détectée : ${durationStr}`)
            }
            video.src = URL.createObjectURL(file)

            // Clear input value to allow re-selection of the same file
            if (videoFileInputRef.current) videoFileInputRef.current.value = ""
        }
    }

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFieldChange('pdfFile', file)
            toast.success("PDF sélectionné")
        }
    }



    const checkActiveStyles = () => {
        setIsBoldActive(document.queryCommandState('bold'))
        setIsItalicActive(document.queryCommandState('italic'))
    }

    const execCommand = (command: string, value: string = "") => {
        document.execCommand(command, false, value)
        checkActiveStyles()
        // Focus corect editor based on modal state
        if (isNoteOpen) {
            contentRef.current?.focus()
        } else {
            editorRef.current?.focus()
        }
    }

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            const reader = new FileReader()
            reader.onload = (event) => {
                const imageUrl = event.target?.result as string
                const img = `<img src="${imageUrl}" style="width: 300px; border-radius: 24px; margin: 24px 0; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); cursor: move; transition: outline 0.2s;" class="article-image" />`

                // Ensure insertion happens in active editor
                if (isNoteOpen) {
                    contentRef.current?.focus()
                    document.execCommand('insertHTML', false, img)
                    handleContentInput()
                } else {
                    editorRef.current?.focus()
                    document.execCommand('insertHTML', false, img)
                    handleInput()
                }
            }
            reader.readAsDataURL(file)
        }
        if (fileInputRef.current) fileInputRef.current.value = ""
    }

    const handleEditorClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'IMG') {
            setSelectedImg(target as HTMLImageElement)
        } else {
            setSelectedImg(null)
        }
        checkActiveStyles()
    }

    const handleDeleteImage = () => {
        if (!selectedImg) return
        const parent = selectedImg.parentElement
        selectedImg.remove()
        setSelectedImg(null)

        // Sync the correct state
        if (parent && (parent === editorRef.current || editorRef.current?.contains(parent))) {
            handleInput()
        } else if (parent && (parent === contentRef.current || contentRef.current?.contains(parent))) {
            handleContentInput()
        }
    }

    const startResizing = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        if (!selectedImg) return
        setIsResizing(true)
        setResizeStart({ x: e.clientX, width: selectedImg.offsetWidth })
    }

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !selectedImg) return
            const deltaX = e.clientX - resizeStart.x
            const newWidth = Math.max(50, resizeStart.width + deltaX)
            selectedImg.style.width = `${newWidth}px`
        }
        const handleMouseUp = () => {
            if (isResizing) {
                setIsResizing(false)
                if (isNoteOpen) handleContentInput(); else handleInput();
            }
        }
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove)
            window.addEventListener('mouseup', handleMouseUp)
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseup', handleMouseUp)
        }
    }, [isResizing, selectedImg, resizeStart, isNoteOpen])

    useEffect(() => {
        if (editorRef.current) {
            editorRef.current.innerHTML = lesson.description || ""
        }
        if (contentRef.current) {
            contentRef.current.innerHTML = lesson.content || ""
        }
    }, [lesson.id])

    const insertCodeBlock = () => {
        const selection = window.getSelection()
        if (!selection) return

        // Detect target container
        const targetContainer = isNoteOpen ? contentRef.current : editorRef.current
        if (!targetContainer) return

        // If selection is lost or outside the container, force it to the end
        if (!selection.rangeCount || !targetContainer.contains(selection.anchorNode)) {
            const range = document.createRange()
            range.selectNodeContents(targetContainer)
            range.collapse(false)
            selection.removeAllRanges()
            selection.addRange(range)
        }

        const range = selection.getRangeAt(0)
        const codeBlock = document.createElement('pre')
        codeBlock.className = "bg-slate-900 text-indigo-300 p-5 rounded-2xl my-6 font-mono text-[11px] overflow-x-auto border border-slate-800 shadow-2xl relative group"
        codeBlock.setAttribute('spellcheck', 'false')
        codeBlock.innerHTML = `<code>${selection.toString() || '// Votre code ici...'}</code>`

        range.deleteContents()
        range.insertNode(codeBlock)

        // Create an "escape" paragraph after the code block
        const p = document.createElement('p')
        p.innerHTML = '<br>'
        p.className = "mt-4"
        codeBlock.after(p)

        // Force focus to the new paragraph
        const newRange = document.createRange()
        const newSel = window.getSelection()
        newRange.setStart(p, 0)
        newRange.collapse(true)
        newSel?.removeAllRanges()
        newSel?.addRange(newRange)

        if (isNoteOpen) handleContentInput(); else handleInput();
    }

    const handleContentInput = () => {
        if (contentRef.current) {
            handleFieldChange('content', contentRef.current.innerHTML)
        }
    }

    const handleInput = () => {
        if (editorRef.current) {
            handleFieldChange('description', editorRef.current.innerHTML)
        }
    }

    const handleContentClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement
        if (target.tagName === 'IMG') {
            setSelectedImg(target as HTMLImageElement)
        } else {
            setSelectedImg(null)
        }
        checkActiveStyles()
    }

    if (lesson.type === 'exercise') {
        const exercises = lesson.exercises || []
        const activeExercise = exercises.find(ex => ex.id === activeExerciseId) || exercises[0] || {
            id: Math.random().toString(36).substr(2, 9),
            type: 'coding',
            title: "",
            instructions: "",
            maxScore: 100,
            language: "BASH / SHELL",
            initialCode: "",
            solution: "",
            assertions: "",
            options: [],
            correctAnswer: true
        }

        return (
            <div className="flex-1 p-8 pb-10 flex flex-col gap-6">
                {exercises.length > 1 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {exercises.map((ex, idx) => (
                            <button
                                key={ex.id}
                                onClick={() => setActiveExerciseId(ex.id)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0 border-2 truncate max-w-[150px]",
                                    (activeExerciseId === ex.id || (!activeExerciseId && idx === 0))
                                        ? "bg-indigo-600 border-indigo-500 text-white shadow-lg"
                                        : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-500 hover:border-indigo-500/50"
                                )}
                            >
                                {ex.title || `Exercice ${idx + 1}`}
                            </button>
                        ))}
                    </div>
                )}
                <ExerciseEditor
                    lesson={lesson}
                    exercise={activeExercise}
                    onChange={(updatedEx) => {
                        const newExercises = exercises.length > 0
                            ? exercises.map(ex => ex.id === activeExercise.id ? updatedEx : ex)
                            : [updatedEx]
                        handleFieldChange('exercises', newExercises)
                    }}
                    onDelete={async () => {
                        try {
                            if (isMongoId(activeExercise.id)) {
                                await deleteExercise(activeExercise.id);
                                toast.success("Exercice supprimé de la base de données");
                            }
                            const newExercises = exercises.filter(ex => ex.id !== activeExercise.id)
                            handleFieldChange('exercises', newExercises)
                            if (newExercises.length > 0) setActiveExerciseId(newExercises[0].id);
                            else setActiveExerciseId(null);
                        } catch (error) {
                            if (error instanceof Error) {
                                toast.error("Échec de la suppression: " + error.message);
                            }
                        }
                    }}
                    t={t}
                />
            </div>
        )
    }

    return (
        <div className="flex-1 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-5 duration-700 p-8 pb-10">
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

            <div className="relative bg-white/60 dark:bg-[#0f172a] backdrop-blur-2xl rounded-[32px] border-2 border-slate-300 dark:border-white/20 p-4 lg:p-6 shadow-2xl overflow-hidden group">
                <div className="absolute -top-24 -right-24 size-80 bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-indigo-500/20 transition-all duration-700" />
                <div className="absolute -bottom-24 -left-24 size-80 bg-violet-500/5 dark:bg-purple-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-violet-500/10 transition-all duration-700" />

                <div className="relative space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between border-b-2 border-slate-300/50 dark:border-white/10 pb-4">
                        <div className="flex items-center gap-3">
                            <div className="size-11 rounded-xl bg-gradient-to-br from-indigo-600 to-violet-700 flex items-center justify-center text-white shadow-lg">
                                <Settings className="w-5 h-5" />
                            </div>
                            <div>
                                <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none">
                                    Paramètres <span className="text-indigo-500">Leçon</span>
                                </h1>
                                <p className="text-[8px] font-bold text-slate-500 dark:text-slate-500 uppercase tracking-widest mt-1">Configuration pédagogique</p>
                            </div>
                        </div>
                    </div>

                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest px-1 flex items-center gap-2">
                                <Type className="w-3.5 h-3.5 text-indigo-500" /> Titre
                            </label>
                            <div className="relative group/input">
                                <Input
                                    value={lesson.title}
                                    onChange={(e) => handleFieldChange('title', e.target.value)}
                                    placeholder="ex: Introduction..."
                                    className="h-10 rounded-xl bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/30 px-4 text-xs font-bold text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Presentation */}
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest px-1 flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-indigo-500" /> Présentation
                        </label>
                        <div className="relative group/editor">
                            <div className="relative bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/30 rounded-2xl overflow-hidden min-h-[140px]">
                                {selectedImg && !isNoteOpen && (
                                    <div className="absolute pointer-events-none border-2 border-indigo-500 rounded-xl z-[60]" style={{ top: selectedImg.offsetTop, left: selectedImg.offsetLeft, width: selectedImg.offsetWidth, height: selectedImg.offsetHeight }}>
                                        <div onMouseDown={startResizing} className="absolute bottom-0 right-0 size-6 bg-indigo-500 rounded-tl-xl rounded-br-2xl pointer-events-auto cursor-nwse-resize flex items-center justify-center shadow-lg"><MoveHorizontal className="w-3 h-3 text-white rotate-45" /></div>
                                        <button onClick={handleDeleteImage} className="absolute top-2 right-2 size-8 bg-rose-500 text-white rounded-xl pointer-events-auto flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                                <div className="p-4 outline-none" onClick={handleEditorClick}>
                                    <div
                                        ref={editorRef}
                                        contentEditable
                                        onInput={handleInput}
                                        onSelect={checkActiveStyles}
                                        className="outline-none text-slate-700 dark:text-slate-300 text-sm leading-relaxed"
                                        data-placeholder="Décrivez le contenu..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Media & Resources */}
                    <div className="flex flex-col gap-3">
                        <div className="space-y-3 p-4 rounded-[24px] bg-white/40 dark:bg-[#0f172a]/80 border-2 border-slate-200 dark:border-white/30 shadow-sm relative overflow-hidden group/section">
                            <div className="relative flex items-center justify-between">
                                <label className="text-[10px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest flex items-center gap-2">
                                    <Play className="w-3.5 h-3.5 text-rose-500" /> Support de cours
                                </label>
                                <div className="flex items-center bg-slate-100/50 dark:bg-black/20 p-1 rounded-xl">
                                    <button onClick={() => handleFieldChange('videoSource', 'url')} className={cn("px-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all", (lesson.videoSource || 'url') === 'url' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-indigo-400")}>URL</button>
                                    <button onClick={() => handleFieldChange('videoSource', 'upload')} className={cn("px-4 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all", lesson.videoSource === 'upload' ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-sm" : "text-slate-500 hover:text-indigo-400")}>Fichier</button>
                                </div>
                            </div>

                            <div className="relative">
                                {(!lesson.type || lesson.type === 'video') && (
                                    lesson.videoSource === 'upload' ? (
                                        <div
                                            onClick={() => videoFileInputRef.current?.click()}
                                            className={cn(
                                                "h-24 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-300",
                                                lesson.videoFile
                                                    ? "bg-emerald-500/5 border-emerald-500/50 shadow-inner"
                                                    : "bg-slate-50/50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-indigo-500/50"
                                            )}
                                        >
                                            <input type="file" ref={videoFileInputRef} accept="video/*" onChange={handleVideoUpload} className="hidden" />
                                            {lesson.videoFile ? (
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500 animate-in zoom-in duration-300" />
                                            ) : (
                                                <Upload className="w-6 h-6 text-slate-400 group-hover/section:scale-110 transition-transform" />
                                            )}
                                            <div className="text-center px-4 max-w-full">
                                                <p className={cn(
                                                    "text-[10px] font-black uppercase tracking-wider truncate",
                                                    lesson.videoFile ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400"
                                                )}>
                                                    {lesson.videoFile instanceof File
                                                        ? lesson.videoFile.name
                                                        : (typeof lesson.videoFile === 'string' && lesson.videoFile
                                                            ? lesson.videoFile.split('/').pop()
                                                            : "Choisir un fichier vidéo")}
                                                </p>
                                                {lesson.videoFile && (
                                                    <p className="text-[8px] font-bold text-emerald-500/60 uppercase mt-0.5 tracking-widest">Fichier prêt pour l'envoi</p>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <Input
                                            value={lesson.videoUrl || ""}
                                            onChange={(e) => {
                                                const url = e.target.value;
                                                handleFieldChange('videoUrl', url);

                                                // Try auto-detecting YouTube duration
                                                if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
                                                    toast.promise(
                                                        fetch(`${process.env.NEXT_PUBLIC_COURSE_API_URL as string}/lessons/youtube-duration?url=${encodeURIComponent(url)}`)
                                                            .then(res => {
                                                                if (!res.ok) throw new Error('Failed to fetch duration');
                                                                return res.json();
                                                            })
                                                            .then(data => {
                                                                if (data && data.data) {
                                                                    handleFieldChange('duration', data.data);
                                                                    return data.data;
                                                                } else {
                                                                    throw new Error('Invalid duration response');
                                                                }
                                                            })
                                                            .catch(err => {
                                                                // Fallback to client-side detection if backend is blocked
                                                                const videoId = getYoutubeId(url);
                                                                if (videoId) {
                                                                    return getYoutubeDurationClient(videoId).then(clientDuration => {
                                                                        handleFieldChange('duration', clientDuration);
                                                                        return clientDuration;
                                                                    });
                                                                }
                                                                throw err;
                                                            }),
                                                        {
                                                            loading: 'Détection de la durée YouTube...',
                                                            success: (dur) => `Durée détectée : ${dur}`,
                                                            error: 'Durée non détectée (saisie manuelle requise)'
                                                        }
                                                    )
                                                }
                                            }}
                                            placeholder="Lien YouTube, Vimeo..."
                                            className="h-9 rounded-xl bg-white dark:bg-[#0f172a] border-2 border-slate-200 dark:border-white/30 px-4 text-[10px] font-bold"
                                        />
                                    )
                                )}

                                {lesson.type === 'resource' && (
                                    <div className="p-4 bg-blue-500/5 border-2 border-dashed border-blue-500/20 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-blue-500 uppercase">Mode Ressource : Ajoutez des fichiers ci-dessous</p>
                                    </div>
                                )}

                                {lesson.type === 'lab' && (
                                    <div className="p-4 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase">Mode TP / Lab : Ajoutez des consignes dans la présentation</p>
                                    </div>
                                )}

                                {lesson.type === 'quiz' && (
                                    <div className="p-4 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-xl text-center">
                                        <p className="text-[10px] font-bold text-amber-500 uppercase">Mode Quiz : Ajoutez des questions dans la section TP</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 p-4 rounded-[24px] bg-white/40 dark:bg-[#0f172a]/80 border-2 border-slate-200 dark:border-white/30 shadow-sm">
                            <label className="text-[10px] font-black text-slate-600 dark:text-indigo-400/80 uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-3.5 h-3.5 text-emerald-500" /> Suppléments & Note
                            </label>
                            <input
                                type="file"
                                ref={pdfFileInputRef}
                                onChange={handlePdfUpload}
                                accept="application/pdf"
                                className="hidden"
                            />
                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    onClick={() => pdfFileInputRef.current?.click()}
                                    className="h-14 rounded-xl bg-rose-50 dark:bg-rose-500/5 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-[8px] font-black uppercase tracking-widest flex flex-col items-center justify-center gap-1 hover:bg-rose-100 dark:hover:bg-rose-500/10 transition-all group/pdf"
                                >
                                    <FileText className="w-3.5 h-3.5 text-rose-500 group-hover/pdf:scale-110 transition-transform" />
                                    {lesson.pdfFile instanceof File ? "OK" : "PDF"}
                                </Button>


                                <Button
                                    onClick={() => { handleFieldChange('hasTextContent', true); setIsNoteOpen(true); }}
                                    className={cn("h-14 rounded-xl font-black text-[8px] uppercase tracking-widest flex flex-col items-center justify-center gap-1", lesson.hasTextContent ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "bg-indigo-500/10 border-2 border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20")}
                                >
                                    {lesson.hasTextContent ? <FileText className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />} Note
                                </Button>
                            </div>


                        </div>
                    </div>
                </div>
            </div>

            {/* Note Modal */}
            {isNoteOpen && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md" onClick={() => setIsNoteOpen(false)} />
                    <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <h3 className="text-sm font-black text-slate-800 dark:text-white uppercase">Éditeur de Note</h3>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                                    <button onClick={() => execCommand('bold')} className={cn("size-8 rounded-lg flex items-center justify-center transition-all", isBoldActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5")}><Bold className="w-3.5 h-3.5" /></button>
                                    <button onClick={() => execCommand('italic')} className={cn("size-8 rounded-lg flex items-center justify-center transition-all", isItalicActive ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5")}><Italic className="w-3.5 h-3.5" /></button>
                                </div>

                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-white/5 relative">
                                    <button onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }} className={cn("size-8 rounded-lg flex items-center justify-center transition-all", showColorPicker ? "bg-indigo-500 text-white" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5")}>
                                        <Palette className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }} className={cn("size-8 rounded-lg flex items-center justify-center transition-all", showSizePicker ? "bg-indigo-500 text-white" : "text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5")}>
                                        <TypeIcon className="w-3.5 h-3.5" />
                                    </button>

                                    {showColorPicker && (
                                        <div className="absolute top-full right-0 mt-2 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] grid grid-cols-4 gap-1.5 min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
                                            {PRESET_COLORS.map(c => (
                                                <button key={c.value} onClick={() => { execCommand('foreColor', c.value); setShowColorPicker(false); }} className="size-6 rounded-lg border border-slate-100 dark:border-white/5 transition-transform hover:scale-110" style={{ backgroundColor: c.value }} title={c.name} />
                                            ))}
                                        </div>
                                    )}

                                    {showSizePicker && (
                                        <div className="absolute top-full right-0 mt-2 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl z-[100] flex flex-col min-w-[120px] animate-in fade-in zoom-in-95 duration-200">
                                            {PRESET_SIZES.map(s => (
                                                <button key={s.value} onClick={() => { execCommand('fontSize', s.value); setShowSizePicker(false); }} className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-left hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300 transition-colors">
                                                    {s.name} <span className="text-[8px] opacity-50 ml-auto font-bold">{s.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950/50 p-1 rounded-xl border border-slate-200 dark:border-white/5">
                                    <button onClick={() => fileInputRef.current?.click()} className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-all"><ImageIcon className="w-3.5 h-3.5" /></button>
                                    <button onClick={insertCodeBlock} className="size-8 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-white/5 transition-all"><Code className="w-3.5 h-3.5" /></button>
                                </div>

                                <div className="w-px h-6 bg-slate-200 dark:bg-white/10 mx-1" />

                                <button onClick={() => setIsNoteOpen(false)} className="size-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-rose-500 hover:text-white transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 dark:bg-slate-950/20">
                            <div className="max-w-4xl mx-auto min-h-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/5 rounded-3xl p-8 relative article-editor">
                                {selectedImg && (
                                    <div className="absolute pointer-events-none border-2 border-indigo-500 rounded-xl z-[60]" style={{ top: selectedImg.offsetTop, left: selectedImg.offsetLeft, width: selectedImg.offsetWidth, height: selectedImg.offsetHeight }}>
                                        <div onMouseDown={startResizing} className="absolute bottom-0 right-0 size-6 bg-indigo-500 rounded-tl-xl rounded-br-2xl pointer-events-auto cursor-nwse-resize flex items-center justify-center shadow-lg"><MoveHorizontal className="w-3 h-3 text-white rotate-45" /></div>
                                        <button onClick={handleDeleteImage} className="absolute top-2 right-2 size-8 bg-rose-500 text-white rounded-xl pointer-events-auto flex items-center justify-center shadow-lg hover:bg-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                )}
                                <div
                                    ref={contentRef}
                                    contentEditable
                                    onInput={handleContentInput}
                                    onSelect={checkActiveStyles}
                                    onClick={handleContentClick}
                                    className="outline-none min-h-[400px]"
                                    data-placeholder="Commencez à rédiger..."
                                />
                            </div>
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 flex items-center justify-end">
                            <Button onClick={() => setIsNoteOpen(false)} className="h-9 px-6 rounded-lg bg-indigo-500 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all">
                                Enregistrer et fermer
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
