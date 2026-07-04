"use client";

import { useEffect, useState } from "react";
import {
  Activity, Bell, Globe2, ShieldCheck, Zap, BarChart3,
  ArrowRight, Check, Server, Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

import { api } from "@/lib/api";
import { UserMenu } from "@/components/ui/UserMenu";

function Nav() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("token");
  });

  useEffect(() => {
    if (!isLoggedIn) return;

    async function verify() {
      try {
        const res = await api.user.me();
        if (!res.ok) {
          localStorage.removeItem("token");
          setIsLoggedIn(false);
        }
      } catch {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }
    }
    verify();
  }, [isLoggedIn]);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/70 border-b border-border/50">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="relative flex h-7 w-7 items-center justify-center rounded-md bg-(image:--gradient-primary) text-primary-foreground">
            <Radio className="h-4 w-4" />
            <span className="absolute inset-0 rounded-md animate-ping bg-primary/30" />
          </span>
          <span className="text-foreground">Pingbase</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="#features" className="hover:text-foreground transition">Features</Link>
          <Link href="#status" className="hover:text-foreground transition">Status pages</Link>
        </nav>

        {isLoggedIn ? (
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <UserMenu />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/signin">Sign in</Link>
            </Button>
            <Button size="sm" className="rounded-lg bg-(image:--gradient-primary) text-primary-foreground hover:opacity-90 transition" asChild>
              <Link href="/signup">
                Start free <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ background: "var(--gradient-hero)" }}>
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none" style={{
        backgroundImage: "linear-gradient(var(--foreground) 1px, transparent 1px), linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
        backgroundSize: "44px 44px",
      }} />
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-32 text-center">
        <Badge variant="secondary" className="inline-flex items-center gap-2 px-3 py-1 text-xs backdrop-blur border-border/60">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          All systems operational · 99.998% this month
        </Badge>
        <h1 className="mt-6 text-5xl md:text-7xl font-semibold tracking-tight text-foreground leading-[1.05]">
          Uptime monitoring,<br />
          <span className="bg-(image:--gradient-primary) bg-clip-text text-transparent">built for builders.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Monitor every endpoint, ship gorgeous status pages, and resolve incidents before your users hit refresh.
        </p>
        <div className="mt-9 flex items-center justify-center gap-3">
          <Button className="rounded-lg bg-(image:--gradient-primary) px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition h-auto" style={{ boxShadow: "var(--shadow-glow)" }} asChild>
            <Link href="/signup">
              Start monitoring free <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" className="rounded-lg px-5 py-3 text-sm font-medium h-auto" asChild>
            <Link href="/">View live demo</Link>
          </Button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">No credit card · 30-second setup · 10 monitors free forever</p>
        <DashboardPreview />
      </div>
    </section>
  );
}

