import { NextRequest, NextResponse } from 'next/server';
import { getOpportunityById, updateOpportunity, deleteOpportunity } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const opp = getOpportunityById(id);
    if (!opp) {
      return NextResponse.json({ success: false, error: 'Opportunity not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: opp });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorId = req.headers.get('x-user-id') || 'usr-po';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[2];

    const updated = updateOpportunity(id, body, actor);
    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const actorId = req.headers.get('x-user-id') || 'usr-admin';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[0];

    const success = deleteOpportunity(id, actor);
    return NextResponse.json({ success });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
