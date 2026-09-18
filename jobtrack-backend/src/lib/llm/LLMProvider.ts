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
    console.log('[MockLLM] Generating structured data for prompt:', prompt.substring(0, 60) + '...');

    const promptLower = (prompt + ' ' + (systemPrompt || '')).toLowerCase();

    // 1. Outreach Draft scenario
    if (promptLower.includes('outreach') || promptLower.includes('recipient:')) {
      const isLinkedInConnection = promptLower.includes('linkedin_connection');
      const isHiringManager = promptLower.includes('hiring_manager');
      const isRecruiter = promptLower.includes('recruiter');
      const isFollowUp = promptLower.includes('follow_up');

      let subject = 'Quick introduction / Engineering alignment';
      let body = '';
      let callToAction = 'Open to a brief 10-minute sync this week?';
      let suggestedFollowUpDays = 4;
      let rationale = 'Direct evidence alignment with verified candidate achievements.';
      const proofPointsUsed = [
        'Built full-stack TypeScript & React applications with high-throughput backend APIs',
        'Reduced p95 page load times by 40% and improved DB indexing',
      ];

      if (isLinkedInConnection) {
        body = `Hi there! Admiring your engineering leadership. I've spent the past 4+ years scaling full-stack React/Node systems with verified performance wins. Would love to connect and follow your team's journey!`;
        callToAction = 'Connect on LinkedIn';
        suggestedFollowUpDays = 5;
        rationale = 'Ultra-crisp connection note under 280 characters focusing on craft and admiration.';
      } else if (isHiringManager) {
        subject = 'Solving data scale & latency bottlenecks — Engineering intro';
        body = `Hi,\n\nI saw that your team is actively tackling architectural scaling challenges. In my previous work, I redesigned core query pipelines and distributed backend services, directly reducing p95 latency by 40% while supporting enterprise scale.\n\nI’d love to learn more about how your team is navigating these technical milestones and share a few technical notes from similar challenges.\n\nWould you have 10 minutes for an informal chat this Thursday or Friday?\n\nBest regards`;
        callToAction = '10-minute technical exchange on Thursday or Friday';
        suggestedFollowUpDays = 4;
        rationale = 'Problems-first opening linking verified candidate outcomes directly to the hiring manager’s likely business goals.';
      } else if (isRecruiter) {
        subject = 'Full Stack Engineer candidate introduction';
        body = `Hi,\n\nI noticed you are hiring for the target engineering role. With deep hands-on expertise across React, TypeScript, Node.js, and PostgreSQL, I specialize in shipping resilient web apps and high-performance APIs.\n\nI have reviewed the team’s current requirements and my verified background is a direct match. I would love to connect for a quick 10-minute introductory screen.\n\nLooking forward to hearing from you!`;
        callToAction = '10-minute introductory recruiter screen';
        suggestedFollowUpDays = 3;
        rationale = 'High-clarity recruiter message prioritizing core stack match, availability, and immediate next steps.';
      } else if (isFollowUp) {
        subject = 'Following up on engineering intro / quick update';
        body = `Hi,\n\nHope your week is off to a great start! Just circling back to my earlier note regarding the engineering role. Since then, I recently open-sourced an architecture benchmark and wanted to share that my interest in the team remains very strong.\n\nNo pressure at all if timing isn't right—if you have 5 minutes next week, I'd welcome the chance to touch base.\n\nWarmly`;
        callToAction = 'Brief check-in next week if timing aligns';
        suggestedFollowUpDays = 7;
        rationale = 'Polite, low-pressure follow-up that brings a tangible update rather than guilt-tripping.';
      } else {
        body = `Hi,\n\nI’ve been following the innovative work your engineering team has been shipping. Having built and optimized full-stack React & TypeScript architectures, I would love to learn more about your team's engineering culture and tech stack decisions.\n\nWould you be open to a 10-minute virtual coffee sometime next week?\n\nBest regards`;
      }

      const mockOutreach: any = {
        persona: isHiringManager ? 'HIRING_MANAGER' : isRecruiter ? 'RECRUITER' : isFollowUp ? 'FOLLOW_UP' : 'PEER_REFERRER',
        channel: isLinkedInConnection ? 'LINKEDIN_CONNECTION' : promptLower.includes('linkedin_inmail') ? 'LINKEDIN_INMAIL' : 'EMAIL',
        subject: isLinkedInConnection ? undefined : subject,
        body,
        proofPointsUsed,
        callToAction,
        suggestedFollowUpDays,
        rationale,
      };

      return schema.parse(mockOutreach);
    }

    // 2. Resume Optimization scenario
    if (promptLower.includes('resume') || promptLower.includes('bullet')) {
      const mockResume: any = {
        summary: 'Performance-driven Software Engineer with extensive experience designing resilient distributed systems, scalable React user interfaces, and robust Node.js microservices backed by verified production metrics.',
        optimizedBullets: [
          {
            originalBulletId: 'bullet-1',
            newBulletText: 'Architected high-throughput REST APIs and real-time state pipelines using TypeScript, reducing p95 database query latency by 42%.',
            rationale: 'Directly aligns candidate verified metrics with JD latency and scalability requirements.',
          },
          {
            originalBulletId: 'bullet-2',
            newBulletText: 'Engineered modular React component library with strict TypeScript types, speeding up feature delivery cycles across product teams.',
            rationale: 'Highlights frontend mastery without inventing false frameworks or numbers.',
          },
        ],
        skillsMapping: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'System Architecture', 'Performance Optimization'],
      };
      return schema.parse(mockResume);
    }

    // 3. Default / Job Description analysis scenario
    const mockJD: any = {
      hardSkills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Docker', 'GraphQL'],
      keywords: ['Distributed Systems', 'API Design', 'Scalability', 'Performance', 'Full Stack'],
      businessProblem: 'Accelerating product velocity while scaling backend infrastructure to support 5x user volume.',
      expectedOutcomes: [
        'Deliver next-gen customer dashboard within first 6 months',
        'Cut p95 API response times below 150ms',
        'Standardize frontend component architecture',
      ],
    };

    return schema.parse(mockJD);
  }

  async generateText(prompt: string, _systemPrompt?: string): Promise<string> {
    console.log('[MockLLM] Generating text for prompt:', prompt.substring(0, 50) + '...');
    return 'This is a mock LLM response tailored to your request.';
  }
}

// Global provider instance
export const llmProvider: LLMProvider = new MockLLMProvider();
