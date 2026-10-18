import { NextRequest, NextResponse } from 'next/server';
import { submitDecisionApproval, recordApprovalDecision } from '@/lib/db/repository';
import { INITIAL_USERS } from '@/lib/db/seed';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const actorId = req.headers.get('x-user-id') || 'usr-management';
    const actor = INITIAL_USERS.find((u) => u.id === actorId) || INITIAL_USERS[1];

    const { action, decisionType, rationale, requestedBudgetSAR, approvalId, decision, conditions } = body;

    let updated;
    if (action === 'submit') {
      updated = submitDecisionApproval(id, decisionType, rationale, Number(requestedBudgetSAR) || 0, actor);
    } else if (action === 'decide') {
      if (actor.role !== 'admin' && actor.role !== 'management') {
        return NextResponse.json({ success: false, error: 'Unauthorized: Only Management or Admin can approve investment decisions.' }, { status: 403 });
      }
      updated = recordApprovalDecision(id, approvalId, decision, conditions || '', actor);
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
