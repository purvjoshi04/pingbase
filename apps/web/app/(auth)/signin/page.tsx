import { AuthForm } from "@/components/auth/AuthForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign in — Pingbase",
    description: "Sign in to your Pingbase account.",
};

export default function SignInPage() {
    return <AuthForm mode="signin" />;
}