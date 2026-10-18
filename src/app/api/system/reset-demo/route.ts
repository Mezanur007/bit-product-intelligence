import { NextRequest, NextResponse } from 'next/server';
import { resetToDemoData } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function POST(req: NextRequest) {
  try {
    const actorId = req.headers.get('x-user-id') || 'usr-admin';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[0];

    resetToDemoData(actor);
    return NextResponse.json({ success: true, message: 'Reset to B-IT demo portfolio completed.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
