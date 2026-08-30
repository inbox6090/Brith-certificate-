import React from 'react';
import { ActivityLog } from '../types';
import { History, X, Clock, ShieldCheck, Trash2 } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  onClearLogs
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="px-5 py-4 bg-emerald-950 text-emerald-50 flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm sm:text-base">
                Audit &amp; Activity Logs (অডিট ও কার্যক্রম লগ)
              </h3>
              <p className="text-xs text-emerald-300">
                User and system actions tracked locally for demonstration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-400 hover:text-white p-1 rounded transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Logs List */}
        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-slate-100 flex-1 space-y-2">
          {logs.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No activity logs recorded yet.</p>
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="pt-2 pb-2 flex items-start justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        log.action === 'Created'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.action === 'Updated'
                          ? 'bg-blue-100 text-blue-800'
                          : log.action === 'Deleted'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {log.action}
                    </span>
                    {log.referenceId && (
                      <span className="font-mono text-slate-700 font-semibold">
                        {log.referenceId}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-800 font-medium">{log.description}</p>
                </div>
                <span className="text-[10px] text-slate-400 whitespace-nowrap font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()} • {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Local prototype auditing enabled</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-md text-xs font-semibold transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
