"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { useLanguage } from "@/context/language-context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { useUserStore } from "@/lib/store"

export function Navbar() {
    const pathname = usePathname();
    const { t } = useLanguage()
    const { user, logout } = useUserStore()
    const [mobileOpen, setMobileOpen] = React.useState(false)

    // Close mobile menu when route changes
    React.useEffect(() => {
        setMobileOpen(false)
    }, [pathname])

    // Prevent body scroll when mobile menu open
    React.useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = "hidden"
        } else {
            document.body.style.overflow = ""
        }
        return () => { document.body.style.overflow = "" }
    }, [mobileOpen])

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

    const navLinks = [
        { name: t('nav.home'), href: "/" },
        { name: t('nav.courses'), href: user?.role === 'student' ? "/student/courses" : "/cours/catalogue" },
        { name: t('nav.about'), href: "/about" },
    ];

    const handleLogout = () => {
        logout();
        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/";
    };

    const userInitials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : user?.email ? user.email.slice(0, 2).toUpperCase() : "??";

    return (
        <>
            <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
                <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between" suppressHydrationWarning>
                    {/* Logo */}
                    <div className="flex items-center gap-3" suppressHydrationWarning>
                        <div className="bg-primary p-1.5 rounded-lg text-white" suppressHydrationWarning>
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

                        {/* Desktop user actions */}
                        {!user ? (
                            <div className="hidden md:flex items-center gap-2">
                                <Link href="/auth">
                                    <Button variant="ghost" className="font-bold">{t('nav.login')}</Button>
                                </Link>
                                <Link href="/auth">
                                    <Button className="bg-primary hover:bg-primary/90 text-white font-bold shadow-md shadow-primary/20 transition-all px-5">
                                        {t('nav.join')}
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
                                <div className="flex items-center gap-3">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-sm font-bold leading-none mb-1">{user.name || user.email.split('@')[0]}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize font-black tracking-widest opacity-70">{user.role}</p>
                                    </div>
                                    <Avatar className="h-9 w-9 border-2 border-primary/20 bg-primary/5">
                                        <AvatarFallback className="bg-transparent text-primary font-black text-xs tracking-tighter">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
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

            {/* Mobile menu overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
                    mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setMobileOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile menu drawer */}
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

                {/* Mobile auth section */}
                <div className="px-4 pb-4 pt-2 border-t border-border">
                    {!user ? (
                        <div className="flex flex-col gap-2">
                            <Link href="/auth" className="w-full">
                                <Button variant="outline" className="w-full font-bold">{t('nav.login')}</Button>
                            </Link>
                            <Link href="/auth" className="w-full">
                                <Button className="w-full bg-primary hover:bg-primary/90 text-white font-bold">
                                    {t('nav.join')}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent/50">
                                <Avatar className="h-9 w-9 border-2 border-primary/20 bg-primary/5">
                                    <AvatarFallback className="bg-transparent text-primary font-black text-xs">
                                        {userInitials}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold leading-none mb-1">{user.name || user.email.split('@')[0]}</p>
                                    <p className="text-[10px] text-muted-foreground capitalize font-black tracking-widest opacity-70">{user.role}</p>
                                </div>
                            </div>
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
