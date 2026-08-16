"use client"

import React from "react"
import { Sidebar, TopNav } from "@/components/layout"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function StudentLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const isPlayerRoute = pathname?.includes("/student/player/")
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    // Close sidebar when route changes
    React.useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

    // Prevent body scroll when drawer is open
    React.useEffect(() => {
        if (sidebarOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [sidebarOpen])

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar
                role="student"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <TopNav
                    role="student"
                    onMenuToggle={() => setSidebarOpen(v => !v)}
                />
                <main className={cn(
                    "flex-1",
                    isPlayerRoute ? "p-0 overflow-hidden" : "p-4 md:p-8 overflow-y-auto"
                )}>
                    {children}
                </main>
            </div>
        </div>
    )
}
