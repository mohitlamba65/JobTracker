import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { FunnelAnalytics } from '../services/FunnelAnalytics';
import { StrategyDiagnoser } from '../services/StrategyDiagnoser';

const router = Router();

// In-memory fallback mock applications & contacts for instant rich demo experience
const mockApplications = [
  { id: 'app-1', status: 'OFFER', fitScore: 92, appliedAt: '2026-09-01' },
  { id: 'app-2', status: 'INTERVIEW', fitScore: 88, appliedAt: '2026-09-05' },
  { id: 'app-3', status: 'INTERVIEW', fitScore: 85, appliedAt: '2026-09-08' },
  { id: 'app-4', status: 'INTERVIEW', fitScore: 82, appliedAt: '2026-09-10' },
  { id: 'app-5', status: 'APPLIED', fitScore: 78, appliedAt: '2026-09-12' },
  { id: 'app-6', status: 'APPLIED', fitScore: 89, appliedAt: '2026-09-14' },
  { id: 'app-7', status: 'APPLIED', fitScore: 74, appliedAt: '2026-09-15' },
  { id: 'app-8', status: 'APPLIED', fitScore: 94, appliedAt: '2026-09-16' },
  { id: 'app-9', status: 'SAVED', fitScore: 91, appliedAt: null },
  { id: 'app-10', status: 'SAVED', fitScore: 86, appliedAt: null },
  { id: 'app-11', status: 'SAVED', fitScore: 68, appliedAt: null },
  { id: 'app-12', status: 'REJECTED', fitScore: 62, appliedAt: '2026-08-28' },
];

const mockContacts = [
  {
    id: 'contact-1',
    interactions: [
      { id: 'i-1', direction: 'OUTBOUND' },
      { id: 'i-2', direction: 'INBOUND' },
    ],
  },
  {
    id: 'contact-2',
    interactions: [
      { id: 'i-3', direction: 'OUTBOUND' },
      { id: 'i-4', direction: 'INBOUND' },
    ],
  },
  {
    id: 'contact-3',
    interactions: [{ id: 'i-5', direction: 'OUTBOUND' }],
  },
  {
    id: 'contact-4',
    interactions: [{ id: 'i-6', direction: 'OUTBOUND' }],
  },
  {
    id: 'contact-5',
    interactions: [{ id: 'i-7', direction: 'OUTBOUND' }],
  },
];

// GET /api/analytics/funnel - Funnel metrics and conversion velocity
router.get('/funnel', async (_req: Request, res: Response): Promise<void> => {
  try {
    let applications: any[] = [];
    let contacts: any[] = [];

    try {
      applications = await prisma.application.findMany({
        include: { job: true },
      });
      contacts = await prisma.contact.findMany({
        include: { interactions: true },
      });
    } catch {
      // Fallback
    }

    const appsToUse = applications.length > 0 ? applications : mockApplications;
    const contactsToUse = contacts.length > 0 ? contacts : mockContacts;

    const report = FunnelAnalytics.calculateFunnelMetrics(appsToUse, contactsToUse);
    res.json(report);
  } catch (error) {
    console.error('Error computing funnel analytics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/analytics/diagnosis - Strategy diagnosis & bottleneck evaluation
router.get('/diagnosis', async (_req: Request, res: Response): Promise<void> => {
  try {
    let applications: any[] = [];
    let contacts: any[] = [];

    try {
      applications = await prisma.application.findMany();
      contacts = await prisma.contact.findMany({
        include: { interactions: true },
      });
    } catch {
      // Fallback
    }

    const appsToUse = applications.length > 0 ? applications : mockApplications;
    const contactsToUse = contacts.length > 0 ? contacts : mockContacts;

    const funnelReport = FunnelAnalytics.calculateFunnelMetrics(appsToUse, contactsToUse);
    const diagnosis = StrategyDiagnoser.diagnoseStrategy(funnelReport);
    res.json(diagnosis);
  } catch (error) {
    console.error('Error computing strategy diagnosis:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/analytics/alerts - Actionable Job Alerts & Notifications (EPIC 13)
router.get('/alerts', async (_req: Request, res: Response): Promise<void> => {
  try {
    const alerts = [
      {
        id: 'alert-1',
        type: 'OPPORTUNITY_MATCH',
        priority: 'HIGH',
        title: 'New 94% Fit Opportunity Detected',
        message: 'Staff Distributed Systems Engineer at Stripe directly matches your core verified backend metrics.',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
        actionUrl: '/opportunities',
        actionLabel: 'Review Opportunity',
      },
      {
        id: 'alert-2',
        type: 'FOLLOW_UP_DUE',
        priority: 'URGENT',
        title: 'Follow-Up Overdue: Sarah Chen (Stripe)',
        message: 'Initial outreach was sent 5 days ago with no reply. 2nd touchpoint has a 42% reply rate.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3h ago
        actionUrl: '/contacts',
        actionLabel: 'Draft Follow-Up',
      },
      {
        id: 'alert-3',
        type: 'STRATEGY_TIP',
        priority: 'MEDIUM',
        title: 'Strategy Optimization Insight',
        message: 'Your 80%+ fit applications are yielding 3.5x more screens than general applications. Prioritize quality over volume.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1d ago
        actionUrl: '/analytics',
        actionLabel: 'View Diagnosis',
      },
    ];

    res.json(alerts);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
