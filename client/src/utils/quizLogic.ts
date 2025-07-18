import { QuizData, BusinessPath } from '../types';
import { businessPaths } from '../data/businessPaths';

// AI-powered business fit analysis
export async function generateAIPersonalizedPaths(data: QuizData): Promise<BusinessPath[]> {
  try {
    const response = await fetch('/api/ai-business-fit-analysis', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ quizData: data }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const analysis = await response.json();
    
    // Convert the AI analysis to BusinessPath format
    return analysis.topMatches.map((match: any) => ({
      ...match.businessPath,
      aiAnalysis: match.analysis,
      fitScore: match.analysis.fitScore
    }));
  } catch (error) {
    console.error('AI analysis failed, using fallback scoring:', error);
    return generatePersonalizedPaths(data);
  }
}

// Enhanced fallback scoring algorithm
export function calculateFitScore(pathId: string, data: QuizData): number {
  let score = 0; // Start with 0 and build up
  
  // Helper function to get value from new or legacy field
  const getValue = (newField: any, legacyField: any, defaultValue: any = 0) => {
    return newField !== undefined ? newField : (legacyField !== undefined ? legacyField : defaultValue);
  };

  // Extract key data points
  const incomeGoal = getValue(data.successIncomeGoal, data.incomeGoal, 1000);
  const timeToIncome = getValue(data.firstIncomeTimeline, data.timeToFirstIncome, '3-6-months');
  const budget = getValue(data.upfrontInvestment, data.startupBudget, 0);
  const timeCommitment = getValue(data.weeklyTimeCommitment, data.timeCommitment, 20);
  const techSkills = getValue(data.techSkillsRating, data.technologyComfort, 3);
  const selfMotivation = getValue(data.selfMotivationLevel, data.selfMotivation, 3);
  const riskTolerance = getValue(data.riskComfortLevel, data.riskTolerance, 3);
  
  // Create a weighted scoring system with multiple factors
  const factors = {
    income: 0,
    timeline: 0,
    budget: 0,
    skills: 0,
    communication: 0,
    creativity: 0,
    riskTolerance: 0,
    timeCommitment: 0,
    motivation: 0,
    workStyle: 0
  };

  // Calculate factor scores based on business path requirements
  switch (pathId) {
    case 'affiliate-marketing':
      factors.income = getIncomeMatch(incomeGoal, 1000, 8000); // Sweet spot: $1K-$8K
      factors.timeline = getTimelineMatch(timeToIncome, ['3-6-months', '6-12-months', 'no-rush']);
      factors.budget = getBudgetMatch(budget, 0, 500); // Low budget friendly
      factors.skills = getSkillsMatch(techSkills, 2, 4); // Medium tech skills
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 2, 4); // Some communication
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 3, 5); // Creative work
      factors.riskTolerance = getRiskMatch(riskTolerance, 2, 4); // Medium risk
      factors.timeCommitment = getTimeMatch(timeCommitment, 10, 30); // Flexible time
      factors.motivation = getMotivationMatch(selfMotivation, 3, 5); // Self-motivated
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo']);
      break;

    case 'freelancing':
      factors.income = getIncomeMatch(incomeGoal, 2000, 10000);
      factors.timeline = getTimelineMatch(timeToIncome, ['under-1-month', '1-3-months']);
      factors.budget = getBudgetMatch(budget, 0, 200);
      factors.skills = getSkillsMatch(techSkills, 3, 5);
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 3, 5);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 2, 5);
      factors.riskTolerance = getRiskMatch(riskTolerance, 2, 4);
      factors.timeCommitment = getTimeMatch(timeCommitment, 15, 40);
      factors.motivation = getMotivationMatch(selfMotivation, 4, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo']);
      break;

    case 'e-commerce-dropshipping':
      factors.income = getIncomeMatch(incomeGoal, 3000, 15000);
      factors.timeline = getTimelineMatch(timeToIncome, ['3-6-months', '6-12-months']);
      factors.budget = getBudgetMatch(budget, 500, 2000);
      factors.skills = getSkillsMatch(techSkills, 3, 5);
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 2, 4);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 3, 5);
      factors.riskTolerance = getRiskMatch(riskTolerance, 3, 5);
      factors.timeCommitment = getTimeMatch(timeCommitment, 20, 50);
      factors.motivation = getMotivationMatch(selfMotivation, 3, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo']);
      break;

    case 'content-creation-ugc':
      factors.income = getIncomeMatch(incomeGoal, 1000, 6000);
      factors.timeline = getTimelineMatch(timeToIncome, ['6-12-months', '1-year-plus', 'no-rush']);
      factors.budget = getBudgetMatch(budget, 0, 500);
      factors.skills = getSkillsMatch(techSkills, 2, 4);
      factors.communication = getCommunicationMatch(data.brandFaceComfort, 4, 5);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 4, 5);
      factors.riskTolerance = getRiskMatch(riskTolerance, 2, 4);
      factors.timeCommitment = getTimeMatch(timeCommitment, 10, 30);
      factors.motivation = getMotivationMatch(selfMotivation, 3, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo']);
      break;

    case 'app-saas-development':
      factors.income = getIncomeMatch(incomeGoal, 5000, 50000);
      factors.timeline = getTimelineMatch(timeToIncome, ['6-12-months', '1-year-plus']);
      factors.budget = getBudgetMatch(budget, 0, 1000);
      factors.skills = getSkillsMatch(techSkills, 4, 5);
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 2, 4);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 3, 5);
      factors.riskTolerance = getRiskMatch(riskTolerance, 3, 5);
      factors.timeCommitment = getTimeMatch(timeCommitment, 30, 60);
      factors.motivation = getMotivationMatch(selfMotivation, 4, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo']);
      break;

    case 'high-ticket-sales':
      factors.income = getIncomeMatch(incomeGoal, 5000, 25000);
      factors.timeline = getTimelineMatch(timeToIncome, ['under-1-month', '1-3-months']);
      factors.budget = getBudgetMatch(budget, 0, 1000);
      factors.skills = getSkillsMatch(techSkills, 2, 4);
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 4, 5);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 2, 4);
      factors.riskTolerance = getRiskMatch(riskTolerance, 4, 5);
      factors.timeCommitment = getTimeMatch(timeCommitment, 20, 50);
      factors.motivation = getMotivationMatch(selfMotivation, 4, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['solo-only', 'mostly-solo', 'team-focused']);
      break;

    case 'online-coaching-consulting':
      factors.income = getIncomeMatch(incomeGoal, 2000, 15000);
      factors.timeline = getTimelineMatch(timeToIncome, ['1-3-months', '3-6-months']);
      factors.budget = getBudgetMatch(budget, 0, 500);
      factors.skills = getSkillsMatch(techSkills, 2, 4);
      factors.communication = getCommunicationMatch(data.directCommunicationEnjoyment, 4, 5);
      factors.creativity = getCreativityMatch(data.creativeWorkEnjoyment, 3, 5);
      factors.riskTolerance = getRiskMatch(riskTolerance, 3, 5);
      factors.timeCommitment = getTimeMatch(timeCommitment, 15, 40);
      factors.motivation = getMotivationMatch(selfMotivation, 4, 5);
      factors.workStyle = getWorkStyleMatch(data.workCollaborationPreference, ['team-focused', 'balanced']);
      break;

    default:
      // Default scoring for paths not explicitly defined
      factors.income = 0.5;
      factors.timeline = 0.5;
      factors.budget = 0.5;
      factors.skills = 0.5;
      factors.communication = 0.5;
      factors.creativity = 0.5;
      factors.riskTolerance = 0.5;
      factors.timeCommitment = 0.5;
      factors.motivation = 0.5;
      factors.workStyle = 0.5;
  }

  // Calculate weighted total score
  const weights = {
    income: 0.15,
    timeline: 0.12,
    budget: 0.10,
    skills: 0.15,
    communication: 0.12,
    creativity: 0.10,
    riskTolerance: 0.10,
    timeCommitment: 0.08,
    motivation: 0.05,
    workStyle: 0.03
  };

  score = Object.keys(factors).reduce((total, key) => {
    return total + (factors[key] * weights[key] * 100);
  }, 0);

  // Apply penalties for major mismatches
  if (data.clientCallsComfort === 'no' && 
      ['high-ticket-sales', 'online-coaching-consulting'].includes(pathId)) {
    score -= 20;
  }

  // Ensure score is between 0-100
  return Math.min(Math.max(Math.round(score), 0), 100);
}

