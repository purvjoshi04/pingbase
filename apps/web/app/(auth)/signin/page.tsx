import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign in — Pingbase",
    description: "Sign in to your Pingbase account to manage uptime monitors, status pages, and incident alerts.",
    openGraph: {
        title: "Sign in — Pingbase",
        description: "Access your Pingbase monitoring dashboard.",
    },
};

export default function SignInPage() {
    return <AuthForm mode="signin" />;
}