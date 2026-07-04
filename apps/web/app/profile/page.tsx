"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { api } from "@/lib/api";

export default function ProfilePage() {
    const [username, setUsername] = useState("");
    const [loadingProfile, setLoadingProfile] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [loadingPassword, setLoadingPassword] = useState(false);

    useEffect(() => {
        async function fetchMe() {
            try {
                const res = await api.user.me();
                const data = await res.json();
                if (res.ok) setUsername(data.user.username);
            } catch {
                toast.error("Could not load profile.");
            } finally {
                setFetching(false);
            }
        }
        fetchMe();
    }, []);

    async function handleUpdateProfile(e: React.FormEvent) {
        e.preventDefault();
        if (!username.trim()) {
            toast.error("Username is required");
            return;
        }
        setLoadingProfile(true);
        try {
            const res = await api.user.updateProfile(username.trim());
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to update profile.");
                return;
            }
            toast.success("Profile updated.");
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setLoadingProfile(false);
        }
    }

    async function handleChangePassword(e: React.FormEvent) {
        e.preventDefault();
        if (!currentPassword || !newPassword) {
            toast.error("Both fields are required");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        setLoadingPassword(true);
        try {
            const res = await api.user.changePassword(currentPassword, newPassword);
            const data = await res.json();
            if (!res.ok) {
                toast.error(data.error ?? "Failed to change password.");
                return;
            }
            toast.success("Password changed.");
            setCurrentPassword("");
            setNewPassword("");
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setLoadingPassword(false);
        }
    }

    if (fetching) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
                <div>
                    <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2 text-muted-foreground hover:text-foreground">
                        <Link href="/dashboard">
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back to monitors
                        </Link>
                    </Button>
                    <h1 className="text-3xl font-semibold tracking-tight">Profile</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your account details.
                    </p>
                </div>
                <div className="space-y-8 rounded-lg border border-white/10 bg-card/50 p-6">
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <h2 className="text-lg font-medium">Username</h2>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="username">Username</Label>
                            <Input
                                id="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="bg-white/3 border-white/10"
                            />
                        </div>
                        <Button type="submit" disabled={loadingProfile}>
                            {loadingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                        </Button>
                    </form>
                    <Separator className="bg-white/10" />
                    <form onSubmit={handleChangePassword} className="space-y-4">
                        <h2 className="text-lg font-medium">Change password</h2>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="currentPassword">Current password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="bg-white/3 border-white/10"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="newPassword">New password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="bg-white/3 border-white/10"
                            />
                        </div>
                        <Button type="submit" disabled={loadingPassword}>
                            {loadingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : "Change password"}
                        </Button>
                    </form>
                </div>
            </main>
        </div>
    );
}