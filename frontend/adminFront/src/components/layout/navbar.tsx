"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useLanguage } from "@/context/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useUserStore } from "@/lib/store"

export function Navbar() {
    const pathname = usePathname();
    const { t } = useLanguage()
    const { user, logout } = useUserStore()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    React.useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    React.useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

    const navLinks = [
        { name: t('nav.home'), href: "/" },
        { name: t('nav.courses'), href: "/cours/catalogue" },
        { name: t('nav.about'), href: "/about" },
    ];

    const getDashboardPath = () => {
        if (!user) return "/auth";
        switch (user.role) {
            case 'instructor':
                return "/instructor/dashboard";
            case 'student':
                return "/student/dashboard";
            default:
                return "/auth";
        }
    };

    const handleLogout = () => {
        logout();
        document.cookie = "admin-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/";
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="bg-primary p-1.5 rounded-lg text-white">
                            <span className="material-symbols-outlined block text-2xl">cloud_done</span>
                        </div>
                        <Link href="/" className="text-xl font-bold tracking-tight">CloudMaster</Link>
                    </div>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => {
                            const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={cn(
                                        "text-sm font-medium transition-colors relative py-1",
                                        isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
                                    )}
                                >
                                    {link.name}
                                    {isActive && (
                                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full animate-in fade-in zoom-in-50 duration-300" />
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2">
                            <ThemeSwitcher />
                            <LanguageSwitcher />
                        </div>

                        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                        {/* Desktop auth */}
                        {!user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/auth">
                                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all px-6">
                                        {t('nav.login')}
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="hidden md:flex items-center gap-3">
                                <Link href={getDashboardPath()}>
                                    <Button variant="outline" className="flex items-center gap-2 font-bold border-primary/20 hover:bg-primary/5 text-primary">
                                        <span className="material-symbols-outlined text-sm">dashboard</span>
                                        Dashboard
                                    </Button>
                                </Link>
                                <div className="flex flex-col items-end">
                                    <span className="text-sm font-bold leading-none">{user.name}</span>
                                    <span className="text-[10px] text-muted-foreground capitalize">{user.role}</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleLogout}
                                    className="text-muted-foreground hover:text-red-500 rounded-full"
                                    title="Logout"
                                >
                                    <span className="material-symbols-outlined">logout</span>
                                </Button>
                            </div>
                        )}

                        {/* Hamburger — mobile only */}
                        <button
                            className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                            onClick={() => setMobileOpen(v => !v)}
                            aria-label={mobileOpen ? "Close menu" : "Open menu"}
                            aria-expanded={mobileOpen}
                        >
                            <span className="material-symbols-outlined text-xl">
                                {mobileOpen ? "close" : "menu"}
                            </span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Mobile backdrop */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile menu */}
            <div
                className={cn(
                    "fixed top-16 left-0 right-0 z-50 bg-background border-b border-border shadow-2xl md:hidden",
                    "transform transition-all duration-300 ease-in-out",
                    mobileOpen ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"
                )}
            >
                <nav className="flex flex-col px-4 py-4 gap-1">
                    {navLinks.map((link) => {
                        const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== '/');
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                )}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-4 pb-4 pt-2 border-t border-border">
                    {!user ? (
                        <Link href="/auth" className="w-full">
                            <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
                                {t('nav.login')}
                            </Button>
                        </Link>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <Link href={getDashboardPath()} className="w-full">
                                <Button variant="outline" className="w-full flex items-center gap-2 font-bold border-primary/20 text-primary">
                                    <span className="material-symbols-outlined text-sm">dashboard</span>
                                    Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={handleLogout}
                                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold"
                            >
                                <span className="material-symbols-outlined text-sm mr-2">logout</span>
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
