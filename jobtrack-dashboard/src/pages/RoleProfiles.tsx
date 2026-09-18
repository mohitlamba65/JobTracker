import React from 'react';
import { Target, Plus } from 'lucide-react';

export default function RoleProfiles() {
  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Role Positioning</h1>
          <p className="text-muted-foreground mt-1">Create distinct profiles to target different roles.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Plus size={16} />
          New Profile
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card 1 */}
        <div className="glass-card rounded-xl p-6 border border-primary/30 relative overflow-hidden group cursor-pointer hover:border-primary transition-colors">
          <div className="absolute top-0 right-0 p-3">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary px-2 py-1 rounded-full border border-primary/30">Primary</span>
          </div>
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Frontend Engineer</h2>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            Positioning focusing heavily on React, performance tuning, UI/UX, and complex state management on the client side.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">React</span>
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">TypeScript</span>
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">Tailwind</span>
          </div>
        </div>

        {/* Profile Card 2 */}
        <div className="glass-card rounded-xl p-6 border border-white/10 relative overflow-hidden group cursor-pointer hover:border-white/30 transition-colors">
          <div className="w-12 h-12 rounded-lg bg-white/5 flex items-center justify-center mb-4 text-muted-foreground group-hover:text-white group-hover:scale-110 transition-all">
            <Target size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Full Stack Developer</h2>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            Positioning emphasizing end-to-end ownership, API design, database modeling, and scalable architecture.
          </p>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">Node.js</span>
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">PostgreSQL</span>
            <span className="px-2 py-1 bg-white/5 rounded-md text-xs font-medium text-white border border-white/10">Prisma</span>
          </div>
        </div>
      </div>
    </div>
  );
}
