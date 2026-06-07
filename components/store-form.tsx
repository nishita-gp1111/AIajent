"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button, Field, Input, Select, Textarea } from "./ui";
import type { AutomationMode, Store, StoreInput } from "@/features/core/types";
import { splitTextarea, uniqueCompact } from "@/features/core/utils";

const defaultInput: StoreInput = {
  name: "",
  industry: "",
  address: "",
  phoneNumber: "",
  businessHours: "",
  regularHolidays: "",
  services: "",
  strengths: "",
  targetCustomers: "",
  keywords: [],
  competitors: [],
  postTone: "親しみやすく、誠実。過度な煽りは避ける",
  ngExpressions: [],
  automationMode: "approval",
  allowTemplateReviewAutoReply: false,
  allowLowRiskGbpAutoPost: false,
  postFrequencyPerMonth: 20,
  gbpLocationName: ""
};

function inputFromStore(store?: Store): StoreInput {
  if (!store) return defaultInput;
  return {
    name: store.name,
    industry: store.industry,
    address: store.address,
    phoneNumber: store.phoneNumber,
    businessHours: store.businessHours,
    regularHolidays: store.regularHolidays,
    services: store.services,
    strengths: store.strengths,
    targetCustomers: store.targetCustomers,
    keywords: store.keywords,
    competitors: store.competitors,
    postTone: store.postTone,
    ngExpressions: store.ngExpressions,
    automationMode: store.automationMode,
    allowTemplateReviewAutoReply: store.allowTemplateReviewAutoReply,
    allowLowRiskGbpAutoPost: store.allowLowRiskGbpAutoPost,
    postFrequencyPerMonth: store.postFrequencyPerMonth,
    gbpLocationName: store.gbpLocationName
  };
}

export function StoreForm({
  store,
  onSubmit
}: {
  store?: Store;
  onSubmit: (input: StoreInput) => void;
}) {
  const router = useRouter();
  const [input, setInput] = useState<StoreInput>(() => inputFromStore(store));
  const [keywordText, setKeywordText] = useState(() => input.keywords.join("\n"));
  const [competitorText, setCompetitorText] = useState(() => input.competitors.join("\n"));
  const [ngText, setNgText] = useState(() => input.ngExpressions.join("\n"));
  const [error, setError] = useState("");

  const keywordCount = useMemo(() => splitTextarea(keywordText).length, [keywordText]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const keywords = splitTextarea(keywordText).slice(0, 20);
    if (!input.name.trim()) {
      setError("店舗名を入力してください。");
      return;
    }
    if (!input.industry.trim()) {
      setError("業種を入力してください。");
      return;
    }
    if (keywordCount > 20) {
      setError("対策キーワードは最大20個までです。");
      return;
    }

    onSubmit({
      ...input,
      keywords,
      competitors: splitTextarea(competitorText),
      ngExpressions: uniqueCompact(splitTextarea(ngText)),
      postFrequencyPerMonth: Number(input.postFrequencyPerMonth) || 20
    });
    router.push("/stores");
  }

  return (
    <form onSubmit={submit} className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-coral/30 bg-coral/10 px-4 py-3 text-sm font-semibold text-[#934438]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="店舗名">
          <Input value={input.name} onChange={(event) => setInput({ ...input, name: event.target.value })} />
        </Field>
        <Field label="業種">
          <Input
            value={input.industry}
            placeholder="例: 高級飲食、美容、クリニック、士業"
            onChange={(event) => setInput({ ...input, industry: event.target.value })}
          />
        </Field>
        <Field label="住所">
          <Input
            value={input.address}
            onChange={(event) => setInput({ ...input, address: event.target.value })}
          />
        </Field>
        <Field label="電話番号">
          <Input
            value={input.phoneNumber}
            onChange={(event) => setInput({ ...input, phoneNumber: event.target.value })}
          />
        </Field>
        <Field label="営業時間">
          <Input
            value={input.businessHours}
            placeholder="例: 10:00-19:00"
            onChange={(event) => setInput({ ...input, businessHours: event.target.value })}
          />
        </Field>
        <Field label="定休日">
          <Input
            value={input.regularHolidays}
            onChange={(event) => setInput({ ...input, regularHolidays: event.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="サービス・メニュー">
          <Textarea
            value={input.services}
            onChange={(event) => setInput({ ...input, services: event.target.value })}
          />
        </Field>
        <Field label="店舗の強み">
          <Textarea
            value={input.strengths}
            onChange={(event) => setInput({ ...input, strengths: event.target.value })}
          />
        </Field>
        <Field label="ターゲット顧客">
          <Textarea
            value={input.targetCustomers}
            onChange={(event) => setInput({ ...input, targetCustomers: event.target.value })}
          />
        </Field>
        <Field label="投稿のトーン">
          <Textarea
            value={input.postTone}
            onChange={(event) => setInput({ ...input, postTone: event.target.value })}
          />
        </Field>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Field label={`対策キーワード (${keywordCount}/20)`} hint="1行に1キーワード。最大20個。">
          <Textarea value={keywordText} onChange={(event) => setKeywordText(event.target.value)} />
        </Field>
        <Field label="競合店舗名" hint="1行に1店舗。">
          <Textarea value={competitorText} onChange={(event) => setCompetitorText(event.target.value)} />
        </Field>
        <Field label="NG表現" hint="生成前後のチェック対象。">
          <Textarea value={ngText} onChange={(event) => setNgText(event.target.value)} />
        </Field>
      </div>

      <div className="grid gap-4 rounded-lg border border-line bg-paper/60 p-4 lg:grid-cols-2">
        <Field label="自動化モード">
          <Select
            value={input.automationMode}
            onChange={(event) =>
              setInput({ ...input, automationMode: event.target.value as AutomationMode })
            }
          >
            <option value="approval">承認制</option>
            <option value="semi_auto">半自動</option>
            <option value="full_auto">完全自動</option>
          </Select>
        </Field>
        <Field label="月間投稿目安">
          <Input
            type="number"
            min={0}
            max={31}
            value={input.postFrequencyPerMonth}
            onChange={(event) =>
              setInput({ ...input, postFrequencyPerMonth: Number(event.target.value) })
            }
          />
        </Field>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-white px-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={input.allowTemplateReviewAutoReply}
            onChange={(event) =>
              setInput({ ...input, allowTemplateReviewAutoReply: event.target.checked })
            }
          />
          星4から5の安全な口コミはテンプレ自動返信を許可
        </label>
        <label className="flex min-h-12 items-center gap-3 rounded-md border border-line bg-white px-3 text-sm font-semibold">
          <input
            type="checkbox"
            checked={input.allowLowRiskGbpAutoPost}
            onChange={(event) =>
              setInput({ ...input, allowLowRiskGbpAutoPost: event.target.checked })
            }
          />
          低リスクGBP投稿の自動投稿を許可
        </label>
        <div className="lg:col-span-2">
          <Field label="GBPロケーション名">
            <Input
              value={input.gbpLocationName || ""}
              placeholder="accounts/{accountId}/locations/{locationId}"
              onChange={(event) => setInput({ ...input, gbpLocationName: event.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          キャンセル
        </Button>
        <Button type="submit">
          <Save className="size-4" />
          保存
        </Button>
      </div>
    </form>
  );
}
