import { z } from 'zod';

export interface LLMProvider {
  /**
   * Generate structured data from an LLM that adheres to a given Zod schema
   */
  generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemPrompt?: string
  ): Promise<T>;

  /**
   * Generate raw text from an LLM
   */
  generateText(prompt: string, systemPrompt?: string): Promise<string>;
}

export class MockLLMProvider implements LLMProvider {
  async generateStructured<T>(
    prompt: string,
    schema: z.ZodSchema<T>,
    systemPrompt?: string
  ): Promise<T> {
    console.log('[MockLLM] Generating structured data for prompt:', prompt.substring(0, 50) + '...');
    
    // In a real implementation, this would call Grok or Gemini API
    // and validate the JSON output against the Zod schema.
    
    // Fallback mock based on the schema (this is simplified for the MVP structure)
    // Normally we'd use a real model here.
    const mockData: any = {
      hardSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      keywords: ['API', 'Frontend', 'Backend', 'Database'],
      businessProblem: 'Scaling the core application to handle enterprise traffic.',
      expectedOutcomes: ['Reduce latency by 20%', 'Deliver new dashboard'],
    };
    
    return schema.parse(mockData);
  }

  async generateText(prompt: string, systemPrompt?: string): Promise<string> {
    console.log('[MockLLM] Generating text...');
    return "This is a mock LLM response.";
  }
}

// Global provider instance
export const llmProvider: LLMProvider = new MockLLMProvider();
