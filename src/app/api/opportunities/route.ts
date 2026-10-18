import { NextRequest, NextResponse } from 'next/server';
import { getAllOpportunities, createOpportunity } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const status = searchParams.get('status') || undefined;
    const query = searchParams.get('query') || undefined;

    const list = getAllOpportunities({ category, status, query });
    return NextResponse.json({ success: true, data: list });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const actorId = req.headers.get('x-user-id') || 'usr-po';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[2];

    if (!body.name) {
      return NextResponse.json({ success: false, error: 'Opportunity name is required.' }, { status: 400 });
    }

    const created = createOpportunity(
      {
        name: body.name,
        category: body.category || 'saas',
        businessProblem: body.businessProblem || '',
        proposedSolution: body.proposedSolution || '',
        targetCustomerSegment: body.targetCustomerSegment || '',
        primaryGeography: body.primaryGeography || 'Saudi Arabia',
        proposedValidationBudgetSAR: Number(body.proposedValidationBudgetSAR) || 15000,
      },
      actor
    );

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