// Helper functions for scoring
function getIncomeMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, 1 - (min - actual) / min);
  return Math.max(0, 1 - (actual - max) / max);
}

function getTimelineMatch(actual: string, preferred: string[]): number {
  return preferred.includes(actual) ? 1 : 0.3;
}

function getBudgetMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, 1 - (min - actual) / (min + 1));
  return Math.max(0, 1 - (actual - max) / (max + 1000));
}

function getSkillsMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return Math.max(0.8, 1 - (actual - max) / 2);
}

function getCommunicationMatch(actual: number, min: number, max: number): number {
  if (!actual) return 0.5;
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return Math.max(0.8, 1 - (actual - max) / 2);
}

function getCreativityMatch(actual: number, min: number, max: number): number {
  if (!actual) return 0.5;
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return Math.max(0.8, 1 - (actual - max) / 2);
}

function getRiskMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return Math.max(0.7, 1 - (actual - max) / 2);
}

function getTimeMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return Math.max(0.8, 1 - (actual - max) / max);
}

function getMotivationMatch(actual: number, min: number, max: number): number {
  if (actual >= min && actual <= max) return 1;
  if (actual < min) return Math.max(0, actual / min);
  return 1; // High motivation is always good
}

function getWorkStyleMatch(actual: string, preferred: string[]): number {
  if (!actual) return 0.5;
  return preferred.includes(actual) ? 1 : 0.5;
}

export function generatePersonalizedPaths(data: QuizData): BusinessPath[] {
  const paths = businessPaths.map(path => ({
    ...path,
    fitScore: calculateFitScore(path.id, data)
  }));
  
  return paths.sort((a, b) => b.fitScore - a.fitScore);
}

export function getNextAdaptiveQuestion(currentStep: number, data: Partial<QuizData>): boolean {
  // Logic to determine if adaptive questions should be shown
  
  if (currentStep === 4 && data.upfrontInvestment && data.upfrontInvestment > 500) {
    return true; // Show inventory comfort question
  }
  
  if (currentStep === 12 && (data.familiarTools?.includes('canva') || (data.creativeWorkEnjoyment && data.creativeWorkEnjoyment >= 4))) {
    return true; // Show digital content comfort question
  }
  
  return false;
}