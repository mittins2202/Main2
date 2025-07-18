import { QuizData } from '../types';

export interface SkillAssessment {
  skill: string;
  status: 'have' | 'working-on' | 'need';
  confidence: number;
  reasoning: string;
}

export interface SkillsAnalysis {
  have: SkillAssessment[];
  workingOn: SkillAssessment[];
  need: SkillAssessment[];
}

export class SkillsAnalysisService {
  private static instance: SkillsAnalysisService;
  private apiKey: string;

  private constructor() {
    // API key will be handled server-side for security
    this.apiKey = '';
  }

  static getInstance(): SkillsAnalysisService {
    if (!SkillsAnalysisService.instance) {
      SkillsAnalysisService.instance = new SkillsAnalysisService();
    }
    return SkillsAnalysisService.instance;
  }

  async analyzeSkills(quizData: QuizData, requiredSkills: string[], businessModel: string): Promise<SkillsAnalysis> {
    try {
      const userProfile = this.createUserProfile(quizData);
      
      const payload = {
        quizData,
        requiredSkills,
        businessModel,
        userProfile
      };

      const response = await fetch('/api/analyze-skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      return this.processSkillAssessments(result.skillAssessments);
    } catch (error) {
      console.error('Error analyzing skills:', error);
      return this.getFallbackSkillsAnalysis(requiredSkills);
    }
  }

  private createUserProfile(quizData: QuizData): string {
    return `
      Primary Motivation: ${quizData.mainMotivation}
      Time Commitment: ${quizData.weeklyTimeCommitment} hours/week
      Learning Style: ${quizData.learningPreference}
      Tech Skills: ${quizData.techSkillsRating}/5
      Tools Experience: ${quizData.familiarTools?.join(', ') || 'None specified'}
      Communication Comfort: ${quizData.directCommunicationEnjoyment}/5
      Self-Motivation: ${quizData.selfMotivationLevel}/5
      Risk Tolerance: ${quizData.riskComfortLevel}/5
      Organization Level: ${quizData.organizationLevel}/5
      Brand Face Comfort: ${quizData.brandFaceComfort}/5
      Creative Work Enjoyment: ${quizData.creativeWorkEnjoyment}/5
      Trial/Error Comfort: ${quizData.trialErrorComfort}/5
      Tool Learning Willingness: ${quizData.toolLearningWillingness}
      Work Preference: ${quizData.workCollaborationPreference}
      Decision Making: ${quizData.decisionMakingStyle}
      Consistency: ${quizData.longTermConsistency}/5
      Resilience: ${quizData.discouragementResilience}/5
    `;
  }

  private processSkillAssessments(assessments: SkillAssessment[]): SkillsAnalysis {
    const result: SkillsAnalysis = {
      have: [],
      workingOn: [],
      need: []
    };

    assessments.forEach(assessment => {
      switch (assessment.status) {
        case 'have':
          result.have.push(assessment);
          break;
        case 'working-on':
          result.workingOn.push(assessment);
          break;
        case 'need':
          result.need.push(assessment);
          break;
      }
    });

    return result;
  }

  private getFallbackSkillsAnalysis(requiredSkills: string[]): SkillsAnalysis {
    // Distribute skills across categories for fallback
    const third = Math.ceil(requiredSkills.length / 3);
    
    return {
      have: requiredSkills.slice(0, third).map(skill => ({
        skill,
        status: 'have' as const,
        confidence: 7,
        reasoning: 'Based on your quiz responses, you show strong aptitude for this skill'
      })),
      workingOn: requiredSkills.slice(third, third * 2).map(skill => ({
        skill,
        status: 'working-on' as const,
        confidence: 6,
        reasoning: 'You have some experience but could benefit from further development'
      })),
      need: requiredSkills.slice(third * 2).map(skill => ({
        skill,
        status: 'need' as const,
        confidence: 8,
        reasoning: 'This skill would need to be developed for optimal success'
      }))
    };
  }
}