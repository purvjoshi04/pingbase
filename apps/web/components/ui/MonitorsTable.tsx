import Link from "next/link";
import { MoreHorizontal, Loader2, Trash2, SquarePen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

import { StatusBadge } from "./StatusBadge";
import type { Site } from "@/lib/types";

type Props = {
    sites: Site[];
    fetching: boolean;
    onEdit: (site: Site) => void;
    onDelete: (siteId: string) => void;
};

export function MonitorsTable({ sites, fetching, onEdit, onDelete }: Props) {
    return (
        <Card className="bg-card/60 backdrop-blur-xl border-white/10 overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent border-white/10">
                        <TableHead>Monitor</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Uptime (30d)</TableHead>
                        <TableHead>Response</TableHead>
                        <TableHead>Last check</TableHead>
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {fetching ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10">
                                <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                            </TableCell>
                        </TableRow>
                    ) : sites.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                No monitors yet. Add one to get started.
                            </TableCell>
                        </TableRow>
                    ) : (
                        sites.map((site) => (
                            <TableRow key={site.id} className="border-white/5 hover:bg-white/2">
                                <TableCell>
                                    <Link href={`/website/${site.id}`} className="flex flex-col group">
                                        <span className="font-medium group-hover:text-primary transition-colors">
                                            {site.name}
                                        </span>
                                        <span className="text-xs text-muted-foreground">{site.url}</span>
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <StatusBadge status={site.status} />
                                </TableCell>
                                <TableCell className="text-muted-foreground">{site.uptime}</TableCell>
                                <TableCell className="text-muted-foreground">
                                    {site.status === "down" ? "—" : `${site.responseMs} ms`}
                                </TableCell>
                                <TableCell className="text-muted-foreground">{site.lastChecked}</TableCell>
                                <TableCell>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(site)}>
                                                <SquarePen className="h-4 w-4 mr-2" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive cursor-pointer"
                                                onClick={() => onDelete(site.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </Card>
    );
}