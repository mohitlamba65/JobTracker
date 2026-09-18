import { useState, useEffect } from 'react';
import {
  TrendingUp,
  Target,
  Send,
  Award,
  AlertTriangle,
  CheckCircle2,
  Bell,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  fetchFunnelAnalytics,
  fetchStrategyDiagnosis,
  fetchAlerts,
} from '../lib/api';
import type {
  FunnelAnalyticsData,
  StrategyDiagnosisData,
  JobAlertItem,
} from '../lib/api';

export default function Analytics() {
  const navigate = useNavigate();
  const [funnelData, setFunnelData] = useState<FunnelAnalyticsData | null>(null);
  const [diagnosisData, setDiagnosisData] = useState<StrategyDiagnosisData | null>(null);
  const [alerts, setAlerts] = useState<JobAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState(false);

  useEffect(() => {
    async function loadAnalytics() {
      setLoading(true);
      try {
        const [funnel, diagnosis, alertList] = await Promise.all([
          fetchFunnelAnalytics(),
          fetchStrategyDiagnosis(),
          fetchAlerts(),
        ]);
        setFunnelData(funnel);
        setDiagnosisData(diagnosis);
        setAlerts(alertList);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  if (loading || !funnelData || !diagnosisData) {
    return (
      <div className="flex items-center justify-center h-96 text-muted-foreground text-sm">
        <div className="flex flex-col items-center gap-3">
          <Activity size={24} className="animate-spin text-primary" />
          <span>Computing pipeline conversion intelligence...</span>
        </div>
      </div>
    );
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'EXCELLENT':
        return {
          bg: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          dot: 'bg-emerald-400',
          label: 'Health: High Converting',
        };
      case 'SOLID':
        return {
          bg: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
          dot: 'bg-blue-400',
          label: 'Health: Solid Traction',
        };
      case 'NEEDS_ADJUSTMENT':
        return {
          bg: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
          dot: 'bg-amber-400',
          label: 'Health: Adjustment Recommended',
        };
      default:
        return {
          bg: 'bg-red-500/20 text-red-400 border-red-500/30',
          dot: 'bg-red-400',
          label: 'Health: Pipeline At Risk',
        };
    }
  };

  const healthBadge = getHealthBadge(diagnosisData.overallHealth);
  const appToInterviewRate =
    funnelData.totalApplied > 0
      ? Math.round((funnelData.totalInterviews / funnelData.totalApplied) * 100)
      : 0;

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <TrendingUp className="text-primary shrink-0" size={28} />
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Funnel Analytics & Strategy Diagnosis
            </h1>
            <div
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${healthBadge.bg}`}
            >
              <span className={`w-2 h-2 rounded-full ${healthBadge.dot} animate-pulse`} />
              {healthBadge.label}
            </div>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Deterministic job search metrics, bottleneck identification, and actionable quality diagnostics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAlertsDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-medium border border-white/10 transition-all cursor-pointer relative"
          >
            <Bell size={16} />
            <span>Triage Alerts</span>
            {alerts.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center ml-1 shadow-md">
                {alerts.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-wider font-semibold">
              App &rarr; Interview Yield
            </span>
            <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center">
              <Target size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">{appToInterviewRate}%</span>
              <span className="text-xs text-emerald-400 font-medium">
                Benchmark: 15–20%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {funnelData.totalInterviews} interviews from {funnelData.totalApplied} applied roles
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Human Outreach Response
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Send size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {funnelData.outreachResponseRate}%
              </span>
              <span className="text-xs text-blue-400 font-medium">
                Benchmark: 25–35%
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Direct engineering leader & recruiter messages
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Overall Offer Conversion
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Award size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {funnelData.overallConversionRate}%
              </span>
              <span className="text-xs text-emerald-400 font-medium">
                {funnelData.totalOffers} Active Offer(s)
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              From applied opportunity to final signed offer
            </p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs uppercase tracking-wider font-semibold">
              Search Velocity
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <Zap size={18} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-white">
                {funnelData.averageCycleTimeDays} days
              </span>
              <span className="text-xs text-purple-400 font-medium">
                Avg. Offer Cycle
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Discovery &rarr; Outreach &rarr; Onsite completion
            </p>
          </div>
        </div>
      </div>

      {/* Executive Strategy Diagnosis Banner */}
      <div className="glass-card rounded-2xl p-6 border border-white/15 bg-gradient-to-br from-primary/10 via-black/40 to-purple-950/20 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles size={18} />
              <span className="text-xs font-bold uppercase tracking-wider">
                Automated Strategy Diagnosis
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {diagnosisData.summaryHeadline}
            </h2>
            <p className="text-xs text-zinc-300 leading-relaxed">
              {diagnosisData.executiveSummary}
            </p>
          </div>

          <div className="bg-primary/20 border border-primary/30 rounded-xl p-4 shrink-0 text-center lg:text-left flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {diagnosisData.highFitLeverageMultiplier}x
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                The 80% Rule Multiplier
              </p>
              <p className="text-xs text-zinc-300 mt-0.5 max-w-[200px]">
                Higher interview yield when applying to 80%+ fit roles.
              </p>
            </div>
          </div>
        </div>

        {/* Tactical Next Steps */}
        <div className="mt-6 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3">
          {diagnosisData.tacticalRecommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-black/30 border border-white/10"
            >
              <div className="w-5 h-5 rounded-full bg-primary/30 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                {i + 1}
              </div>
              <p className="text-xs text-zinc-200 leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Funnel Visualization */}
      <div className="glass-card rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers size={18} className="text-primary" />
              Pipeline Conversion Funnel
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track drop-off and velocity at every milestone from saved to signed offer.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-white/5 border border-white/10 text-muted-foreground">
            Deterministic Rates
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {funnelData.stages.map((st, i) => {
            const isLast = i === funnelData.stages.length - 1;
            return (
              <div
                key={st.stage}
                className="p-4 rounded-xl bg-black/30 border border-white/10 flex flex-col justify-between hover:border-primary/40 transition-all group"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Step 0{i + 1}
                  </span>
                  <h4 className="font-semibold text-white text-sm group-hover:text-primary transition-colors">
                    {st.label}
                  </h4>
                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-white">{st.count}</span>
                    <span className="text-xs text-muted-foreground">opportunities</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-white/5 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Conversion:</span>
                    <span className="text-emerald-400 font-bold">
                      {st.conversionFromPrevious}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Avg. Dwell:</span>
                    <span className="text-zinc-300">{st.averageDaysInStage}d</span>
                  </div>
                  {!isLast && st.dropoffRate > 0 && (
                    <div className="flex justify-between items-center text-[11px] text-amber-400/80">
                      <span>Drop-off:</span>
                      <span>{st.dropoffRate}%</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid: Bottleneck Inspector & 80% Rule Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bottleneck Inspector */}
        <div className="glass-card rounded-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-amber-400" />
                Bottleneck Diagnostic Engine
              </h3>
              <span className="text-xs text-muted-foreground">Evaluated Criteria</span>
            </div>

            <div className="space-y-3">
              {diagnosisData.bottlenecks.map((item) => (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border transition-all ${
                    item.severity === 'CRITICAL'
                      ? 'bg-red-500/10 border-red-500/30'
                      : item.severity === 'WARNING'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-white/[0.03] border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        {item.stage}
                      </span>
                      <h4 className="font-semibold text-white text-sm mt-0.5">
                        {item.title}
                      </h4>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.severity === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-300'
                          : item.severity === 'WARNING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {item.severity}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-300 leading-relaxed mb-3">
                    {item.description}
                  </p>

                  <div className="p-2.5 rounded-lg bg-black/40 border border-white/10 text-xs flex justify-between items-center mb-2">
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="text-white font-semibold">{item.metric}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Benchmark: </span>
                      <span className="text-zinc-300">{item.industryBenchmark}</span>
                    </div>
                  </div>

                  <p className="text-xs text-primary font-medium flex items-center gap-1.5 mt-2">
                    <CheckCircle2 size={13} className="shrink-0" />
                    <span>Action: {item.recommendedAction}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* The 80% Rule Validation Matrix */}
        <div className="glass-card rounded-xl p-6 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-400" />
                The 80% Rule: Fit Score Yield
              </h3>
              <span className="text-xs text-muted-foreground">Deterministic Correlation</span>
            </div>

            <p className="text-xs text-muted-foreground mb-4">
              Validation of quality over mass-apply: how high-evidence alignment directly translates to interview calls.
            </p>

            <div className="space-y-4">
              {funnelData.fitScoreCorrelation.map((tier) => (
                <div
                  key={tier.tier}
                  className="p-4 rounded-xl bg-black/30 border border-white/10"
                >
                  <div className="flex justify-between items-center mb-2">
                    <div>
                      <span className="font-semibold text-white text-sm">
                        {tier.rangeLabel}
                      </span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({tier.applications} submitted)
                      </span>
                    </div>
                    <span
                      className={`text-sm font-bold ${
                        tier.interviewRate >= 30
                          ? 'text-emerald-400'
                          : tier.interviewRate > 0
                          ? 'text-blue-400'
                          : 'text-zinc-500'
                      }`}
                    >
                      {tier.interviewRate}% Interview Rate
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        tier.tier === 'HIGH_FIT'
                          ? 'bg-gradient-to-r from-primary to-emerald-400'
                          : tier.tier === 'MEDIUM_FIT'
                          ? 'bg-blue-500'
                          : 'bg-zinc-600'
                      }`}
                      style={{ width: `${Math.max(tier.interviewRate, 4)}%` }}
                    />
                  </div>

                  <div className="mt-2 text-[11px] text-muted-foreground flex justify-between">
                    <span>{tier.interviews} successful interview calls</span>
                    <span>
                      {tier.tier === 'HIGH_FIT'
                        ? 'Optimal yield zone'
                        : tier.tier === 'MEDIUM_FIT'
                        ? 'Requires tailoring'
                        : 'High rejection risk'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center justify-between">
            <span>Focusing on &gt;= 80% Fit Score saves ~14 hours of rejected applications weekly.</span>
            <button
              onClick={() => navigate('/opportunities')}
              className="text-xs font-semibold underline flex items-center gap-1 hover:text-white cursor-pointer"
            >
              Filter 80%+ JDs
              <ChevronRight size={12} />
            </button>
          </div>
        </div>
      </div>

      {/* Role Breakdown Performance */}
      <div className="glass-card rounded-xl border border-white/10 overflow-hidden">
        <div className="p-5 border-b border-white/10 bg-white/[0.02]">
          <h3 className="text-base font-bold text-white">
            Role Profile Conversion Breakdown
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Identify which target role positionings generate the highest traction.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-[11px] uppercase tracking-wider text-muted-foreground bg-black/40 border-b border-white/10">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Target Role</th>
                <th className="px-6 py-3.5 font-semibold">Applications</th>
                <th className="px-6 py-3.5 font-semibold">Interviews</th>
                <th className="px-6 py-3.5 font-semibold">Offers</th>
                <th className="px-6 py-3.5 font-semibold">Average Fit</th>
                <th className="px-6 py-3.5 font-semibold text-right">Conversion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {funnelData.roleBreakdown.map((role) => (
                <tr
                  key={role.roleTitle}
                  className="hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-6 py-4 font-semibold text-white">
                    {role.roleTitle}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">{role.applications}</td>
                  <td className="px-6 py-4 text-zinc-300">{role.interviews}</td>
                  <td className="px-6 py-4 text-emerald-400 font-bold">
                    {role.offers}
                  </td>
                  <td className="px-6 py-4 text-zinc-300">
                    <span className="px-2 py-0.5 rounded bg-primary/15 text-primary border border-primary/20 font-medium">
                      {role.averageFitScore}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-white">
                    {role.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER: Triage Alerts Hub */}
      {isAlertsDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-zinc-950 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Bell size={18} className="text-primary" />
                  <h3 className="text-lg font-bold text-white">
                    Actionable Opportunity & Follow-up Alerts
                  </h3>
                </div>
                <button
                  onClick={() => setIsAlertsDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {alerts.map((al) => (
                  <div
                    key={al.id}
                    className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2 hover:border-primary/40 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          al.priority === 'URGENT'
                            ? 'bg-red-500/20 text-red-300'
                            : al.priority === 'HIGH'
                            ? 'bg-primary/20 text-primary'
                            : 'bg-blue-500/20 text-blue-300'
                        }`}
                      >
                        {al.priority} • {al.type.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(al.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <h4 className="text-sm font-semibold text-white">{al.title}</h4>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {al.message}
                    </p>

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => {
                          setIsAlertsDrawerOpen(false);
                          navigate(al.actionUrl);
                        }}
                        className="flex items-center gap-1 text-xs text-primary font-semibold hover:underline cursor-pointer"
                      >
                        {al.actionLabel}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-muted-foreground">
                All alerts are generated dynamically from your active pipeline events.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
