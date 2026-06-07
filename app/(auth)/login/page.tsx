"use client";

import type { FormEvent } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Bot, LogIn } from "lucide-react";
import { Button, Field, Input } from "@/components/ui";
import { useKuroko } from "@/features/core/kuroko-store";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useKuroko();
  const [email, setEmail] = useState("owner@kuroko-ai.local");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    login(email);
    router.replace("/dashboard");
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-lg border border-line bg-white/88 p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-md bg-ink text-white">
            <Bot className="size-6" />
          </span>
          <div>
            <h1 className="text-2xl font-black tracking-[0.12em] text-ink">KUROKO AI</h1>
            <p className="text-sm font-semibold text-ink/55">店舗マーケティング運用管理</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-8 grid gap-5">
          <Field label="メールアドレス">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Button type="submit" className="w-full">
            <LogIn className="size-4" />
            ログイン
          </Button>
        </form>

        <p className="mt-5 text-xs leading-5 text-ink/52">
          MVPではデモログインです。Supabase Authへ接続すると、同じ画面から本番認証に切り替えられます。
        </p>
      </div>
    </main>
  );
}
