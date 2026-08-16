import React, { useState, useEffect } from "react"
import { Star, Send, CheckCircle2, Edit2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createReview, getUserReview, updateReview as updateReviewApi } from "@/data/courses"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface CourseRatingProps {
    courseId: string;
    onSuccess?: () => void;
}

export function CourseRating({ courseId, onSuccess }: CourseRatingProps) {
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(0)
    const [comment, setComment] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [loading, setLoading] = useState(true)
    const [existingReview, setExistingReview] = useState<any>(null)
    const [isEditing, setIsEditing] = useState(false)

    useEffect(() => {
        const fetchExisting = async () => {
            try {
                const review = await getUserReview(courseId);
                if (review) {
                    setExistingReview(review);
                    setRating(review.ratings);
                    setComment(review.title || "");
                }
            } catch (err) {
                console.error("Error fetching review:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchExisting();
    }, [courseId]);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error("Veuillez sélectionner une note")
            return
        }

        setSubmitting(true)
        try {
            if (isEditing && existingReview) {
                const updated = await updateReviewApi(existingReview._id, rating, comment);
                setExistingReview(updated.data);
                setIsEditing(false);
                toast.success("Votre avis a été mis à jour !");
            } else {
                const created = await createReview(courseId, rating, comment);
                setExistingReview(created.data);
                toast.success("Merci pour votre avis !");
            }
            if (onSuccess) onSuccess()
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de l'envoi de l'avis");
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center p-8">
                <div className="size-8 border-2 border-primary/10 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    if (existingReview && !isEditing) {
        return (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-500 animate-in fade-in zoom-in-95">
                <div className="flex flex-col items-center gap-6">
                    <div className="size-16 rounded-[2.5rem] bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <CheckCircle2 className="size-8" />
                    </div>

                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-black text-slate-900 dark:text-white">Votre avis actuel</h3>
                        <div className="flex justify-center gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    className={cn("size-6", s <= existingReview.ratings ? "fill-amber-400 text-amber-400" : "text-slate-200 dark:text-slate-700")}
                                />
                            ))}
                        </div>
                    </div>

                    {existingReview.title && (
                        <p className="text-slate-500 dark:text-slate-400 italic text-center text-lg max-w-lg">
                            "{existingReview.title}"
                        </p>
                    )}

                    <Button
                        onClick={() => setIsEditing(true)}
                        variant="outline"
                        className="h-12 px-8 rounded-2xl border-2 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 font-bold text-xs uppercase tracking-widest transition-all"
                    >
                        <Edit2 className="size-4" />
                        Changer mon avis
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 lg:p-10 shadow-sm hover:shadow-xl transition-all duration-500 relative">
            {isEditing && (
                <button
                    onClick={() => {
                        setIsEditing(false);
                        setRating(existingReview.ratings);
                        setComment(existingReview.title || "");
                    }}
                    className="absolute top-8 right-8 size-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-rose-500 transition-colors"
                >
                    <X className="size-5" />
                </button>
            )}

            <div className="space-y-8">
                <div className="text-center space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        {isEditing ? "Modifier votre avis" : "Votre avis compte"}
                    </h3>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        {isEditing ? "Ajustez vos informations" : "Comment évaluez-vous ce cours ?"}
                    </p>
                </div>

                {/* Star Rating */}
                <div className="flex justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onMouseEnter={() => setHover(star)}
                            onMouseLeave={() => setHover(0)}
                            onClick={() => setRating(star)}
                            className="focus:outline-none transition-transform active:scale-90"
                        >
                            <Star
                                className={cn(
                                    "size-10 transition-all duration-300",
                                    (hover || rating) >= star
                                        ? "fill-amber-400 text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]"
                                        : "text-slate-200 dark:text-slate-700 hover:text-amber-200"
                                )}
                            />
                        </button>
                    ))}
                </div>

                {/* Comment area */}
                <div className="space-y-4">
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Qu'avez-vous pensé du cours ?"
                        className="w-full min-h-[120px] p-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-3xl text-sm font-medium outline-none focus:border-blue-500 transition-all resize-none"
                    />

                    <Button
                        onClick={handleSubmit}
                        disabled={submitting || rating === 0}
                        className="w-full h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[13px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-50"
                    >
                        {submitting ? (
                            <div className="size-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <div className="flex items-center gap-2">
                                <span>{isEditing ? "Mettre à jour" : "Envoyer mon avis"}</span>
                                <Send className="size-4" />
                            </div>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
