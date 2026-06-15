"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, CircleAlert, KeyRound, MapPin, RotateCcw, ShieldCheck } from "lucide-react";
import { Button, Panel } from "@/components/ui";
import { useKuroko } from "@/features/core/kuroko-store";

type Status = {
  mode: "demo" | "configured";
  credentials: {
    supabase: boolean;
    gemini: boolean;
    googleBusinessProfile: boolean;
  };
};

export default function SettingsPage() {
  const { resetDemo } = useKuroko();
  const [status, setStatus] = useState<Status>();

  useEffect(() => {
    fetch("/api/system/status")
      .then((response) => response.json())
      .then((data: Status) => setStatus(data));
  }, []);

  const rows = [
    ["Supabase 認証・DB", status?.credentials.supabase],
    ["Gemini API", status?.credentials.gemini],
    ["Google Business Profile", status?.credentials.googleBusinessProfile]
  ] as const;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-sm font-bold text-brass">System settings</p>
        <h1 className="mt-1 text-3xl font-black text-ink">設定・連携状況</h1>
      </div>

      <Panel title="現在の利用モード">
        <div className="flex items-start gap-3 rounded-lg bg-paper p-4">
          {status?.mode === "configured" ? (
            <CheckCircle2 className="mt-0.5 size-5 text-moss" />
          ) : (
            <CircleAlert className="mt-0.5 size-5 text-brass" />
          )}
          <div>
            <p className="font-bold">{status?.mode === "configured" ? "外部サービスの認証情報あり" : "デモモード"}</p>
            <p className="mt-1 text-sm leading-6 text-ink/60">
              現在のアプリはデモ保存を使用します。認証情報を設定した後も、各APIの接続実装と動作確認を完了してから本番運用してください。
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="外部連携">
        <div className="grid gap-2">
          {rows.map(([label, connected]) => (
            <div key={label} className="flex items-center justify-between rounded-md border border-line bg-white px-4 py-3">
              <span className="text-sm font-bold">{label}</span>
              <span className={`text-xs font-bold ${connected ? "text-moss" : "text-brass"}`}>
                {connected ? "認証情報あり" : "未設定"}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel
        title="GBP連携に必要な準備"
        description="Googleアカウントで認証した後、管理可能な店舗を牛くんずAI側で取得して紐づけます。"
      >
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-line bg-paper p-4">
            <KeyRound className="size-5 text-brass" />
            <h3 className="mt-3 text-sm font-bold">Google Cloud設定</h3>
            <p className="mt-1 text-xs leading-5 text-ink/60">
              GBP API利用承認、関連APIの有効化、OAuthクライアントIDとリダイレクトURIが必要です。
            </p>
          </div>
          <div className="rounded-md border border-line bg-paper p-4">
            <ShieldCheck className="size-5 text-moss" />
            <h3 className="mt-3 text-sm font-bold">管理権限のあるアカウント</h3>
            <p className="mt-1 text-xs leading-5 text-ink/60">
              対象店舗のオーナーまたは管理者権限を持つGoogleアカウントでOAuth認証します。
            </p>
          </div>
          <div className="rounded-md border border-line bg-paper p-4">
            <MapPin className="size-5 text-sky" />
            <h3 className="mt-3 text-sm font-bold">店舗ロケーション選択</h3>
            <p className="mt-1 text-xs leading-5 text-ink/60">
              認証後にaccountとlocationをAPI取得します。口コミ返信には確認済みロケーションが必要です。
            </p>
          </div>
        </div>
      </Panel>

      <Panel title="デモデータ">
        <Button variant="secondary" onClick={resetDemo}>
          <RotateCcw className="size-4" /> 初期状態に戻す
        </Button>
      </Panel>
    </div>
  );
}
