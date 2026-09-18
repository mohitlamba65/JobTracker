import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { JDAnalyzer } from '../services/JDAnalyzer';
import { FitEngine, CandidateEvidence } from '../services/FitEngine';

const router = Router();

const CreateJobSchema = z.object({
  companyName: z.string().min(1),
  title: z.string().min(1),
  url: z.string().url().optional(),
  source: z.string().optional(),
  description: z.string().optional(),
  candidateId: z.string().uuid().optional(),
});

router.post('/', async (req: Request, res: Response) => {
  try {
    // 1. Validate request
    const data = CreateJobSchema.parse(req.body);

    // 2. Upsert Company (Deduplication)
    const company = await prisma.company.upsert({
      where: { name: data.companyName },
      update: {},
      create: { name: data.companyName },
    });

    // 3. Extract JD Requirements using JD Intelligence (Background-like async task)
    let requirements = null;
    let fitAnalysis = null;
    let fitScore = null;

    if (data.description) {
      requirements = await JDAnalyzer.extractRequirements(data.description);

      // 4. If candidate context provided, calculate Fit Score
      if (data.candidateId) {
        const candidate = await prisma.candidateProfile.findUnique({
          where: { id: data.candidateId },
        });

        if (candidate && candidate.evidence) {
          const evidence = candidate.evidence as any;
          const candidateEvidence: CandidateEvidence = {
            skills: Array.isArray(evidence.skills) ? evidence.skills : [],
            experience: Array.isArray(evidence.experience) ? evidence.experience : [],
          };

          const fitResult = FitEngine.calculateFit(candidateEvidence, requirements);
          fitAnalysis = fitResult;
          fitScore = fitResult.score;
        }
      }
    }

    // 5. Create Job and Application entity
    const job = await prisma.job.create({
      data: {
        companyId: company.id,
        title: data.title,
        url: data.url || null,
        source: data.source || null,
        description: data.description || null,
        requirements: (requirements ?? {}) as any,
      },
    });

    // Link it to pipeline by creating an Application in "SAVED" state
    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        status: 'SAVED',
        fitScore,
        fitAnalysis: (fitAnalysis ?? {}) as any,
      }
    });

    res.status(201).json({ job, application, fitAnalysis });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.issues || error.message });
      return;
    }
    console.error('Failed to ingest job:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
