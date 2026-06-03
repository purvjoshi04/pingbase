import { Badge } from "@/components/ui/badge";
import type { Status } from "@/lib/types";

const STATUS_MAP: Record<Status, { label: string; dot: string; cls: string }> = {
    up:       { label: "Up",       dot: "bg-emerald-400", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
    down:     { label: "Down",     dot: "bg-red-400",     cls: "bg-red-500/10 text-red-400 border-red-500/20" },
    degraded: { label: "Degraded", dot: "bg-amber-400",   cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

export function StatusBadge({ status }: { status: Status }) {
    const { label, dot, cls } = STATUS_MAP[status];
    return (
        <Badge variant="outline" className={`gap-1.5 font-medium ${cls}`}>
            <span className="relative flex h-2 w-2">
                {status === "up" && (
                    <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dot} opacity-60`} />
                )}
                <span className={`relative inline-flex h-2 w-2 rounded-full ${dot}`} />
            </span>
            {label}
        </Badge>
    );
}