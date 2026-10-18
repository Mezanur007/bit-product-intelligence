import { NextRequest, NextResponse } from 'next/server';
import { AIResearcher } from '@/lib/ai/researcher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, targetAudience, pricingSAR, industry } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    const marketEstimate = await AIResearcher.estimateMarketSize({
      productName,
      category: category || 'saas',
      targetAudience: targetAudience || '',
      pricingSAR: pricingSAR ? Number(pricingSAR) : undefined,
      industry,
    });

    return NextResponse.json({
      success: true,
      data: marketEstimate,
      metadata: {
        engine: 'Saudi Market Sizing Engine (Monshaat / GaStat Heuristics)',
        sourceType: 'ai_hypothesis',
        requiresHumanVerification: true,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Internal AI service error' },
      { status: 500 }
    );
  }
}
