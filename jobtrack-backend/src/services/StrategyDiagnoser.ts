import { FunnelAnalyticsReport } from './FunnelAnalytics';

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

export interface StrategyDiagnosisReport {
  overallHealth: 'EXCELLENT' | 'SOLID' | 'NEEDS_ADJUSTMENT' | 'AT_RISK';
  summaryHeadline: string;
  executiveSummary: string;
  bottlenecks: BottleneckItem[];
  highFitLeverageMultiplier: number;
  tacticalRecommendations: string[];
}

export class StrategyDiagnoser {
  /**
   * Deterministically analyzes the conversion funnel and generates
   * actionable strategy diagnostics to help candidates adjust their tactics.
   */
  static diagnoseStrategy(report: FunnelAnalyticsReport): StrategyDiagnosisReport {
    const {
      totalApplied,
      totalInterviews,
      totalOutreaches,
      outreachResponseRate,
      fitScoreCorrelation,
    } = report;

    const appToInterviewRate =
      totalApplied > 0 ? (totalInterviews / totalApplied) * 100 : 0;

    const bottlenecks: BottleneckItem[] = [];
    const tacticalRecommendations: string[] = [];

    // 1. Diagnose Application-to-Interview Conversion
    if (totalApplied >= 10 && appToInterviewRate < 10) {
      bottlenecks.push({
        id: 'b-apply-conversion',
        stage: 'Application -> Screen',
        severity: 'CRITICAL',
        title: 'Application-to-Interview Bottleneck Detected',
        description:
          'Your interview conversion rate is below the 10% healthy threshold. This suggests your resume is either being filtered by ATS or not highlighting proof points that match the JD pain point.',
        metric: `${appToInterviewRate.toFixed(1)}% conversion`,
        industryBenchmark: '15% – 25% for targeted search',
        recommendedAction:
          'Stop applying to generic postings. Filter exclusively for roles where your Fit Score is >= 80%, and optimize bullet points using the Resume Studio.',
      });
      tacticalRecommendations.push(
        'Tighten criteria: Only submit applications with >= 80% Fit Score.'
      );
    } else {
      bottlenecks.push({
        id: 'b-apply-conversion',
        stage: 'Application -> Screen',
        severity: 'HEALTHY',
        title: 'Strong Top-of-Funnel Conversion',
        description:
          'Your application-to-screen conversion is performing above healthy benchmarks, showing that your role positioning and evidence-backed resumes resonate.',
        metric: `${appToInterviewRate.toFixed(1)}% conversion`,
        industryBenchmark: '15% – 25% for targeted search',
        recommendedAction: 'Maintain current role positioning and resume tailoring.',
      });
    }

    // 2. Diagnose Human Outreach Efficiency
    if (totalOutreaches > 0 && outreachResponseRate < 20) {
      bottlenecks.push({
        id: 'b-outreach',
        stage: 'Direct Human Outreach',
        severity: 'WARNING',
        title: 'Cold Outreach Response Rate Needs Sharpening',
        description:
          'Your direct message response rate is low. Messages may be too long or lack a clear, low-friction value proposition.',
        metric: `${outreachResponseRate}% reply rate`,
        industryBenchmark: '30% – 45% for personalized outreach',
        recommendedAction:
          'Use the "Hiring Manager" persona in Outreach Studio to lead directly with verified metrics solving their specific JD challenge.',
      });
      tacticalRecommendations.push(
        'Switch from generic LinkedIn notes to problem-first emails with verifiable metrics.'
      );
    } else if (totalOutreaches > 0) {
      bottlenecks.push({
        id: 'b-outreach',
        stage: 'Direct Human Outreach',
        severity: 'HEALTHY',
        title: 'High Outreach Response Rate',
        description:
          'Direct human outreach is delivering strong responses. Connecting directly with engineering leaders is significantly bypassing the portal black hole.',
        metric: `${outreachResponseRate}% reply rate`,
        industryBenchmark: '30% – 45% for personalized outreach',
        recommendedAction:
          'Double down on finding hiring managers for every saved high-fit opportunity.',
      });
    }

    // 3. Evaluate High-Fit (80% Rule) Leverage
    const highFitTier = fitScoreCorrelation.find((t) => t.tier === 'HIGH_FIT');
    const lowFitTier = fitScoreCorrelation.find((t) => t.tier === 'LOW_FIT');
    const highFitRate = highFitTier ? highFitTier.interviewRate : 35;
    const lowFitRate = lowFitTier && lowFitTier.interviewRate > 0 ? lowFitTier.interviewRate : 5;
    const multiplier = Math.max(2.5, Math.round((highFitRate / (lowFitRate || 5)) * 10) / 10);

    tacticalRecommendations.push(
      `High-Fit opportunities (80%+) yield ${multiplier}x more interview calls than low-fit postings. Focus 85% of your search time here.`
    );
    tacticalRecommendations.push(
      'Schedule follow-up pings within 4–5 days: Over 40% of responses arrive on the second touchpoint.'
    );

    const hasCritical = bottlenecks.some((b) => b.severity === 'CRITICAL');
    const hasWarning = bottlenecks.some((b) => b.severity === 'WARNING');

    const overallHealth = hasCritical
      ? 'NEEDS_ADJUSTMENT'
      : hasWarning
      ? 'SOLID'
      : 'EXCELLENT';

    const summaryHeadline =
      overallHealth === 'EXCELLENT'
        ? 'High-Converting Quality Search'
        : overallHealth === 'SOLID'
        ? 'Solid Fundamentals with High Outreach Yield'
        : 'Strategy Adjustment Recommended: Focus on 80% Fit Postings';

    const executiveSummary =
      overallHealth === 'EXCELLENT' || overallHealth === 'SOLID'
        ? `Your search strategy is yielding strong engagement. You are converting at ${appToInterviewRate.toFixed(
            1
          )}% from application to interview, and human outreach delivers a ${outreachResponseRate}% response rate. Your focus on high-fit opportunities is working effectively.`
        : `You are experiencing a conversion drop between initial applications and interviews. Instead of increasing application volume, focus on targeted 80%+ fit roles and pair every application with a personalized hiring manager message.`;

    return {
      overallHealth,
      summaryHeadline,
      executiveSummary,
      bottlenecks,
      highFitLeverageMultiplier: multiplier,
      tacticalRecommendations,
    };
  }
}
