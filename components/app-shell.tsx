"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Building2,
  Clock3,
  Home,
  LogOut,
  MessageSquareText,
  Plus,
  Sparkles
} from "lucide-react";
import { Button } from "./ui";
import { useKuroko } from "@/features/core/kuroko-store";

const navItems = [
  { href: "/dashboard", label: "ダッシュボード", icon: Home },
  { href: "/stores", label: "店舗", icon: Building2 },
  { href: "/proposals", label: "AI提案", icon: MessageSquareText },
  { href: "/history", label: "投稿履歴", icon: Clock3 }
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, logout, isReady, generateProposals } = useKuroko();

  useEffect(() => {
    if (isReady && !session) {
      router.replace("/login");
    }
  }, [isReady, router, session]);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-white/86 px-4 py-5 backdrop-blur lg:block">
        <Link href="/dashboard" className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-md bg-ink text-white">
            <Bot className="size-5" />
          </span>
          <span>
            <span className="block text-lg font-black tracking-[0.16em]">KUROKO</span>
            <span className="text-xs font-semibold text-ink/52">AI marketing agent</span>
          </span>
        </Link>

        <nav className="mt-8 grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-semibold transition ${
                  active ? "bg-ink text-white" : "text-ink/70 hover:bg-paper hover:text-ink"
                }`}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-4 right-4 grid gap-2">
          <Button
            className="w-full"
            onClick={() => {
              generateProposals();
              router.push("/proposals");
            }}
          >
            <Sparkles className="size-4" />
            本日の提案を作成
          </Button>
          <Button className="w-full" variant="secondary" onClick={() => router.push("/stores/new")}>
            <Plus className="size-4" />
            店舗を追加
          </Button>
          <button
            className="flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-semibold text-ink/55 hover:bg-paper hover:text-ink"
            onClick={() => {
              logout();
              router.replace("/login");
            }}
          >
            <LogOut className="size-4" />
            ログアウト
          </button>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-line bg-paper/88 px-4 py-3 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-3">
            <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
              <Bot className="size-5" />
              <span className="font-black tracking-[0.12em]">KUROKO</span>
            </Link>
            <div className="hidden text-sm font-semibold text-ink/60 lg:block">
              毎朝の提案確認から承認・投稿履歴まで
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="hidden sm:inline-flex"
                onClick={() => {
                  generateProposals();
                  router.push("/proposals");
                }}
              >
                <Sparkles className="size-4" />
                提案作成
              </Button>
              <span className="rounded-full border border-line bg-white px-3 py-2 text-xs font-bold text-ink/65">
                {session?.email || "loading"}
              </span>
            </div>
          </div>
          <nav className="mt-3 grid grid-cols-4 gap-1 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`grid min-h-12 place-items-center rounded-md text-[11px] font-bold ${
                    active ? "bg-ink text-white" : "bg-white/70 text-ink/62"
                  }`}
                >
                  <Icon className="mb-1 size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
