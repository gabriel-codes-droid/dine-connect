import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { AlertCircle, FileText, Loader2, Send, ShieldCheck } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout';
import DashboardPageHeader from '../components/layout/DashboardPageHeader';
import { auth } from '../services/auth';
import { reportService } from '../firebase';
import type { IssueReport, ReportCategory, ReportStatus } from '../firebase';

const CATEGORY_OPTIONS: Array<{ value: ReportCategory; label: string }> = [
  { value: 'restaurant', label: 'Restaurant issue' },
  { value: 'order', label: 'Order issue' },
  { value: 'reservation', label: 'Reservation issue' },
  { value: 'account', label: 'Account or profile' },
  { value: 'technical', label: 'Technical problem' },
  { value: 'other', label: 'Other' },
];

const STATUS_LABELS: Record<ReportStatus, string> = {
  open: 'Open',
  in_review: 'In review',
  resolved: 'Resolved',
};

function formatDate(value: IssueReport['createdAt']): string {
  if (!value) return 'Date unavailable';
  const date = typeof (value as any).toDate === 'function' ? (value as any).toDate() : new Date(value as any);
  if (Number.isNaN(date.getTime())) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function statusClasses(status: ReportStatus): string {
  if (status === 'resolved') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200';
  if (status === 'in_review') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200';
  return 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200';
}

function ReportForm({ sessionUid, reporterName, reporterEmail, onCreated }: {
  sessionUid: string;
  reporterName: string;
  reporterEmail: string;
  onCreated: () => void;
}) {
  const [category, setCategory] = useState<ReportCategory>('technical');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const cleanSubject = subject.trim();
    const cleanDescription = description.trim();
    if (!cleanSubject || !cleanDescription) {
      setError('Add a short subject and explain what happened before submitting.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await reportService.createReport({
        reporterId: sessionUid,
        reporterName,
        reporterEmail,
        category,
        subject: cleanSubject,
        description: cleanDescription,
      });
      setSubject('');
      setDescription('');
      setCategory('technical');
      setSuccess(true);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'We could not submit your report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-lg border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card sm:p-6">
      <div className="mb-5 flex items-start gap-3">
        <div className="rounded-md bg-primary/10 p-2 text-primary"><AlertCircle size={20} /></div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Submit a report</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Tell us what went wrong. Your report will appear in Reported issues below.</p>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">{error}</div>}
      {success && <div className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">Report submitted. You can follow its status below.</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          Category
          <select value={category} onChange={(event) => setCategory(event.target.value as ReportCategory)} className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white">
            {CATEGORY_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-100">
          Subject
          <input value={subject} onChange={(event) => setSubject(event.target.value)} maxLength={120} placeholder="What is the problem?" className="mt-1.5 w-full rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
        </label>
      </div>
      <label className="mt-4 block text-sm font-medium text-gray-800 dark:text-gray-100">
        Details
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} maxLength={2000} rows={5} placeholder="Include the page, order, restaurant, or action involved and what you expected to happen." className="mt-1.5 w-full resize-y rounded-md border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-600 dark:bg-slate-900 dark:text-white" />
      </label>
      <div className="mt-4 flex justify-end">
        <button type="submit" disabled={saving} className="action-primary inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {saving ? 'Submitting…' : 'Submit report'}
        </button>
      </div>
    </form>
  );
}

function ReportList({ reports, isAdmin, updatingId, onStatusChange }: {
  reports: IssueReport[];
  isAdmin: boolean;
  updatingId: string | null;
  onStatusChange: (id: string, status: ReportStatus) => void;
}) {
  if (reports.length === 0) {
    return <div className="rounded-lg border border-dashed border-gray-300 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-dark-card"><FileText className="mx-auto mb-3 text-gray-400" size={38} /><p className="font-medium text-gray-800 dark:text-white">No reports yet</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Submitted reports will appear here.</p></div>;
  }

  return <div className="space-y-3">
    {reports.map((report) => (
      <article key={report.id} className="rounded-lg border border-border bg-white p-5 shadow-sm dark:border-dark-border dark:bg-dark-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-gray-900 dark:text-white">{report.subject}</h3>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(report.status)}`}>{STATUS_LABELS[report.status]}</span>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.category.replace('_', ' ')} · {formatDate(report.createdAt)}{isAdmin && ` · ${report.reporterName}`}</p>
          </div>
          {isAdmin && <select value={report.status} disabled={updatingId === report.id} onChange={(event) => onStatusChange(report.id, event.target.value as ReportStatus)} className="rounded-md border border-gray-300 bg-white px-2.5 py-2 text-sm text-gray-800 dark:border-slate-600 dark:bg-slate-900 dark:text-white"><option value="open">Open</option><option value="in_review">In review</option><option value="resolved">Resolved</option></select>}
        </div>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-700 dark:text-gray-200">{report.description}</p>
      </article>
    ))}
  </div>;
}

export default function Reports() {
  const session = auth.getSession();
  const sessionUid = session?.uid;
  const sessionRole = session?.role;
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionUid || !sessionRole) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsubscribe = reportService.subscribeToReports(sessionRole === 'super-admin' ? null : sessionUid, (nextReports) => {
      setReports(nextReports);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [sessionUid, sessionRole]);

  const isAdmin = sessionRole === 'super-admin';
  const subtitle = useMemo(() => isAdmin ? 'Review issues submitted by customers and restaurant teams.' : 'Submit an issue and track the reports you have already sent.', [isAdmin]);

  if (!session?.authenticated || !sessionUid || !sessionRole) return <Navigate to="/login" replace />;

  const handleStatusChange = async (id: string, status: ReportStatus) => {
    setUpdatingId(id);
    setError(null);
    try {
      await reportService.updateStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update the report status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <DashboardLayout userRole={sessionRole} userName={session.username} title="Reports">
      <div className="space-y-6">
        <DashboardPageHeader eyebrow="Support" title="Reports" subtitle={subtitle} icon={FileText} />
        <ReportForm sessionUid={sessionUid} reporterName={session.username} reporterEmail={session.email} onCreated={() => setError(null)} />
        {isAdmin && <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-gray-700 dark:text-gray-200"><div className="flex items-start gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-primary" size={18} /><p>As a super-admin, you can review every submitted report and update its status. Reports you submit are also included in this list.</p></div></div>}
        {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">{error}</div>}
        <section>
          <div className="mb-3"><h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reported issues</h2><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{isAdmin ? 'All reports submitted across DineConnect.' : 'Your submitted reports and their current status.'}</p></div>
          {loading ? <div className="flex items-center gap-2 rounded-lg border border-border bg-white p-5 text-sm text-gray-700 dark:border-dark-border dark:bg-dark-card dark:text-gray-200"><Loader2 className="animate-spin text-primary" size={18} /> Loading reports…</div> : <ReportList reports={reports} isAdmin={isAdmin} updatingId={updatingId} onStatusChange={handleStatusChange} />}
        </section>
      </div>
    </DashboardLayout>
  );
}
