"use client"

import React from "react"
import { Sidebar, TopNav } from "@/components/layout"
import { usePathname } from "next/navigation"

export default function InstructorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const [sidebarOpen, setSidebarOpen] = React.useState(false)

    React.useEffect(() => {
        setSidebarOpen(false)
    }, [pathname])

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
                role="instructor"
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0">
                <TopNav
                    role="instructor"
                    onMenuToggle={() => setSidebarOpen(v => !v)}
                />
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    )
}
