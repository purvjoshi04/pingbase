"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, Zap } from "lucide-react";
import { toast } from "sonner";

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
        <div className="min-h-screen bg-[#0a0f0d] flex flex-col">
            <header className="px-6 h-16 flex items-center">
                <Link href="/" className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
                        <Zap className="h-4 w-4 text-black" fill="black" />
                    </span>
                    <span className="text-white font-semibold text-base">Pingbase</span>
                </Link>
            </header>
            <main className="flex-1 flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-[#111915] border border-white/10 rounded-2xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-white text-2xl font-bold mb-1">
                            {isSignup ? "Create your account" : "Welcome back"}
                        </h1>
                        <p className="text-gray-400 text-sm">
                            {isSignup
                                ? "Start monitoring your endpoints in under a minute."
                                : "Sign in to your Pingbase dashboard"}
                        </p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium" htmlFor="username">
                                Username
                            </label>
                            <input
                                id="username"
                                type="text"
                                autoComplete="username"
                                placeholder="yourhandle"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                className="w-full bg-[#0d1510] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-white text-sm font-medium" htmlFor="password">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete={isSignup ? "new-password" : "current-password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-[#0d1510] border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((s) => !s)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        {isSignup && (
                            <div className="space-y-2">
                                <label className="text-white text-sm font-medium" htmlFor="confirm">
                                    Confirm password
                                </label>
                                <input
                                    id="confirm"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    className="w-full bg-[#0d1510] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition"
                                />
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-emerald-400 hover:bg-emerald-300 disabled:opacity-60 text-black font-semibold rounded-xl py-3 text-sm transition flex items-center justify-center mt-2"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isSignup ? (
                                "Create account"
                            ) : (
                                "Sign in"
                            )}
                        </button>
                    </form>
                    <p className="text-center text-sm text-gray-500 mt-6">
                        {isSignup ? (
                            <>
                                Already have an account?{" "}
                                <Link href="/signin" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                                    Sign in
                                </Link>
                            </>
                        ) : (
                            <>
                                New to Pingbase?{" "}
                                <Link href="/signup" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
                                    Create an account
                                </Link>
                            </>
                        )}
                    </p>
                </div>
            </main>
        </div>
    );
}