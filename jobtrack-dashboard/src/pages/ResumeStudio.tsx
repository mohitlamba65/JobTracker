import React from 'react';
import { FileText, Wand2, CheckCircle2 } from 'lucide-react';

export default function ResumeStudio() {
  return (
    <div className="flex flex-col gap-6 h-full max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Resume Studio</h1>
          <p className="text-muted-foreground mt-1">Generate JD-specific resumes backed strictly by your canonical evidence.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(var(--primary),0.3)]">
          <Wand2 size={16} />
          Optimize for JD
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Target Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Target Role Profile</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Frontend Engineer</option>
                  <option>Full Stack Developer</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">Target Job (JD)</label>
                <select className="w-full bg-black/20 border border-white/10 rounded-md p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50">
                  <option>Frontend Engineer at Acme Corp</option>
                  <option>React Developer at TechStart</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="glass-card rounded-xl p-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Evidence Validation</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">All generated claims are verified against your Canonical Profile.</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 size={18} className="text-green-400 shrink-0 mt-0.5" />
                <p className="text-sm text-muted-foreground">No metrics or outcomes were hallucinated.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card rounded-xl border border-white/10 p-8 overflow-y-auto">
          {/* Resume Preview */}
          <div className="bg-white text-black p-8 shadow-xl min-h-[800px] font-sans">
            <div className="text-center border-b-2 border-gray-300 pb-4 mb-6">
              <h1 className="text-3xl font-bold tracking-tight">John Doe</h1>
              <p className="text-gray-600 mt-1">San Francisco, CA | john@example.com | linkedin.com/in/johndoe</p>
            </div>
            
            <div className="mb-6">
              <h2 className="text-lg font-bold text-primary border-b border-gray-300 mb-2 uppercase tracking-wide">Professional Summary</h2>
              <p className="text-sm text-gray-800 leading-relaxed group relative">
                <span className="bg-yellow-100 cursor-help" title="AI Optimized for JD: Focuses on React performance tuning.">Experienced Frontend Engineer specializing in high-performance React applications. </span>
                Demonstrated ability to lead legacy migrations, notably improving TTI by 40% at TechCorp. Passionate about building accessible, dynamic web interfaces using modern TypeScript patterns.
              </p>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-primary border-b border-gray-300 mb-2 uppercase tracking-wide">Experience</h2>
              
              <div className="mb-4">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-bold text-gray-900">TechCorp</h3>
                  <span className="text-sm text-gray-600 font-medium">2023 - Present</span>
                </div>
                <div className="text-sm italic text-gray-700 mb-2">Senior Frontend Developer</div>
                <ul className="list-disc list-inside text-sm text-gray-800 space-y-1.5 ml-1">
                  <li className="bg-yellow-100 inline-block w-full cursor-help" title="Optimized: Emphasized 'React 18' and 'Zod' to match JD requirements.">Led migration of legacy dashboard to React 18, improving TTI by 40%.</li>
                  <li>Architected dynamic form engine using React Hook Form and Zod.</li>
                  <li>Mentored 3 junior developers and established frontend testing standards.</li>
                </ul>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-bold text-primary border-b border-gray-300 mb-2 uppercase tracking-wide">Skills</h2>
              <p className="text-sm text-gray-800 leading-relaxed">
                <span className="font-semibold">Languages & Frameworks:</span> TypeScript, React, Node.js, Next.js <br />
                <span className="font-semibold">Tools & Infrastructure:</span> Git, CI/CD, Prisma, Tailwind CSS
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
