"use client"

import React from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeSwitcher } from "@/components/theme-switcher"
import { LanguageSwitcher } from "@/components/language-switcher"
import { useUserStore } from "@/lib/store"
import { useLanguage } from "@/context/language-context"
import { NotificationsDropdown } from "@/components/notifications-dropdown"
import { Settings, User, CreditCard, LogOut, Shield, ChevronDown } from "lucide-react"

interface TopNavProps {
    role: "instructor" | "student"
    onMenuToggle?: () => void
}

export function TopNav({ role, onMenuToggle }: TopNavProps) {
    const { user, logout } = useUserStore()

    const { t } = useLanguage()
    const [mounted, setMounted] = React.useState(false)
    const [searchOpen, setSearchOpen] = React.useState(false)

    React.useEffect(() => {
        setMounted(true)
    }, [])

    const handleLogout = () => {
        logout();
        document.cookie = "user-role=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        window.location.href = "/";
    };

    const userInitials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : "??";

    return (
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border px-3 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-2">
            {/* Left: hamburger + title */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Hamburger — mobile only */}
                <button
                    onClick={onMenuToggle}
                    className="lg:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground flex-shrink-0"
                    aria-label="Toggle menu"
                >
                    <span className="material-symbols-outlined text-xl">menu</span>
                </button>

                <h2 className="text-base sm:text-lg font-bold tracking-tight hidden sm:block truncate">
                    {role === 'instructor' ? 'Instructor Portal' : 'Student Dashboard'}
                </h2>

                {/* Search — hidden on xs, visible from sm */}
                <div className={`flex-1 max-w-md relative hidden md:block`}>
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                        <span className="material-symbols-outlined text-xl">search</span>
                    </div>
                    <Input
                        className="w-full bg-accent/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm placeholder:text-muted-foreground focus-visible:ring-primary/20 transition-all"
                        placeholder="Search metrics, users, or courses..."
                        type="text"
                    />
                </div>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                {/* Mobile search icon */}
                <button
                    className="md:hidden p-2 rounded-lg hover:bg-accent transition-colors text-muted-foreground"
                    onClick={() => setSearchOpen(v => !v)}
                    aria-label="Search"
                >
                    <span className="material-symbols-outlined text-xl">search</span>
                </button>

                <div className="flex items-center gap-1 bg-accent/30 p-1 rounded-xl">
                    <LanguageSwitcher />
                    <ThemeSwitcher />
                    <NotificationsDropdown user={user} role={role} />
                </div>

                <div className="flex items-center gap-3 pl-2 sm:pl-4 border-l border-border h-10">
                    {!mounted ? (
                        <div className="h-9 w-9 rounded-full bg-accent/50 animate-pulse" />
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="flex items-center gap-2 sm:gap-3 p-1 h-auto hover:bg-accent/50 rounded-xl transition-all group">
                                    <Avatar className="h-9 w-9 border-2 border-primary/20 bg-primary/5 transition-all group-hover:border-primary/40 shadow-sm">
                                        <AvatarFallback className="bg-transparent text-primary font-black text-xs tracking-tighter">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="text-left hidden sm:block pr-2">
                                        <p className="text-sm font-bold leading-none mb-1 truncate max-w-[100px] lg:max-w-[120px]">
                                            {user?.name || user?.email?.split('@')[0] || "Guest"}
                                        </p>
                                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-tight opacity-70">{role}</p>
                                    </div>
                                    <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-data-[state=open]:rotate-180 hidden sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-64 p-2 rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border-border/50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-3 py-4 text-center border-b border-border/50 mb-1">
                                    <p className="text-sm font-black text-foreground mb-0.5">{user?.name}</p>
                                    <p className="text-[11px] text-muted-foreground truncate italic">{user?.email}</p>
                                </div>

                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-muted-foreground/70 px-3 py-2">Account Management</DropdownMenuLabel>

                                <Link href={`/${role}/profile`}>
                                    <DropdownMenuItem className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary group transition-colors">
                                        <div className="p-1.5 rounded-lg bg-accent group-focus:bg-primary/10 transition-colors">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <span className="text-sm font-bold">Profile Details</span>
                                    </DropdownMenuItem>
                                </Link>

                                <DropdownMenuItem className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary group transition-colors">
                                    <div className="p-1.5 rounded-lg bg-accent group-focus:bg-primary/10 transition-colors">
                                        <Shield className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold">Security &amp; Trust</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary group transition-colors">
                                    <div className="p-1.5 rounded-lg bg-accent group-focus:bg-primary/10 transition-colors">
                                        <CreditCard className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold">Billing &amp; Credits</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-1 border-border/50" />

                                <DropdownMenuItem className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl focus:bg-primary/5 focus:text-primary group transition-colors">
                                    <div className="p-1.5 rounded-lg bg-accent group-focus:bg-primary/10 transition-colors">
                                        <Settings className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold">System Options</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator className="my-1 border-border/50" />

                                <DropdownMenuItem
                                    onClick={handleLogout}
                                    className="flex items-center gap-3 p-2.5 cursor-pointer rounded-xl focus:bg-destructive/5 focus:text-destructive group transition-colors"
                                >
                                    <div className="p-1.5 rounded-lg bg-destructive/10 text-destructive group-focus:bg-destructive/20 transition-colors">
                                        <LogOut className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm font-bold">Logout Session</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            </div>

            {/* Mobile search bar — expands below header */}
            {searchOpen && (
                <div className="absolute top-full left-0 right-0 z-20 md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 py-3 shadow-lg">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground pointer-events-none">
                            <span className="material-symbols-outlined text-xl">search</span>
                        </div>
                        <Input
                            className="w-full bg-accent/50 border-none rounded-xl py-2 pl-10 pr-4 text-sm"
                            placeholder="Search metrics, users, or courses..."
                            type="text"
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    )
}
