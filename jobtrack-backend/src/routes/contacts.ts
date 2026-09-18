import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import {
  OutreachDrafter,
  OutreachPersonaEnum,
  OutreachChannelEnum,
} from '../services/OutreachDrafter';

const router = Router();

// In-memory fallback mock contacts for rich local testing & immediate productivity
let mockContacts: any[] = [
  {
    id: 'contact-1',
    firstName: 'Sarah',
    lastName: 'Chen',
    title: 'Head of Engineering',
    email: 'sarah.chen@stripe-demo.com',
    linkedin: 'https://linkedin.com/in/sarah-chen-eng',
    type: 'HIRING_MANAGER',
    companyId: 'comp-stripe',
    company: { id: 'comp-stripe', name: 'Stripe' },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    interactions: [
      {
        id: 'int-1',
        type: 'COLD_EMAIL',
        direction: 'OUTBOUND',
        content: 'Sent cold outreach sharing distributed systems scaling results and latency optimization.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      },
    ],
    nextFollowUpDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString(), // Overdue by 1 day!
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
    companyId: 'comp-airbnb',
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
    nextFollowUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(), // Due tomorrow
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
    companyId: 'comp-linear',
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

const CreateContactSchema = z.object({
  companyName: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  title: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  linkedin: z.string().url().optional().or(z.literal('')),
  type: z.enum(['HIRING_MANAGER', 'RECRUITER', 'PEER_REFERRER', 'OTHER']).default('HIRING_MANAGER'),
  initialNote: z.string().optional(),
});

const LogInteractionSchema = z.object({
  contactId: z.string(),
  applicationId: z.string().optional(),
  type: z.string(),
  direction: z.enum(['OUTBOUND', 'INBOUND']),
  content: z.string().min(1),
  nextFollowUpDays: z.number().optional(),
});

const GenerateOutreachSchema = z.object({
  persona: OutreachPersonaEnum,
  channel: OutreachChannelEnum,
  recipientName: z.string().min(1),
  recipientTitle: z.string().optional(),
  companyName: z.string().min(1),
  jobTitle: z.string().optional(),
  candidateName: z.string().default('Candidate'),
  candidateEvidence: z.object({
    skills: z.array(z.string()),
    experience: z.array(z.string()),
  }),
  businessProblem: z.string().optional(),
  keyJobRequirements: z.array(z.string()).optional(),
  previousTouchpointSummary: z.string().optional(),
});

// GET /api/contacts - List all contacts with interactions
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    try {
      const contacts = await prisma.contact.findMany({
        include: {
          company: true,
          interactions: {
            orderBy: { timestamp: 'desc' },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });
      if (contacts && contacts.length > 0) {
        res.json(contacts);
        return;
      }
    } catch {
      // Prisma query fallback if table or db not migrated yet
    }
    res.json(mockContacts);
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// GET /api/contacts/pipeline/follow-ups - Follow-up Action Queue
router.get('/pipeline/follow-ups', async (_req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();
    const followUps = mockContacts
      .filter((c) => c.nextFollowUpDate)
      .map((c) => {
        const dueDate = new Date(c.nextFollowUpDate);
        const diffMs = dueDate.getTime() - now.getTime();
        const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const isOverdue = diffDays < 0;

        return {
          contactId: c.id,
          contactName: `${c.firstName} ${c.lastName}`,
          title: c.title,
          companyName: c.company?.name || 'Company',
          type: c.type,
          dueDate: c.nextFollowUpDate,
          daysOverdue: isOverdue ? Math.abs(diffDays) : 0,
          isOverdue,
          status: isOverdue ? 'OVERDUE' : diffDays <= 2 ? 'DUE_SOON' : 'UPCOMING',
          lastInteraction: c.interactions?.[c.interactions.length - 1] || null,
          recommendedAction: isOverdue
            ? `Send polite Follow-Up ping (Day ${Math.abs(diffDays)} overdue)`
            : 'Prepare follow-up materials',
        };
      })
      .sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));

    res.json(followUps);
  } catch (error) {
    console.error('Error calculating follow-ups:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/contacts - Create contact
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = CreateContactSchema.parse(req.body);

    const newContact = {
      id: `contact-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      title: data.title || '',
      email: data.email || null,
      linkedin: data.linkedin || null,
      type: data.type,
      companyId: `comp-${Date.now()}`,
      company: { id: `comp-${Date.now()}`, name: data.companyName },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      interactions: data.initialNote
        ? [
            {
              id: `int-${Date.now()}`,
              type: 'INITIAL_CONTACT',
              direction: 'OUTBOUND',
              content: data.initialNote,
              timestamp: new Date().toISOString(),
            },
          ]
        : [],
      nextFollowUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    };

    try {
      const company = await prisma.company.upsert({
        where: { name: data.companyName },
        update: {},
        create: { name: data.companyName },
      });

      const contact = await prisma.contact.create({
        data: {
          companyId: company.id,
          firstName: data.firstName,
          lastName: data.lastName,
          title: data.title || null,
          email: data.email || null,
          linkedin: data.linkedin || null,
          type: data.type,
        },
        include: { company: true, interactions: true },
      });
      res.status(201).json(contact);
      return;
    } catch {
      // Use fallback
      mockContacts.unshift(newContact);
      res.status(201).json(newContact);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error('Error creating contact:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/contacts/:id/interactions - Log interaction
router.post('/:id/interactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const contactId = String(req.params['id']);
    const data = LogInteractionSchema.parse({ ...req.body, contactId });

    const newInteraction = {
      id: `int-${Date.now()}`,
      contactId,
      applicationId: data.applicationId || null,
      type: data.type,
      direction: data.direction,
      content: data.content,
      timestamp: new Date().toISOString(),
    };

    // Update in-memory contact
    const contact = mockContacts.find((c) => c.id === contactId);
    if (contact) {
      if (!contact.interactions) contact.interactions = [];
      contact.interactions.unshift(newInteraction);
      if (data.nextFollowUpDays) {
        contact.nextFollowUpDate = new Date(
          Date.now() + 1000 * 60 * 60 * 24 * data.nextFollowUpDays
        ).toISOString();
      }
    }

    try {
      const interaction = await prisma.interaction.create({
        data: {
          contactId,
          applicationId: data.applicationId || null,
          type: data.type,
          direction: data.direction,
          content: data.content,
        },
      });
      res.status(201).json(interaction);
      return;
    } catch {
      res.status(201).json(newInteraction);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error('Error logging interaction:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /api/contacts/outreach/draft - Generate Tailored Outreach Draft
router.post('/outreach/draft', async (req: Request, res: Response): Promise<void> => {
  try {
    const params = GenerateOutreachSchema.parse(req.body);
    const draft = await OutreachDrafter.generateDraft(params);
    res.json(draft);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error('Error drafting outreach:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /api/contacts/:id - Remove contact
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const contactId = String(req.params['id']);
    mockContacts = mockContacts.filter((c) => c.id !== contactId);
    try {
      await prisma.contact.delete({ where: { id: contactId } });
    } catch {
      // Ignored for mock fallback
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting contact:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
