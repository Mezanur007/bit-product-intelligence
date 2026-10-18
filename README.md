# B-IT Technology — Product Intelligence & Investment Decision Platform

> **Internal business intelligence, SaaS product evaluation, financial forecasting, and investment decision support platform for B-IT Technology (Saudi Arabia).**

---

## 1. Executive Summary & Product Vision

B-IT Technology is an IT company identifying, validating, launching, and managing recurring-revenue business opportunities in Saudi Arabia (SaaS, AI agents, standardized custom software, white-label partnerships, and IT subscription services).

With an initial evaluation capital discipline budget below **SAR 25,000**, B-IT cannot afford to commit heavy engineering resources without prior validation of customer demand.

This platform operates as an internal **Product Investment Office**, transforming fragmented market research and employee assumptions into explainable, structured, auditable management decisions through a **6-step guided evaluation framework** and **deterministic financial modeling**.

---

## 2. Vercel-First Architecture & Technology Stack

The platform is designed and optimized for cloud deployment on **Vercel** with full persistence, server-side authorization, and zero unverified AI dependencies.

- **Framework**: Next.js 16 (React 19, TypeScript, App Router).
- **Styling & Design Tokens**: Tailwind CSS with enterprise B-IT brand identity tokens (Deep Navy `#111827`, Primary Blue `#315EE8`, Accent Blue `#6484FF`, Success Emerald `#159769`, Warning Amber `#D99A2B`, Danger Red `#D95360`).
- **Data Visualization**: Recharts (MRR growth timelines, forecast vs. actual spend, 24-month cumulative cash flow payback curves, stage distribution).
- **Icons**: Lucide Icons.
- **Persistence Layer**:
  - Relational DDL schema: `src/lib/db/schema.sql` (PostgreSQL 14+ / Neon / Supabase compatible with 31 normalized entities, foreign keys, and indexes).
  - Storage repository: `src/lib/db/repository.ts` providing atomic JSON/file-backed persistence with in-memory caching for serverless environments.
- **Automated Test Suite**: Node.js test runner via `tsx` with hand-verified calculation fixtures (`tests/financial-engine.test.ts`, `tests/decision-engine.test.ts`, `tests/repository.test.ts`).

---

## 3. Financial Calculation Engine Specification

The financial engine (`src/lib/financial-engine/index.ts`) consists of pure, deterministic functions without hidden optimism multipliers.

### Unit Economics
$$\text{Gateway Fee} = (\text{Monthly Price} \times \text{Processing \%}) + \text{Fixed Fee}$$
$$\text{Variable Cost per Customer} = \text{Hosting/AI Cost} + \text{Support Cost} + \text{Gateway Fee}$$
$$\text{Monthly Contribution per Customer} = \text{Monthly Price} - \text{Variable Cost per Customer}$$
$$\text{Contribution Margin \%} = \frac{\text{Monthly Contribution}}{\text{Monthly Price}} \times 100$$

### Operating Break-Even Customer Count
$$\text{Break-Even Customers} = \left\lceil \frac{\text{Monthly Fixed Operating Costs}}{\text{Monthly Contribution per Customer}} \right\rceil$$

> **Critical Safety Constraint**: If monthly unit contribution is zero or negative, the engine flags a critical viability failure and returns `null`. Every sale in a negative contribution model accelerates cash burn; the platform prevents approval until pricing or variable costs are restructured.

### Investment Payback Horizon
Payback is achieved at Month $M$ where:
$$\text{Cumulative Cash Flow}_M = -\text{Initial Cash Investment} + \sum_{m=1}^{M} \text{Operating Cash Flow}_m \ge 0$$
If cumulative cash does not recover initial capital within the horizon (e.g. 24 months), the engine explicitly states that payback is not reached in the modeled period.

### 3 Independent Scenarios
1. **Downside**: 20% lower price, 35% lower acquisition, 30% higher churn, 15% higher variable costs, and 20% initial cost overrun.
2. **Base Case**: Management's best evidence-based estimate.
3. **Upside**: 15% higher price, 30% faster customer growth, 20% lower churn, and 10% lower variable cloud cost.

---

## 4. Six-Step Guided Evaluation Framework

1. **Step 1: Market Opportunity & Customer Validation**
   - Bottom-up & Top-down sizing: TAM, SAM, and SOM calculations.
   - Verified demand indicators: counts of customer interviews, qualified leads, Letters of Intent (LOIs), and paid pilot commitments.
   - Enforces the principle: *A large market is not proof that customers will buy this product.*
2. **Step 2: Competitor & Differentiation Intelligence**
   - Competitor benchmark register: observed prices, pricing interval, Arabic support status, strengths, weaknesses, and B-IT differentiation opportunity.
3. **Step 3: Technical Feasibility & Delivery Plan**
   - Architecture summary, build vs. buy (build, buy, partner, white-label), reusable B-IT components, and delivery effort breakdown in work days across Discovery, UX/UI, Frontend, Backend, and QA.
   - Distinct tracking of cash capital vs. internal economic labor value.
   - Verification of Saudi data residency (AWS Riyadh `me-central-1`).
