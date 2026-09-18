import React from 'react';

export default function Opportunities() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Opportunities</h1>
          <p className="text-muted-foreground mt-1">Discover and evaluate new job postings.</p>
        </div>
      </div>
      
      <div className="glass-card flex-1 rounded-xl p-8 flex items-center justify-center border-dashed border-2 border-white/10 bg-transparent">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8"/><path d="M3 16.2V21m0 0h4.8M3 21l6-6"/><path d="M21 7.8V3m0 0h-4.8M21 3l-6 6"/><path d="M3 7.8V3m0 0h4.8M3 3l6 6"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-white">No opportunities found</h3>
          <p className="text-sm text-muted-foreground mt-2">Connect your email or manually add jobs to start building your pipeline.</p>
          <button className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            Add Job
          </button>
        </div>
      </div>
    </div>
  );
}
