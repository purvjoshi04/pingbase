"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Radio, ArrowLeft, Activity, Clock, TrendingUp, Globe, Zap, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { TickStatus } from "@/lib/types";
import { getLastChecked, tickToStatus } from "@/lib/helpers";


type Status = "up" | "down" | "degraded";

type Tick = {
    id: string;
    status: TickStatus;
    response_time_ms: number;
    createdAt: string;
    region_id: string;
};

type SiteDetail = {
    id: string;
    name: string;
    url: string;
    ticks: Tick[];
};


function StatusBadge({ status }: { status: Status }) {
    const map = {
        up: { label: "Up", dot: "bg-emerald-400", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
        down: { label: "Down", dot: "bg-red-400", cls: "bg-red-500/10 text-red-400 border-red-500/20" },
        degraded: { label: "Degraded", dot: "bg-amber-400", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
    };
    const s = map[status];
    return (
        <Badge variant="outline" className={`gap-1.5 font-medium ${s.cls}`}>
            <span className="relative flex h-2 w-2">
                {status === "up" && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${s.dot} opacity-60`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${s.dot}`} />
            </span>
            {s.label}
        </Badge>
    );
}

export default function WebsiteDetail() {
    const { websiteId } = useParams<{ websiteId: string }>();
    const [site, setSite] = useState<SiteDetail | null>(null);
    const [fetching, setFetching] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const fetchSite = async () => {
            try {
                const res = await api.websites.getStatus(websiteId);
                if (res.status === 404) { setNotFound(true); return; }
                const data = await res.json();
                if (res.ok) setSite(data.website);
            } catch {
                setNotFound(true);
            } finally {
                setFetching(false);
            }
        };

        fetchSite();
        const intervalId = window.setInterval(fetchSite, 30 * 1000);
        return () => window.clearInterval(intervalId);
    }, [websiteId]);

    useEffect(() => {
        const id = window.setInterval(() => setNow(Date.now()), 30_000);
        return () => window.clearInterval(id);
    }, []);

    const lastChecked = site?.ticks[0] ? getLastChecked(site.ticks[0].createdAt, now) : "—";

    if (fetching) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (notFound || !site) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-semibold">Monitor not found</h1>
                    <p className="text-muted-foreground mt-2">This monitor does not exist or you don&apos;t have access.</p>
                    <Button asChild className="mt-6 bg-linear-to-r from-primary to-primary-glow">
                        <Link href="/dashboard">Back to Dashboard</Link>
                    </Button>
                </div>
            </div>
        );
    }

    const ticks = site.ticks;
    const latestTick = ticks[0];
    const currentStatus: Status = !latestTick ? "degraded" : tickToStatus(latestTick.status);

    const upTicks = ticks.filter((t) => t.status === "Up").length;
    const downTicks = ticks.filter((t) => t.status === "Down").length;
    const degradedTicks = ticks.filter((t) => t.status === "Unknown").length;
    const uptimePct = ticks.length > 0 ? ((upTicks / ticks.length) * 100).toFixed(1) : "—";

    const respondingTicks = ticks.filter((t) => t.status !== "Down");
    const avgResponse = respondingTicks.length > 0
        ? Math.round(respondingTicks.reduce((a, t) => a + t.response_time_ms, 0) / respondingTicks.length)
        : 0;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <header className="relative top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Radio className="h-4 w-4" />
                        </span>
                        <span>Pingbase</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/dashboard" className="hover:text-foreground">Monitors</Link>
                        <a className="hover:text-foreground" href="#">Incidents</a>
                        <a className="hover:text-foreground" href="#">Status pages</a>
                        <a className="hover:text-foreground" href="#">Settings</a>
                    </nav>
                </div>
            </header>

            <main className="relative mx-auto max-w-7xl px-6 py-10">
                <div className="mb-8">
                    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to monitors
                        </Link>
                    </Button>
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-semibold tracking-tight">{site.name}</h1>
                            <a
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:text-primary/80 transition-colors inline-flex items-center gap-1 mt-1"
                            >
                                <Globe className="h-3.5 w-3.5" />
                                {site.url}
                            </a>
                        </div>
                        <StatusBadge status={currentStatus} />
                    </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-4 mb-10">
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
                            <Activity className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold capitalize">{currentStatus}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Uptime</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{uptimePct}%</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Response</CardTitle>
                            <Zap className="h-4 w-4 text-primary" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{avgResponse} ms</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Last Check</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{lastChecked}</div>
                        </CardContent>
                    </Card>
                </div>
                <Card className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Last {ticks.length} checks</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {ticks.length === 0 ? (
                            <p className="text-muted-foreground text-sm">No checks yet - the worker will start recording soon.</p>
                        ) : (
                            <>
                                <div className="flex gap-2">
                                    {ticks.map((tick) => {
                                        const color = tick.status === "Up"
                                            ? "bg-emerald-400"
                                            : tick.status === "Unknown"
                                                ? "bg-amber-400"
                                                : "bg-red-400";
                                        const heightPct = tick.status === "Down"
                                            ? 100
                                            : Math.min(100, Math.max(15, tick.response_time_ms / 6));
                                        return (
                                            <div key={tick.id} className="flex-1 flex flex-col items-center gap-2 group">
                                                <div className="w-full h-24 rounded-lg overflow-hidden bg-white/3 relative">
                                                    <div
                                                        className={`absolute bottom-0 left-0 right-0 rounded-t-sm transition-all ${color}`}
                                                        style={{ height: `${heightPct}%` }}
                                                    />
                                                </div>
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {tick.status}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="rounded-xl border border-white/10 overflow-hidden">
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider bg-white/3">
                                        <div className="col-span-3">Time</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-3">Response</div>
                                        <div className="col-span-4">Details</div>
                                    </div>
                                    {ticks.map((tick) => {
                                        const status = tickToStatus(tick.status);
                                        return (
                                            <div
                                                key={tick.id}
                                                className="grid grid-cols-12 gap-4 px-4 py-3 text-sm border-t border-white/5 items-center hover:bg-white/2 transition-colors"
                                            >
                                                <div className="col-span-3 text-muted-foreground">
                                                    {new Date(tick.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                                                </div>
                                                <div className="col-span-2">
                                                    <StatusBadge status={status} />
                                                </div>
                                                <div className="col-span-3 text-muted-foreground">
                                                    {tick.status === "Down" ? "—" : `${tick.response_time_ms} ms`}
                                                </div>
                                                <div className="col-span-4 text-muted-foreground">
                                                    {tick.status === "Up" ? "HTTP 200 OK" : tick.status === "Unknown" ? "HTTP 200 Slow" : "Connection failed"}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-emerald-400" />{upTicks} up
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-amber-400" />{degradedTicks} degraded
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <span className="h-2 w-2 rounded-full bg-red-400" />{downTicks} down
                                    </span>
                                    <span className="ml-auto">{uptimePct}% uptime in last {ticks.length} checks</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}