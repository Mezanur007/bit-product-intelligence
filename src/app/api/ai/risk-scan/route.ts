import { NextRequest, NextResponse } from 'next/server';
import { AIResearcher } from '@/lib/ai/researcher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, technicalStack, targetAudience } = body;

    if (!productName) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      );
    }

    const risks = await AIResearcher.scanRisks({
      productName,
      category: category || 'saas',
      technicalStack,
      targetAudience,
    });

    return NextResponse.json({
      success: true,
      data: risks,
      metadata: {
        engine: 'Saudi Regulatory & Technical Risk Scanner (Phase 2)',
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
