import React from 'react';

export const JobsManagementTab: React.FC = () => {
  const jobs = [
    { jobId: 'job-render-demo-101', sessionId: 'gen-sess-demo-completed', status: 'Completed', progress: 100, elapsedMs: 3200 },
    { jobId: 'job-render-102', sessionId: 'gen-sess-102', status: 'Running', progress: 45, elapsedMs: 1200 },
    { jobId: 'job-render-103', sessionId: 'gen-sess-103', status: 'Queued', progress: 0, elapsedMs: 0 }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow space-y-4">
      <div>
        <h3 className="text-xl font-bold text-white">Production Jobs & Queue Manager</h3>
        <p className="text-xs text-slate-400">Monitor active render jobs, worker threads, and queue throughput</p>
      </div>

      <div className="space-y-3">
        {jobs.map(job => (
          <div key={job.jobId} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="font-mono font-bold text-indigo-400">{job.jobId}</span>
              <p className="text-slate-400 mt-0.5">Session: <strong className="text-slate-300">{job.sessionId}</strong></p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-32 bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full transition-all" style={{ width: `${job.progress}%` }} />
              </div>
              <span className="text-slate-300 font-semibold">{job.progress}%</span>
              <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase ${
                job.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                job.status === 'Running' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/30' :
                'bg-amber-500/10 text-amber-400 border border-amber-500/30'
              }`}>
                {job.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
