import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Dashboard — Pingbase",
    description: "Monitor all your tracked websites in one place.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}