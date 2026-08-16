"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Mail, Phone, MapPin, Shield,
    ArrowLeft, Save, Key, Pencil,
    AlertCircle, CheckCircle2
} from "lucide-react"
import { countries } from "@/lib/countries"
import { cn } from "@/lib/utils"

interface UserData {
    _id: string;
    email: string;
    role: string;
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

export default function UserDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [user, setUser] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState<UserData | null>(null);
    const [passwords, setPasswords] = useState({ password: '', confirmPassword: '' });
    const [saving, setSaving] = useState(false);

    const fetchUser = useCallback(async () => {
        setLoading(true);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${params.id}`, {
                headers: { 'Authorization': `Bearer ${adminToken}` }
            });
            const result = await response.json();
            if (response.ok) {
                setUser(result.data);
                setEditData(result.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [params.id]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${params.id}/profile`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({
                    email: editData?.email,
                    role: editData?.role,
                    firstName: editData?.profile?.firstName,
                    lastName: editData?.profile?.lastName,
                    phone: editData?.profile?.phone,
                    dateOfBirth: editData?.profile?.dateOfBirth,
                    street: editData?.address?.street,
                    city: editData?.address?.city,
                    state: editData?.address?.state,
                    country: editData?.address?.country,
                    zipCode: editData?.address?.zipCode
                })
            });
            if (response.ok) {
                setIsEditing(false);
                fetchUser();
                alert('Profile updated successfully');
            }
        } catch {
            alert('Update failed');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.password !== passwords.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        setSaving(true);
        try {
            const adminToken = localStorage.getItem('admin-token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_USER_API_URL}/admin/user/${params.id}/password`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${adminToken}`
                },
                body: JSON.stringify({ password: passwords.password })
            });
            if (response.ok) {
                setPasswords({ password: '', confirmPassword: '' });
                alert('Password reset successfully');
            }
        } catch {
            alert('Reset failed');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-white">Loading profile...</div>;
    if (!user) return <div className="p-8 text-rose-500">User not found</div>;

    const countryName = countries.find(c => c.code === user.address?.country)?.name || user.address?.country;

    return (
        <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-5xl mx-auto">
            {/* Nav Header */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" className="gap-2 text-slate-500" onClick={() => router.back()}>
                    <ArrowLeft className="size-4" /> Back to Users
                </Button>
                <div className="flex gap-2">
                    <Button
                        variant={isEditing ? "outline" : "default"}
                        className={cn("gap-2 font-bold", !isEditing && "bg-primary text-white hover:bg-primary/90")}
                        onClick={() => setIsEditing(!isEditing)}
                    >
                        {isEditing ? "Cancel" : <><Pencil className="size-4" /> Edit Profile</>}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Brief Info */}
                <div className="space-y-6">
                    <Card className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-primary/20 to-blue-500/20" />
                        <CardContent className="pt-0 -mt-12 text-center pb-8">
                            <div className="inline-block relative">
                                <div className="size-24 rounded-3xl bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-900 bg-cover shadow-lg"
                                    style={{ backgroundImage: `url('https://api.dicebear.com/7.x/avataaars/svg?seed=${user.profile?.firstName}')` }}>
                                </div>
                                {user.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 size-7 bg-primary text-white rounded-full flex items-center justify-center border-4 border-white dark:border-slate-900">
                                        <CheckCircle2 className="size-4" />
                                    </div>
                                )}
                            </div>
                            <h3 className="mt-4 text-xl font-black text-slate-900 dark:text-white">
                                {user.profile?.firstName} {user.profile?.lastName}
                            </h3>
                            <p className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-1">{user.role}</p>

                            <div className="mt-6 flex flex-col gap-3 text-left">
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Mail className="size-4 text-primary" />
                                    <span className="truncate">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Phone className="size-4 text-primary" />
                                    <span>{user.profile?.phone || 'No phone'}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-lg bg-white dark:bg-slate-900">
                        <CardHeader className="border-b dark:border-slate-800">
                            <CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Security Status</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-500">Account status</span>
                                <Badge className={cn("rounded-full px-3 py-1 border-none", user.isActive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30")}>
                                    {user.isActive ? 'Active' : 'Suspended'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold text-slate-500">Email Verification</span>
                                <Badge className={cn("rounded-full px-3 py-1 border-none", user.isVerified ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30")}>
                                    {user.isVerified ? 'Verified' : 'Pending'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-6">
                    {isEditing ? (
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                            <CardHeader className="border-b dark:border-slate-800 py-6">
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Pencil className="size-5 text-primary" /> Edit User Profile
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <form onSubmit={handleUpdateProfile} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">First Name</label>
                                            <Input
                                                value={editData?.profile?.firstName || ''}
                                                onChange={(e) => editData && setEditData({ ...editData, profile: { ...editData.profile!, firstName: e.target.value } })}
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Last Name</label>
                                            <Input
                                                value={editData?.profile?.lastName || ''}
                                                onChange={(e) => editData && setEditData({ ...editData, profile: { ...editData.profile!, lastName: e.target.value } })}
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400">Email Address</label>
                                        <Input
                                            value={editData?.email || ''}
                                            onChange={(e) => editData && setEditData({ ...editData, email: e.target.value })}
                                            className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t dark:border-slate-800">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Role</label>
                                            <select
                                                value={editData?.role || 'student'}
                                                onChange={(e) => editData && setEditData({ ...editData, role: e.target.value })}
                                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 h-11 rounded-xl px-4 text-sm"
                                            >
                                                <option value="student">Student</option>
                                                <option value="instructor">Instructor</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase tracking-widest text-slate-400">Phone</label>
                                            <Input
                                                value={editData?.profile?.phone || ''}
                                                onChange={(e) => editData && setEditData({ ...editData, profile: { ...editData.profile!, phone: e.target.value } })}
                                                className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end gap-3 pt-6">
                                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                                        <Button type="submit" disabled={saving} className="bg-primary text-white px-8 font-bold h-11 rounded-xl gap-2">
                                            {saving ? "Saving..." : <><Save className="size-4" /> Save Changes</>}
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                            <CardHeader className="border-b dark:border-slate-800 py-6">
                                <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <Shield className="size-5 text-primary" /> Profile Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                    <DetailItem label="Full Name" value={`${user.profile?.firstName} ${user.profile?.lastName}`} />
                                    <DetailItem label="Email" value={user.email} />
                                    <DetailItem label="Role" value={user.role} />
                                    <DetailItem label="Phone" value={user.profile?.phone || 'Not provided'} />
                                    <DetailItem label="Birth Date" value={user.profile?.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString() : 'Not provided'} />
                                    <DetailItem label="Member Since" value={new Date(user.createdAt).toLocaleDateString()} />
                                </div>

                                <div className="mt-12 pt-8 border-t dark:border-slate-800">
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                                        <MapPin className="size-4" /> Address Information
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                        <DetailItem label="Street" value={user.address?.street || '-'} />
                                        <DetailItem label="City" value={user.address?.city || '-'} />
                                        <DetailItem label="State/Province" value={user.address?.state || '-'} />
                                        <DetailItem label="Country" value={countryName || '-'} />
                                        <DetailItem label="Zip Code" value={user.address?.zipCode || '-'} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Reset Password Card */}
                    <Card className="border-none shadow-xl bg-white dark:bg-slate-900">
                        <CardHeader className="border-b dark:border-slate-800 py-6">
                            <CardTitle className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 text-rose-500">
                                <Key className="size-5" /> Reset Security Access
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-8 text-left">
                            <p className="text-sm text-slate-500 mb-6 bg-rose-50 dark:bg-rose-900/10 p-4 rounded-xl border border-rose-100 dark:border-rose-900/30">
                                <AlertCircle className="size-4 inline mr-2 text-rose-500" />
                                This will permanently change the user&apos;s password. The user will receive an email notification about this change.
                            </p>
                            <form onSubmit={handleResetPassword} className="space-y-4 max-w-sm">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 text-left block">New Password</label>
                                    <Input
                                        type="password"
                                        required
                                        value={passwords.password}
                                        onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 text-left block">Confirm Password</label>
                                    <Input
                                        type="password"
                                        required
                                        value={passwords.confirmPassword}
                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                        className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11 rounded-xl"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <Button type="submit" disabled={saving} className="bg-rose-500 text-white font-bold h-11 rounded-xl px-6 mt-4 w-full md:w-auto shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all">
                                    {saving ? "Processing..." : "Reset Password"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col gap-1 text-left">
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">{label}</span>
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{value}</span>
        </div>
    );
}
