"use client"

import { use, useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react"
import { useUserStore } from "@/lib/store"

export default function VerifyEmailUpdatePage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter()
    const { token } = use(params)
    const { language } = useLanguage()
    const { user, setUser } = useUserStore()
    const t = translations[language].verify_email
    const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
    const [status, setStatus] = useState<"verifying" | "success" | "error" | "unauthorized">("verifying")
    const executedRef = useRef(false)

    useEffect(() => {
        // Only accessible if logged in
        if (!user) {
            setStatus("unauthorized")
            const timer = setTimeout(() => router.push("/auth"), 3000)
            return () => clearTimeout(timer)
        }

        if (!token) {
            setStatus("error")
            return
        }

        // Prevent double execution in React StrictMode
        if (executedRef.current) return
        executedRef.current = true

        const verifyEmailUpdate = async () => {
            const authToken = localStorage.getItem('user-token');

            try {
                const response = await fetch(`${API_BASE_URL}/auth/verify-email-update/${token}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${authToken}`
                    }
                })

                const result = await response.json();

                if (response.ok) {
                    setStatus("success")

                    // Update the local data
                    if (result.token) {
                        localStorage.setItem('user-token', result.token);
                    }
                    if (result.data) {
                        setUser({
                            ...user,
                            email: result.data.email
                        });
                    }

                    // Success! Redirect to profile after a brief delay
                    setTimeout(() => {
                        router.push(`/${user.role}/profile`)
                    }, 4000)
                } else {
                    setStatus("error")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus("error")
            }
        }

        verifyEmailUpdate()
    }, [token, router, user, setUser])

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.5))] -z-10" />

            <Card className="w-full max-w-md border-2 shadow-xl animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${status === "verifying" ? "bg-primary/10" :
                            status === "success" ? "bg-green-100 dark:bg-green-900/20" :
                                status === "unauthorized" ? "bg-amber-100 dark:bg-amber-900/20" :
                                    "bg-red-100 dark:bg-red-900/20"
                            }`}>
                            {status === "verifying" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />}
                            {status === "unauthorized" && <ShieldCheck className="h-12 w-12 text-amber-600 dark:text-amber-400" />}
                            {status === "error" && <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />}
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        {status === "unauthorized" ? "Connexion requise" : t.title}
                    </CardTitle>
                    <CardDescription className="text-base">
                        {status === "verifying" && t.verifying}
                        {status === "success" && t.success_title}
                        {status === "unauthorized" && "Vous devez être connecté pour confirmer votre changement d'email."}
                        {status === "error" && t.error_title}
                    </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-8">
                    {status === "success" ? (
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed font-bold text-green-600 dark:text-green-400">
                                Votre adresse e-mail a été mise à jour avec succès !
                            </p>
                            <p className="text-sm text-slate-500">
                                Vos informations de session ont été mises à jour. Redirection vers votre profil...
                            </p>
                        </div>
                    ) : status === "unauthorized" ? (
                        <p className="text-muted-foreground">
                            Redirection vers la page de connexion...
                        </p>
                    ) : status === "error" ? (
                        <p className="text-muted-foreground">
                            {t.error_desc}
                        </p>
                    ) : (
                        <p className="text-muted-foreground">
                            Vérification du jeton de sécurité en cours...
                        </p>
                    )}
                </CardContent>

                <CardFooter className="bg-muted/50 border-t p-6">
                    <Button className="w-full group" onClick={() => router.push(user ? `/${user.role}/dashboard` : "/auth")}>
                        {user ? "Retour au tableau de bord" : t.back_to_login}
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
