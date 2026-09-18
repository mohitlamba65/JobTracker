import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';

const router = Router();

const RoleProfileSchema = z.object({
  candidateId: z.string().uuid(),
  targetRoleTitle: z.string().min(1),
  seniority: z.string().optional(),
  positioningStatement: z.string().optional(),
  skills: z.array(z.string()).optional(),
});

// Create a new role positioning profile
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const data = RoleProfileSchema.parse(req.body);
    
    const roleProfile = await prisma.roleProfile.create({
      data: {
        candidateId: data.candidateId,
        targetRoleTitle: data.targetRoleTitle,
        seniority: data.seniority || null,
        positioningStatement: data.positioningStatement || null,
        skills: (data.skills ?? []) as any,
      },
    });

    res.status(201).json(roleProfile);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues });
      return;
    }
    console.error('Failed to create role profile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all role profiles for a candidate
router.get('/candidate/:candidateId', async (req: Request, res: Response) => {
  try {
    const candidateId = String(req.params['candidateId']);
    const roleProfiles = await prisma.roleProfile.findMany({
      where: { candidateId },
      orderBy: { createdAt: 'desc' },
    });

    res.json(roleProfiles);
  } catch (error) {
    console.error('Failed to fetch role profiles:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
