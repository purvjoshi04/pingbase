"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Radio } from "lucide-react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { mapApiWebsiteToSite } from "@/lib/helpers";
import type { Site, WebsiteFromApi } from "@/lib/types";

import { AddMonitorDialog } from "@/components/ui/AddMonitorDialog";
import { EditMonitorDialog } from "@/components/ui/EditMonitorDialog";
import { MonitorsTable } from "@/components/ui/MonitorsTable";
import { SummaryCards } from "@/components/ui/SummaryCards";

export default function DashboardPage() {
    const [sites, setSites] = useState<Site[]>([]);
    const [fetching, setFetching] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [editingSite, setEditingSite] = useState<Site | null>(null);

    const upCount = sites.filter((s) => s.status === "up").length;
    const downCount = sites.filter((s) => s.status === "down").length;
    const degradedCount = sites.filter((s) => s.status === "degraded").length;

    useEffect(() => {
        async function fetchSites() {
            try {
                const res = await api.websites.getAll();
                const data = await res.json();
                if (res.ok) setSites(data.websites.map((w: WebsiteFromApi) => mapApiWebsiteToSite(w)));
            } catch {

            } finally {
                setFetching(false);
            }
        }

        fetchSites();
        const id = window.setInterval(fetchSites, 30_000);
        return () => window.clearInterval(id);
    }, []);

    function handleAdded(site: Site) {
        setSites((prev) => [site, ...prev]);
    }

    function handleUpdated(id: string, name: string, url: string) {
        setSites((prev) => prev.map((s) => (s.id === id ? { ...s, name, url } : s)));
    }

    async function handleDelete(siteId: string) {
        try {
            const res = await api.websites.delete(siteId);
            if (!res.ok) {
                const data = await res.json();
                toast.error(data.error ?? "Failed to delete.");
                return;
            }
            setSites((prev) => prev.filter((s) => s.id !== siteId));
            toast.success("Monitor removed.");
        } catch {
            toast.error("Could not reach the server.");
        }
    }

    function openEdit(site: Site) {
        setEditingSite(site);
        setEditOpen(true);
    }

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
                    {/* <span className="hidden sm:inline text-xs text-muted-foreground">acme@team</span> */}
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
                    <AddMonitorDialog open={addOpen} onOpenChange={setAddOpen} onAdded={handleAdded} />
                </div>

                <EditMonitorDialog
                    key={editingSite?.id}
                    site={editingSite}
                    open={editOpen}
                    onOpenChange={setEditOpen}
                    onUpdated={handleUpdated}
                />

                <SummaryCards upCount={upCount} downCount={downCount} degradedCount={degradedCount} />

                <MonitorsTable
                    sites={sites}
                    fetching={fetching}
                    onEdit={openEdit}
                    onDelete={handleDelete}
                />
            </main>
        </div>
    );
}