import { NextResponse } from 'next/server';
import { consumerTemplateOptions } from '@/app/generate/chatspec';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    ok: true,
    templates: consumerTemplateOptions.map((template) => ({
      id: template.id,
      title: template.title,
      shortLabel: template.shortLabel,
      category: template.category,
      accent: template.accent,
      journeyPresetId: template.journeyPresetId,
      focusLevel: template.focusLevel,
      baseFreqHz: template.baseFreqHz,
      sampleLengthSec: template.sampleLengthSec
    }))
  });
}
