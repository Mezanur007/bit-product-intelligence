import { NextRequest, NextResponse } from 'next/server';
import {
  updateMarketAssessment,
  addCompetitor,
  removeCompetitor,
  updateTechnicalFeasibility,
  saveFinancialAssumptions,
  updateMandatoryGate,
  addRisk,
  runOpportunityDecisionEngine,
  getOpportunityById,
  updateOpportunity,
} from '@/lib/db/repository';
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

    const { step, action, payload } = body;

    let updated;
    switch (step) {
      case 'market':
        updated = updateMarketAssessment(id, payload, actor);
        break;

      case 'competitor':
        if (action === 'add') {
          updated = addCompetitor(id, payload, actor);
        } else if (action === 'delete') {
          updated = removeCompetitor(id, payload.competitorId, actor);
        }
        break;

      case 'technical':
        updated = updateTechnicalFeasibility(id, payload, actor);
        break;

      case 'financial':
        updated = saveFinancialAssumptions(id, payload, actor);
        break;

      case 'gate':
        updated = updateMandatoryGate(id, payload.gateId, payload.status, payload.evidence, actor);
        break;

      case 'risk':
        updated = addRisk(id, payload, actor);
        break;

      case 'scores':
        const opp = getOpportunityById(id);
        if (opp) {
          opp.categoryScores = { ...opp.categoryScores, ...payload };
          updateOpportunity(id, { categoryScores: opp.categoryScores }, actor);
          updated = runOpportunityDecisionEngine(id, actor);
        }
        break;

      case 'run-engine':
        updated = runOpportunityDecisionEngine(id, actor);
        break;

      default:
        return NextResponse.json({ success: false, error: `Invalid step: ${step}` }, { status: 400 });
    }

    return NextResponse.json({ success: true, data: updated || getOpportunityById(id) });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
