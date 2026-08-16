"use client";

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function AdminDashboardPage() {
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
        const interval = setInterval(fetchMetrics, 30000); // refresh every 30s
        return () => clearInterval(interval);
    }, [range]);

    // Format data for Recharts — history items have { timestamp, appSummary }
    const chartData = [...history].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()).map(h => ({
        time: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        load: parseFloat((h.appSummary?.clusterLoadPercent ?? 0).toFixed(1)),
        cpu: parseFloat((h.appSummary?.cpuPercent ?? 0).toFixed(1)),
        ram: parseFloat((h.appSummary?.ramPercent ?? 0).toFixed(1)),
    }));

    const getUptimeString = (seconds: number) => {
        if (seconds < 60) return `${Math.floor(seconds)}s`;
        const mins = Math.floor(seconds / 60);
        if (mins < 60) return `${mins}m`;
        const hours = Math.floor(mins / 60);
        return `${hours}h ${mins % 60}m`;
    };

    return (
        <div className="flex flex-col gap-8">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Admin</span>
                <span className="material-symbols-outlined text-xs text-muted-foreground">chevron_right</span>
                <span className="text-muted-foreground">Dashboard</span>
                <span className="material-symbols-outlined text-xs text-muted-foreground">chevron_right</span>
                <span className="font-bold">System Health & Users</span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { 
                        label: "CPU Usage", 
                        value: metrics ? `${metrics.appSummary.cpuPercent.toFixed(1)}%` : "...", 
                        icon: "memory", 
                        sub: "Real-time cluster CPU", 
                        color: "destructive" 
                    },
                    { 
                        label: "RAM Usage", 
                        value: metrics ? `${metrics.appSummary.ramPercent.toFixed(1)}%` : "...", 
                        icon: "storage", 
                        sub: metrics ? `${metrics.appSummary.ramMB.toFixed(0)} MB total` : "Loading...", 
                        color: "success" 
                    },
                    { 
                        label: "Network Traffic", 
                        value: metrics ? `${(metrics.appSummary.networkRxMB + metrics.appSummary.networkTxMB).toFixed(2)} MB/s` : "...", 
                        icon: "speed", 
                        sub: metrics ? `Rx: ${metrics.appSummary.networkRxMB.toFixed(2)} | Tx: ${metrics.appSummary.networkTxMB.toFixed(2)}` : "Loading...", 
                        color: "destructive" 
                    },
                    { 
                        label: "Active Containers", 
                        value: metrics ? `${metrics.appSummary.runningContainers}/${metrics.appSummary.containersCount}` : "...", 
                        icon: "rebase_edit", 
                        sub: "Running services", 
                        color: "success" 
                    },
                ].map((stat, i) => (
                    <Card key={i}>
                        <CardHeader className="flex flex-row items-start justify-between pb-2 space-y-0">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                            <span className="material-symbols-outlined text-primary/40">{stat.icon}</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
                            <div className="flex items-center gap-1.5 mt-2">
                                <span className="text-muted-foreground text-[10px]">{stat.sub}</span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Section */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-base">Cluster Load Distribution</CardTitle>
                        <p className="text-sm text-muted-foreground">Real-time worker node health telemetry</p>
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
                    <div className="w-full h-[280px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#137fec" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="time" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} minTickGap={30} />
                                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '8px' }}
                                    itemStyle={{ color: '#e2e8f0' }}
                                />
                                <Area type="monotone" dataKey="load" name="Cluster Load" stroke="#137fec" strokeWidth={2} fillOpacity={1} fill="url(#colorLoad)" />
                                <Area type="monotone" dataKey="cpu" name="CPU Usage" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorCpu)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Running Services / Containers Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between px-6 py-5 border-b">
                    <div>
                        <CardTitle className="text-base">Running Services</CardTitle>
                        <p className="text-sm text-muted-foreground">Real-time status of cluster containers</p>
                    </div>
                </CardHeader>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Container Name</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Status</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">CPU Usage</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">RAM Usage</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground">Network (Rx/Tx)</TableHead>
                                <TableHead className="px-6 py-3 text-xs font-bold uppercase text-muted-foreground text-right">Uptime</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading services...</TableCell>
                                </TableRow>
                            ) : metrics && metrics.containers ? (
                                metrics.containers.map((container: any, i: number) => (
                                    <TableRow key={i} className="hover:bg-muted/30 group">
                                        <TableCell className="px-6 py-4 font-bold text-sm">
                                            {container.name}
                                            <div className="text-[10px] text-muted-foreground font-normal">{container.image}</div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-1.5">
                                                <div className={`size-1.5 rounded-full ${container.status === 'running' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className="text-sm capitalize">{container.status}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="text-sm font-medium">{container.cpuPercent.toFixed(2)}%</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="text-sm font-medium">{container.ramMB.toFixed(1)} MB</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4">
                                            <span className="text-xs text-muted-foreground">{container.networkRxMB.toFixed(2)} / {container.networkTxMB.toFixed(2)} MB</span>
                                        </TableCell>
                                        <TableCell className="px-6 py-4 text-right text-sm text-muted-foreground">
                                            {getUptimeString(container.uptimeSeconds)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No data available</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>


        </div>
    )
}
