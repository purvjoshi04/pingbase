"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Radio, Plus, MoreHorizontal, Activity, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Trash2, SquarePen } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { computeStats } from "@/lib/uptime";

type Status = "up" | "down" | "degraded";

type Site = {
    id: string;
    name: string;
    url: string;
    status: Status;
    uptime: string;
    responseMs: number;
    lastChecked: string;
};

type Tick = {
    status: "Up" | "Down" | "Unknown";
    response_time_ms: number;
    createdAt: string;
};

type WebsiteFromApi = {
    id: string;
    url: string;
    name: string;
    ticks: Tick[];
};

function tickStatusToStatus(ticks: Tick[]): Status {
    const latest = ticks[0];
    if (!latest || latest.status === "Unknown") return "degraded";
    return latest.status === "Up" ? "up" : "down";
}

function StatusBadge({ status }: { status: Status }) {
    const map: Record<Status, { label: string; dot: string; cls: string }> = {
        up: {
            label: "Up",
            dot: "bg-emerald-400",
            cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        },
        down: {
            label: "Down",
            dot: "bg-red-400",
            cls: "bg-red-500/10 text-red-400 border-red-500/20",
        },
        degraded: {
            label: "Degraded",
            dot: "bg-amber-400",
            cls: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        },
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

export default function DashboardPage() {
    const [sites, setSites] = useState<Site[]>([]);

    // Add modal state
    const [open, setOpen] = useState(false);
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState("1");
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    // Edit modal state
    const [editOpen, setEditOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);
    const [editName, setEditName] = useState("");
    const [editUrl, setEditUrl] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const upCount = sites.filter((s) => s.status === "up").length;
    const downCount = sites.filter((s) => s.status === "down").length;
    const degradedCount = sites.filter((s) => s.status === "degraded").length;

    useEffect(() => {
        const fetchSites = async () => {
            try {
                const res = await api.websites.getAll();
                const data = await res.json();
                if (res.ok) {
                    setSites(
                        data.websites.map((w: WebsiteFromApi) => {
                            const { uptime, responseMs, lastChecked } = computeStats(w.ticks);
                            return {
                                id: w.id,
                                name: w.name,
                                url: w.url,
                                status: tickStatusToStatus(w.ticks),
                                uptime,
                                responseMs,
                                lastChecked,
                            };
                        })
                    );
                }
            } catch {
                
            } finally {
                setFetching(false);
            }
        };

        fetchSites();
        const intervalId = window.setInterval(fetchSites, 30 * 1000);
        return () => window.clearInterval(intervalId);
    }, []);

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim() || !url.trim()) {
            toast.error("Name and URL are required");
            return;
        }
        setLoading(true);
        try {
            const res = await api.websites.create(url.trim(), name.trim());
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to add monitor.");
                return;
            }
            const newSite: Site = {
                id: data.id,
                name: name.trim(),
                url: url.trim(),
                status: "degraded",
                uptime: "—",
                responseMs: 0,
                lastChecked: "just now",
            };
            setSites((prev) => [newSite, ...prev]);
            setName("");
            setUrl("");
            setInterval("1");
            setOpen(false);
            toast.success(`Now monitoring ${newSite.name}`);
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    };

    const openEdit = (site: Site) => {
        setEditingSite(site);
        setEditName(site.name);
        setEditUrl(site.url);
        setEditOpen(true);
    };

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingSite) return;
        if (!editName.trim() || !editUrl.trim()) {
            toast.error("Name and URL are required");
            return;
        }
        setEditLoading(true);
        try {
            const res = await api.websites.update(editingSite.id, editUrl.trim(), editName.trim());
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to update monitor.");
                return;
            }
            setSites((prev) =>
                prev.map((s) =>
                    s.id === editingSite.id
                        ? { ...s, name: editName.trim(), url: editUrl.trim() }
                        : s
                )
            );
            setEditOpen(false);
            setEditingSite(null);
            toast.success("Monitor updated.");
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setEditLoading(false);
        }
    };

    const handleDelete = async (siteId: string) => {
        try {
            const res = await api.websites.delete(siteId);
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error ?? "Failed to delete monitor.");
                return;
            }
            setSites((prev) => prev.filter((s) => s.id !== siteId));
            toast.success("Monitor removed.");
        } catch {
            toast.error("Could not reach the server.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-primary/10 blur-[120px]" />
                <div className="absolute top-1/3 -right-32 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />
            </div>

            <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
                <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                        <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                            <Radio className="h-4 w-4" />
                        </span>
                        <span>Pingbase</span>
                    </Link>
                    {/* <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/dashboard" className="text-foreground">Monitors</Link>
                        <a className="hover:text-foreground" href="#">Incidents</a>
                        <a className="hover:text-foreground" href="#">Status pages</a>
                        <a className="hover:text-foreground" href="#">Settings</a>
                    </nav> */}
                    {/* <div className="flex items-center gap-3">
                        <span className="hidden sm:inline text-xs text-muted-foreground">acme@team</span>
                    </div> */}
                </div>
            </header>

            <main className="relative mx-auto max-w-7xl px-6 py-10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">Monitors</h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Real-time status of every endpoint you&apos;re tracking.
                        </p>
                    </div>

                    <Dialog open={open} onOpenChange={(v) => {
                        setOpen(v);
                        if (!v) { setName(""); setUrl(""); setInterval("1"); }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="bg-linear-to-r from-primary to-primary-glow shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" />
                                Add monitor
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card/90 backdrop-blur-2xl border-white/10">
                            <DialogHeader>
                                <DialogTitle>Add a new monitor</DialogTitle>
                                <DialogDescription>
                                    We&apos;ll start checking this endpoint immediately and alert you if it goes down.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Display name</Label>
                                    <Input
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Marketing site"
                                        className="bg-white/3 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="url">URL</Label>
                                    <Input
                                        id="url"
                                        type="url"
                                        value={url}
                                        onChange={(e) => setUrl(e.target.value)}
                                        placeholder="https://example.com"
                                        className="bg-white/3 border-white/10"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="interval">Check interval</Label>
                                    <Select value={interval} onValueChange={setInterval}>
                                        <SelectTrigger id="interval" className="bg-white/3 border-white/10">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Every 1 minute</SelectItem>
                                            <SelectItem value="3">Every 3 minutes</SelectItem>
                                            <SelectItem value="5">Every 5 minutes</SelectItem>
                                            <SelectItem value="10">Every 10 minutes</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <DialogFooter className="pt-2">
                                    <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="bg-linear-to-r from-primary to-primary-glow"
                                    >
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add monitor"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={editOpen} onOpenChange={(v) => {
                    setEditOpen(v);
                    if (!v) setEditingSite(null);
                }}>
                    <DialogContent className="bg-card/90 backdrop-blur-2xl border-white/10">
                        <DialogHeader>
                            <DialogTitle>Edit monitor</DialogTitle>
                            <DialogDescription>
                                Update the display name or URL for this monitor.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Display name</Label>
                                <Input
                                    id="edit-name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Marketing site"
                                    className="bg-white/3 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-url">URL</Label>
                                <Input
                                    id="edit-url"
                                    type="url"
                                    value={editUrl}
                                    onChange={(e) => setEditUrl(e.target.value)}
                                    placeholder="https://example.com"
                                    className="bg-white/3 border-white/10"
                                />
                            </div>
                            <DialogFooter className="pt-2">
                                <Button type="button" variant="ghost" onClick={() => setEditOpen(false)}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={editLoading}
                                    className="bg-linear-to-r from-primary to-primary-glow"
                                >
                                    {editLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <div className="grid gap-4 sm:grid-cols-3 mb-8">
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Operational</CardTitle>
                            <Activity className="h-4 w-4 text-emerald-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{upCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Degraded</CardTitle>
                            <TrendingUp className="h-4 w-4 text-amber-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{degradedCount}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card/60 backdrop-blur-xl border-white/10">
                        <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Down</CardTitle>
                            <AlertCircle className="h-4 w-4 text-red-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-semibold">{downCount}</div>
                        </CardContent>
                    </Card>
                </div>

                <Card className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="hover:bg-transparent border-white/10">
                                <TableHead>Monitor</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Uptime (30d)</TableHead>
                                <TableHead>Response</TableHead>
                                <TableHead>Last check</TableHead>
                                <TableHead className="w-10"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fetching ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : sites.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No monitors yet. Add one to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sites.map((site) => (
                                    <TableRow key={site.id} className="border-white/5 hover:bg-white/2">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{site.name}</span>
                                                <span className="text-xs text-muted-foreground">{site.url}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell><StatusBadge status={site.status} /></TableCell>
                                        <TableCell className="text-muted-foreground">{site.uptime}</TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {site.status === "down" ? "—" : `${site.responseMs} ms`}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{site.lastChecked}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        className="cursor-pointer"
                                                        onClick={() => openEdit(site)}
                                                    >
                                                        <SquarePen className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive cursor-pointer"
                                                        onClick={() => handleDelete(site.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </main>
        </div>
    );
}