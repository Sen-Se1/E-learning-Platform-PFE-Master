"use client";

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function InfrastructurePage() {
    const [metrics, setMetrics] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [range, setRange] = useState<"day" | "week">("day");
    const [loading, setLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_METRICS_API_URL as string;

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const [latestRes, historyRes] = await Promise.all([
                    fetch(`${API_URL}/summary`),
                    fetch(`${API_URL}/summary/history?range=${range}`)
                ]);
                
                if (latestRes.ok) {
                    const latestData = await latestRes.json();
                    setMetrics(latestData);
                }
                
                if (historyRes.ok) {
                    const historyData = await historyRes.json();
                    setHistory(historyData);
                }
            } catch (error) {
                console.error("Failed to fetch metrics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMetrics();
        const interval = setInterval(fetchMetrics, 10000); // refresh every 10s for infra
        return () => clearInterval(interval);
    }, [range]);

    // Format data for Recharts — history items have { timestamp, appSummary }
    const chartData = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        load: parseFloat((h.appSummary?.clusterLoadPercent ?? 0).toFixed(1)),
        cpu: parseFloat((h.appSummary?.cpuPercent ?? 0).toFixed(1)),
        ram: parseFloat((h.appSummary?.ramPercent ?? 0).toFixed(1)),
    }));

    const cpuDistributionData = metrics?.containers?.map((c: any) => ({
        name: c.name,
        cpu: parseFloat(c.cpuPercent.toFixed(1))
    })).sort((a: any, b: any) => b.cpu - a.cpu) || [];

    const getUptimeString = (seconds: number) => {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) return `${days}d ${hours % 24}h`;
        return `${hours}h ${mins % 60}m`;
    };

    const totalRestarts = metrics?.containers?.reduce((acc: number, curr: any) => acc + (curr.restartCount || 0), 0) || 0;
    const networkTotal = metrics ? (metrics.appSummary.networkRxMB + metrics.appSummary.networkTxMB).toFixed(2) : "0";

    return (
        <div className="flex flex-col gap-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <span className="material-symbols-outlined text-xs text-muted-foreground">chevron_right</span>
                <span className="font-bold">Cloud Infrastructure</span>
            </div>

            {/* Header section */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight mb-2">Cloud Infrastructure Monitor</h1>
                <p className="text-muted-foreground">Real-time telemetry and resource usage across your Kubernetes cluster.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { 
                        label: "Total RAM Used", 
                        value: metrics ? `${metrics.appSummary.ramMB.toFixed(0)} MB` : "...", 
                        icon: "memory", 
                        sub: "Overall memory consumption", 
                        color: "destructive" 
                    },
                    { 
                        label: "Disk I/O", 
                        value: metrics ? `${(metrics.appSummary.diskReadMB + metrics.appSummary.diskWriteMB).toFixed(1)} MB` : "...", 
                        icon: "hard_drive", 
                        sub: metrics ? `R: ${metrics.appSummary.diskReadMB.toFixed(1)} | W: ${metrics.appSummary.diskWriteMB.toFixed(1)}` : "...", 
                        color: "success" 
                    },
                    { 
                        label: "Network (Rx+Tx)", 
                        value: `${networkTotal} MB/s`, 
                        icon: "cloud_sync", 
                        sub: "Total bandwidth", 
                        color: "destructive" 
                    },
                    { 
                        label: "Total Restarts", 
                        value: totalRestarts.toString(), 
                        icon: "restart_alt", 
                        sub: totalRestarts > 0 ? "Warning: Containers restarted" : "Stable cluster", 
                        color: totalRestarts > 0 ? "destructive" : "success" 
                    },
                ].map((stat, i) => (
                    <Card key={i} className={stat.label === "Total Restarts" && parseInt(stat.value) > 0 ? "border-rose-500/50 bg-rose-500/5" : ""}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                            <span className={`material-symbols-outlined ${stat.label === "Total Restarts" && parseInt(stat.value) > 0 ? "text-rose-500" : "text-primary/40"}`}>{stat.icon}</span>
                        </CardHeader>
                        <CardContent>
                            <div className={`text-3xl font-bold tracking-tight ${stat.label === "Total Restarts" && parseInt(stat.value) > 0 ? "text-rose-500" : ""}`}>{stat.value}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className={`text-[10px] ${stat.label === "Total Restarts" && parseInt(stat.value) > 0 ? "text-rose-500 font-bold" : "text-muted-foreground"}`}>{stat.sub}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Graph */}
                <Card className="lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-base">System Resources Over Time</CardTitle>
                        </div>
                        <div className="flex gap-2">
                            <Badge 
                                variant={range === "day" ? "secondary" : "outline"} 
                                className={`px-3 py-1.5 cursor-pointer ${range !== "day" ? "text-muted-foreground border-transparent" : ""}`}
                                onClick={() => setRange("day")}
                            >Day</Badge>
                            <Badge 
                                variant={range === "week" ? "secondary" : "outline"} 
                                className={`px-3 py-1.5 cursor-pointer ${range !== "week" ? "text-muted-foreground border-transparent" : ""}`}
                                onClick={() => setRange("week")}
                            >Week</Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[300px] mt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                    <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                                    <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                        itemStyle={{ color: '#e2e8f0' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="load" name="Cluster Load %" stroke="#137fec" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="cpu" name="CPU Usage %" stroke="#ef4444" strokeWidth={2} dot={false} />
                                    <Line type="monotone" dataKey="ram" name="RAM Usage %" stroke="#10b981" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* CPU Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">CPU Distribution</CardTitle>
                        <p className="text-xs text-muted-foreground">Real-time CPU share per container</p>
                    </CardHeader>
                    <CardContent>
                        <div className="w-full h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart layout="vertical" data={cpuDistributionData} margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} fontSize={11} width={80} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    />
                                    <Bar dataKey="cpu" fill="#137fec" radius={[0, 4, 4, 0]} name="CPU %" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Advanced Containers Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b">
                    <div>
                        <CardTitle className="text-base">Container Details</CardTitle>
                        <p className="text-sm text-muted-foreground">Deep dive into individual container metrics</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
                        <span className="material-symbols-outlined text-sm">refresh</span>
                        Refresh Data
                    </Button>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Container Name</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Status & Uptime</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">CPU & RAM</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Disk R/W</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Restarts</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading services...</TableCell>
                                </TableRow>
                            ) : metrics && metrics.containers ? (
                                metrics.containers.map((container: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-muted/30 group">
                                        <TableCell className="px-6 py-4 font-bold text-sm">
                                            {container.name}
                                            <div className="text-[10px] text-muted-foreground font-normal mt-1">{container.image}</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <div className={`size-1.5 rounded-full ${container.status === 'running' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                                                <span className={`text-sm capitalize ${container.status !== 'running' ? 'text-rose-500 font-bold' : ''}`}>{container.status}</span>
                                            </div>
                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <span className="material-symbols-outlined text-[10px]">timer</span>
                                                {getUptimeString(container.uptimeSeconds)}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="text-sm font-medium mb-1">{container.cpuPercent.toFixed(2)}% CPU</div>
                                            <div className="text-[11px] text-muted-foreground">{container.ramMB.toFixed(1)} MB RAM</div>
                                            <div className="w-full bg-muted rounded-full h-1 mt-2">
                                                <div className="bg-primary h-1 rounded-full" style={{ width: `${Math.min(100, container.cpuPercent)}%` }}></div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="text-sm">R: {container.diskReadMB.toFixed(2)} MB</div>
                                            <div className="text-sm">W: {container.diskWriteMB.toFixed(2)} MB</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            {container.restartCount > 0 ? (
                                                <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                                                    <span className="material-symbols-outlined text-[12px]">warning</span>
                                                    {container.restartCount} restarts
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 bg-emerald-500/10">
                                                    0
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    )
}
