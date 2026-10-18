/**
 * B-IT Technology — AI Market Intelligence Researcher
 * Orchestrates AI research scans, evidence generation, and staging.
 */

import {
  AICompetitorScanRequest,
  AICompetitorItem,
  AIMarketEstimateRequest,
  AIMarketEstimateResult,
  AIRiskScanRequest,
  AIRiskItem,
} from './types';
import { SaudiMarketKnowledgeEngine } from './provider';

export class AIResearcher {
  /**
   * Run automated competitor scan for a product
   */
  static async scanCompetitors(req: AICompetitorScanRequest): Promise<AICompetitorItem[]> {
    // If an external LLM is configured via env, we could invoke it here.
    // Otherwise, we utilize our specialized deterministic Saudi Market Knowledge Engine.
    return SaudiMarketKnowledgeEngine.scanCompetitors(req);
  }

  /**
   * Estimate Saudi addressable market size (TAM, SAM, SOM)
   */
  static async estimateMarketSize(req: AIMarketEstimateRequest): Promise<AIMarketEstimateResult> {
    return SaudiMarketKnowledgeEngine.estimateMarket(req);
  }

  /**
   * Scan regulatory and technical risks
   */
  static async scanRisks(req: AIRiskScanRequest): Promise<AIRiskItem[]> {
    return SaudiMarketKnowledgeEngine.scanRisks(req);
  }
}
