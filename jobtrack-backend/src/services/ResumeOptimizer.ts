import { z } from 'zod';
import { llmProvider } from '../lib/llm/LLMProvider';
import { JDRequirements } from './JDAnalyzer';
import { CandidateEvidence } from './FitEngine';

export const OptimizedResumeSchema = z.object({
  summary: z.string().describe('A 3-4 line role-specific summary backed by evidence'),
  optimizedBullets: z.array(
    z.object({
      originalBulletId: z.string(),
      newBulletText: z.string(),
      rationale: z.string(),
    })
  ).describe('Optimized bullet points that prioritize JD requirements without inventing metrics.'),
  skillsMapping: z.array(z.string()).describe('List of relevant skills mapped from the JD to the candidate evidence.'),
});

export type OptimizedResume = z.infer<typeof OptimizedResumeSchema>;

export class ResumeOptimizer {
  /**
   * Generates a JD-specific optimized resume strictly based on Canonical Evidence.
   * Enforces the "Never invent metrics/technology" rules.
   */
  static async optimizeResume(
    candidateEvidence: CandidateEvidence,
    jdRequirements: JDRequirements,
    rolePositioning: string
  ): Promise<OptimizedResume> {
    const systemPrompt = `You are an expert Resume Optimizer.
CRITICAL RULES:
1. NEVER invent metrics, statistics, or outcomes.
2. NEVER invent technology experience the candidate does not have.
3. NEVER invent responsibilities.
4. Only reframe existing evidence to highlight alignment with the JD requirements.
5. If evidence is weak, output the best truthful representation.`;

    const prompt = `
Please optimize the candidate's resume for the following job description.

--- JOB DESCRIPTION REQUIREMENTS ---
${JSON.stringify(jdRequirements, null, 2)}

--- ROLE POSITIONING GOAL ---
${rolePositioning}

--- CANDIDATE CANONICAL EVIDENCE ---
${JSON.stringify(candidateEvidence, null, 2)}

Provide the optimized summary, bullet points, and skills mapping matching the requested schema.`;

    // Call the LLM provider to generate the structured optimized resume
    const optimizedResult = await llmProvider.generateStructured(
      prompt,
      OptimizedResumeSchema,
      systemPrompt
    );

    return optimizedResult;
  }
}
