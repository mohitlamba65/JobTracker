import { Search, Filter, Plus, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

const MOCK_APPLICATIONS = [
  { id: '1', company: 'Acme Corp', role: 'Frontend Engineer', status: 'INTERVIEW', date: '2026-09-15', fit: 85 },
  { id: '2', company: 'TechStart', role: 'Full Stack Developer', status: 'APPLIED', date: '2026-09-17', fit: 92 },
  { id: '3', company: 'Global Systems', role: 'React Developer', status: 'SAVED', date: '2026-09-18', fit: 78 },
];

export default function Applications() {
  return (
    <div className="flex flex-col gap-6 h-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Applications CRM</h1>
          <p className="text-muted-foreground mt-1">Manage and track your active job search pipeline.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 glass-card rounded-md text-sm font-medium hover:bg-white/10 transition-colors">
            <Filter size={16} />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            <Plus size={16} />
            New Application
          </button>
        </div>
      </div>
      
      <div className="glass-card flex-1 rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        <div className="p-4 border-b border-white/10 flex gap-4 bg-white/5">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search companies, roles..." 
              className="w-full bg-black/20 border border-white/10 rounded-md py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-muted-foreground transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-black/40 sticky top-0 z-10 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 font-medium">Company</th>
                <th className="px-6 py-4 font-medium">Role</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Fit Score</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_APPLICATIONS.map((app) => (
                <tr key={app.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 font-medium text-white">{app.company}</td>
                  <td className="px-6 py-4 text-muted-foreground">{app.role}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-medium border",
                      app.status === 'INTERVIEW' && "bg-blue-500/10 text-blue-400 border-blue-500/20",
                      app.status === 'APPLIED' && "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
                      app.status === 'SAVED' && "bg-slate-500/10 text-slate-300 border-slate-500/20"
                    )}>
                      {app.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{app.date}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 rounded-full bg-black/40 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            app.fit >= 90 ? "bg-green-500" : app.fit >= 80 ? "bg-primary" : "bg-yellow-500"
                          )} 
                          style={{ width: `${app.fit}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-white">{app.fit}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-muted-foreground hover:text-white opacity-0 group-hover:opacity-100 transition-opacity p-1">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
