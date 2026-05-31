"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Radio, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/lib/api";

type Mode = "signin" | "signup";

interface AuthFormProps {
    mode: Mode;
}

export function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const isSignup = mode === "signup";
    const title = isSignup ? "Create your account" : "Welcome back";
    const subtitle = isSignup
        ? "Start monitoring your endpoints in under a minute."
        : "Sign in to your Pingbase dashboard.";
    const cta = isSignup ? "Create account" : "Sign in";

    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (username.trim().length < 3) {
            toast.error("Username must be at least 3 characters.");
            return;
        }
        if (password.length < 8) {
            toast.error("Password must be at least 8 characters.");
            return;
        }
        if (isSignup && password !== confirm) {
            toast.error("Passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const res = isSignup
                ? await api.user.signup(username.trim(), password)
                : await api.user.signin(username.trim(), password);

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error ?? "Something went wrong. Please try again.");
                return;
            }
            localStorage.setItem("token", data.token);

            toast.success(isSignup ? "Account created — welcome to Pingbase!" : "Signed in successfully.");
            router.push("/dashboard");
        } catch {
            toast.error("Could not reach the server. Check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-125 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-32 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <Link href="/" className="absolute top-8 left-8 flex items-center gap-2.5 group">
                <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform group-hover:scale-105">
                    <Radio className="h-4 w-4" />
                </span>
                <span className="text-foreground font-bold tracking-tight text-lg">Pingbase</span>
            </Link>
            <div className="w-full max-w-105 relative">
                <div className="absolute -inset-0.5 bg-linear-to-b from-primary/20 to-transparent rounded-[24px] blur-sm opacity-60 pointer-events-none" />
                <Card className="relative bg-card/70 backdrop-blur-3xl border-white/10 rounded-[22px] p-8 shadow-2xl gap-0">
                    <CardHeader className="text-center p-0 mb-10 space-y-2">
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">{title}</CardTitle>
                        <CardDescription className="text-sm">{subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <form onSubmit={onSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-[13px] font-medium text-foreground/80 ml-1">
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="yourhandle"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    className="h-12 bg-white/3 border-white/10 rounded-xl px-4 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-[13px] font-medium text-foreground/80 ml-1">
                                    Password
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete={isSignup ? "new-password" : "current-password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-12 bg-white/3 border-white/10 rounded-xl px-4 pr-11 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {isSignup && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirm" className="text-[13px] font-medium text-foreground/80 ml-1">
                                        Confirm password
                                    </Label>
                                    <Input
                                        id="confirm"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                        className="h-12 bg-white/3 border-white/10 rounded-xl px-4 text-foreground placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary/40 transition-all"
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 mt-2 rounded-xl bg-linear-to-r from-primary to-primary-glow text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:opacity-95 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : cta}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="p-0 mt-8 pt-6 border-t border-white/5 justify-center text-sm text-muted-foreground">
                        {isSignup ? (
                            <span>
                                Already have an account?{" "}
                                <Link href="/signin" className="text-primary hover:text-primary-glow font-medium transition-colors ml-1">
                                    Sign in
                                </Link>
                            </span>
                        ) : (
                            <span>
                                New to Pingbase?{" "}
                                <Link href="/signup" className="text-primary hover:text-primary-glow font-medium transition-colors ml-1">
                                    Create an account
                                </Link>
                            </span>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}