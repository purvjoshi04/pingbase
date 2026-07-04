"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

import { api } from "@/lib/api";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CurrentUser = {
    id: string;
    username: string;
};

export function UserMenu() {
    const [user, setUser] = useState<CurrentUser | null>(null);
    const router = useRouter();

    useEffect(() => {
        async function fetchMe() {
            try {
                const res = await api.user.me();
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.user);
                }
            } catch {}
        }
        fetchMe();
    }, []);

    function handleLogout() {
        api.user.logout();
        router.push("/");
    }

    if (!user) return null;

    const initials = user.username.slice(0, 2).toUpperCase();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary hover:bg-primary/30 transition-colors">
                    {initials}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card/95 backdrop-blur-xl border-white/10">
                <DropdownMenuLabel className="text-sm text-muted-foreground">
                    Signed in as <span className="text-foreground font-medium">{user.username}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User className="h-4 w-4" /> Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 cursor-pointer text-red-400 focus:text-red-400"
                >
                    <LogOut className="h-4 w-4" /> Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}