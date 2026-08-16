"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/context/language-context"
import { translations } from "@/lib/translations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, Loader2, Mail, ArrowRight } from "lucide-react"

export default function VerifyEmailPage({ params }: { params: Promise<{ token: string }> }) {
    const router = useRouter()
    const { token } = use(params)
    const { language } = useLanguage()
    const t = translations[language].verify_email
    const API_BASE_URL = process.env.NEXT_PUBLIC_USER_API_URL;
    const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying")
    const [resending, setResending] = useState(false)
    const [resendEmail, setResendEmail] = useState("")
    const [resendStatus, setResendStatus] = useState<"idle" | "success" | "error">("idle")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            return
        }

        const verifyEmail = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json"
                    }
                })

                if (response.ok) {
                    setStatus("success")
                    // Automatic redirect after 3 seconds
                    const timeout = setTimeout(() => {
                        router.push("/auth")
                    }, 3000)
                    return () => clearTimeout(timeout)
                } else {
                    setStatus("error")
                }
            } catch (error) {
                console.error("Verification error:", error)
                setStatus("error")
            }
        }

        verifyEmail()
    }, [token, router])

    const handleResend = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!resendEmail) return

        setResending(true)
        setResendStatus("idle")
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/auth/resend-verification-email`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email: resendEmail })
            })

            if (response.ok) {
                setResendStatus("success")
            } else {
                setResendStatus("error")
            }
        } catch (error) {
            console.error("Resend error:", error)
            setResendStatus("error")
        } finally {
            setResending(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
            <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,#fff,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.5))] -z-10" />

            <Card className="w-full max-w-md border-2 shadow-xl animate-in fade-in zoom-in duration-500">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center mb-6">
                        <div className={`p-4 rounded-full ${status === "verifying" ? "bg-primary/10" :
                            status === "success" ? "bg-green-100 dark:bg-green-900/20" :
                                "bg-red-100 dark:bg-red-900/20"
                            }`}>
                            {status === "verifying" && <Loader2 className="h-12 w-12 animate-spin text-primary" />}
                            {status === "success" && <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400" />}
                            {status === "error" && <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />}
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight">{t.title}</CardTitle>
                    <CardDescription className="text-base">
                        {status === "verifying" && t.verifying}
                        {status === "success" && t.success_title}
                        {status === "error" && t.error_title}
                    </CardDescription>
                </CardHeader>

                <CardContent className="text-center pb-8">
                    {status === "success" ? (
                        <div className="space-y-4">
                            <p className="text-muted-foreground leading-relaxed">
                                {t.success_desc}
                            </p>
                            <div className="flex justify-center">
                                <span className="flex h-2 w-2 rounded-full bg-primary animate-ping" />
                            </div>
                        </div>
                    ) : status === "error" ? (
                        <div className="space-y-6">
                            <p className="text-muted-foreground">
                                {t.error_desc}
                            </p>

                            <form onSubmit={handleResend} className="space-y-4 text-left border-t pt-6">
                                <div className="space-y-2">
                                    <label htmlFor="email" className="text-sm font-medium">
                                        Enter your email to receive a new link
                                    </label>
                                    <div className="flex gap-2">
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="your@email.com"
                                            value={resendEmail}
                                            onChange={(e) => setResendEmail(e.target.value)}
                                            required
                                            className="flex-1"
                                        />
                                        <Button type="submit" disabled={resending} className="shrink-0">
                                            {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                </div>

                                {resendStatus === "success" && (
                                    <p className="text-sm text-green-600 dark:text-green-400 font-medium animate-in slide-in-from-top-1">
                                        {t.resend_success}
                                    </p>
                                )}
                                {resendStatus === "error" && (
                                    <p className="text-sm text-red-600 dark:text-red-400 font-medium animate-in slide-in-from-top-1">
                                        {t.resend_error}
                                    </p>
                                )}
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-muted-foreground">
                                We are validating your security token. This usually takes just a second.
                            </p>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="bg-muted/50 border-t p-6 flex flex-col gap-3">
                    {status === "success" ? (
                        <Button className="w-full group" onClick={() => router.push("/auth")}>
                            {t.back_to_login}
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    ) : (
                        <Button variant="outline" className="w-full" onClick={() => router.push("/auth")}>
                            {t.back_to_login}
                        </Button>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
