import { NextRequest, NextResponse } from 'next/server';
import { AIResearcher } from '@/lib/ai/researcher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, description, industry, targetMarket } = body;

    if (!productName || !category) {
      return NextResponse.json(
        { success: false, error: 'Product name and category are required' },
        { status: 400 }
      );
    }

    const competitors = await AIResearcher.scanCompetitors({
      productName,
      category,
      description: description || '',
      industry,
      targetMarket: targetMarket || 'Saudi Arabia',
    });

    return NextResponse.json({
      success: true,
      data: competitors,
      metadata: {
        engine: 'Saudi Market Intelligence AI Engine (Phase 2)',
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
