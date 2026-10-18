import { describe, it, beforeEach } from 'node:test';
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
  resetToDemoData,
  getAllUsers,
  getUserById,
  getUserByUsername,
  createUser,
} from '../src/lib/db/repository.js';
import { INITIAL_USERS } from '../src/lib/db/seed.js';

describe('Data Repository & Persistence — B-IT Technology', () => {
  const adminUser = INITIAL_USERS[0]; // Mezanur Maruf (CTO)

  beforeEach(() => {
    resetToDemoData(adminUser);
  });

  it('loads seeded real opportunities (LawOS 360 and BITEX)', () => {
    const opps = getAllOpportunities();
    assert.strictEqual(opps.length, 2);
    
    const lawos = getOpportunityById('BIT-OP-LAWOS360');
    assert.ok(lawos !== null);
    assert.strictEqual(lawos?.name, 'LawOS 360');
    assert.strictEqual(lawos?.pilotPlan?.targetCustomers, 10);
    assert.strictEqual(lawos?.pilotPlan?.durationDays, 365);

    const bitex = getOpportunityById('BIT-OP-BITEX');
    assert.ok(bitex !== null);
    assert.strictEqual(bitex?.name, 'BITEX');
    assert.strictEqual(bitex?.pilotPlan?.targetCustomers, 5);
  });

  it('verifies initial 2 Super Admin users (Maruf & Faisal)', () => {
    const users = getAllUsers();
    assert.strictEqual(users.length, 2);

    const maruf = getUserByUsername('maruf@b-it.co');
    assert.ok(maruf !== null);
    assert.strictEqual(maruf?.name, 'Mezanur Maruf (CTO)');
    assert.strictEqual(maruf?.role, 'admin');

    const faisal = getUserByUsername('coo@b--it.co');
    assert.ok(faisal !== null);
    assert.strictEqual(faisal?.name, 'Faisal Mohammed (COO)');
    assert.strictEqual(faisal?.role, 'admin');
  });

  it('creates new users by username and selected role', () => {
    const newUser = createUser(
      {
        username: 'analyst@b-it.co',
        name: 'Sarah Al-Otaibi',
        role: 'market_analyst',
        roleTitle: 'Senior Market Intelligence Analyst',
        department: 'Strategy & Research',
        password: 'Bit@123456@',
      },
      adminUser
    );

    assert.ok(newUser.id.startsWith('usr-'));
    assert.strictEqual(newUser.username, 'analyst@b-it.co');
    assert.strictEqual(newUser.role, 'market_analyst');
    assert.strictEqual(newUser.avatarInitials, 'SA');

    const retrieved = getUserById(newUser.id);
    assert.ok(retrieved !== null);
    assert.strictEqual(retrieved?.name, 'Sarah Al-Otaibi');

    const allUsers = getAllUsers();
    assert.strictEqual(allUsers.length, 3);

    // Prevents duplicate username
    assert.throws(() => {
      createUser(
        {
          username: 'analyst@b-it.co',
          name: 'Duplicate Sarah',
          role: 'market_analyst',
        },
        adminUser
      );
    }, /already exists/);
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
    const cloned = cloneOpportunity('BIT-OP-LAWOS360', 'LawOS 360 — GCC Regional Expansion', adminUser);
    assert.ok(cloned.id !== 'BIT-OP-LAWOS360');
    assert.strictEqual(cloned.name, 'LawOS 360 — GCC Regional Expansion');
    assert.strictEqual(cloned.status, 'discovery');
  });

  it('updates mandatory gate and verifies state', () => {
    const op = getOpportunityById('BIT-OP-LAWOS360');
    assert.ok(op !== null);

    const updated = updateMandatoryGate(
      'BIT-OP-LAWOS360',
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
    const managementUser = INITIAL_USERS[1]; // Faisal Mohammed (COO)

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
