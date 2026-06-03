import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { api } from "@/lib/api";
import type { Site } from "@/lib/types";

type Props = {
    site: Site | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onUpdated: (id: string, name: string, url: string) => void;
};

export function EditMonitorDialog({ site, open, onOpenChange, onUpdated }: Props) {
    const [name, setName] = useState(site?.name ?? "");
    const [url, setUrl] = useState(site?.url ?? "");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!site || !name.trim() || !url.trim()) return;

        setLoading(true);
        try {
            const res = await api.websites.update(site.id, url.trim(), name.trim());
            const data = await res.json();

            if (!res.ok) {
                toast.error(data.error ?? "Failed to update monitor.");
                return;
            }

            onUpdated(site.id, name.trim(), url.trim());
            onOpenChange(false);
            toast.success("Monitor updated.");
        } catch {
            toast.error("Could not reach the server.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-card/90 backdrop-blur-2xl border-white/10">
                <DialogHeader>
                    <DialogTitle>Edit monitor</DialogTitle>
                    <DialogDescription>Update the display name or URL.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="edit-name">Display name</Label>
                        <Input
                            id="edit-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-white/3 border-white/10"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="edit-url">URL</Label>
                        <Input
                            id="edit-url"
                            type="url"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="bg-white/3 border-white/10"
                        />
                    </div>
                    <DialogFooter className="pt-2">
                        <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading} className="bg-linear-to-r from-primary to-primary-glow">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}