import { NextRequest, NextResponse } from 'next/server';
import { cloneOpportunity } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorId = req.headers.get('x-user-id') || 'usr-po';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[2];

    const newName = body.newName || `Clone of ${id}`;
    const cloned = cloneOpportunity(id, newName, actor);
    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
