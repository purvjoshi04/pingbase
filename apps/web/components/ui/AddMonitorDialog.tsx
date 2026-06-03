import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { api } from "@/lib/api";
import type { Site } from "@/lib/types";

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onAdded: (site: Site) => void;
};

export function AddMonitorDialog({ open, onOpenChange, onAdded }: Props) {
    const [name, setName] = useState("");
    const [url, setUrl] = useState("");
    const [interval, setInterval] = useState("1");
    const [loading, setLoading] = useState(false);

    function handleClose(next: boolean) {
        onOpenChange(next);
        if (!next) {
            setName("");
            setUrl("");
            setInterval("1");
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!name.trim() || !url.trim()) {
            toast.error("Name and URL are required");
            return;
        }

        setLoading(true);
        try {
            const res = await api.websites.create(url.trim(), name.trim());
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error ?? "Failed to add monitor.");
                return;
            }

            onAdded({
                id: data.id,
                name: name.trim(),
                url: url.trim(),
                status: "degraded",
                uptime: "—",
                responseMs: 0,
                lastChecked: "just now",
            });

            toast.success(`Now monitoring ${name.trim()}`);
            handleClose(false);
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogTrigger asChild>
                <Button className="bg-linear-to-r from-primary to-primary-glow shadow-lg shadow-primary/20">
                    <Plus className="h-4 w-4" /> Add monitor
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/90 backdrop-blur-2xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Add a new monitor</DialogTitle>
                    <DialogDescription>We&apos;ll start checking this endpoint immediately.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Display name</Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Marketing site"
                            className="bg-white/3 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="url">URL</Label>
                        <Input
                            id="url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            placeholder="https://example.com"
                            className="bg-white/3 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="interval">Check interval</Label>
                        <Select value={interval} onValueChange={setInterval}>
                            <SelectTrigger id="interval" className="bg-white/3 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Every 1 minute</SelectItem>
                                <SelectItem value="3">Every 3 minutes</SelectItem>
                                <SelectItem value="5">Every 5 minutes</SelectItem>
                                <SelectItem value="10">Every 10 minutes</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={() => handleClose(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-linear-to-r from-primary to-primary-glow">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add monitor"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}