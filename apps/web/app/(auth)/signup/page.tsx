import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create your account — Pingbase",
    description: "Start monitoring uptime, latency, and incidents in minutes. Create your free Pingbase account.",
    openGraph: {
        title: "Create your account — Pingbase",
        description: "Start monitoring uptime, latency, and incidents in minutes.",
    },
};

export default function SignUpPage() {
    return <AuthForm mode="signup" />;
}