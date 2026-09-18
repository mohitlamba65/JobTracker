const API_BASE_URL = 'http://localhost:3000/api';

export interface InteractionItem {
  id: string;
  type: string;
  direction: 'OUTBOUND' | 'INBOUND';
  content: string;
  timestamp: string;
}

export interface ContactItem {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string | null;
  linkedin?: string | null;
  type: 'HIRING_MANAGER' | 'RECRUITER' | 'PEER_REFERRER' | 'OTHER';
  companyId?: string;
  company?: { id: string; name: string };
  createdAt: string;
  interactions?: InteractionItem[];
  nextFollowUpDate?: string;
  followUpStatus?: 'OVERDUE' | 'UPCOMING' | 'SCHEDULED';
}

export interface FollowUpItem {
  contactId: string;
  contactName: string;
  title?: string;
  companyName: string;
  type: string;
  dueDate: string;
  daysOverdue: number;
  isOverdue: boolean;
  status: 'OVERDUE' | 'DUE_SOON' | 'UPCOMING';
  lastInteraction?: InteractionItem | null;
  recommendedAction: string;
}

export interface OutreachDraftResult {
  persona: string;
  channel: string;
  subject?: string;
  body: string;
  proofPointsUsed: string[];
  callToAction: string;
  suggestedFollowUpDays: number;
  rationale: string;
}

export interface GenerateOutreachPayload {
  persona: 'HIRING_MANAGER' | 'RECRUITER' | 'PEER_REFERRER' | 'FOLLOW_UP';
  channel: 'EMAIL' | 'LINKEDIN_INMAIL' | 'LINKEDIN_CONNECTION';
  recipientName: string;
  recipientTitle?: string | undefined;
  companyName: string;
  jobTitle?: string | undefined;
  candidateName?: string | undefined;
  candidateEvidence: {
    skills: string[];
    experience: string[];
  };
  businessProblem?: string | undefined;
  keyJobRequirements?: string[] | undefined;
  previousTouchpointSummary?: string | undefined;
}

