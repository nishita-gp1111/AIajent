import { NextResponse } from "next/server";
import { z } from "zod";
import { importGoogleMapsStore } from "@/features/store-import/google-maps-importer";

export const maxDuration = 120;

const requestSchema = z.object({
  url: z.string().url()
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const draft = await importGoogleMapsStore(body.url);
    return NextResponse.json({ draft });
  } catch (error) {
    const message = error instanceof Error ? error.message : "店舗情報の読み取りに失敗しました。";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
