import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  getAllOpportunities,
  getOpportunityById,
  createOpportunity,
  updateOpportunity,
  cloneOpportunity,
  addCompetitor,
  updateMandatoryGate,
  submitDecisionApproval,
  recordApprovalDecision,
  getAuditLogs,
} from '../src/lib/db/repository.js';
import { INITIAL_USERS } from '../src/lib/db/seed.js';

describe('Data Repository & Persistence — B-IT Technology', () => {
  const adminUser = INITIAL_USERS[0]; // Khalid Al-Mansoor

  it('loads seeded demo opportunities', () => {
    const opps = getAllOpportunities();
    assert.ok(opps.length >= 4);
    const op1 = getOpportunityById('BIT-OP-001');
    assert.ok(op1 !== null);
    assert.strictEqual(op1?.name, 'SME IT Service Desk SaaS');
  });

  it('creates and persists a new opportunity with audit entry', () => {
    const initialAuditCount = getAuditLogs().length;

    const created = createOpportunity(
      {
        name: 'Automated ZATCA Billing Sync',
        category: 'saas',
        businessProblem: 'Manual tax reconciliation',
        proposedValidationBudgetSAR: 12000,
      },
      adminUser
    );

    assert.ok(created.id.startsWith('BIT-OP-'));
    assert.strictEqual(created.name, 'Automated ZATCA Billing Sync');

    const retrieved = getOpportunityById(created.id);
    assert.ok(retrieved !== null);
    assert.strictEqual(retrieved?.proposedValidationBudgetSAR, 12000);

    const newAuditCount = getAuditLogs().length;
    assert.ok(newAuditCount > initialAuditCount);
  });

  it('clones an opportunity cleanly', () => {
    const cloned = cloneOpportunity('BIT-OP-001', 'SME IT Service Desk — GCC Expansion', adminUser);
    assert.ok(cloned.id !== 'BIT-OP-001');
    assert.strictEqual(cloned.name, 'SME IT Service Desk — GCC Expansion');
    assert.strictEqual(cloned.status, 'discovery');
  });

  it('updates mandatory gate and verifies state', () => {
    const op = getOpportunityById('BIT-OP-001');
    assert.ok(op !== null);

    const updated = updateMandatoryGate(
      'BIT-OP-001',
      'gate-8',
      'pass',
      'Support capacity approved by Operations Lead',
      adminUser
    );

    const gate = updated.mandatoryGates.find((g) => g.id === 'gate-8');
    assert.strictEqual(gate?.status, 'pass');
    assert.strictEqual(gate?.evidence, 'Support capacity approved by Operations Lead');
  });

  it('handles decision submission and approval workflow with status transition', () => {
    const opp = createOpportunity(
      {
        name: 'Workflow Approval Test Project',
        category: 'custom_software',
      },
      adminUser
    );

    const submitted = submitDecisionApproval(
      opp.id,
      'PILOT',
      'Positive market interviews and sound unit economics',
      15000,
      adminUser
    );
    assert.strictEqual(submitted.status, 'decision_pending');
    assert.strictEqual(submitted.approvals.length, 1);

    const approvalId = submitted.approvals[0].id;
    const managementUser = INITIAL_USERS[1]; // Tariq Al-Ghamdi

    const approved = recordApprovalDecision(
      opp.id,
      approvalId,
      'approved',
      'Authorize 15,000 SAR pilot budget',
      managementUser
    );

    assert.strictEqual(approved.status, 'pilot_approved');
    assert.strictEqual(approved.approvedBudgetSAR, 15000);
    assert.strictEqual(approved.approvals[0].status, 'approved');
  });
});
