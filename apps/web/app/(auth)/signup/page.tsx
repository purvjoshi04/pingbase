import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create your account — Pingbase",
    description: "Start monitoring uptime in minutes.",
};

export default function SignUpPage() {
    return <AuthForm mode="signup" />;
}