type Tick = {
    status: "Up" | "Down" | "Unknown";
    response_time_ms: number;
    createdAt: string;
};

export function computeStats(ticks: Tick[]) {
    if (!ticks.length) return { uptime: "—", responseMs: 0, lastChecked: "—" };

    const upTicks = ticks.filter((t) => t.status === "Up").length;
    const uptime = ((upTicks / ticks.length) * 100).toFixed(2) + "%";

    const avgResponse = Math.round(
        ticks.reduce((sum, t) => sum + t.response_time_ms, 0) / ticks.length
    );

    const lastChecked = formatRelative(new Date(ticks[0].createdAt));

    return { uptime, responseMs: avgResponse, lastChecked };
}

function formatRelative(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
}