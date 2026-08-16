"use client"

import { FormEvent, useEffect, useRef, useState } from "react"
import { Bot, Check, LoaderCircle, MessageCircle, Send, Sparkles, X, User, BookOpen, Receipt, Calendar, CheckCircle2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatMessage = {
    id: string
    role: "assistant" | "user"
    content: string
    requiresConfirmation?: boolean
    confirmationMessage?: string
    type?: "text" | "table" | "list"
    data?: any[]
}

const STORAGE_KEY = "admin-ai-chat-messages"
const INITIAL_MESSAGE: ChatMessage = {
    id: "welcome",
    role: "assistant",
    content: "Hi! I am your admin AI assistant. How can I help you today?",
}

function getReplyContent(payload: unknown): string {
    if (typeof payload === "string") return payload
    if (typeof payload === "number" || typeof payload === "boolean") return String(payload)
    if (!payload || typeof payload !== "object") return "The assistant completed your request."

    const data = payload as Record<string, unknown>
    const preferredKeys = ["reply", "response", "output", "text", "message", "content"]

    for (const key of preferredKeys) {
        if (key in data) {
            const value = getReplyContent(data[key])
            if (value) return value
        }
    }

    return JSON.stringify(payload, null, 2)
}

function needsConfirmation(payload: unknown): boolean {
    if (!payload || typeof payload !== "object") return false

    const data = payload as Record<string, unknown>
    if (
        data.requiresConfirmation === true ||
        data.confirmationRequired === true ||
        data.needsConfirmation === true
    ) {
        return true
    }

    return Object.values(data).some(needsConfirmation)
}

function createMessage(
    role: ChatMessage["role"],
    content: string,
    requiresConfirmation = false,
    confirmationMessage?: string,
    type?: "text" | "table" | "list",
    data?: any[],
): ChatMessage {
    return {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        role,
        content,
        requiresConfirmation,
        confirmationMessage,
        type,
        data,
    }
}

function DataRenderer({ type, data }: { type?: "text" | "table" | "list"; data?: any[] }) {
    if (!data || !Array.isArray(data) || data.length === 0) return null

    // Determine target entity type if possible
    const firstItem = data[0] || {}
    const isUser = "email" in firstItem || "role" in firstItem
    const isCourse = "title" in firstItem && "category" in firstItem
    const isInscription = "paymentStatus" in firstItem || "enrolledAt" in firstItem

    // Render User Card List
    if (isUser) {
        return (
            <div className="mt-3 space-y-2 w-full">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <User className="size-3" /> Users ({data.length})
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {data.map((user: any, idx: number) => {
                        const name = user.profile?.firstName 
                            ? `${user.profile.firstName} ${user.profile.lastName || ""}` 
                            : user.email?.split("@")[0] || "User"
                        const role = user.role || "student"
                        const isActive = user.isActive ?? true
                        
                        return (
                            <div 
                                key={idx} 
                                className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#1a2633] text-xs flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[150px]">
                                        {name}
                                    </span>
                                    <span className={cn(
                                        "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0",
                                        role === "admin" && "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
                                        role === "instructor" && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
                                        role === "student" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                        {role}
                                    </span>
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 truncate text-[11px]">{user.email}</div>
                                <div className="flex items-center justify-between text-[11px] mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400">Status</span>
                                    <span className={cn(
                                        "flex items-center gap-1 font-semibold text-[10px]",
                                        isActive ? "text-emerald-500" : "text-rose-500"
                                    )}>
                                        {isActive ? <CheckCircle2 className="size-3 shrink-0" /> : <AlertCircle className="size-3 shrink-0" />}
                                        {isActive ? "Active" : "Suspended"}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Render Course Card List
    if (isCourse) {
        return (
            <div className="mt-3 space-y-2 w-full">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <BookOpen className="size-3" /> Courses ({data.length})
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {data.map((course: any, idx: number) => {
                        return (
                            <div 
                                key={idx} 
                                className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#1a2633] text-xs flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors"
                            >
                                <div className="font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug">
                                    {course.title}
                                </div>
                                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                                    <span>{course.category}</span>
                                    <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-medium">
                                        {course.level || "All Levels"}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between font-semibold text-[11px] mt-1 pt-1.5 border-t border-slate-100 dark:border-slate-800/60">
                                    <span className="text-slate-400">Price</span>
                                    <span className="text-primary dark:text-[#38bdf8] font-bold text-[13px]">
                                        {course.price === 0 ? "Free" : `$${course.price}`}
                                    </span>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Render Inscription Card List
    if (isInscription) {
        return (
            <div className="mt-3 space-y-2 w-full">
                <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Receipt className="size-3" /> Inscriptions ({data.length})
                </p>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                    {data.map((ins: any, idx: number) => {
                        const insId = ins._id?.slice(-8) || ins.id?.slice(-8) || idx
                        return (
                            <div 
                                key={idx} 
                                className="p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-[#1a2633] text-xs flex flex-col gap-2 shadow-sm hover:border-primary/30 transition-colors"
                            >
                                <div className="flex justify-between items-center text-[10px] text-slate-400">
                                    <span>Ref: #{insId}</span>
                                    {ins.enrolledAt && (
                                        <span className="flex items-center gap-1">
                                            <Calendar className="size-2.5" />
                                            {new Date(ins.enrolledAt).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1 text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400">Status</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                        ins.status === "active" 
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400" 
                                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                    )}>
                                        {ins.status}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center text-[11px]">
                                    <span className="text-slate-500 dark:text-slate-400">Payment</span>
                                    <span className={cn(
                                        "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase",
                                        ins.paymentStatus === "paid" 
                                            ? "bg-teal-100 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400" 
                                            : "bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400"
                                    )}>
                                        {ins.paymentStatus}
                                    </span>
                                </div>
                                {ins.price !== undefined && (
                                    <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-800/60 pt-1.5 mt-1 font-semibold text-[11px]">
                                        <span className="text-slate-400">Amount</span>
                                        <span className="text-slate-800 dark:text-slate-200 font-bold">${ins.price}</span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    // Generic Table Fallback
    const headers = Object.keys(firstItem).filter(
        (k) => typeof firstItem[k] !== "object" && k !== "_id" && k !== "id" && k !== "__v"
    )

    if (headers.length === 0) return null

    return (
        <div className="mt-3 space-y-2 w-full">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
                Data ({data.length})
            </p>
            <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800 rounded-xl max-h-64 overflow-y-auto shadow-sm">
                <table className="w-full text-[11px] text-left border-collapse bg-white dark:bg-[#1a2633]">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/65 text-slate-500 dark:text-slate-400 font-bold">
                            {headers.map((h, i) => (
                                <th key={i} className="p-2.5 capitalize whitespace-nowrap">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row: any, rIdx: number) => (
                            <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800/50 text-slate-700 dark:text-slate-300 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition-colors">
                                {headers.map((h, cIdx) => (
                                    <td key={cIdx} className="p-2.5 truncate max-w-[120px]">{String(row[h] ?? "")}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function AdminAiChat() {
    const [isOpen, setIsOpen] = useState(false)
    const [input, setInput] = useState("")
    const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE])
    const [isSending, setIsSending] = useState(false)
    const [error, setError] = useState("")
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        try {
            const savedMessages = sessionStorage.getItem(STORAGE_KEY)
            if (savedMessages) setMessages(JSON.parse(savedMessages) as ChatMessage[])
        } catch {
            sessionStorage.removeItem(STORAGE_KEY)
        }
    }, [])

    useEffect(() => {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isSending])

    useEffect(() => {
        if (isOpen) inputRef.current?.focus()
    }, [isOpen])

    const sendMessage = async (message: string, confirmed = false) => {
        const trimmedMessage = message.trim()
        if (!trimmedMessage || isSending) return

        setError("")
        setIsSending(true)

        if (!confirmed) {
            setMessages((current) => [...current, createMessage("user", trimmedMessage)])
            setInput("")
        }

        try {
            const token = localStorage.getItem("admin-token")
            const apiUrl = process.env.NEXT_PUBLIC_USER_API_URL

            if (!apiUrl) throw new Error("User API URL is not configured.")
            if (!token) throw new Error("Your admin session has expired. Please sign in again.")

            const response = await fetch(`${apiUrl}/admin/ai-chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ message: trimmedMessage, confirmed }),
            })

            const result = await response.json().catch(() => null)

            if (!response.ok) {
                throw new Error(
                    getReplyContent(result?.message ?? result) ||
                    `The assistant request failed (${response.status}).`,
                )
            }

            const replyPayload = result?.message ?? result
            const payloadType = replyPayload && typeof replyPayload === "object" ? (replyPayload as any).type : undefined
            const payloadData = replyPayload && typeof replyPayload === "object" ? (replyPayload as any).data : undefined

            setMessages((current) => [
                ...current,
                createMessage(
                    "assistant",
                    getReplyContent(replyPayload),
                    needsConfirmation(replyPayload),
                    trimmedMessage,
                    payloadType,
                    payloadData,
                ),
            ])
        } catch (requestError) {
            setError(
                requestError instanceof Error
                    ? requestError.message
                    : "Unable to reach the AI assistant.",
            )
        } finally {
            setIsSending(false)
        }
    }

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        void sendMessage(input)
    }

    const confirmAction = (messageId: string) => {
        const message = messages.find((item) => item.id === messageId)
        if (!message?.confirmationMessage) return

        setMessages((current) =>
            current.map((item) =>
                item.id === messageId ? { ...item, requiresConfirmation: false } : item,
            ),
        )
        void sendMessage(message.confirmationMessage, true)
    }

    return (
        <div className="fixed bottom-20 right-4 z-[70] sm:bottom-7 sm:right-7">
            {isOpen && (
                <section
                    aria-label="Admin AI assistant"
                    className="mb-4 flex h-[min(620px,calc(100vh-7rem))] w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16222c] shadow-2xl sm:w-[390px]"
                >
                    <header className="flex items-center justify-between bg-primary px-4 py-3 text-primary-foreground">
                        <div className="flex items-center gap-3">
                            <div className="flex size-10 items-center justify-center rounded-xl bg-white/15">
                                <Sparkles className="size-5" />
                            </div>
                            <div>
                                <h2 className="font-semibold">Admin AI</h2>
                                <p className="text-xs text-primary-foreground/75">AI operations assistant</p>
                            </div>
                        </div>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-primary-foreground hover:bg-white/15 hover:text-primary-foreground"
                            onClick={() => setIsOpen(false)}
                            aria-label="Close AI chat"
                        >
                            <X />
                        </Button>
                    </header>

                    <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-[#101922]/50 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-350 dark:[&::-webkit-scrollbar-thumb]:bg-slate-850 [&::-webkit-scrollbar-thumb]:rounded-full">
                        <div className="space-y-4 p-4" aria-live="polite">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "flex gap-2.5",
                                        message.role === "user" && "justify-end",
                                    )}
                                >
                                    {message.role === "assistant" && (
                                        <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                            <Bot className="size-4" />
                                        </div>
                                    )}
                                    <div className="max-w-[82%] space-y-2">
                                        <div
                                            className={cn(
                                                "whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                                                message.role === "user"
                                                    ? "rounded-br-md bg-primary text-primary-foreground"
                                                    : "rounded-bl-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#1e2d3d] text-slate-800 dark:text-slate-100 shadow-sm",
                                            )}
                                        >
                                            {message.content}
                                        </div>
                                        {message.role === "assistant" && message.data && (
                                            <DataRenderer type={message.type} data={message.data} />
                                        )}
                                        {message.requiresConfirmation && (
                                            <Button
                                                type="button"
                                                size="sm"
                                                className="w-full"
                                                disabled={isSending}
                                                onClick={() => confirmAction(message.id)}
                                            >
                                                <Check />
                                                Confirm action
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {isSending && (
                                <div className="flex items-center gap-2.5 text-muted-foreground">
                                    <div className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <Bot className="size-4" />
                                    </div>
                                    <div className="rounded-2xl rounded-bl-md border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#1e2d3d] px-3.5 py-2.5 shadow-sm">
                                        <LoaderCircle className="size-4 animate-spin" />
                                    </div>
                                </div>
                            )}
                            <div ref={bottomRef} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#16222c] p-3">
                        {error && <p className="mb-2 text-xs text-destructive">{error}</p>}
                        <div className="flex items-center gap-2">
                            <input
                                ref={inputRef}
                                value={input}
                                onChange={(event) => setInput(event.target.value)}
                                maxLength={1000}
                                disabled={isSending}
                                placeholder="Ask the admin assistant..."
                                aria-label="Message"
                                className="h-10 min-w-0 flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#101922] px-3 text-sm text-slate-900 dark:text-slate-100 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                className="size-10 rounded-xl"
                                disabled={isSending || input.trim().length < 2}
                                aria-label="Send message"
                            >
                                {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
                            </Button>
                        </div>
                    </form>
                </section>
            )}

            <Button
                type="button"
                size="icon"
                onClick={() => setIsOpen((open) => !open)}
                className="size-14 rounded-full shadow-xl shadow-primary/25 transition-transform hover:scale-105"
                aria-label={isOpen ? "Close AI chat" : "Open AI chat"}
                aria-expanded={isOpen}
            >
                {isOpen ? <X className="size-6" /> : <MessageCircle className="size-6" />}
            </Button>
        </div>
    )
}
