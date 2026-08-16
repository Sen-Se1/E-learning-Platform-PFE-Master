"use client"

import React from "react"
import {
    Code,
    MessageSquare,
    CheckCircle2,
    FileText,
    Trophy,
    Check,
    ChevronLeft,
    ChevronRight,
    Download,
    Terminal,
    Play,
    FileBadge,
    Circle,
    X
} from "lucide-react"
import { Lesson, Course, Exercise } from "@/data/courses"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { CourseRating } from "@/components/courses/course-rating"
import { useSearchParams, useRouter } from "next/navigation"

interface ContentTabsProps {
    currentLesson: Lesson;
    course: Course;
    onExerciseComplete?: (exId: string) => void;
    completedItems?: string[];
}

export function ContentTabs({ currentLesson, course, onExerciseComplete, completedItems = [] }: ContentTabsProps) {
    const [activeExercise, setActiveExercise] = React.useState<Exercise | null>(null);
    const [userCode, setUserCode] = React.useState<string>("");
    const [selectedOptionId, setSelectedOptionId] = React.useState<string | null>(null);
    const [booleanAnswer, setBooleanAnswer] = React.useState<boolean | null>(null);
    const [isChecking, setIsChecking] = React.useState(false);
    const [validationResult, setValidationResult] = React.useState<{ isCorrect: boolean; feedback: string; attemptNumber?: number } | null>(null);
    const autoNavTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const { user } = useUserStore();
    const router = useRouter();
    const searchParams = useSearchParams();
    const exerciseIdParam = searchParams.get('exerciseId');
    const [hasHandledInitial, setHasHandledInitial] = React.useState(false);
    const [lessonStats, setLessonStats] = React.useState<any[]>([]);

    const fetchLessonStats = React.useCallback(async () => {
        if (!user || !currentLesson) return;
        try {
            const token = localStorage.getItem('user-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL}/submissions/progression/${currentLesson._id || currentLesson.id}?userId=${user.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (result.data) {
                setLessonStats(result.data.exerciseStats || []);
            }
        } catch (err) {
            console.error("Error fetching lesson stats:", err);
        }
    }, [user, currentLesson, activeExercise]);

    React.useEffect(() => {
        fetchLessonStats();
    }, [fetchLessonStats]);

    React.useEffect(() => {
        if (autoNavTimeoutRef.current) {
            clearTimeout(autoNavTimeoutRef.current);
            autoNavTimeoutRef.current = null;
        }
        if (activeExercise) {
            setUserCode(activeExercise.initialCode || "// Write your code here...");
            setSelectedOptionId(null);
            setBooleanAnswer(null);
            setValidationResult(null);
        }
    }, [activeExercise]);

    // Handle initial exerciseId from URL
    React.useEffect(() => {
        if (!hasHandledInitial && exerciseIdParam && currentLesson.exercises) {
            const exercise = currentLesson.exercises.find(
                ex => (ex._id || ex.id) === exerciseIdParam
            );
            if (exercise) {
                setActiveExercise(exercise);
                setHasHandledInitial(true);
            }
        }
    }, [exerciseIdParam, currentLesson.exercises, hasHandledInitial]);

    const handleExitWorkspace = () => {
        setActiveExercise(null);
        // Clear exerciseId from URL
        const params = new URLSearchParams(searchParams.toString());
        params.delete('exerciseId');
        const newQuery = params.toString();
        router.replace(`${window.location.pathname}${newQuery ? `?${newQuery}` : ''}`, { scroll: false });
    };

    // Find breadcrumb info
    let currentModule: any = null;
    let currentModuleIdx = 0;
    let lessonNumberInModule = 0;
    let totalLessonsInModule = 0;

    course.modules.forEach((mod, modIdx) => {
        const foundLessonIdx = mod.lessons.findIndex(l => l.id === currentLesson.id || l._id === currentLesson.id);
        if (foundLessonIdx !== -1) {
            currentModule = mod;
            currentModuleIdx = modIdx + 1;
            lessonNumberInModule = foundLessonIdx + 1;
            totalLessonsInModule = mod.lessons.length;
        }
    });

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-slate-900 p-6 lg:p-10 space-y-12 animate-in fade-in duration-700">
            {/* 1. Header & Overview Section */}
            <section className="space-y-8">
                <div>
                    <div className="flex items-center flex-wrap gap-2 mb-4">
                        <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-bold text-[10px] uppercase tracking-wider border-none px-3 py-1">
                            Module {currentModuleIdx}{currentModule?.title ? `: ${currentModule.title}` : ''}
                        </Badge>
                        <span className="text-slate-200 dark:text-slate-800">•</span>
                        <span className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">Session {lessonNumberInModule} of {totalLessonsInModule}</span>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight mb-6">
                        {currentLesson.title}
                    </h1>
                    <div className="max-w-4xl space-y-6">
                        {currentLesson.description && (
                            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic border-l-4 border-blue-600/20 pl-6 py-1">
                                {currentLesson.description}
                            </p>
                        )}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 mb-2 mt-2">
                                <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                                    <FileText className="size-4 text-amber-600" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Session Content</h3>
                            </div>
                            <div className="bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <FileText className="size-32 text-amber-600 rotate-12" />
                                </div>
                                <div
                                    className="relative z-10 text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 max-w-none text-left
                                    [&_h1]:text-2xl [&_h1]:font-black [&_h1]:text-slate-900 [&_h1]:dark:text-white [&_h1]:mb-6 [&_h1]:mt-8
                                    [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:dark:text-slate-100 [&_h2]:mb-4 [&_h2]:mt-6
                                    [&_p]:mb-4
                                    [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4
                                    [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
                                    [&_li]:mb-1
                                    [&_img]:rounded-2xl [&_img]:my-6 [&_img]:shadow-lg
                                    [&_pre]:bg-slate-900 [&_pre]:text-slate-100 [&_pre]:p-5 [&_pre]:rounded-2xl [&_pre]:font-mono [&_pre]:text-[13px] [&_pre]:overflow-x-auto [&_pre]:shadow-2xl [&_pre]:border [&_pre]:border-slate-800 [&_pre]:my-6
                                    [&_code]:bg-slate-100 [&_code]:dark:bg-slate-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:font-mono [&_code]:text-sm
                                    [&_pre>code]:bg-transparent [&_pre>code]:p-0 [&_pre>code]:text-inherit"
                                    dangerouslySetInnerHTML={{
                                        __html: currentLesson.content || "In this session, we investigate the fundamental architecture and implementation strategies. This technical deep dive explores the core pillars of the subject matter, ensuring a robust understanding of the underlying principles."
                                    }}
                                />
                            </div>
                        </div>

                        {/* Completion Button for Non-Video Lessons */}
                        {currentLesson.type && currentLesson.type !== 'video' && (
                            <div className="pt-6">
                                <Button
                                    onClick={() => {
                                        if (onExerciseComplete) {
                                            onExerciseComplete(currentLesson._id || currentLesson.id);
                                            toast.success("Session marquée comme terminée !");
                                        }
                                    }}
                                    className={cn(
                                        "h-14 px-10 rounded-2xl font-black text-sm uppercase tracking-widest gap-3 shadow-xl transition-all",
                                        completedItems.includes(currentLesson._id || currentLesson.id)
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                            : "bg-indigo-600 hover:bg-slate-900 text-white shadow-indigo-500/20"
                                    )}
                                >
                                    {completedItems.includes(currentLesson._id || currentLesson.id) ? (
                                        <>
                                            <CheckCircle2 className="size-5" />
                                            Terminé
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="size-5" />
                                            Marquer comme terminé
                                        </>
                                    )}
                                </Button>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 px-1">
                                    Une fois terminé, vous pourrez passer à la session suivante.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 2. Instructor Notes Section */}
            {currentLesson.noteContent && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-8 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <FileBadge className="size-4 text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Instructor Insights</h3>
                    </div>
                    <div className="max-w-4xl">
                        <div className="bg-amber-50/30 dark:bg-amber-900/5 border border-amber-100/50 dark:border-amber-900/20 rounded-3xl p-6 lg:p-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileBadge className="size-32 text-amber-600 rotate-12" />
                            </div>
                            <div className="relative z-10 text-slate-700 dark:text-slate-300 text-lg leading-relaxed">
                                {(() => {
                                    const raw = currentLesson.noteContent?.replace(/^[`"\s]+|[`"\s]+$/g, '') || "";
                                    const lines = raw.split('\n');
                                    const elements: React.ReactNode[] = [];
                                    let currentCodeBlock: string[] = [];
                                    let inExplicitCodeBlock = false;

                                    lines.forEach((line, idx) => {
                                        const trimmedLine = line.trim();

                                        // Ignore or toggle on markdown code block delimiters (even escaped ones like \`\`\`)
                                        if (trimmedLine.replace(/\\/g, '').startsWith('```')) {
                                            if (inExplicitCodeBlock) {
                                                inExplicitCodeBlock = false;
                                                if (currentCodeBlock.length > 0) {
                                                    elements.push(
                                                        <code key={`code-${idx}`} className="block bg-slate-900/90 text-slate-100 p-4 rounded-xl font-mono text-sm my-6 border border-slate-700 shadow-2xl overflow-x-auto">
                                                            {currentCodeBlock.join('\n')}
                                                        </code>
                                                    );
                                                    currentCodeBlock = [];
                                                }
                                            } else {
                                                inExplicitCodeBlock = true;
                                                if (currentCodeBlock.length > 0) {
                                                    elements.push(
                                                        <code key={`code-pre-${idx}`} className="block bg-slate-900/90 text-slate-100 p-4 rounded-xl font-mono text-sm my-6 border border-slate-700 shadow-2xl overflow-x-auto">
                                                            {currentCodeBlock.join('\n')}
                                                        </code>
                                                    );
                                                    currentCodeBlock = [];
                                                }
                                            }
                                            return; // Skip rendering the delimiter line
                                        }

                                        const isCodeLine = inExplicitCodeBlock || line.includes('const ') || line.includes('require(') || line.includes('server.') ||
                                            line.startsWith('  ') || (currentCodeBlock.length > 0 && line.trim() !== '' && !line.startsWith('#') && !line.startsWith('-'));

                                        if (isCodeLine) {
                                            currentCodeBlock.push(line);
                                        } else {
                                            if (currentCodeBlock.length > 0) {
                                                elements.push(
                                                    <code key={`code-${idx}`} className="block bg-slate-900/90 text-slate-100 p-4 rounded-xl font-mono text-sm my-6 border border-slate-700 shadow-2xl overflow-x-auto">
                                                        {currentCodeBlock.join('\n')}
                                                    </code>
                                                );
                                                currentCodeBlock = [];
                                            }

                                            if (line.startsWith('# ')) {
                                                elements.push(<h1 key={idx} className="text-2xl font-black text-slate-900 dark:text-white mb-6 mt-10 flex items-center gap-3">
                                                    <span className="h-6 w-1 bg-blue-600 rounded-full" />
                                                    {line.replace('# ', '')}
                                                </h1>);
                                            } else if (line.startsWith('## ')) {
                                                elements.push(<h2 key={idx} className="text-sm font-black text-slate-800 dark:text-slate-100 mb-4 mt-8 bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg inline-block">{line.replace('## ', '')}</h2>);
                                            } else if (line.trim().startsWith('- ') || line.trim().startsWith('✔️ ')) {
                                                elements.push(
                                                    <div key={idx} className="flex gap-4 mb-3 ml-6 group/item">
                                                        <div className="size-5 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                                                            <div className="size-1.5 bg-blue-600 rounded-full" />
                                                        </div>
                                                        <span className="font-medium text-[15px]">{line.replace(/^([-]|\u2714\uFE0F)\s+/, '')}</span>
                                                    </div>
                                                );
                                            } else if (line.trim() === '') {
                                                elements.push(<div key={idx} className="h-2" />);
                                            } else {
                                                elements.push(<p key={idx} className="mb-4 text-slate-600 dark:text-slate-400 font-medium text-[15px]">{line}</p>);
                                            }
                                        }
                                    });

                                    if (currentCodeBlock.length > 0) {
                                        elements.push(
                                            <code key="code-last" className="block bg-slate-900/90 text-slate-100 p-4 rounded-xl font-mono text-sm my-6 border border-slate-700 shadow-2xl overflow-x-auto">
                                                {currentCodeBlock.join('\n')}
                                            </code>
                                        );
                                    }

                                    return elements;
                                })()}
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Practical Challenges Section */}
            {currentLesson.exercises && currentLesson.exercises.length > 0 && (
                <section className="space-y-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                            <Terminal className="size-4 text-indigo-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Practical Challenges</h3>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
                        {(() => {
                            const codingExercises = currentLesson.exercises.filter(ex => ex.type === 'coding');
                            const quizExercises = currentLesson.exercises.filter(ex => ex.type === 'quiz');
                            const booleanExercises = currentLesson.exercises.filter(ex => ex.type === 'boolean');

                            const cards: React.ReactNode[] = [];
                            let globalIdx = 1;

                            // 1. Coding challenges stay individual
                            codingExercises.forEach(ex => {
                                const stat = lessonStats.find(s => s.exerciseId === (ex._id || ex.id));
                                cards.push(
                                    <ExerciseCard
                                        key={ex.id || ex._id || globalIdx}
                                        index={globalIdx++}
                                        exercise={ex}
                                        onStart={() => setActiveExercise(ex)}
                                        isCompleted={completedItems.includes(ex.id || ex._id || "")}
                                        stat={stat}
                                    />
                                );
                            });

                            // 2. Quiz Collection
                            if (quizExercises.length > 0) {
                                cards.push(
                                    <CollectionCard
                                        key="quiz-collection"
                                        index={globalIdx++}
                                        type="quiz"
                                        count={quizExercises.length}
                                        title={`${quizExercises.length} Knowledge Checks`}
                                        exercises={quizExercises}
                                        completedItems={completedItems}
                                        lessonStats={lessonStats}
                                        onStart={(ex) => setActiveExercise(ex)}
                                    />
                                );
                            }

                            // 3. Boolean Collection
                            if (booleanExercises.length > 0) {
                                cards.push(
                                    <CollectionCard
                                        key="boolean-collection"
                                        index={globalIdx++}
                                        type="boolean"
                                        count={booleanExercises.length}
                                        title={`${booleanExercises.length} Technical Decisions`}
                                        exercises={booleanExercises}
                                        completedItems={completedItems}
                                        lessonStats={lessonStats}
                                        onStart={(ex) => setActiveExercise(ex)}
                                    />
                                );
                            }

                            return cards;
                        })()}
                    </div>
                </section>
            )}

            {/* Exercise Workspace Overlay */}
            {activeExercise && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 lg:p-10 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-950 w-full max-w-[1400px] h-full max-h-[820px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-10 duration-700 ease-out border border-white/20 dark:border-slate-800/50">
                        <div className="h-20 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="size-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                                    <Code className="size-5 text-white" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight">{activeExercise.title}</h4>
                                        {completedItems.includes(activeExercise._id || activeExercise.id || "") && (
                                            <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-2 py-0 text-[9px] font-black uppercase tracking-tighter">
                                                Passed
                                            </Badge>
                                        )}
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">In-Browser Practice • {activeExercise.language || activeExercise.type}</span>
                                </div>
                            </div>

                            {/* Manual Navigation Control - Filtered by Type */}
                            {currentLesson.exercises && (
                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    {(() => {
                                        const sameTypeExercises = currentLesson.exercises.filter(ex => ex.type === activeExercise.type);
                                        const currentIndex = sameTypeExercises.findIndex(ex => (ex.id || ex._id) === (activeExercise.id || activeExercise._id));

                                        if (sameTypeExercises.length <= 1) return null;

                                        return (
                                            <>
                                                <>
                                                    <button
                                                        disabled={currentIndex === 0}
                                                        onClick={() => setActiveExercise(sameTypeExercises[currentIndex - 1])}
                                                        className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <ChevronLeft className="size-5" />
                                                    </button>
                                                    <div className="flex items-center gap-1.5 px-2">
                                                        {sameTypeExercises.map((ex, idx) => (
                                                            <div
                                                                key={ex.id || ex._id || idx}
                                                                onClick={() => setActiveExercise(ex)}
                                                                className={cn(
                                                                    "size-6 rounded-md flex items-center justify-center text-[10px] font-black cursor-pointer transition-all",
                                                                    currentIndex === idx
                                                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 scale-110"
                                                                        : completedItems.includes(ex.id || ex._id || "")
                                                                            ? "bg-emerald-500/20 text-emerald-600 hover:bg-emerald-500/30"
                                                                            : "bg-slate-200 dark:bg-slate-800 text-slate-500 hover:bg-slate-300 dark:hover:bg-slate-700"
                                                                )}
                                                            >
                                                                {completedItems.includes(ex.id || ex._id || "") ? <Check className="size-3" /> : idx + 1}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <button
                                                        disabled={currentIndex === sameTypeExercises.length - 1}
                                                        onClick={() => setActiveExercise(sameTypeExercises[currentIndex + 1])}
                                                        className="size-9 rounded-xl flex items-center justify-center text-slate-500 hover:bg-white dark:hover:bg-slate-800 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent transition-all shadow-sm hover:shadow-md"
                                                    >
                                                        <ChevronRight className="size-5" />
                                                    </button>
                                                </>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            <button
                                onClick={handleExitWorkspace}
                                className="h-11 px-6 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-black hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center gap-2"
                            >
                                Exit Workspace
                            </button>
                        </div>

                        <div className="flex-1 flex overflow-hidden">
                            {/* 1. Instruction Sidebar */}
                            <div className="w-[400px] border-r border-slate-100 dark:border-slate-800 p-8 overflow-y-auto bg-slate-50/30 dark:bg-slate-900/10">
                                <div className="max-w-md mx-auto space-y-10">
                                    <div className="space-y-4">
                                        <Badge className="bg-indigo-600 text-white border-none py-1.5 px-4 font-black">CHALLENGE TASK</Badge>
                                        <h2 className="text-2xl font-black text-slate-900 dark:text-white leading-tight">Mastering {activeExercise.title}</h2>
                                        <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                                            <div className="flex items-center gap-2">
                                                <Trophy className="size-4 text-amber-500" />
                                                <span>{activeExercise.maxScore || 50} Points</span>
                                            </div>
                                            <span>•</span>
                                            <span>Estimated 15m</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6 text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        <p>{activeExercise.instructions || "Implement the solution based on the technical requirements provided in this session. Ensure your code satisfies all edge cases and assertions."}</p>

                                        {(() => {
                                            const stat = lessonStats.find(s => s.exerciseId === (activeExercise._id || activeExercise.id));
                                            if (stat && !validationResult) {
                                                const isCompleted = stat.isCompleted;
                                                return (
                                                    <div className={`p-4 rounded-2xl border flex flex-col gap-3 animate-in fade-in slide-in-from-top-1 shadow-sm ${isCompleted
                                                        ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
                                                        : 'bg-rose-50/50 border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400'
                                                        }`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`size-8 rounded-xl flex items-center justify-center shrink-0 ${isCompleted ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                                                {isCompleted ? <CheckCircle2 className="size-4" /> : <X className="size-4" />}
                                                            </div>
                                                            <div className="space-y-0.5 flex-1 pt-0.5">
                                                                <p className="text-[10px] font-black uppercase tracking-widest opacity-70">
                                                                    {isCompleted ? 'Précédemment Réussi' : 'Tentative Échouée'}
                                                                </p>
                                                                <p className="text-sm font-bold leading-tight">
                                                                    {isCompleted
                                                                        ? `Déjà validé (${stat.attempts} tentatives).`
                                                                        : `Faux lors de votre précédente tentative.`}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        })()}

                                        {validationResult && (
                                            <div className={`p-5 rounded-3xl border flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 shadow-sm ${validationResult.isCorrect
                                                ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:border-emerald-900/50 dark:text-emerald-400'
                                                : 'bg-rose-50/50 border-rose-100 text-rose-800 dark:bg-rose-950/30 dark:border-rose-900/50 dark:text-rose-400'
                                                }`}>
                                                <div className="flex items-start gap-3">
                                                    {validationResult.isCorrect ? <CheckCircle2 className="size-5 shrink-0" /> : <X className="size-5 shrink-0" />}
                                                    <div className="space-y-1 flex-1">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="text-sm font-black uppercase tracking-widest">{validationResult.isCorrect ? 'Challenge Passed' : 'Execution Failed'}</p>
                                                            {(validationResult as any).attemptNumber && (
                                                                <span className="text-[10px] bg-white/40 dark:bg-black/20 px-2 py-0.5 rounded-full font-bold">
                                                                    Trial #{(validationResult as any).attemptNumber}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm font-medium leading-relaxed opacity-90">{validationResult.feedback}</p>
                                                    </div>
                                                </div>

                                                {(validationResult as any).result !== undefined && (validationResult as any).result !== null && (
                                                    <div className="space-y-3 pt-2 border-t border-slate-200/20">
                                                        <p className="text-[11px] font-black uppercase tracking-tight opacity-60">Execution Output:</p>
                                                        <pre className="p-4 bg-slate-950 text-emerald-400 rounded-xl font-mono text-[11px] leading-relaxed overflow-x-auto border border-white/5">
                                                            {typeof (validationResult as any).result === 'object'
                                                                ? JSON.stringify((validationResult as any).result, null, 2)
                                                                : String((validationResult as any).result)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4 shadow-sm">
                                            <h5 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                                <div className="size-1.5 bg-indigo-600 rounded-full" />
                                                Requirements
                                            </h5>
                                            <ul className="text-sm space-y-3">
                                                <li className="flex gap-2">
                                                    <span className="text-slate-300">•</span>
                                                    <span>Implement the logic in the main editor.</span>
                                                </li>
                                                <li className="flex gap-2">
                                                    <span className="text-slate-300">•</span>
                                                    <span>All tests must pass for full points.</span>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Exercise Container (Coding, Quiz, or Boolean) */}
                            <div className="flex-1 bg-slate-50 dark:bg-slate-950 p-5 flex flex-col gap-5 text-left">
                                {activeExercise.type === 'quiz' ? (
                                    <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-8 border border-slate-100 dark:border-slate-800 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                                        <div className="space-y-2">
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Multiple Choice</span>
                                            <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight">{activeExercise.instructions || "Select the correct answer:"}</h3>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            {activeExercise.options?.map((option: any) => (
                                                <button
                                                    key={option.id}
                                                    onClick={() => setSelectedOptionId(option.id)}
                                                    className={`w-full p-6 rounded-2xl border-2 transition-all flex items-center justify-between group ${selectedOptionId === option.id
                                                        ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/10'
                                                        : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-transparent'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`size-6 rounded-full flex items-center justify-center border-2 transition-all ${selectedOptionId === option.id
                                                            ? 'border-indigo-600 bg-indigo-600'
                                                            : 'border-slate-200 dark:border-slate-700 group-hover:border-slate-300'
                                                            }`}>
                                                            {selectedOptionId === option.id && <CheckCircle2 className="size-4 text-white" />}
                                                        </div>
                                                        <span className={`text-[15px] font-bold ${selectedOptionId === option.id
                                                            ? 'text-indigo-900 dark:text-indigo-200'
                                                            : 'text-slate-600 dark:text-slate-400'
                                                            }`}>
                                                            {option.text}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : activeExercise.type === 'boolean' ? (
                                    <div className="flex-1 min-h-0 bg-white dark:bg-slate-900 rounded-3xl shadow-xl p-6 border border-slate-100 dark:border-slate-800 flex flex-col gap-6 items-center justify-center overflow-y-auto scrollbar-hide">
                                        <div className="text-center space-y-3 max-w-2xl shrink-0">
                                            <Badge className="bg-amber-100 text-amber-600 border-none px-3 py-1 font-black text-[9px] tracking-widest uppercase">Quick Decision</Badge>
                                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                                                {activeExercise.instructions}
                                            </h3>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 w-full max-w-md shrink-0">
                                            <button
                                                onClick={() => setBooleanAnswer(true)}
                                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-4 transition-all group ${booleanAnswer === true
                                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-950'
                                                    }`}
                                            >
                                                <div className={`size-12 rounded-full flex items-center justify-center transition-all ${booleanAnswer === true ? 'bg-green-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}>
                                                    <Check className="size-6 font-bold" />
                                                </div>
                                                <span className={`text-[13px] font-black uppercase tracking-widest ${booleanAnswer === true ? 'text-green-600' : 'text-slate-400'
                                                    }`}>VRAI</span>
                                            </button>

                                            <button
                                                onClick={() => setBooleanAnswer(false)}
                                                className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-4 transition-all group ${booleanAnswer === false
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                                    : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 bg-white dark:bg-slate-950'
                                                    }`}
                                            >
                                                <div className={`size-12 rounded-full flex items-center justify-center transition-all ${booleanAnswer === false ? 'bg-red-500 text-white scale-110' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                    }`}>
                                                    <X className="size-6 font-bold" />
                                                </div>
                                                <span className={`text-[13px] font-black uppercase tracking-widest ${booleanAnswer === false ? 'text-red-600' : 'text-slate-400'
                                                    }`}>FAUX</span>
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-1 bg-slate-900 rounded-3xl shadow-2xl relative overflow-hidden group border border-slate-800 flex text-left">
                                        {/* Line Numbers */}
                                        <div className="w-12 bg-slate-950/50 border-r border-slate-800/50 pt-8 pb-8 flex flex-col items-center text-[11px] font-mono text-slate-600 select-none">
                                            {Array.from({ length: userCode.split('\n').length + 5 }).map((_, i) => (
                                                <div key={i} className="h-[22.5px] leading-[22.5px]">{i + 1}</div>
                                            ))}
                                        </div>
                                        <div className="relative flex-1 group">
                                            {/* Smart Validator Badge */}
                                            <div className="absolute top-6 right-8 flex flex-col items-end gap-2 z-20 pointer-events-none">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{activeExercise.language?.toUpperCase() || 'JAVASCRIPT'}</span>
                                                    <div className="size-2 rounded-full bg-green-500 animate-pulse" />
                                                </div>
                                                <div className="flex flex-col items-end gap-1 px-4 py-2 bg-amber-500/5 border border-amber-500/10 rounded-xl backdrop-blur-md">
                                                    <div className="flex items-center gap-2">
                                                        <div className="size-1.5 rounded-full bg-amber-500" />
                                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Smart Validator</span>
                                                    </div>
                                                    <p className="text-[8px] text-slate-400 font-medium max-w-[180px] text-right">
                                                        Validation basée sur la structure et la solution de référence (Souple).
                                                    </p>
                                                </div>
                                            </div>
                                            <textarea
                                                value={userCode}
                                                onChange={(e) => setUserCode(e.target.value)}
                                                spellCheck={false}
                                                className="h-full w-full bg-transparent p-8 font-mono text-[14px] text-slate-100 leading-[22.5px] outline-none resize-none whitespace-pre overflow-y-auto custom-scrollbar text-left"
                                                placeholder="// Write your code here..."
                                            />
                                        </div>
                                    </div>
                                )}

                                <div className="h-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between px-8 shrink-0">
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                            <div className="size-2 rounded-full bg-slate-200" />
                                            <span>{activeExercise.type !== 'coding' ? 'Ready' : 'Idle'}</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
                                        <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest">
                                            {activeExercise.type === 'quiz' ? 'Multiple Choice' : activeExercise.type === 'boolean' ? 'Quick Decision' : 'Test Coverage: 0%'}
                                        </span>
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (!user) {
                                                toast.error("Veuillez vous connecter pour soumettre vos réponses");
                                                return;
                                            }

                                            let answer: any = null;
                                            if (activeExercise.type === 'quiz') {
                                                if (!selectedOptionId) return toast.error("Veuillez sélectionner une option");
                                                answer = selectedOptionId;
                                            } else if (activeExercise.type === 'boolean') {
                                                if (booleanAnswer === null) return toast.error("Veuillez choisir Vrai ou Faux");
                                                answer = booleanAnswer;
                                            } else {
                                                if (!userCode.trim()) return toast.error("Veuillez entrer votre code");
                                                answer = userCode;
                                            }

                                            setIsChecking(true);
                                            try {
                                                const token = localStorage.getItem('user-token');
                                                const response = await fetch(`${process.env.NEXT_PUBLIC_PROGRESS_API_URL}/submissions`, {
                                                    method: 'POST',
                                                    headers: { 
                                                        'Content-Type': 'application/json',
                                                        'Authorization': `Bearer ${token}` 
                                                    },
                                                    body: JSON.stringify({
                                                        exerciseId: activeExercise._id || activeExercise.id,
                                                        courseId: course._id || course.id,
                                                        lessonId: currentLesson._id || currentLesson.id,
                                                        moduleId: activeExercise.moduleId || (currentLesson as any).moduleId,
                                                        userId: user.id,
                                                        answer
                                                    })
                                                });

                                                const result = await response.json();
                                                if (response.ok) {
                                                    setValidationResult(result.data);
                                                    fetchLessonStats(); // Update stats locally after submission
                                                    if (result.data.isCorrect) {
                                                        toast.success("Correct ! Excellent travail.");

                                                        // Update progress locally
                                                        if (onExerciseComplete) {
                                                            onExerciseComplete(activeExercise.id || activeExercise._id || "");
                                                        }

                                                        // Auto-navigate after a short delay
                                                        autoNavTimeoutRef.current = setTimeout(() => {
                                                            const sameTypeExercises = currentLesson.exercises?.filter(ex => ex.type === activeExercise.type) || [];
                                                            const currentIndex = sameTypeExercises.findIndex(ex => (ex.id || ex._id) === (activeExercise.id || activeExercise._id));
                                                            const nextExercise = sameTypeExercises[currentIndex + 1];

                                                            if (nextExercise) {
                                                                setActiveExercise(nextExercise);
                                                            } else {
                                                                toast.success("Félicitations ! Vous avez terminé cette section.");
                                                                setActiveExercise(null);
                                                            }
                                                            autoNavTimeoutRef.current = null;
                                                        }, 4000);
                                                    } else {
                                                        toast.error(result.data.feedback || "Réponse incorrecte. Réessayez !");
                                                    }
                                                } else {
                                                    throw new Error(result.message || "Erreur lors de la validation");
                                                }
                                            } catch (error: any) {
                                                toast.error("Erreur de connexion au service de progression");
                                                console.error(error);
                                            } finally {
                                                setIsChecking(false);
                                            }
                                        }}
                                        disabled={isChecking}
                                        className="px-10 py-4 bg-indigo-600 text-white rounded-2xl text-[13px] font-black hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-xl shadow-indigo-600/10 flex items-center gap-3 disabled:opacity-50"
                                    >
                                        <Trophy className={`size-4 ${isChecking ? 'animate-bounce' : ''}`} />
                                        {isChecking ? 'Checking...' : (activeExercise.type !== 'coding' ? 'Verify & Next' : 'Run All Tests & Submit')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Study Materials (Resources) Section */}
            {currentLesson.pdfUrl && (
                <section className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="size-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <FileText className="size-4 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">Study Materials</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
                        <a href={currentLesson.pdfUrl} target="_blank" rel="noopener noreferrer">
                            <ResourceCard
                                icon={<FileText className="w-5 h-5 text-red-500" />}
                                title={currentLesson.pdfFile || "Session_Handout.pdf"}
                                subtext="PDF Document • Open in new tab"
                            />
                        </a>
                    </div>
                </section>
            )}

            {/* 4. Course Feedback Section */}
            <section className="pt-12 border-t border-slate-100 dark:border-slate-800">
                <div className="max-w-4xl mx-auto">
                    <CourseRating courseId={course._id || course.id} />
                </div>
            </section>
        </div>
    )
}


function ExerciseCard({ exercise, onStart, index, isCompleted, stat }: { exercise: any, onStart: () => void, index: number, isCompleted?: boolean, stat?: any }) {
    const isCoding = exercise.type === 'coding';
    const isQuiz = exercise.type === 'quiz';
    const isBoolean = exercise.type === 'boolean';
    const isFailed = stat && !stat.isCompleted;

    return (
        <div className={cn(
            "group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 flex flex-col h-full border-b-[6px]",
            isCompleted ? "border-b-emerald-500" : isFailed ? "border-b-rose-500" : "hover:border-b-indigo-600"
        )}>
            {/* Header Info */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center size-7 rounded-lg bg-slate-900 text-white text-[10px] font-black italic">
                            {index.toString().padStart(2, '0')}
                        </span>
                        <Badge className={`
                            ${isCoding ? 'bg-indigo-600' : isQuiz ? 'bg-amber-500' : 'bg-emerald-500'} 
                            text-white border-none text-[9px] font-black tracking-widest px-2 py-0.5
                        `}>
                            {exercise.type.toUpperCase()}
                        </Badge>
                    </div>
                </div>
                {isCompleted ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                        <CheckCircle2 className="size-3 text-emerald-500" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Correct</span>
                    </div>
                ) : isFailed ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 rounded-full border border-rose-500/20">
                        <X className="size-3 text-rose-500" />
                        <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest">Incorrect</span>
                    </div>
                ) : null}
                {exercise.maxScore && (
                    <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800">
                        <Trophy className="size-3 text-amber-500" />
                        <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{exercise.maxScore} XP</span>
                    </div>
                )}
            </div>

            {/* Title & Instructions */}
            <div className="flex-1 space-y-3 mb-8">
                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight group-hover:text-indigo-600 transition-colors">
                    {exercise.title}
                </h4>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-3 font-medium">
                    {exercise.instructions}
                </p>
            </div>

            {/* Actions */}
            <div className="flex justify-center">
                <button
                    onClick={onStart}
                    className="w-full max-w-[200px] py-3 bg-indigo-600 text-white rounded-xl text-[11px] font-black hover:bg-slate-900 dark:hover:bg-white dark:hover:text-black transition-all shadow-lg shadow-indigo-600/10 active:scale-95 flex items-center justify-center gap-2"
                >
                    <Trophy className="size-3" />
                    START
                </button>
            </div>

            {/* Decorative Icon */}
            <div className="absolute -bottom-4 -right-4 size-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none rotate-12">
                {isCoding ? <Code size={96} /> : isQuiz ? <MessageSquare size={96} /> : <CheckCircle2 size={96} />}
            </div>
        </div>
    )
}

function CollectionCard({ index, type, count, title, exercises, onStart, completedItems = [], lessonStats = [] }: {
    index: number,
    type: string,
    count: number,
    title: string,
    exercises: any[],
    onStart: (ex: any) => void,
    completedItems?: string[],
    lessonStats?: any[]
}) {
    const isQuiz = type === 'quiz';
    return (
        <div className="group relative bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all duration-500 flex flex-col h-full hover:bg-white dark:hover:bg-slate-900 hover:border-solid hover:shadow-xl">
            <div className="flex items-start justify-between mb-6">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <span className="flex items-center justify-center size-7 rounded-lg bg-slate-400 text-white text-[10px] font-black italic">
                            {index.toString().padStart(2, '0')}
                        </span>
                        <Badge className={`${isQuiz ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'} border-none text-[9px] font-black tracking-widest px-2 py-0.5 uppercase`}>
                            {type} Collection
                        </Badge>
                    </div>
                </div>
                <div className="size-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-100 dark:border-slate-700 font-black text-xs">
                    {count}
                </div>
            </div>

            <div className="flex-1 mb-8 space-y-5">
                <div>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight mb-2">
                        {title}
                    </h4>
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest">
                        Bundle of {count} questions
                    </p>
                </div>

                <div className="space-y-2">
                    {exercises.map((ex, i) => {
                        const isDone = completedItems.includes(ex.id || ex._id || "");
                        const stat = lessonStats.find(s => s.exerciseId === (ex._id || ex.id));
                        const isWrong = stat && !stat.isCompleted;

                        return (
                            <div
                                key={ex.id || ex._id || i}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onStart(ex);
                                }}
                                className={cn(
                                    "flex items-center gap-3 p-3 bg-white/50 dark:bg-slate-800/30 rounded-xl border transition-all cursor-pointer group/item",
                                    isDone
                                        ? "border-emerald-500/30 bg-emerald-50/30 dark:bg-emerald-500/5 hover:bg-white"
                                        : isWrong
                                            ? "border-rose-500/30 bg-rose-50/30 dark:bg-rose-500/5 hover:border-rose-500"
                                            : "border-slate-100/50 dark:border-slate-800/50 hover:border-indigo-500 hover:bg-white dark:hover:bg-slate-800"
                                )}
                            >
                                <div className={cn(
                                    "size-5 rounded flex items-center justify-center text-[10px] font-bold transition-colors",
                                    isDone
                                        ? "bg-emerald-500 text-white"
                                        : isWrong
                                            ? "bg-rose-500 text-white"
                                            : "bg-slate-100 dark:bg-slate-700 text-slate-500 group-hover/item:bg-indigo-600 group-hover/item:text-white"
                                )}>
                                    {isDone ? <Check className="size-3" /> : isWrong ? <X className="size-3" /> : i + 1}
                                </div>
                                <span className={cn(
                                    "text-[13px] font-medium transition-colors truncate",
                                    isDone ? "text-emerald-700 dark:text-emerald-400" : isWrong ? "text-rose-700 dark:text-rose-400" : "text-slate-600 dark:text-slate-300 group-hover/item:text-indigo-600"
                                )}>
                                    {ex.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <button
                onClick={() => onStart(exercises[0])}
                className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[11px] font-black hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                START COLLECTION
            </button>

            <div className="absolute -bottom-4 -right-4 size-24 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                {isQuiz ? <MessageSquare size={96} /> : <CheckCircle2 size={96} />}
            </div>
        </div>
    );
}

function ResourceCard({ icon, title, subtext }: { icon: React.ReactNode, title: string, subtext: string }) {
    return (
        <div className="flex items-center justify-between p-6 bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-900 transition-all cursor-pointer group">
            <div className="flex items-center gap-5 min-w-0">
                <div className="size-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/30 transition-colors">
                    {icon}
                </div>
                <div className="flex flex-col min-w-0">
                    <h5 className="text-[15px] font-bold text-slate-900 dark:text-white truncate leading-tight mb-1">{title}</h5>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{subtext}</span>
                </div>
            </div>
            <div className="size-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-all shrink-0">
                <Download className="w-4 h-4" />
            </div>
        </div>
    )
}
