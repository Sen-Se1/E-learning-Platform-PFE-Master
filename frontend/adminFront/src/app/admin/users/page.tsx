"use client"

import React, { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
    Search,
    Filter,
    MoreVertical,
    GraduationCap,
    ShieldCheck,
    Trash2,
    Download,
    ChevronLeft,
    ChevronRight,
    UserPlus,
    Upload,
    ChevronDown,
    Mail,
    Phone,
    Cloud,
    Shield,
    Eye,
    Key,
    UserX,
    ShieldAlert,
    Save,
    Loader2,
    CheckCircle2
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

interface User {
    _id: string;
    email: string;
    role: 'admin' | 'instructor' | 'student';
    isActive: boolean;
    isVerified: boolean;
    profile?: {
        firstName: string;
        lastName: string;
        phone?: string;
        dateOfBirth?: string;
    };
    address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        zipCode?: string;
    };
    createdAt: string;
}

interface Pagination {
    currentPage: number;
    limit: number;
    totalPages: number;
    totalUsers: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [pagination, setPagination] = useState<Pagination | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    console.log(error); // Keep it or remove it? The log says it's unused.
    const [searchTerm, setSearchTerm] = useState("");
    const [filterRole, setFilterRole] = useState<string>("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Add User Modal State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [addUserLoading, setAddUserLoading] = useState(false);
    const [newUser, setNewUser] = useState({
        email: "",
        password: "",
        role: "student" as "student" | "instructor" | "admin",
        firstName: "",
        lastName: "",
        phone: "",
        street: "",
        city: "",
        state: "",
        country: "",
        zipCode: ""
    });

    // Reset Password Modal State
    const [isResetPwdOpen, setIsResetPwdOpen] = useState(false);
    const [resettingUser, setResettingUser] = useState<User | null>(null);
    const [newPwd, setNewPwd] = useState("");
    const [pwdSaving, setPwdSaving] = useState(false);
    const [realTimeStats, setRealTimeStats] = useState({
        growth: "0",
        instructors: { total: 0, active: 0, verified: 0 },
        admins: { total: 0, active: 0 }
    });

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const roleQuery = filterRole !== 'all' ? `&role=${filterRole}` : '';
            const searchQuery = searchTerm ? `&search=${searchTerm}` : '';

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user?page=${currentPage}&limit=10${roleQuery}${searchQuery}`,
                {
                    headers: {
                        'Authorization': `Bearer ${adminToken}`
                    }
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to fetch users');
            }

            setUsers(result.data);
            setPagination(result.pagination);
            if (result.stats) {
                setRealTimeStats(result.stats);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, filterRole, searchTerm]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchUsers();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [fetchUsers]);

    const handleToggleStatus = async (userId: string) => {
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${userId}/toggle-status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to toggle status');
            }

            // Update local state
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, isActive: !u.isActive } : u
            ));

            // Refresh stats in header
            fetchUsers();
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return;

        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${adminToken}`
                }
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to delete user');
            }

            // Update local state
            setUsers(prev => prev.filter(u => u._id !== userId));
            toast.success('User deleted successfully');

            // Refresh stats in header
            fetchUsers();
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
        }
    };

    const handleUpdateRole = async (userId: string, newRole: string) => {
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${userId}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to update role');
            }

            // Update local state
            setUsers(prev => prev.map(u =>
                u._id === userId ? { ...u, role: newRole as 'admin' | 'instructor' | 'student' } : u
            ));
            toast.success(`Role updated to ${newRole}`);

            // Refresh stats in header
            fetchUsers();
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
        }
    };

    const handleAddUser = async () => {
        // Validate required fields
        if (
            !newUser.email ||
            !newUser.password ||
            !newUser.firstName ||
            !newUser.lastName ||
            !newUser.phone ||
            !newUser.street ||
            !newUser.city ||
            !newUser.state ||
            !newUser.country ||
            !newUser.zipCode
        ) {
            toast.error("Please fill in all fields.");
            return;
        }

        if (newUser.password.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }

        if (newUser.country.length !== 2) {
            toast.error("Country code must be exactly 2 letters (e.g. TN, US).");
            return;
        }

        setAddUserLoading(true);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: newUser.email,
                    password: newUser.password,
                    role: newUser.role,
                    profile: {
                        firstName: newUser.firstName,
                        lastName: newUser.lastName,
                        phone: newUser.phone,
                    },
                    address: {
                        street: newUser.street,
                        city: newUser.city,
                        state: newUser.state,
                        country: newUser.country.toUpperCase(),
                        zipCode: newUser.zipCode
                    }
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create user');
            }

            toast.success('User created successfully');
            setIsAddUserOpen(false);
            setNewUser({
                email: "",
                password: "",
                role: "student",
                firstName: "",
                lastName: "",
                phone: "",
                street: "",
                city: "",
                state: "",
                country: "",
                zipCode: ""
            });
            fetchUsers();
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
        } finally {
            setAddUserLoading(false);
        }
    };

    const handleResetPassword = async () => {
        if (!resettingUser || !newPwd) return;

        const hasLowercase = /[a-z]/.test(newPwd);
        const hasUppercase = /[A-Z]/.test(newPwd);
        const hasNumber = /[0-9]/.test(newPwd);
        const hasSymbol = /[!@#$%^&*(),.?":{}|<>]/.test(newPwd);

        if (newPwd.length < 8) {
            toast.error("Password must be at least 8 characters long");
            return;
        }

        if (!hasLowercase || !hasUppercase || !hasNumber || !hasSymbol) {
            toast.error("Password must contain a lowercase letter, an uppercase letter, a number, and a symbol");
            return;
        }

        setPwdSaving(true);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${resettingUser._id}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ password: newPwd })
            });

            if (!response.ok) {
                const result = await response.json();
                throw new Error(result.message || 'Failed to reset password');
            }

            toast.success('Password updated successfully');
            setIsResetPwdOpen(false);
            setNewPwd("");
            setResettingUser(null);
        } catch (err) {
            if (err instanceof Error) {
                toast.error(err.message);
            }
        } finally {
            setPwdSaving(false);
        }
    };

    const openResetModal = (user: User) => {
        setResettingUser(user);
        setNewPwd("");
        setIsResetPwdOpen(true);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u._id));
        }
    };

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-black tracking-tight text-foreground">User Management</h2>
                    <p className="text-muted-foreground">Manage and monitor platform users across all cloud tracks.</p>
                </div>
                <div className="flex gap-3">
                    <Button 
                        onClick={() => setIsAddUserOpen(true)}
                        className="h-11 px-6 bg-primary text-white font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                    >
                        <UserPlus className="size-4" />
                        Add New User
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-none shadow-sm bg-blue-50/50 dark:bg-blue-900/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-blue-600 dark:text-blue-400 text-sm font-bold uppercase tracking-wider">Total Users</p>
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                                <GraduationCap className="size-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{pagination?.totalUsers || 0}</p>
                            <span className="text-emerald-600 text-xs font-bold">+{realTimeStats.growth}% this month</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-purple-50/50 dark:bg-purple-900/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-purple-600 dark:text-purple-400 text-sm font-bold uppercase tracking-wider">Active Instructors</p>
                            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600">
                                <ShieldCheck className="size-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{realTimeStats.instructors.active}</p>
                            <span className="text-emerald-600 text-xs font-bold">
                                {realTimeStats.instructors.active === realTimeStats.instructors.total
                                    ? "All active"
                                    : `${realTimeStats.instructors.active}/${realTimeStats.instructors.total} active`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-slate-50/50 dark:bg-slate-900/10">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-bold uppercase tracking-wider">System Admins</p>
                            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600">
                                <Shield className="size-5" />
                            </div>
                        </div>
                        <div className="flex items-baseline gap-2">
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{realTimeStats.admins.active}</p>
                            <span className="text-slate-500 text-xs font-medium">
                                {realTimeStats.admins.active === realTimeStats.admins.total
                                    ? "All active"
                                    : `${realTimeStats.admins.active}/${realTimeStats.admins.total} active`}
                            </span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main User View Area */}
            <Card className="overflow-hidden flex flex-col flex-1 border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none">
                {/* Tabs & Toolbar */}
                <div className="border-b dark:border-slate-800 bg-white dark:bg-slate-950/50">
                    <div className="flex px-6 gap-8 overflow-x-auto scrollbar-hide">
                        {[
                            { id: 'all', label: 'All Users' },
                            { id: 'student', label: 'Students' },
                            { id: 'instructor', label: 'Instructors' },
                            { id: 'admin', label: 'Admins' },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => { setFilterRole(tab.id); setCurrentPage(1); }}
                                className={cn(
                                    "pb-4 pt-4 px-1 text-sm font-bold whitespace-nowrap transition-all relative",
                                    filterRole === tab.id ? "text-primary" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                                )}
                            >
                                {tab.label}
                                {filterRole === tab.id && (
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full shadow-[0_-4px_10px_rgba(19,127,236,0.5)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Filters Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50/50 dark:bg-slate-900/20 border-b dark:border-slate-800">
                    <div className="flex items-center gap-2 flex-1 min-w-[300px]">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 size-5" />
                            <Input
                                value={searchTerm}
                                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                                className="w-full pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-primary/20 transition-all"
                                placeholder="Search by name, email, or track..."
                            />
                        </div>
                        <Button variant="ghost" size="icon" className="h-11 w-11 text-slate-400 hover:bg-white dark:hover:bg-slate-800">
                            <Filter className="size-5" />
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 dark:text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                <TableHead className="px-6 py-4">User Identity</TableHead>
                                <TableHead className="px-6 py-4">Role & Credentials</TableHead>
                                <TableHead className="px-6 py-4">Account Status</TableHead>
                                <TableHead className="px-6 py-4 text-right">Settings</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y dark:divide-slate-800">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4} className="h-20 text-center">
                                            <div className="flex items-center justify-center gap-2 text-slate-400 animate-pulse">
                                                <div className="size-2 bg-primary rounded-full" />
                                                <div className="size-2 bg-primary rounded-full animation-delay-200" />
                                                <div className="size-2 bg-primary rounded-full animation-delay-400" />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-60 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Cloud className="size-12 opacity-20" />
                                            <p className="font-bold">No cloud users found</p>
                                            <p className="text-xs">Try adjusting your filters or search term</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : users.map((user) => (
                                <TableRow key={user._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors group relative">
                                    <TableCell className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative">
                                                <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 bg-cover overflow-hidden"
                                                    style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user.profile?.firstName || user._id}')` }}>
                                                </div>
                                                {user.isVerified && (
                                                    <div className="absolute -bottom-1 -right-1 size-5 bg-primary text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                                                        <ShieldCheck className="size-3" />
                                                    </div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 dark:text-white leading-tight">
                                                    {user.profile?.firstName} {user.profile?.lastName}
                                                </p>
                                                <p className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-1">
                                                    <Mail className="size-3" />
                                                    {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <div className="flex flex-col gap-2">
                                            <Badge variant="secondary" className={cn(
                                                "text-[10px] font-black px-2 mt-0.5 rounded-lg w-fit transition-all uppercase tracking-tighter",
                                                user.role === 'student' ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                                                    user.role === 'instructor' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                                        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-none border-none"
                                            )}>
                                                {user.role}
                                            </Badge>
                                            {user.profile?.phone && (
                                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                                    <Phone className="size-3" />
                                                    {user.profile.phone}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-4">
                                        <button
                                            onClick={() => handleToggleStatus(user._id)}
                                            className={cn(
                                                "group/btn flex items-center gap-2 py-1.5 px-3 rounded-full text-[11px] font-black transition-all border-2",
                                                user.isActive ?
                                                    "bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-900/50 dark:text-emerald-400" :
                                                    "bg-rose-50 border-rose-100 text-rose-700 dark:bg-rose-900/20 dark:border-rose-900/50 dark:text-rose-400"
                                            )}
                                        >
                                            <div className={cn("size-2 rounded-full ring-4 ring-offset-0", user.isActive ? "bg-emerald-500 ring-emerald-500/20" : "bg-rose-500 ring-rose-500/20 shadow-none")}></div>
                                            {user.isActive ? 'ACCOUNT ACTIVE' : 'SUSPENDED'}
                                            <ChevronDown className="size-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                        </button>
                                    </TableCell>
                                    <TableCell className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 h-10 w-10 rounded-xl transition-all">
                                                    <MoreVertical className="size-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl">
                                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 py-1.5">User Actions</DropdownMenuLabel>
                                                <Link href={`/admin/users/${user._id}`}>
                                                    <DropdownMenuItem className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                                        <Eye className="size-4 text-slate-400" />
                                                        <span className="text-sm font-bold">View Profile</span>
                                                    </DropdownMenuItem>
                                                </Link>

                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

                                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 py-1.5">Account Security</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => openResetModal(user)}
                                                    className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <Key className="size-4 text-slate-400" />
                                                    <span className="text-sm font-bold">Reset Password</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleToggleStatus(user._id)}
                                                    className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    <ShieldAlert className={cn("size-4", user.isActive ? "text-amber-500" : "text-emerald-500")} />
                                                    <span className="text-sm font-bold">{user.isActive ? 'Deactivate Account' : 'Activate Account'}</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />

                                                <DropdownMenuLabel className="text-[10px] font-black uppercase text-slate-400 tracking-widest px-2 py-1.5">Change Role</DropdownMenuLabel>
                                                <div className="grid grid-cols-1 gap-1">
                                                    {['student', 'instructor', 'admin'].filter(r => r !== user.role).map(role => (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            onClick={() => handleUpdateRole(user._id, role)}
                                                            className="gap-2 px-3 py-2 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <div className="size-1.5 rounded-full bg-slate-300" />
                                                            <span className="text-xs font-bold capitalize">Switch to {role}</span>
                                                        </DropdownMenuItem>
                                                    ))}
                                                </div>

                                                <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800 my-1" />
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteUser(user._id)}
                                                    className="gap-2 px-3 py-2.5 rounded-lg cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                                >
                                                    <UserX className="size-4" />
                                                    <span className="text-sm font-bold">Delete User</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>

                {/* Footer Pagination */}
                {pagination && (
                    <div className="p-6 border-t dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-950/50">
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                            Showing <span className="text-slate-900 dark:text-white">{(pagination.currentPage - 1) * pagination.limit + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(pagination.currentPage * pagination.limit, pagination.totalUsers)}</span> of <span className="text-slate-900 dark:text-white">{pagination.totalUsers}</span> users
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasPrevPage || loading}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="h-10 px-4 border-slate-200 dark:border-slate-800 font-bold hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30"
                            >
                                <ChevronLeft className="size-4 mr-1" /> Previous
                            </Button>

                            <div className="flex gap-2">
                                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === pagination.totalPages || (p >= currentPage - 1 && p <= currentPage + 1))
                                    .map((p, i, arr) => {
                                        const showDots = i > 0 && p !== arr[i - 1] + 1;
                                        return (
                                            <React.Fragment key={p}>
                                                {showDots && <span className="self-center px-1 text-slate-400">...</span>}
                                                <Button
                                                    size="sm"
                                                    disabled={loading}
                                                    onClick={() => setCurrentPage(p)}
                                                    className={cn(
                                                        "h-10 w-10 font-bold transition-all shadow-none",
                                                        currentPage === p ? "bg-primary text-white shadow-lg shadow-primary/20 scale-105" : "bg-transparent text-slate-500 hover:text-primary hover:bg-primary/5"
                                                    )}
                                                >
                                                    {p}
                                                </Button>
                                            </React.Fragment>
                                        );
                                    })
                                }
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={!pagination.hasNextPage || loading}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="h-10 px-4 border-slate-200 dark:border-slate-800 font-bold hover:bg-white dark:hover:bg-slate-900 disabled:opacity-30"
                            >
                                Next <ChevronRight className="size-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Reset Password Modal */}
            {isResetPwdOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-md border-none shadow-2xl bg-white dark:bg-slate-950 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-2 bg-primary w-full" />
                        <CardHeader className="pt-8 px-8 flex flex-row items-center justify-between space-y-0">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Key className="size-6 text-primary" /> Reset Security
                                </CardTitle>
                                <p className="text-sm text-slate-400 font-medium">Configure new access credentials for user.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setIsResetPwdOpen(false)}
                            >
                                <ChevronDown className="size-5 rotate-90" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-8 space-y-6">
                            {resettingUser && (
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="size-12 rounded-xl bg-cover"
                                        style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${resettingUser.profile?.firstName || resettingUser._id}')` }}
                                    />
                                    <div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white">{resettingUser.profile?.firstName} {resettingUser.profile?.lastName}</p>
                                        <p className="text-xs text-slate-400 font-bold">{resettingUser.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">New Secure Password</label>
                                <div className="relative">
                                    <Key className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
                                    <Input
                                        type="password"
                                        placeholder="Min. 8 characters"
                                        value={newPwd}
                                        onChange={(e) => setNewPwd(e.target.value)}
                                        className="h-14 pl-12 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all rounded-2xl text-lg font-bold"
                                        onKeyDown={(e) => e.key === 'Enter' && handleResetPassword()}
                                        autoFocus
                                    />
                                </div>
                                <div className="grid grid-cols-4 gap-1.5 px-1">
                                    <div className={cn("h-1.5 rounded-full transition-all", newPwd.length >= 8 ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} title="Length" />
                                    <div className={cn("h-1.5 rounded-full transition-all", /[A-Z]/.test(newPwd) && /[a-z]/.test(newPwd) ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} title="Case" />
                                    <div className={cn("h-1.5 rounded-full transition-all", /[0-9]/.test(newPwd) ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} title="Number" />
                                    <div className={cn("h-1.5 rounded-full transition-all", /[!@#$%^&*(),.?":{}|<>]/.test(newPwd) ? "bg-emerald-500" : "bg-slate-100 dark:bg-slate-800")} title="Symbol" />
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                                    <span className={cn("text-[10px] font-bold flex items-center gap-1", newPwd.length >= 8 ? "text-emerald-500" : "text-slate-400")}>
                                        {newPwd.length >= 8 ? <CheckCircle2 className="size-3" /> : <div className="size-1 bg-slate-400 rounded-full" />} 8+ Characters
                                    </span>
                                    <span className={cn("text-[10px] font-bold flex items-center gap-1", /[A-Z]/.test(newPwd) && /[a-z]/.test(newPwd) ? "text-emerald-500" : "text-slate-400")}>
                                        {/[A-Z]/.test(newPwd) && /[a-z]/.test(newPwd) ? <CheckCircle2 className="size-3" /> : <div className="size-1 bg-slate-400 rounded-full" />} Mix Case
                                    </span>
                                    <span className={cn("text-[10px] font-bold flex items-center gap-1", /[0-9]/.test(newPwd) ? "text-emerald-500" : "text-slate-400")}>
                                        {/[0-9]/.test(newPwd) ? <CheckCircle2 className="size-3" /> : <div className="size-1 bg-slate-400 rounded-full" />} Number
                                    </span>
                                    <span className={cn("text-[10px] font-bold flex items-center gap-1", /[!@#$%^&*(),.?":{}|<>]/.test(newPwd) ? "text-emerald-500" : "text-slate-400")}>
                                        {/[!@#$%^&*(),.?":{}|<>]/.test(newPwd) ? <CheckCircle2 className="size-3" /> : <div className="size-1 bg-slate-400 rounded-full" />} Symbol
                                    </span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 font-medium leading-relaxed bg-blue-50/50 dark:bg-blue-900/10 p-3 rounded-xl border border-blue-100/50 dark:border-blue-900/30">
                                <ShieldAlert className="size-3 inline mr-1 text-blue-500" />
                                This operation will override the existing password. The user will be notified via email for security compliance.
                            </p>
                        </CardContent>
                        <div className="p-8 pt-0 flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-14 rounded-2xl font-black border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={() => setIsResetPwdOpen(false)}
                            >
                                CANCEL
                            </Button>
                            <Button
                                className="flex-[2] h-14 rounded-2xl font-black bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
                                onClick={handleResetPassword}
                                disabled={pwdSaving || newPwd.length < 8 || !/[a-z]/.test(newPwd) || !/[A-Z]/.test(newPwd) || !/[0-9]/.test(newPwd) || !/[!@#$%^&*(),.?":{}|<>]/.test(newPwd)}
                            >
                                {pwdSaving ? <Loader2 className="size-5 animate-spin" /> : <Save className="size-5" />}
                                UPDATE ACCESS
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* Add User Modal */}
            {isAddUserOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-2xl border-none shadow-2xl bg-white dark:bg-slate-950 overflow-hidden animate-in zoom-in-95 duration-300">
                        <div className="h-2 bg-primary w-full" />
                        <CardHeader className="pt-6 px-8 flex flex-row items-center justify-between space-y-0">
                            <div className="flex flex-col gap-1">
                                <CardTitle className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <UserPlus className="size-6 text-primary" /> Create User Account
                                </CardTitle>
                                <p className="text-sm text-slate-400 font-medium">Add a new user credential to the platform database.</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="size-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                                onClick={() => setIsAddUserOpen(false)}
                            >
                                <ChevronDown className="size-5 rotate-90" />
                            </Button>
                        </CardHeader>
                        
                        {/* Scrollable Form Content */}
                        <CardContent className="p-8 space-y-6 max-h-[calc(100vh-14rem)] overflow-y-auto">
                            {/* Personal Info Grid */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b pb-1.5 dark:border-slate-800">1. Personal Information</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">First Name</label>
                                        <Input
                                            value={newUser.firstName}
                                            onChange={(e) => setNewUser(p => ({ ...p, firstName: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="John"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Name</label>
                                        <Input
                                            value={newUser.lastName}
                                            onChange={(e) => setNewUser(p => ({ ...p, lastName: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="Doe"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                                        <Input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser(p => ({ ...p, email: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="john.doe@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone Number</label>
                                        <Input
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser(p => ({ ...p, phone: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="+21628642656"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Password</label>
                                        <Input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser(p => ({ ...p, password: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="Min. 8 characters"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Account Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser(p => ({ ...p, role: e.target.value as any }))}
                                            className="w-full h-11 px-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Address Grid */}
                            <div className="space-y-4 pt-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b pb-1.5 dark:border-slate-800">2. Physical Address</h3>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Street Address</label>
                                    <Input
                                        value={newUser.street}
                                        onChange={(e) => setNewUser(p => ({ ...p, street: e.target.value }))}
                                        className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                        placeholder="123 Education St."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">City</label>
                                        <Input
                                            value={newUser.city}
                                            onChange={(e) => setNewUser(p => ({ ...p, city: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="Tunis"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">State / Region</label>
                                        <Input
                                            value={newUser.state}
                                            onChange={(e) => setNewUser(p => ({ ...p, state: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="Tunis"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Country Code (2 Letters)</label>
                                        <Input
                                            value={newUser.country}
                                            onChange={(e) => setNewUser(p => ({ ...p, country: e.target.value }))}
                                            maxLength={2}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl uppercase"
                                            placeholder="TN"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Zip / Postal Code</label>
                                        <Input
                                            value={newUser.zipCode}
                                            onChange={(e) => setNewUser(p => ({ ...p, zipCode: e.target.value }))}
                                            className="h-11 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:ring-primary/20 rounded-xl"
                                            placeholder="1000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        
                        <div className="p-8 pt-4 border-t dark:border-slate-800 flex gap-4 bg-slate-50/50 dark:bg-slate-950/50">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 rounded-xl font-bold border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
                                onClick={() => setIsAddUserOpen(false)}
                            >
                                CANCEL
                            </Button>
                            <Button
                                className="flex-[2] h-12 rounded-xl font-bold bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all gap-2"
                                onClick={handleAddUser}
                                disabled={addUserLoading}
                            >
                                {addUserLoading ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
                                CREATE USER ACCOUNT
                            </Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
