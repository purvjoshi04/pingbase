import { computeStats } from "@/lib/uptime";
import type { Site, Status, Tick, TickStatus, WebsiteFromApi } from "./types";

export function tickStatusToStatus(ticks: Tick[]): Status {
    const latest = ticks[0];
    if (!latest || latest.status === "Unknown") return "degraded";
    return latest.status === "Up" ? "up" : "down";
}

export function mapApiWebsiteToSite(w: WebsiteFromApi): Site {
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
}

export function tickToStatus(s: TickStatus): Status {
    if (s === "Up") return "up";
    if (s === "Down") return "down";
    return "degraded";
}

export function getLastChecked(createdAt: string, now: number): string {
    const seconds = Math.floor((now - new Date(createdAt).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
}

