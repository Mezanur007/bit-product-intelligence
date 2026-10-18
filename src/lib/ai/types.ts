/**
 * B-IT Technology — AI Research & Intelligence Types
 * Phase 2 Service Layer
 */

export interface AICompetitorScanRequest {
  opportunityId?: string;
  productName: string;
  category: string;
  description: string;
  industry?: string;
  targetMarket?: string;
}

export interface AICompetitorItem {
  id: string;
  name: string;
  website: string;
  productName: string;
  country: string;
  observedPriceSAR: number;
  pricingInterval: 'monthly' | 'annual' | 'one_time' | 'usage';
  hasArabicSupport: boolean;
  mainStrengths: string;
  mainWeaknesses: string;
  differentiationOpportunity: string;
  confidence: 'ai_hypothesis';
  sourceUrl: string;
  detectedAt: string;
}

export interface AIMarketEstimateRequest {
  opportunityId?: string;
  productName: string;
  category: string;
  targetAudience: string;
  pricingSAR?: number;
  industry?: string;
}

export interface AIMarketEstimateResult {
  tamSAR: number;
  samSAR: number;
  somSAR: number;
  targetEstablishmentsCount: number;
  sizingMethodology: 'hybrid' | 'bottom_up' | 'top_down';
  confidenceLevel: 'medium' | 'high';
  methodologyNotes: string;
  dataSources: string[];
  suggestedArpuSAR: number;
  generatedAt: string;
}

export interface AIRiskScanRequest {
  opportunityId?: string;
  productName: string;
  category: string;
  technicalStack?: string[];
  targetAudience?: string;
}

export interface AIRiskItem {
  riskCode: string;
  category: 'regulatory' | 'privacy' | 'technical' | 'commercial' | 'operational';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  regulatoryBody?: string; // e.g. 'ZATCA', 'PDPL/SDAIA', 'SBA / MOJ', 'CITC'
}

export interface AIStagedFinding {
  id: string;
  opportunityId: string;
  findingType: 'competitor' | 'market_size' | 'risk' | 'pricing';
  title: string;
  payload: any;
  status: 'staged' | 'accepted' | 'rejected';
  confidence: 'ai_hypothesis';
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}
