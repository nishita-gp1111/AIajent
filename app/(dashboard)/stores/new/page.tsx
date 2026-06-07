"use client";

import { Panel } from "@/components/ui";
import { StoreForm } from "@/components/store-form";
import { useKuroko } from "@/features/core/kuroko-store";

export default function NewStorePage() {
  const { createStore } = useKuroko();

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold text-brass">New store</p>
        <h1 className="mt-1 text-3xl font-black text-ink">店舗登録</h1>
      </div>
      <Panel title="店舗情報">
        <StoreForm onSubmit={createStore} />
      </Panel>
    </div>
  );
}
