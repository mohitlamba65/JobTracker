import React from 'react';

export default function Contacts() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Network & Contacts</h1>
          <p className="text-muted-foreground mt-1">Manage professional relationships and follow-ups.</p>
        </div>
      </div>
      
      <div className="glass-card flex-1 rounded-xl p-8 flex items-center justify-center border-dashed border-2 border-white/10 bg-transparent">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 text-primary">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h3 className="text-lg font-semibold text-white">No contacts yet</h3>
          <p className="text-sm text-muted-foreground mt-2">Start adding hiring managers, recruiters, and referrers to keep track of networking.</p>
          <button className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            Add Contact
          </button>
        </div>
      </div>
    </div>
  );
}
