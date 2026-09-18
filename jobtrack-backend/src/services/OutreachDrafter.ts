import { z } from 'zod';
import { llmProvider } from '../lib/llm/LLMProvider';
import { CandidateEvidence } from './FitEngine';

export const OutreachPersonaEnum = z.enum([
  'HIRING_MANAGER',
  'RECRUITER',
  'PEER_REFERRER',
  'FOLLOW_UP',
]);
export type OutreachPersona = z.infer<typeof OutreachPersonaEnum>;

export const OutreachChannelEnum = z.enum([
  'EMAIL',
  'LINKEDIN_INMAIL',
  'LINKEDIN_CONNECTION',
]);
export type OutreachChannel = z.infer<typeof OutreachChannelEnum>;

export const OutreachDraftSchema = z.object({
  persona: OutreachPersonaEnum,
  channel: OutreachChannelEnum,
  subject: z.string().optional().describe('Email subject line (required for EMAIL, optional for LINKEDIN)'),
  body: z.string().describe('The tailored outreach message body'),
  proofPointsUsed: z.array(z.string()).describe('Specific candidate evidence points truthfully referenced in the draft'),
  callToAction: z.string().describe('Low-friction, courteous ask'),
  suggestedFollowUpDays: z.number().int().describe('Recommended number of days before sending a follow-up'),
  rationale: z.string().describe('Why this structure and angle was chosen for this recipient'),
});

export type OutreachDraft = z.infer<typeof OutreachDraftSchema>;

export interface OutreachDraftParams {
  persona: OutreachPersona;
  channel: OutreachChannel;
  recipientName: string;
  recipientTitle?: string | undefined;
  companyName: string;
  jobTitle?: string | undefined;
  candidateName: string;
  candidateEvidence: CandidateEvidence;
  businessProblem?: string | undefined;
  keyJobRequirements?: string[] | undefined;
  previousTouchpointSummary?: string | undefined; // For follow-ups
}

export class OutreachDrafter {
  /**
   * Generates a tailored, evidence-backed outreach or follow-up draft.
   * Adheres strictly to the Zero Hallucination rule.
   */
  static async generateDraft(params: OutreachDraftParams): Promise<OutreachDraft> {
    const {
      persona,
      channel,
      recipientName,
      recipientTitle,
      companyName,
      jobTitle,
      candidateName,
      candidateEvidence,
      businessProblem,
      keyJobRequirements,
      previousTouchpointSummary,
    } = params;

    const systemPrompt = `You are an elite Job Search Outreach Strategist and Communication Coach.
Your goal is to draft a high-converting, human, respectful outreach message.

CRITICAL ANTI-HALLUCINATION RULES:
1. NEVER invent mutual connections, personal anecdotes, or fake background stories.
2. NEVER invent work experience, metrics, or technologies not present in Candidate Evidence.
3. Every claim about the candidate's skills or achievements must be backed by the provided Candidate Evidence.
4. Keep the message concise, empathetic, and respectful of the recipient's high cognitive load.
5. If the channel is LINKEDIN_CONNECTION, keep the entire message strictly under 280 characters.
6. If the channel is LINKEDIN_INMAIL, keep it under 150 words.
7. If the channel is EMAIL, include a compelling, non-spammy subject line (under 60 chars) and clear paragraphs.`;

    const prompt = `
Generate an outreach draft with the following specifications:

RECIPIENT:
- Name: ${recipientName}
- Title: ${recipientTitle || 'Leader / Team Member'}
- Company: ${companyName}
- Target Persona: ${persona}
- Channel: ${channel}

TARGET ROLE CONTEXT:
- Job Title: ${jobTitle || 'Target Opportunity'}
- Identified Business Problem / Team Challenge: ${businessProblem || 'Scaling and improving product engineering'}
- Key Role Requirements: ${JSON.stringify(keyJobRequirements || [])}
${previousTouchpointSummary ? `- Previous Touchpoint History: ${previousTouchpointSummary}` : ''}

CANDIDATE PROFILE:
- Name: ${candidateName}
- Candidate Evidence (ONLY USE THESE VERIFIED FACTS):
${JSON.stringify(candidateEvidence, null, 2)}

Provide the structured output adhering to the required schema.`;

    const draft = await llmProvider.generateStructured(
      prompt,
      OutreachDraftSchema,
      systemPrompt
    );

    return draft;
  }
}
