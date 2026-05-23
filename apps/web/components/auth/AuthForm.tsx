"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";                          // ← next/link
import { Radio, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card, CardContent, CardDescription,
    CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card";

type Mode = "signin" | "signup";
interface AuthFormProps {
    mode: Mode;
}
export function AuthForm({ mode }: AuthFormProps) {
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
    const onSubmit = async (e: FormEvent) => {
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
        await new Promise((r) => setTimeout(r, 700));
        setLoading(false);
        toast.success(isSignup ? "Account created — welcome to Pingbase!" : "Signed in successfully.");
    };
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <div className="absolute inset-0 -z-10 bg-(image:--gradient-hero) opacity-60" />
            <header className="px-6 h-16 flex items-center">
                <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
                    <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-(image:--gradient-primary) text-primary-foreground">
                        <Radio className="h-4 w-4" />
                    </span>
                    <span className="text-foreground">Pingbase</span>
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center px-6 py-12">
                <Card className="w-full max-w-md border-border/60 bg-card/60 backdrop-blur-xl shadow-(--shadow-card)">
                    <CardHeader className="space-y-2 text-center">
                        <CardTitle className="text-2xl">{title}</CardTitle>
                        <CardDescription>{subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={onSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input
                                    id="username"
                                    type="text"
                                    autoComplete="username"
                                    placeholder="yourhandle"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete={isSignup ? "new-password" : "current-password"}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((s) => !s)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {isSignup && (
                                <div className="space-y-2">
                                    <Label htmlFor="confirm">Confirm password</Label>
                                    <Input
                                        id="confirm"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="••••••••"
                                        value={confirm}
                                        onChange={(e) => setConfirm(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-lg bg-(image:--gradient-primary) text-primary-foreground hover:opacity-90 transition"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : cta}
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center text-sm text-muted-foreground">
                        {isSignup ? (
                            <span>
                                Already have an account?{" "}
                                <Link href="/signin" className="text-foreground hover:text-primary transition font-medium">
                                    Sign in
                                </Link>
                            </span>
                        ) : (
                            <span>
                                New to Pingbase?{" "}
                                <Link href="/signup" className="text-foreground hover:text-primary transition font-medium">
                                    Create an account
                                </Link>
                            </span>
                        )}
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
}