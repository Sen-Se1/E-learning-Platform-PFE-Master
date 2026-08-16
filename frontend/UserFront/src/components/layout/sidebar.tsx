"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

interface SidebarProps {
    role: "instructor" | "student"
    isOpen?: boolean
    onClose?: () => void
}

const navItems = {
    instructor: [
        { label: "Dashboard", href: "/instructor/dashboard", icon: "dashboard" },
        { label: "My Courses", href: "/instructor/courses", icon: "book_5" },
        { label: "Students", href: "/instructor/students", icon: "group" },
        { label: "Earnings", href: "/instructor/earnings", icon: "account_balance_wallet" },
        { label: "Settings", href: "/instructor/settings", icon: "settings" },
    ],
    student: [
        { label: "Dashboard", href: "/student/dashboard", icon: "dashboard" },
        { label: "Courses", href: "/student/courses", icon: "book_4" },
        { label: "Labs", href: "/student/labs", icon: "code_blocks" },
        { label: "Certifications", href: "/student/certificates", icon: "workspace_premium" },
        { label: "Profile", href: "/student/profile", icon: "person" },
    ],
}

function SidebarContent({ role, onClose }: { role: "instructor" | "student"; onClose?: () => void }) {
    const pathname = usePathname()
    const items = navItems[role]

    return (
        <div className="p-6 flex flex-col gap-6 h-full justify-between">
            <div className="flex flex-col gap-8">
                {/* Logo / Brand */}
                <div className="flex gap-3 items-center justify-between">
                    <div className="flex gap-3 items-center">
                        <div className="bg-primary rounded-lg size-10 flex items-center justify-center text-white">
                            <span className="material-symbols-outlined">{role === 'instructor' ? 'school' : 'person'}</span>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-base font-bold leading-tight">
                                {role === 'instructor' ? 'DevOps Instructor' : 'DevOps Master'}
                            </h1>
                            <p className="text-muted-foreground text-xs font-normal">Master's Project</p>
                        </div>
                    </div>
                    {/* Close button — only on mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden p-1.5 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                            aria-label="Close menu"
                        >
                            <span className="material-symbols-outlined text-xl">close</span>
                        </button>
                    )}
                </div>

                {/* Nav Links */}
                <nav className="flex flex-col gap-1">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                                (pathname === item.href || pathname.startsWith(`${item.href}/`))
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <span className={cn("material-symbols-outlined", (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "fill-1")}>
                                {item.icon}
                            </span>
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    )
}

export function Sidebar({ role, isOpen = false, onClose }: SidebarProps) {
    return (
        <>
            {/* Desktop sidebar — always visible on lg+ */}
            <aside className="w-72 flex-shrink-0 border-r border-border bg-card flex flex-col h-full hidden lg:flex">
                <SidebarContent role={role} />
            </aside>

            {/* Mobile overlay backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Mobile drawer */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full w-72 bg-card border-r border-border flex flex-col",
                    "transform transition-transform duration-300 ease-in-out lg:hidden",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <SidebarContent role={role} onClose={onClose} />
            </aside>
        </>
    )
}
