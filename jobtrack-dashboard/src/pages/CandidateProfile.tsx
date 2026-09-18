import React from 'react';
import { Save, UserCircle } from 'lucide-react';

export default function CandidateProfile() {
  return (
    <div className="flex flex-col gap-6 h-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Canonical Profile</h1>
          <p className="text-muted-foreground mt-1">Your core professional data used to generate tailored resumes.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Save size={16} />
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          {/* Profile Summary Card */}
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-black/40 flex items-center justify-center border-2 border-primary/50 mb-4">
                <UserCircle size={48} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-bold text-white">John Doe</h2>
              <p className="text-primary font-medium text-sm mt-1">Software Engineer</p>
              <p className="text-muted-foreground text-sm mt-3">San Francisco, CA • Remote</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 border border-white/10 space-y-4">
            <h3 className="font-semibold text-white border-b border-white/10 pb-2">Target Roles</h3>
            <div className="space-y-2">
              <div className="px-3 py-2 bg-white/5 rounded-md text-sm text-white font-medium border border-white/5 flex justify-between">
                <span>Frontend Engineer</span>
                <span className="text-primary text-xs">Primary</span>
              </div>
              <div className="px-3 py-2 bg-white/5 rounded-md text-sm text-muted-foreground border border-white/5">
                Full Stack Developer
              </div>
            </div>
            <button className="w-full py-2 border border-dashed border-white/20 rounded-md text-sm text-muted-foreground hover:text-white hover:border-white/40 transition-colors">
              + Add Target Role
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Professional Summary</h3>
            <textarea 
              className="w-full h-32 bg-black/20 border border-white/10 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder:text-muted-foreground resize-none"
              placeholder="A brief overview of your experience and goals..."
              defaultValue="Experienced software engineer specializing in building high-performance React applications and scalable Node.js backends. Passionate about AI integration and creating exceptional user experiences."
            />
          </div>

          <div className="glass-card rounded-xl p-6 border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Verified Evidence</h3>
              <span className="text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30">
                Ground Truth
              </span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              This data serves as the source of truth for generating resumes. AI will not hallucinate facts not present here.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg border border-white/5 relative group">
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium text-white">Senior Frontend Developer <span className="text-muted-foreground font-normal">at TechCorp</span></h4>
                  <span className="text-xs text-muted-foreground">2023 - Present</span>
                </div>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>Led migration of legacy dashboard to React 18, improving TTI by 40%.</li>
                  <li>Architected dynamic form engine using React Hook Form and Zod.</li>
                  <li>Mentored 3 junior developers and established frontend testing standards.</li>
                </ul>
              </div>
            </div>

            <button className="w-full mt-4 py-3 border border-dashed border-white/20 rounded-md text-sm text-muted-foreground hover:text-white hover:border-white/40 transition-colors flex items-center justify-center gap-2">
               Upload Resume to Extract Evidence
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