// Fallback seed data for rich interactive experience
const FALLBACK_CONTACTS: ContactItem[] = [
  {
    id: 'contact-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    title: 'Head of Engineering',
    email: 'sarah.chen@stripe-demo.com',
    linkedin: 'https://linkedin.com/in/sarah-chen-eng',
    type: 'HIRING_MANAGER',
    company: { id: 'comp-stripe', name: 'Stripe' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    interactions: [
      {
        id: 'int-1',
        type: 'COLD_EMAIL',
        direction: 'OUTBOUND',
        content: 'Sent initial cold outreach sharing distributed systems scaling results and latency optimization.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ],
    nextFollowUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
    followUpStatus: 'OVERDUE',
  },
  {
    id: 'contact-2',
    firstName: 'Marcus',
    lastName: 'Vance',
    title: 'Lead Tech Recruiter',
    email: 'marcus.vance@airbnb-demo.com',
    linkedin: 'https://linkedin.com/in/marcus-vance-talent',
    type: 'RECRUITER',
    company: { id: 'comp-airbnb', name: 'Airbnb' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    interactions: [
      {
        id: 'int-2',
        type: 'LINKEDIN_MESSAGE',
        direction: 'OUTBOUND',
        content: 'Connected on LinkedIn referencing the Staff Frontend Engineer opening.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
      },
      {
        id: 'int-3',
        type: 'LINKEDIN_MESSAGE',
        direction: 'INBOUND',
        content: 'Thanks for reaching out! Your profile looks solid. Could you send over a resume and preferred time for a quick 15-min chat?',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
      },
    ],
    nextFollowUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
    followUpStatus: 'UPCOMING',
  },
  {
    id: 'contact-3',
    firstName: 'Elena',
    lastName: 'Rostova',
    title: 'Senior Staff Infrastructure Engineer',
    email: 'elena.rostova@linear-demo.com',
    linkedin: 'https://linkedin.com/in/elena-rostova-dev',
    type: 'PEER_REFERRER',
    company: { id: 'comp-linear', name: 'Linear' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    interactions: [
      {
        id: 'int-4',
        type: 'COFFEE_CHAT',
        direction: 'OUTBOUND',
        content: 'Had a 20-min informal coffee chat discussing their synchronization engine and sync architecture.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
      },
    ],
    nextFollowUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    followUpStatus: 'SCHEDULED',
  },
];

export async function fetchContacts(): Promise<ContactItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return FALLBACK_CONTACTS;
  }
}

export async function fetchFollowUps(): Promise<FollowUpItem[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/contacts/pipeline/follow-ups`);
    if (!res.ok) throw new Error('Failed to fetch');
    return await res.json();
  } catch {
    return [
      {
        contactId: 'contact-1',
        contactName: 'Sarah Chen',
        title: 'Head of Engineering',
        companyName: 'Stripe',
        type: 'HIRING_MANAGER',
        dueDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(),
        daysOverdue: 1,
        isOverdue: true,
        status: 'OVERDUE',
        lastInteraction: FALLBACK_CONTACTS[0]?.interactions?.[0] || null,
        recommendedAction: 'Send polite Follow-Up ping (Day 1 overdue)',
      },
    ];
  }
}

export async function createContact(data: {
  companyName: string;
  firstName: string;
  lastName: string;
  title?: string;
  email?: string;
  linkedin?: string;
  type: string;
  initialNote?: string;
}): Promise<ContactItem> {
  const res = await fetch(`${API_BASE_URL}/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create contact');
  return await res.json();
}

export async function deleteContact(id: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/contacts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete contact');
}

export async function logInteraction(
  contactId: string,
  data: {
    type: string;
    direction: 'OUTBOUND' | 'INBOUND';
    content: string;
    nextFollowUpDays?: number;
  }
): Promise<InteractionItem> {
  const res = await fetch(`${API_BASE_URL}/contacts/${contactId}/interactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to log interaction');
  return await res.json();
}

export async function generateOutreachDraft(
  payload: GenerateOutreachPayload
): Promise<OutreachDraftResult> {
  const res = await fetch(`${API_BASE_URL}/contacts/outreach/draft`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to generate draft');
  return await res.json();
}

export interface FunnelStageItem {
  stage: string;
  label: string;
  count: number;
  conversionFromPrevious: number;
  dropoffRate: number;
  averageDaysInStage: number;
}

export interface RolePerformanceItem {
  roleTitle: string;
  applications: number;
  interviews: number;
  offers: number;
  conversionRate: number;
  averageFitScore: number;
}

export interface FitTierItem {
  tier: string;
  rangeLabel: string;
  applications: number;
  interviews: number;
  interviewRate: number;
}

export interface FunnelAnalyticsData {
  stages: FunnelStageItem[];
  overallConversionRate: number;
  totalSaved: number;
  totalApplied: number;
  totalInterviews: number;
  totalOffers: number;
  totalOutreaches: number;
  outreachResponseRate: number;
  averageCycleTimeDays: number;
  roleBreakdown: RolePerformanceItem[];
  fitScoreCorrelation: FitTierItem[];
}

export interface BottleneckItem {
  id: string;
  stage: string;
  severity: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  title: string;
  description: string;
  metric: string;
  industryBenchmark: string;
  recommendedAction: string;
}

export interface StrategyDiagnosisData {
  overallHealth: 'EXCELLENT' | 'SOLID' | 'NEEDS_ADJUSTMENT' | 'AT_RISK';
  summaryHeadline: string;
  executiveSummary: string;
  bottlenecks: BottleneckItem[];
  highFitLeverageMultiplier: number;
  tacticalRecommendations: string[];
}

export interface JobAlertItem {
  id: string;
  type: string;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM';
  title: string;
  message: string;
  timestamp: string;
  actionUrl: string;
  actionLabel: string;
}

export async function fetchFunnelAnalytics(): Promise<FunnelAnalyticsData> {
  const res = await fetch(`${API_BASE_URL}/analytics/funnel`);
  if (!res.ok) throw new Error('Failed to fetch funnel analytics');
  return await res.json();
}

export async function fetchStrategyDiagnosis(): Promise<StrategyDiagnosisData> {
  const res = await fetch(`${API_BASE_URL}/analytics/diagnosis`);
  if (!res.ok) throw new Error('Failed to fetch strategy diagnosis');
  return await res.json();
}

export async function fetchAlerts(): Promise<JobAlertItem[]> {
  const res = await fetch(`${API_BASE_URL}/analytics/alerts`);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return await res.json();
}

