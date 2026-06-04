"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname } from "next/navigation";
import { Radio } from "lucide-react";

export function PageLoader() {
    const pathname = usePathname();
    const [loading, setLoading] = useState(false);
    const [, startTransition] = useTransition();

    useEffect(() => {
        startTransition(() => setLoading(true));
        const t = setTimeout(() => startTransition(() => setLoading(false)), 1000);
        return () => clearTimeout(t);
    }, [pathname]);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                    <span className="absolute inset-0 rounded-xl animate-ping bg-primary/40" />
                    <Radio className="h-6 w-6" />
                </div>
                <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
            </div>
        </div>
    );
}