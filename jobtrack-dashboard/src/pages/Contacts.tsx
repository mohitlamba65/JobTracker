import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  ExternalLink,
  Clock,
  Sparkles,
  Send,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Calendar,
  X,
  Copy,
  ChevronRight,
  UserCheck,
  TrendingUp,
} from 'lucide-react';
import {
  fetchContacts,
  fetchFollowUps,
  createContact,
  logInteraction,
  generateOutreachDraft,
} from '../lib/api';
import type {
  ContactItem,
  FollowUpItem,
  OutreachDraftResult,
} from '../lib/api';

export default function Contacts() {
  const [contacts, setContacts] = useState<ContactItem[]>([]);
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');

  // Modals & Drawers state
  const [isNewContactModalOpen, setIsNewContactModalOpen] = useState(false);
  const [isOutreachModalOpen, setIsOutreachModalOpen] = useState(false);
  const [isLogInteractionModalOpen, setIsLogInteractionModalOpen] = useState(false);
  const [isTimelineDrawerOpen, setIsTimelineDrawerOpen] = useState(false);

  // Active contact for drawer/modals
  const [activeContact, setActiveContact] = useState<ContactItem | null>(null);

  // New Contact form state
  const [newContactForm, setNewContactForm] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    title: '',
    email: '',
    linkedin: '',
    type: 'HIRING_MANAGER',
    initialNote: '',
  });

  // Log interaction form state
  const [interactionForm, setInteractionForm] = useState({
    type: 'LINKEDIN_MESSAGE',
    direction: 'OUTBOUND' as 'OUTBOUND' | 'INBOUND',
    content: '',
    nextFollowUpDays: 4,
  });

  // Outreach Studio state
  const [outreachPersona, setOutreachPersona] = useState<
    'HIRING_MANAGER' | 'RECRUITER' | 'PEER_REFERRER' | 'FOLLOW_UP'
  >('HIRING_MANAGER');
  const [outreachChannel, setOutreachChannel] = useState<
    'EMAIL' | 'LINKEDIN_INMAIL' | 'LINKEDIN_CONNECTION'
  >('EMAIL');
  const [isDrafting, setIsDrafting] = useState(false);
  const [outreachDraft, setOutreachDraft] = useState<OutreachDraftResult | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [contactsData, followUpsData] = await Promise.all([
        fetchContacts(),
        fetchFollowUps(),
      ]);
      setContacts(contactsData);
      setFollowUps(followUpsData);
    } catch (err) {
      console.error('Failed to load contacts data:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filtered contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      `${c.firstName} ${c.lastName} ${c.company?.name || ''} ${c.title || ''}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (selectedTypeFilter === 'ALL') return true;
    if (selectedTypeFilter === 'OVERDUE') return c.followUpStatus === 'OVERDUE';
    return c.type === selectedTypeFilter;
  });

  // Open Outreach Studio with preselected persona & contact
  const handleOpenOutreachStudio = (
    contact: ContactItem,
    presetPersona?: 'HIRING_MANAGER' | 'RECRUITER' | 'PEER_REFERRER' | 'FOLLOW_UP'
  ) => {
    setActiveContact(contact);
    if (presetPersona) {
      setOutreachPersona(presetPersona);
    } else if (contact.type === 'RECRUITER') {
      setOutreachPersona('RECRUITER');
    } else if (contact.type === 'PEER_REFERRER') {
      setOutreachPersona('PEER_REFERRER');
    } else {
      setOutreachPersona('HIRING_MANAGER');
    }
    setOutreachDraft(null);
    setIsOutreachModalOpen(true);
  };

  // Open Log Interaction
  const handleOpenLogInteraction = (contact: ContactItem) => {
    setActiveContact(contact);
    setInteractionForm({
      type: 'LINKEDIN_MESSAGE',
      direction: 'OUTBOUND',
      content: '',
      nextFollowUpDays: 4,
    });
    setIsLogInteractionModalOpen(true);
  };

  // View timeline drawer
  const handleViewTimeline = (contact: ContactItem) => {
    setActiveContact(contact);
    setIsTimelineDrawerOpen(true);
  };

  // Create Contact submit
  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactForm.firstName || !newContactForm.companyName) return;

    try {
      const created = await createContact(newContactForm);
      setContacts((prev) => [created, ...prev]);
      setIsNewContactModalOpen(false);
      setNewContactForm({
        firstName: '',
        lastName: '',
        companyName: '',
        title: '',
        email: '',
        linkedin: '',
        type: 'HIRING_MANAGER',
        initialNote: '',
      });
      loadData();
    } catch (err) {
      console.error('Failed to create contact:', err);
    }
  };

  // Log Interaction submit
  const handleLogInteractionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContact || !interactionForm.content) return;

    try {
      await logInteraction(activeContact.id, interactionForm);
      setIsLogInteractionModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to log interaction:', err);
    }
  };

  // Run AI Outreach Drafter
  const handleGenerateDraft = async () => {
    if (!activeContact) return;
    setIsDrafting(true);
    try {
      const draft = await generateOutreachDraft({
        persona: outreachPersona,
        channel: outreachChannel,
        recipientName: `${activeContact.firstName} ${activeContact.lastName}`,
        recipientTitle: activeContact.title || 'Engineering Leader',
        companyName: activeContact.company?.name || 'Target Company',
        jobTitle: 'Senior / Staff Software Engineer',
        candidateName: 'Candidate',
        candidateEvidence: {
          skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Distributed Systems'],
          experience: [
            'Architected distributed microservices handling 15M+ events/day with 99.98% uptime',
            'Reduced p95 API response times by 40% using PostgreSQL connection pooling and indexing',
          ],
        },
        businessProblem:
          activeContact.company?.name === 'Stripe'
            ? 'Scaling global real-time checkout & high-volume payment throughput'
            : 'Scaling core product workflows and modernizing client latency',
        previousTouchpointSummary: activeContact.interactions?.[0]?.content,
      });
      setOutreachDraft(draft);
    } catch (err) {
      console.error('Failed to draft outreach:', err);
    } finally {
      setIsDrafting(false);
    }
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(label);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  // 1-Click: Log generated outreach to interaction timeline
  const handleLogDraftAsInteraction = async () => {
    if (!activeContact || !outreachDraft) return;
    try {
      await logInteraction(activeContact.id, {
        type: outreachChannel === 'EMAIL' ? 'COLD_EMAIL' : 'LINKEDIN_MESSAGE',
        direction: 'OUTBOUND',
        content: outreachDraft.body,
        nextFollowUpDays: outreachDraft.suggestedFollowUpDays,
      });
      setIsOutreachModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Failed to log outreach as interaction:', err);
    }
  };

  // Metrics calculation
  const totalContacts = contacts.length;
  const overdueCount = followUps.filter((f) => f.isOverdue).length;
  const dueSoonCount = followUps.filter((f) => f.status === 'DUE_SOON').length;
  const totalInteractions = contacts.reduce(
    (acc, c) => acc + (c.interactions?.length || 0),
    0
  );

  return (
    <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Networking CRM & Outreach Engine
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
              Phase 5 Active
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Human-first outreach powered by verified candidate evidence, zero hallucinations, and automated follow-up cadences.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewContactModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] cursor-pointer"
          >
            <Plus size={16} />
            Add Contact
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Total Network
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">{totalContacts}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Overdue Follow-ups
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-2xl font-bold text-amber-400">{overdueCount}</p>
              {overdueCount > 0 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                  Needs Attention
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Upcoming Follow-ups
            </p>
            <p className="text-2xl font-bold text-white mt-0.5">{dueSoonCount}</p>
          </div>
        </div>

        <div className="glass-card rounded-xl p-4 border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Total Touchpoints
            </p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{totalInteractions}</p>
          </div>
        </div>
      </div>

      {/* Follow-up Queue Highlight */}
      {followUps.length > 0 && (
        <div className="glass-card rounded-xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-transparent to-primary/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <h3 className="text-sm font-semibold text-white tracking-wide uppercase">
                Priority Follow-Up Queue
              </h3>
            </div>
            <span className="text-xs text-muted-foreground">
              {overdueCount} overdue • {dueSoonCount} due soon
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {followUps.map((item) => {
              const matchedContact = contacts.find((c) => c.id === item.contactId);
              return (
                <div
                  key={item.contactId}
                  className={`p-3.5 rounded-lg border transition-all ${
                    item.isOverdue
                      ? 'bg-amber-500/10 border-amber-500/40 hover:border-amber-400'
                      : 'bg-black/30 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {item.contactName}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {item.title} •{' '}
                        <span className="text-primary font-medium">
                          {item.companyName}
                        </span>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        item.isOverdue
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {item.isOverdue ? `${item.daysOverdue}d overdue` : 'Due soon'}
                    </span>
                  </div>

                  {item.lastInteraction && (
                    <p className="text-xs text-zinc-300 mt-2 line-clamp-1 italic bg-black/20 p-1.5 rounded">
                      &quot;{item.lastInteraction.content}&quot;
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(item.dueDate).toLocaleDateString()}
                    </span>
                    {matchedContact && (
                      <button
                        onClick={() =>
                          handleOpenOutreachStudio(matchedContact, 'FOLLOW_UP')
                        }
                        className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 transition-colors cursor-pointer"
                      >
                        <Sparkles size={12} />
                        Draft Follow-Up
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main CRM Contact Directory */}
      <div className="glass-card rounded-xl border border-white/10 flex flex-col overflow-hidden">
        {/* Filter & Search Bar */}
        <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between gap-4 bg-white/[0.02]">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
              size={16}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts by name, company, or title..."
              className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'ALL', label: 'All Contacts' },
              { id: 'HIRING_MANAGER', label: 'Hiring Managers' },
              { id: 'RECRUITER', label: 'Recruiters' },
              { id: 'PEER_REFERRER', label: 'Peers & Referrers' },
              { id: 'OVERDUE', label: 'Overdue Follow-ups' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTypeFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  selectedTypeFilter === tab.id
                    ? 'bg-primary text-white shadow-[0_0_12px_rgba(var(--primary),0.3)]'
                    : 'text-muted-foreground hover:text-white hover:bg-white/5'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Grid */}
        <div className="p-6">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Loading professional contacts...
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-16 text-center">
              <Users size={36} className="mx-auto text-muted-foreground mb-3 opacity-40" />
              <h3 className="text-base font-semibold text-white">No contacts found</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? 'No contacts matched your search query.'
                  : 'Start adding recruiters, engineering managers, and referrers to jumpstart your network.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  className="glass-card rounded-xl p-5 border border-white/10 hover:border-primary/40 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-primary/40 to-purple-600/40 border border-white/20 flex items-center justify-center text-white font-bold text-sm shadow-md">
                        {contact.firstName[0] || 'C'}
                        {contact.lastName[0] || ''}
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-base group-hover:text-primary transition-colors">
                          {contact.firstName} {contact.lastName}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {contact.title || 'Professional'}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/10">
                      {contact.company?.name || 'Company'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-zinc-400 font-medium">Persona:</span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
                        {contact.type.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-zinc-400">
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Mail size={13} />
                          <span className="line-clamp-1 max-w-[140px]">
                            {contact.email}
                          </span>
                        </a>
                      )}
                      {contact.linkedin && (
                        <a
                          href={contact.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink size={13} />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Last Interaction / Follow-Up Status */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock size={13} />
                      {contact.nextFollowUpDate ? (
                        <span
                          className={
                            contact.followUpStatus === 'OVERDUE'
                              ? 'text-amber-400 font-medium'
                              : 'text-zinc-300'
                          }
                        >
                          {contact.followUpStatus === 'OVERDUE'
                            ? 'Follow-up overdue'
                            : `Due ${new Date(contact.nextFollowUpDate).toLocaleDateString()}`}
                        </span>
                      ) : (
                        <span>No follow-up set</span>
                      )}
                    </div>

                    <button
                      onClick={() => handleViewTimeline(contact)}
                      className="text-xs text-primary hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <span>{contact.interactions?.length || 0} touchpoints</span>
                      <ChevronRight size={12} />
                    </button>
                  </div>

                  {/* Card Actions */}
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenOutreachStudio(contact)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-xs font-semibold transition-all cursor-pointer shadow-sm"
                    >
                      <Sparkles size={14} />
                      AI Outreach
                    </button>

                    <button
                      onClick={() => handleOpenLogInteraction(contact)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-medium transition-all cursor-pointer"
                    >
                      <MessageSquare size={14} />
                      Log Touchpoint
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: AI Personalized Outreach Studio */}
      {isOutreachModalOpen && activeContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="glass-card w-full max-w-2xl rounded-2xl border border-white/20 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsOutreachModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 text-primary mb-1">
              <Sparkles size={20} />
              <span className="text-xs uppercase font-bold tracking-wider">
                Evidence-Grounded Outreach Studio
              </span>
            </div>
            <h2 className="text-xl font-bold text-white">
              Personalized Outreach for {activeContact.firstName} {activeContact.lastName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {activeContact.title} at{' '}
              <span className="text-white font-medium">
                {activeContact.company?.name}
              </span>
            </p>

            {/* Persona & Channel Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                  Target Persona Strategy
                </label>
                <select
                  value={outreachPersona}
                  onChange={(e) => setOutreachPersona(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="HIRING_MANAGER">👔 Hiring Manager (Pain-point & Evidence)</option>
                  <option value="RECRUITER">🎯 Recruiter (Role match & Availability)</option>
                  <option value="PEER_REFERRER">🤝 Peer / Referrer (Craft & Engineering)</option>
                  <option value="FOLLOW_UP">⏰ Follow-Up (Courteous Value-Add Bump)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1.5 block">
                  Outreach Channel
                </label>
                <select
                  value={outreachChannel}
                  onChange={(e) => setOutreachChannel(e.target.value as any)}
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="EMAIL">📧 Cold Email (Subject + 3 Paragraphs)</option>
                  <option value="LINKEDIN_INMAIL">💼 LinkedIn InMail (Concise, High-impact)</option>
                  <option value="LINKEDIN_CONNECTION">⚡ LinkedIn Connection Note (&lt;280 chars)</option>
                </select>
              </div>
            </div>

            {/* Verified Candidate Evidence Guarantee Banner */}
            <div className="mt-4 p-3 rounded-lg bg-primary/10 border border-primary/20 flex items-start gap-2.5">
              <CheckCircle2 size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white">Strict Anti-Hallucination Policy: </span>
                Every technical claim is backed directly by your Canonical Candidate Evidence. No fake statistics or phantom experiences.
              </div>
            </div>

            {/* Generate Action */}
            <div className="mt-5 flex justify-end">
              <button
                onClick={handleGenerateDraft}
                disabled={isDrafting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(var(--primary),0.4)] disabled:opacity-50 cursor-pointer"
              >
                <Sparkles size={15} className={isDrafting ? 'animate-spin' : ''} />
                {isDrafting ? 'Drafting Evidence-Backed Message...' : 'Generate Personalized Message'}
              </button>
            </div>

            {/* Output Display */}
            {outreachDraft && (
              <div className="mt-5 space-y-4 pt-5 border-t border-white/10 animate-in fade-in slide-in-from-bottom-2">
                {outreachDraft.subject && (
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Subject Line
                      </span>
                      <button
                        onClick={() => handleCopy(outreachDraft.subject!, 'subject')}
                        className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Copy size={12} />
                        {copySuccess === 'subject' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                    <div className="p-3 bg-black/40 border border-white/15 rounded-lg text-sm text-white font-mono">
                      {outreachDraft.subject}
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Message Content
                    </span>
                    <button
                      onClick={() => handleCopy(outreachDraft.body, 'body')}
                      className="text-xs text-primary hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Copy size={12} />
                      {copySuccess === 'body' ? 'Copied Message!' : 'Copy Message'}
                    </button>
                  </div>
                  <div className="p-4 bg-black/40 border border-white/15 rounded-lg text-sm text-white whitespace-pre-wrap leading-relaxed">
                    {outreachDraft.body}
                  </div>
                </div>

                {/* Evidence Used & Follow-Up Recommendation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[11px] font-semibold text-emerald-400 block mb-1.5 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      Canonical Proof Points Used
                    </span>
                    <ul className="text-xs text-zinc-300 space-y-1">
                      {outreachDraft.proofPointsUsed.map((p, i) => (
                        <li key={i} className="line-clamp-1">
                          • {p}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-primary block mb-1 flex items-center gap-1">
                        <Clock size={13} />
                        Recommended Cadence
                      </span>
                      <p className="text-xs text-zinc-300">
                        Follow up in{' '}
                        <span className="text-white font-bold">
                          {outreachDraft.suggestedFollowUpDays} days
                        </span>{' '}
                        if no response is received.
                      </p>
                    </div>

                    <button
                      onClick={handleLogDraftAsInteraction}
                      className="mt-3 w-full py-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <UserCheck size={14} />
                      Log to CRM & Set Cadence
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: Add New Contact */}
      {isNewContactModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/20 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsNewContactModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-white">Add New Contact</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add a recruiter, hiring manager, or potential referrer to your networking CRM.
            </p>

            <form onSubmit={handleCreateContact} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactForm.firstName}
                    onChange={(e) =>
                      setNewContactForm({ ...newContactForm, firstName: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactForm.lastName}
                    onChange={(e) =>
                      setNewContactForm({ ...newContactForm, lastName: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newContactForm.companyName}
                    onChange={(e) =>
                      setNewContactForm({
                        ...newContactForm,
                        companyName: e.target.value,
                      })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newContactForm.title}
                    onChange={(e) =>
                      setNewContactForm({ ...newContactForm, title: e.target.value })
                    }
                    placeholder="e.g. Head of Engineering"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newContactForm.email}
                    onChange={(e) =>
                      setNewContactForm({ ...newContactForm, email: e.target.value })
                    }
                    placeholder="name@company.com"
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={newContactForm.linkedin}
                    onChange={(e) =>
                      setNewContactForm({ ...newContactForm, linkedin: e.target.value })
                    }
                    placeholder="https://linkedin.com/in/..."
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Contact Type
                </label>
                <select
                  value={newContactForm.type}
                  onChange={(e) =>
                    setNewContactForm({ ...newContactForm, type: e.target.value })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="HIRING_MANAGER">Hiring Manager</option>
                  <option value="RECRUITER">Technical Recruiter</option>
                  <option value="PEER_REFERRER">Peer / Potential Referrer</option>
                  <option value="OTHER">Other Professional</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Initial Notes / Touchpoint
                </label>
                <textarea
                  rows={2}
                  value={newContactForm.initialNote}
                  onChange={(e) =>
                    setNewContactForm({ ...newContactForm, initialNote: e.target.value })
                  }
                  placeholder="How did you find this contact or what is the context?"
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsNewContactModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md"
                >
                  Save Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Log Interaction */}
      {isLogInteractionModalOpen && activeContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-lg rounded-2xl border border-white/20 p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLogInteractionModalOpen(false)}
              className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-white">
              Log Touchpoint with {activeContact.firstName}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Record cold emails, calls, LinkedIn messages, and schedule the next follow-up.
            </p>

            <form onSubmit={handleLogInteractionSubmit} className="mt-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Channel / Type
                  </label>
                  <select
                    value={interactionForm.type}
                    onChange={(e) =>
                      setInteractionForm({ ...interactionForm, type: e.target.value })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="LINKEDIN_MESSAGE">LinkedIn Message</option>
                    <option value="COLD_EMAIL">Cold Email</option>
                    <option value="PHONE_CALL">Phone Call</option>
                    <option value="COFFEE_CHAT">Coffee Chat</option>
                    <option value="REFERRAL_REQUEST">Referral Request</option>
                    <option value="FOLLOW_UP">Follow-Up Ping</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-300 block mb-1">
                    Direction
                  </label>
                  <select
                    value={interactionForm.direction}
                    onChange={(e) =>
                      setInteractionForm({
                        ...interactionForm,
                        direction: e.target.value as any,
                      })
                    }
                    className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="OUTBOUND">Outbound (I reached out)</option>
                    <option value="INBOUND">Inbound (They replied)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Notes & Content *
                </label>
                <textarea
                  required
                  rows={3}
                  value={interactionForm.content}
                  onChange={(e) =>
                    setInteractionForm({ ...interactionForm, content: e.target.value })
                  }
                  placeholder="Key takeaways, answers, or sent message snippet..."
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-zinc-300 block mb-1">
                  Schedule Next Follow-Up In
                </label>
                <select
                  value={interactionForm.nextFollowUpDays}
                  onChange={(e) =>
                    setInteractionForm({
                      ...interactionForm,
                      nextFollowUpDays: Number(e.target.value),
                    })
                  }
                  className="w-full bg-black/40 border border-white/15 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value={3}>3 days (High urgency)</option>
                  <option value={4}>4 days (Standard follow-up)</option>
                  <option value={7}>7 days (1 week)</option>
                  <option value={14}>14 days (Long-term nurture)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsLogInteractionModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all cursor-pointer shadow-md"
                >
                  Save Touchpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DRAWER: Interaction Timeline */}
      {isTimelineDrawerOpen && activeContact && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-zinc-950 border-l border-white/10 p-6 flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div>
                  <h3 className="text-lg font-bold text-white">
                    {activeContact.firstName} {activeContact.lastName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {activeContact.title} at {activeContact.company?.name}
                  </p>
                </div>
                <button
                  onClick={() => setIsTimelineDrawerOpen(false)}
                  className="p-1 rounded-full hover:bg-white/10 text-muted-foreground hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-6">
                <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-4">
                  Touchpoint Timeline
                </h4>

                {(!activeContact.interactions ||
                  activeContact.interactions.length === 0) && (
                  <div className="py-12 text-center text-xs text-muted-foreground">
                    No interactions logged yet.
                  </div>
                )}

                <div className="space-y-4">
                  {activeContact.interactions?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold px-2 py-0.5 rounded text-[10px] ${
                            item.direction === 'OUTBOUND'
                              ? 'bg-primary/20 text-primary'
                              : 'bg-emerald-500/20 text-emerald-300'
                          }`}
                        >
                          {item.direction} • {item.type.replace('_', ' ')}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-white whitespace-pre-wrap leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex gap-2">
              <button
                onClick={() => {
                  setIsTimelineDrawerOpen(false);
                  handleOpenOutreachStudio(activeContact);
                }}
                className="flex-1 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles size={14} />
                Draft Outreach
              </button>
              <button
                onClick={() => {
                  setIsTimelineDrawerOpen(false);
                  handleOpenLogInteraction(activeContact);
                }}
                className="flex-1 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send size={14} />
                Log Touchpoint
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
