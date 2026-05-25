import { useState, useEffect } from 'react';
import { errorLogsApi, type ErrorLog } from '../api';
import { BugAntIcon, ClockIcon } from '@heroicons/react/24/outline';

export default function ErrorLogsPage() {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadLogs = async () => {
    try {
      const { data } = await errorLogsApi.getAll();
      setLogs(data || []);
    } catch { } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin" />
      <p className="text-zinc-400 font-bold animate-pulse uppercase tracking-widest text-[10px]">Analizando...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-600/20">
             <BugAntIcon className="w-7 h-7 text-white" />
           </div>
           <div>
            <h1 className="text-2xl font-black text-zinc-800 tracking-tighter">Bitácora de <span className="text-emerald-600">Eventos</span></h1>
            <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-widest">Abarrotes Villarreal</p>
           </div>
        </div>
        <div className="flex items-center gap-3 bg-emerald-50 px-6 py-3 rounded-2xl border border-emerald-100">
          <ClockIcon className="w-6 h-6 text-emerald-600 animate-pulse" />
          <div className="text-right">
            <div className="text-xl font-black text-zinc-800 font-mono leading-none tracking-tighter">{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
            <div className="text-[10px] text-zinc-400 uppercase tracking-widest font-black mt-1">{currentTime.toLocaleDateString([], { day: 'numeric', month: 'short' })}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Fecha / Suceso</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Módulo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-emerald-50/50 transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-emerald-600 border border-zinc-200 group-hover:border-emerald-200 group-hover:bg-emerald-50 transition-all">
                         <ClockIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-zinc-800">{new Date(log.createdAt).toLocaleString()}</p>
                        <p className="text-xs font-bold text-zinc-500 mt-1 leading-tight">{log.message}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-right">
                     <p className="text-[10px] font-black text-zinc-400 uppercase">{log.pantalla || 'SISTEMA'}</p>
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
