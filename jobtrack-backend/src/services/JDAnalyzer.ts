import { z } from 'zod';
import { llmProvider } from '../lib/llm/LLMProvider';

export const JDRequirementsSchema = z.object({
  hardSkills: z.array(z.string()).describe('Explicitly required hard skills and technologies'),
  keywords: z.array(z.string()).describe('Important ATS keywords and domain terms'),
  businessProblem: z.string().describe('The underlying business problem the role solves'),
  expectedOutcomes: z.array(z.string()).describe('Specific outcomes or responsibilities expected in the first year'),
});

export type JDRequirements = z.infer<typeof JDRequirementsSchema>;

export class JDAnalyzer {
  /**
   * Extracts structured requirements from raw Job Description text.
   */
  static async extractRequirements(jdText: string): Promise<JDRequirements> {
    const systemPrompt = `You are an expert technical recruiter and ATS parsing system.
Your job is to extract objective, factual requirements from the provided job description.
Do not infer requirements that are not stated. Do not hallucinate.
Output must exactly match the requested schema.`;

    const prompt = `Please extract the requirements from the following job description:\n\n${jdText}`;

    // Call the LLM provider to extract structured data
    const requirements = await llmProvider.generateStructured(
      prompt,
      JDRequirementsSchema,
      systemPrompt
    );

    return requirements;
  }
}