4. **Step 4: Financial Simulator & Investment Analysis**
   - Interactive sliders for monthly price, customer ramp, churn, and variable cloud/AI costs.
   - Live break-even recalculation and 24-month cumulative cash flow chart.
5. **Step 5: Risk Register & 9 Mandatory Decision Gates**
   - Risk matrix with likelihood, impact, severity, owner, and mitigation strategy.
   - **9 Mandatory Gates**:
     1. Customer Demand Validation
     2. Financial Viability & Contribution Margin
     3. Validation Budget Authorization (Cap: SAR 25,000)
     4. Technical Feasibility & Architecture Sign-off
     5. Saudi Data Protection (PDPL) & Cybersecurity
     6. Legal, ZATCA e-Invoicing & Contract Terms
     7. IP & Source Code Ownership
     8. Operational Support & Team Capacity
     9. Designated Approver Sign-off
   - **CORE RULE**: High weighted score NEVER overrides a mandatory gate failure. A failure in any critical gate blocks `EXECUTE` and routes to `HOLD` or `DROP`.
6. **Step 6: Business Decision & Approvals**
   - Recommendation synthesis: `EXECUTE`, `PILOT`, `CONTINUE_RESEARCH`, `HOLD`, `PARTNER`, or `DROP`.
   - Formal approval workflow: Submit for review $\rightarrow$ Designated management approver sign-off with formal conditions and authorized budget.

---

## 5. Modules Summary

| Module | Description | Route |
| :--- | :--- | :--- |
| **Executive Dashboard** | 10 KPI cards, MRR & expenditure timelines, attention panel, status distribution. | `/` |
| **Opportunity Register** | Searchable pipeline, status/category filters, guided creation modal, cloning. | `/opportunities` |
| **6-Step Workspace** | Interactive 6-step evaluation workspace with live recalculation and gate audit. | `/opportunities/[id]` |
| **Financial Simulator** | Standalone sandbox for modeling unit economics, break-even, and price sensitivity. | `/financial-simulator` |
| **Market Intelligence** | Evidence classification registry and cross-product competitor benchmarks. | `/market-intelligence` |
| **Portfolio & Launches** | Approved pilot tracker, pre-launch verification checklist, and actuals tracking. | `/portfolio` |
| **Executive Reports** | Formal Investment Decision Memo formatted for executive review and printable PDF. | `/reports` |
| **Team & Approvals** | Multi-role simulator (Admin, Approver, PO, Analyst, Tech, Finance) & approval queue. | `/team` |
| **Settings & Governance** | Configurable criteria weights (validating sum to 100%), budget caps, zero-data toggle. | `/settings` |

---

## 6. Role-Based Access Control (RBAC) Matrix

| Role | Key Capabilities | Example Assignee |
| :--- | :--- | :--- |
| **Administrator** | Manage all opportunities, system configuration, criteria weights, and portfolio resets. | Khalid Al-Mansoor |
| **Management / Approver** | Review investment cases, authorize capital budgets, approve pilots and launches. | Tariq Al-Ghamdi |
| **Product Owner** | Create opportunities, manage evaluations, run decision engine, submit reviews. | Mezanur Rahman |
| **Market Analyst** | Maintain competitor records, verify research sources, conduct market sizing. | Sarah Al-Otaibi |
| **Technical Reviewer**| Estimate delivery effort, evaluate architecture, verify Saudi PDPL hosting. | Fahad Al-Harbi |
| **Finance Reviewer** | Validate financial assumptions, audit break-even thresholds, verify actuals. | Omar Al-Zahrani |

---

## 7. Honest Zero-Data Mode vs. Demo Data

In compliance with corporate governance requirements:
- **Demo Mode**: Seeds 5 realistic, fully articulated Saudi IT product opportunities (`BIT-OP-001` to `BIT-OP-005`) covering SaaS, AI agents, custom software, and partnerships with verified calculation outputs.
- **Honest Zero-Data Mode**: Clearable at any time via the top navigation bar or Settings page (`/api/system/reset-zero`), enabling clean-slate production operations without fabricated figures.

---

## 8. Verification & Running the Platform

### Running Automated Test Suite
```bash
npm test
```
*Executes all 17 unit tests verifying financial formulas, break-even edge cases, mandatory gate overrides, and persistence.*

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

---

## 9. Vercel Deployment Guide

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete B-IT Product Intelligence & Investment Decision Platform"
   git push origin master
   ```
2. **Deploy on Vercel**:
   ```bash
   vercel --prod
   ```
3. **Environment Variables**:
   - `DATABASE_URL`: *(Optional)* Connection string for managed PostgreSQL (Neon / Supabase). If omitted, the internal file-backed atomic repository operates seamlessly.
   - `NEXT_PUBLIC_APP_URL`: Production domain URL.

---

## 10. AI Research Agent Phase 2 Integration Roadmap

- **Phase 2.1**: Provider service interface for Claude / OpenAI structured outputs.
- **Phase 2.2**: Automated Saudi competitor pricing discovery with source URL capture and timestamping.
- **Phase 2.3**: Automated market sizing extraction from public Monshaat / GASTAT reports.
- **Governance Mandate**: All AI-extracted findings are tagged with the `AI-generated hypothesis` badge and require human analyst review before inclusion in formal investment gates.
