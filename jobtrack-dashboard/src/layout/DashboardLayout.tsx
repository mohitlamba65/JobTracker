import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Briefcase, LayoutDashboard, Users, User, Bell, Target, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-64 flex-shrink-0 glass border-r border-white/10 z-20 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-lg shadow-[0_0_15px_rgba(var(--primary),0.5)]">
              J
            </div>
            <span className="font-semibold text-lg tracking-wide text-white">JobTrack</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
          <NavItem to="/opportunities" icon={<LayoutDashboard size={20} />} label="Opportunities" />
          <NavItem to="/applications" icon={<Briefcase size={20} />} label="Applications" />
          <NavItem to="/contacts" icon={<Users size={20} />} label="Contacts" />
          
          <div className="pt-4 pb-2">
            <p className="px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">Preparation</p>
          </div>
          <NavItem to="/roles" icon={<Target size={20} />} label="Role Profiles" />
          <NavItem to="/resume" icon={<FileText size={20} />} label="Resume Studio" />
        </nav>

        <div className="p-4 border-t border-white/10">
          <NavItem to="/profile" icon={<User size={20} />} label="My Profile" />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        {/* Header - Glassmorphism */}
        <header className="h-16 glass border-b border-white/10 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center">
            {/* Page Title placeholder, could be dynamic */}
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-muted-foreground hover:text-white">
              <Bell size={20} />
            </button>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-purple-600 border border-white/20 shadow-md"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group",
          isActive
            ? "bg-primary/20 text-white shadow-sm border border-primary/20"
            : "text-muted-foreground hover:bg-white/5 hover:text-white"
        )
      }
    >
      <span className="group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      <span className="font-medium text-sm">{label}</span>
    </NavLink>
  );
}
