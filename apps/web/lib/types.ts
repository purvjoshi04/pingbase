export type Status = "up" | "down" | "degraded";

export type Site = {
    id: string;
    name: string;
    url: string;
    status: Status;
    uptime: string;
    responseMs: number;
    lastChecked: string;
};

export type Tick = {
    status: "Up" | "Down" | "Unknown";
    response_time_ms: number;
    createdAt: string;
};

export type WebsiteFromApi = {
    id: string;
    url: string;
    name: string;
    ticks: Tick[];
};

export type TickStatus = "Up" | "Down" | "Unknown";