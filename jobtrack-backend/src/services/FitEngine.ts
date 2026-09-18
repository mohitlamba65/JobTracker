import { JDRequirements } from './JDAnalyzer';

export interface CandidateEvidence {
  skills: string[];
  experience: string[];
}

export interface FitAnalysisResult {
  score: number; // 0-100
  matchedSkills: string[];
  missingSkills: string[];
  analysisContext: string;
}

export class FitEngine {
  /**
   * Deterministically calculates a fit score based on structured candidate evidence and JD requirements.
   * This aligns with the "Don't turn analytics into fake certainty" and "80% Rule" epics.
   */
  static calculateFit(
    candidateEvidence: CandidateEvidence,
    jdRequirements: JDRequirements
  ): FitAnalysisResult {
    const { hardSkills } = jdRequirements;
    
    if (!hardSkills || hardSkills.length === 0) {
      return {
        score: 0,
        matchedSkills: [],
        missingSkills: [],
        analysisContext: "No hard skills were extracted from the JD.",
      };
    }

    const matchedSkills: string[] = [];
    const missingSkills: string[] = [];

    // Normalize strings for matching (lowercase, remove spaces)
    const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    const candidateSkillsNormalized = candidateEvidence.skills.map(normalize);

    hardSkills.forEach((reqSkill) => {
      const normalizedReq = normalize(reqSkill);
      // Determine if this skill exists in candidate evidence
      const isMatch = candidateSkillsNormalized.some(cSkill => 
        cSkill.includes(normalizedReq) || normalizedReq.includes(cSkill)
      );

      if (isMatch) {
        matchedSkills.push(reqSkill);
      } else {
        missingSkills.push(reqSkill);
      }
    });

    const score = Math.round((matchedSkills.length / hardSkills.length) * 100);

    return {
      score,
      matchedSkills,
      missingSkills,
      analysisContext: `Matched ${matchedSkills.length} out of ${hardSkills.length} required hard skills.`
    };
  }
}