function DashboardPreview() {
  const checks = [
    { name: "api.pingbase.io", region: "Global · 14 regions", ms: 42, status: "up" },
    { name: "checkout.acme.com", region: "us-east · eu-west", ms: 118, status: "up" },
    { name: "auth.pingbase.io", region: "Global", ms: 67, status: "up" },
    { name: "billing-worker", region: "Cron · every 1m", ms: 230, status: "degraded" },
    { name: "cdn.assets.io", region: "Edge · 32 regions", ms: 18, status: "up" },
  ] as const;

  return (
    <div className="relative mx-auto mt-16 max-w-5xl">
      <div className="absolute -inset-4 bg-(image:--gradient-primary) opacity-20 blur-3xl rounded-3xl" />
      <Card className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden text-left" style={{ boxShadow: "var(--shadow-card)" }}>
        <CardHeader className="flex-row items-center gap-2 px-4 py-3 border-b border-border bg-background/40 space-y-0">
          <span className="h-3 w-3 rounded-full bg-destructive/70" />
          <span className="h-3 w-3 rounded-full bg-chart-4/70" />
          <span className="h-3 w-3 rounded-full bg-primary/70" />
          <span className="ml-3 text-xs text-muted-foreground font-mono">pingbase.io/dashboard</span>
        </CardHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border">
          {[
            { label: "Uptime · 30d", value: "99.998%", sub: "+0.04% vs last" },
            { label: "Avg response", value: "84ms", sub: "Global p95" },
            { label: "Incidents", value: "0", sub: "Last 7 days" },
          ].map((s) => (
            <CardContent key={s.label} className="bg-card px-5 py-4">
              <CardDescription className="text-xs">{s.label}</CardDescription>
              <div className="mt-1 text-2xl font-semibold text-foreground">{s.value}</div>
              <div className="text-xs text-primary">{s.sub}</div>
            </CardContent>
          ))}
        </div>
        <div className="divide-y divide-border">
          {checks.map((c) => (
            <div key={c.name} className="grid grid-cols-12 items-center gap-4 px-5 py-4 hover:bg-accent/30 transition">
              <div className="col-span-4 flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${c.status === "up" ? "bg-primary shadow-[0_0_10px_var(--primary)]" : "bg-chart-4"}`} />
                <div>
                  <div className="text-sm font-medium text-foreground font-mono">{c.name}</div>
                  <div className="text-xs text-muted-foreground">{c.region}</div>
                </div>
              </div>
              <div className="col-span-6 flex items-end gap-0.5 h-8">
                {Array.from({ length: 60 }).map((_, i) => {
                  const h = 20 + ((i * 37 + c.ms) % 80);
                  const bad = c.status === "degraded" && i > 48 && i < 55;
                  return (
                    <span
                      key={i}
                      className={`flex-1 rounded-sm ${bad ? "bg-chart-4" : "bg-primary/70"}`}
                      style={{ height: `${h}%` }}
                    />
                  );
                })}
              </div>
              <div className="col-span-2 text-right text-sm font-mono text-muted-foreground">{c.ms}ms</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Logos() {
  const logos = ["Acme", "Linearly", "Northwind", "Vercell", "Replicat", "Hyperion"];
  return (
    <section className="border-y border-border/60 bg-background/60">
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-wrap items-center justify-between gap-x-12 gap-y-4">
        <span className="text-xs uppercase tracking-widest text-muted-foreground">Trusted by teams shipping at</span>
        {logos.map((l) => (
          <span key={l} className="text-lg font-semibold text-muted-foreground/70 tracking-tight">{l}</span>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: Activity, title: "Uptime monitoring", body: "HTTP, TCP, ping, DNS, SSL and keyword checks from 14 global regions every 30 seconds." },
    { icon: Bell, title: "Instant alerts", body: "Slack, Discord, PagerDuty, SMS, voice calls. On-call schedules and escalations included." },
    { icon: Globe2, title: "Status pages", body: "Beautiful, brandable status pages on your own domain. Subscribers get notified automatically." },
    { icon: BarChart3, title: "Heartbeats & cron", body: "Know within seconds when a job misses its window. Per-minute granularity, generous timeouts." },
    { icon: ShieldCheck, title: "SSL & domain expiry", body: "Never get caught off guard. Get warned 30, 14, 7 and 1 day before certificates expire." },
    { icon: Zap, title: "Log management", body: "Stream logs at the speed of grep. Structured search, retention up to 3 years, SQL queries." },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-6 py-28">
      <div className="max-w-2xl">
        <p className="text-sm font-medium text-primary">Everything in one place</p>
        <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-foreground">The observability stack you&apos;d build for yourself.</h2>
        <p className="mt-4 text-lg text-muted-foreground">Six products. One bill. One dashboard. Built by infra engineers who got tired of stitching SaaS together.</p>
      </div>
      <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-2xl overflow-hidden border border-border">
        {items.map((f) => (
          <Card key={f.title} className="group bg-card p-7 rounded-none border-0 hover:bg-accent/40 transition shadow-none">
            <CardContent className="p-0">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}

function StatusShowcase() {
  return (
    <section id="status" className="border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-6 py-28 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm font-medium text-primary">Status pages</p>
          <h2 className="mt-3 text-4xl md:text-5xl font-semibold tracking-tight text-foreground">Status pages your customers will actually bookmark.</h2>
          <p className="mt-4 text-lg text-muted-foreground">Custom domain, your logo, your fonts, your colors. Subscribers can opt in by email, SMS, or RSS. Incident updates post in seconds.</p>
          <ul className="mt-8 space-y-3">
            {["Custom domain + SSL in one click", "Embed components anywhere", "Localized in 23 languages", "Subscriber-only maintenance windows"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <Check className="h-3 w-3" />
                </span>
                <span className="text-sm">{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="relative">
          <div className="absolute -inset-6 bg-(image:--gradient-primary) opacity-10 blur-3xl rounded-3xl" />
          <Card className="relative rounded-2xl border border-border bg-card overflow-hidden" style={{ boxShadow: "var(--shadow-card)" }}>
            <CardHeader className="px-6 py-5 border-b border-border flex-row items-center justify-between space-y-0">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">status.acme.com</CardTitle>
              </div>
              <Badge variant="default" className="text-xs bg-transparent border-transparent text-primary">
                ● All systems normal
              </Badge>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {[
                { name: "API", up: 100 },
                { name: "Dashboard", up: 100 },
                { name: "Webhooks", up: 99.94 },
                { name: "Background jobs", up: 100 },
                { name: "Marketing site", up: 100 },
              ].map((s) => (
                <div key={s.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{s.name}</span>
                    <span className="text-muted-foreground font-mono">{s.up}%</span>
                  </div>
                  <div className="mt-2 flex gap-0.5">
                    {Array.from({ length: 60 }).map((_, i) => {
                      const bad = s.up < 100 && (i === 22 || i === 23);
                      return <span key={i} className={`h-7 flex-1 rounded-[2px] ${bad ? "bg-chart-4" : "bg-primary/80"}`} />;
                    })}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="mx-auto max-w-7xl px-6 pb-28">
      <Card className="relative overflow-hidden rounded-3xl border border-border p-12 md:p-20 text-center" style={{ background: "var(--gradient-hero)" }}>
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 h-48 w-160 bg-(image:--gradient-primary) opacity-30 blur-3xl rounded-full" />
        <CardTitle className="relative text-4xl md:text-5xl font-semibold tracking-tight text-foreground leading-tight">
          Sleep through the night. We&apos;ll wake you only when it matters.
        </CardTitle>
        <CardDescription className="relative mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Set up your first monitor in 30 seconds. Free forever for up to 10 endpoints.
        </CardDescription>
        <Button className="relative mt-8 inline-flex items-center gap-2 rounded-lg bg-(image:--gradient-primary) px-6 py-3 text-sm font-medium text-primary-foreground hover:opacity-90 transition h-auto" style={{ boxShadow: "var(--shadow-glow)" }} asChild>
          <Link href="/signup">
            Start monitoring free <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </Card>
    </section>
  );
}

function Footer() {
  const date = new Date();
  const year = date.getFullYear();
  return (
    <footer>
      <Separator />
      <div className="mx-auto max-w-7xl px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-(image:--gradient-primary) text-primary-foreground">
            <Radio className="h-3.5 w-3.5" />
          </span>
          <span className="text-foreground font-semibold">Pingbase</span>
          <span>· © {year}</span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-foreground transition">Privacy</a>
          <a href="#" className="hover:text-foreground transition">Terms</a>
          <a href="#" className="hover:text-foreground transition">Security</a>
          <a href="#" className="hover:text-foreground transition">Changelog</a>
        </div>
      </div>
    </footer>
  );
}

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground antialiased">
      <Nav />
      <Hero />
      <Logos />
      <Features />
      <StatusShowcase />
      <CTA />
      <Footer />
    </main>
  );
}