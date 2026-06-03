import { Activity, TrendingUp, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
    upCount: number;
    downCount: number;
    degradedCount: number;
};

export function SummaryCards({ upCount, downCount, degradedCount }: Props) {
    return (
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
    );
}