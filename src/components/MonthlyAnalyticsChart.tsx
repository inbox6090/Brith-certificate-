import React, { useState, useMemo } from 'react';
import { DemoRecord, RecordStatus } from '../types';
import {
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  BarChart3,
  PieChart as PieIcon,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Table as TableIcon
} from 'lucide-react';

interface MonthlyAnalyticsChartProps {
  records: DemoRecord[];
  onFilterStatus?: (status: string) => void;
}

interface MonthlyDataPoint {
  monthKey: string; // e.g. "2026-08"
  monthLabel: string; // e.g. "Aug 2026"
  monthLabelBn: string; // e.g. "আগস্ট ২০২৬"
  total: number;
  verified: number;
  drafts: number;
  pending: number;
  pendingTotal: number; // drafts + pending
  rate: number; // percentage
}

const MONTH_NAMES_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const MonthlyAnalyticsChart: React.FC<MonthlyAnalyticsChartProps> = ({
  records,
  onFilterStatus
}) => {
  const [chartType, setChartType] = useState<'composed' | 'area' | 'donut'>('composed');
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'all'>('6m');
  const [showTable, setShowTable] = useState<boolean>(false);

  // Parse and aggregate records by month
  const { monthlyData, overallStats } = useMemo(() => {
    const monthsMap: { [key: string]: { verified: number; drafts: number; pending: number; total: number } } = {};

    // Determine reference timeline: generate consecutive past months leading to August 2026
    const now = new Date(2026, 7, 30); // 2026-08-30
    const countMonths = timeRange === '6m' ? 6 : timeRange === '12m' ? 12 : 12;

    for (let i = countMonths - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;
      monthsMap[key] = { verified: 0, drafts: 0, pending: 0, total: 0 };
    }

    // Process actual records
    records.forEach(rec => {
      let recDate: Date | null = null;

      // Try createdAt (ISO)
      if (rec.createdAt) {
        const parsed = new Date(rec.createdAt);
        if (!isNaN(parsed.getTime())) {
          recDate = parsed;
        }
      }

      // Try dateOfRegistration (DD/MM/YYYY)
      if (!recDate && rec.dateOfRegistration) {
        const parts = rec.dateOfRegistration.split('/');
        if (parts.length === 3) {
          const d = parseInt(parts[0], 10);
          const m = parseInt(parts[1], 10) - 1;
          const y = parseInt(parts[2], 10);
          const parsed = new Date(y, m, d);
          if (!isNaN(parsed.getTime())) {
            recDate = parsed;
          }
        }
      }

      // Fallback to August 2026
      if (!recDate) {
        recDate = new Date(2026, 7, 15);
      }

      const y = recDate.getFullYear();
      const m = String(recDate.getMonth() + 1).padStart(2, '0');
      const key = `${y}-${m}`;

      if (!monthsMap[key]) {
        monthsMap[key] = { verified: 0, drafts: 0, pending: 0, total: 0 };
      }

      monthsMap[key].total += 1;
      if (rec.status === 'Verified Demo') {
        monthsMap[key].verified += 1;
      } else if (rec.status === 'Draft') {
        monthsMap[key].drafts += 1;
      } else if (rec.status === 'Pending Review') {
        monthsMap[key].pending += 1;
      }
    });

    // Synthetic distribution baseline for historical trend visualization if records are small in demo
    const keys = Object.keys(monthsMap).sort();
    
    // Convert to array of MonthlyDataPoint
    const points: MonthlyDataPoint[] = keys.map((key, index) => {
      const [yStr, mStr] = key.split('-');
      const mIdx = parseInt(mStr, 10) - 1;
      const monthLabel = `${MONTH_NAMES_EN[mIdx]} '${yStr.slice(2)}`;
      const monthLabelBn = `${MONTH_NAMES_BN[mIdx]} ${yStr}`;
      const entry = monthsMap[key];

      // Add baseline demo distribution if empty to show realistic historical context for prototype
      let verified = entry.verified;
      let drafts = entry.drafts;
      let pending = entry.pending;
      let total = entry.total;

      // Realistic historical baseline for standard UP monthly registry demo visualization
      if (total === 0 && index < keys.length - 1) {
        // baseline curve
        const baseOffset = (index + 1) * 3;
        verified = Math.max(1, (baseOffset % 7) + 4);
        drafts = Math.max(1, (baseOffset % 3) + 1);
        pending = Math.max(0, (baseOffset % 2));
        total = verified + drafts + pending;
      } else if (key === '2026-08' && total < records.length) {
        // Reflect all current demo records in current month
        const actualDrafts = records.filter(r => r.status === 'Draft').length;
        const actualPending = records.filter(r => r.status === 'Pending Review').length;
        const actualVerified = records.filter(r => r.status === 'Verified Demo').length;
        drafts = Math.max(drafts, actualDrafts);
        pending = Math.max(pending, actualPending);
        verified = Math.max(verified, actualVerified);
        total = drafts + pending + verified;
      }

      const pendingTotal = drafts + pending;
      const rate = total > 0 ? Math.round((verified / total) * 100) : 0;

      return {
        monthKey: key,
        monthLabel,
        monthLabelBn,
        total,
        verified,
        drafts,
        pending,
        pendingTotal,
        rate
      };
    });

    // Overall metrics
    const currentMonthPoint = points[points.length - 1] || { total: 0, verified: 0, drafts: 0, pending: 0, pendingTotal: 0, rate: 0 };
    const prevMonthPoint = points[points.length - 2] || { total: 0, verified: 0, drafts: 0, pending: 0, pendingTotal: 0, rate: 0 };
    
    const currentTotal = currentMonthPoint.total;
    const currentPending = currentMonthPoint.pendingTotal;
    const currentVerified = currentMonthPoint.verified;
    const prevTotal = prevMonthPoint.total;
    
    const monthlyGrowth = prevTotal > 0 
      ? Math.round(((currentTotal - prevTotal) / prevTotal) * 100)
      : 12;

    const allTimeVerified = records.filter(r => r.status === 'Verified Demo').length;
    const allTimeDrafts = records.filter(r => r.status === 'Draft').length;
    const allTimePending = records.filter(r => r.status === 'Pending Review').length;
    const allTimeTotal = records.length;
    const overallClearanceRate = allTimeTotal > 0 
      ? Math.round((allTimeVerified / allTimeTotal) * 100) 
      : 75;

    return {
      monthlyData: points,
      overallStats: {
        currentTotal,
        currentPending,
        currentVerified,
        monthlyGrowth,
        allTimeVerified,
        allTimeDrafts,
        allTimePending,
        allTimeTotal,
        overallClearanceRate
      }
    };
  }, [records, timeRange]);

  // Donut chart status data
  const statusPieData = useMemo(() => {
    const drafts = records.filter(r => r.status === 'Draft').length || 2;
    const pending = records.filter(r => r.status === 'Pending Review').length || 1;
    const verified = records.filter(r => r.status === 'Verified Demo').length || 4;
    const archived = records.filter(r => r.status === 'Archived').length || 0;

    return [
      { name: 'Verified Demo (অনুমোদিত সনদ)', value: verified, color: '#047857', statusKey: 'Verified Demo' },
      { name: 'Pending Review (পর্যালোচনাধীন)', value: pending, color: '#d97706', statusKey: 'Pending Review' },
      { name: 'Draft Records (খসড়া এন্ট্রি)', value: drafts, color: '#475569', statusKey: 'Draft' },
      ...(archived > 0 ? [{ name: 'Archived (সংরক্ষিত)', value: archived, color: '#94a3b8', statusKey: 'Archived' }] : [])
    ];
  }, [records]);

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as MonthlyDataPoint;
      return (
        <div className="bg-slate-900 text-white text-xs p-3 rounded-lg shadow-xl border border-slate-700 min-w-44">
          <p className="font-bold text-emerald-400 border-b border-slate-800 pb-1.5 font-['Noto_Sans_Bengali']">
            {data.monthLabelBn} ({data.monthLabel})
          </p>
          <div className="mt-2 space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block"></span>
                সম্পন্নকৃত নিবন্ধন:
              </span>
              <span className="font-bold text-emerald-400 font-mono">{data.verified} টি</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs bg-amber-500 inline-block"></span>
                অপেক্ষমাণ ড্রাফট/রিভিউ:
              </span>
              <span className="font-bold text-amber-400 font-mono">{data.pendingTotal} টি</span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1.5 border-t border-slate-800 font-semibold">
              <span className="text-white">সর্বমোট আবেদন:</span>
              <span className="font-bold text-white font-mono">{data.total} টি</span>
            </div>
            <div className="flex items-center justify-between gap-4 text-[11px] text-slate-400">
              <span>নিষ্পত্তির হার:</span>
              <span className="font-mono text-emerald-300 font-bold">{data.rate}%</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* 4 Summary Stat Cards Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Monthly Registrations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Monthly Registrations
              </span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <Calendar className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-slate-900 font-mono">
                {overallStats.currentTotal}
              </h3>
              <span className="text-xs text-slate-500 font-['Noto_Sans_Bengali']">টি এন্ট্রি</span>
            </div>
            <p className="text-xs text-slate-500 font-['Noto_Sans_Bengali'] mt-1">
              চলতি মাসের মোট নিবন্ধন আবেদন
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
              {overallStats.monthlyGrowth >= 0 ? (
                <>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+{overallStats.monthlyGrowth}%</span>
                </>
              ) : (
                <>
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  <span>{overallStats.monthlyGrowth}%</span>
                </>
              )}
            </span>
            <span className="text-slate-400 text-[11px]">vs পূর্ববর্তী মাস</span>
          </div>
        </div>

        {/* Card 2: Pending Drafts Records */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('Draft')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-amber-300 transition group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Drafts
              </span>
              <span className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
                <Clock className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-amber-700 font-mono">
                {overallStats.allTimeDrafts + overallStats.allTimePending}
              </h3>
              <span className="text-xs text-slate-500 font-['Noto_Sans_Bengali']">টি খসড়া</span>
            </div>
            <p className="text-xs text-slate-500 font-['Noto_Sans_Bengali'] mt-1">
              অপেক্ষমাণ খসড়া ও রিভিউ রেকর্ড
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>খসড়া: <strong className="text-slate-800">{overallStats.allTimeDrafts}</strong></span>
            <span className="text-slate-300">•</span>
            <span>রিভিউ: <strong className="text-amber-700">{overallStats.allTimePending}</strong></span>
          </div>
        </div>

        {/* Card 3: Completed & Verified Registrations */}
        <div 
          onClick={() => onFilterStatus && onFilterStatus('Verified Demo')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition group flex flex-col justify-between cursor-pointer"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Verified Registrations
              </span>
              <span className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-emerald-800 font-mono">
                {overallStats.allTimeVerified}
              </h3>
              <span className="text-xs text-slate-500 font-['Noto_Sans_Bengali']">টি যাচাইকৃত</span>
            </div>
            <p className="text-xs text-slate-500 font-['Noto_Sans_Bengali'] mt-1">
              যাচাইকৃত ও ইস্যুকৃত ডেমো সনদ
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-emerald-700 font-medium">QR/Barcode Ready</span>
            <span className="text-slate-400 text-[11px]">ইস্যু সম্পন্ন</span>
          </div>
        </div>

        {/* Card 4: Clearance & Verification Rate */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:border-blue-300 transition group flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Clearance Rate
              </span>
              <span className="p-1.5 bg-blue-50 text-blue-700 rounded-lg border border-blue-200">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-blue-900 font-mono">
                {overallStats.overallClearanceRate}%
              </h3>
              <span className="text-xs text-slate-500 font-['Noto_Sans_Bengali']">নিষ্পত্তি হার</span>
            </div>
            <p className="text-xs text-slate-500 font-['Noto_Sans_Bengali'] mt-1">
              আবেদন নিষ্পত্তি ও ভেরিফিকেশন গতি
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100">
            {/* Progress bar */}
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, overallStats.overallClearanceRate))}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Visual Data Chart Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Chart Header Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 font-['Noto_Sans_Bengali']">
                মাসিক জন্ম নিবন্ধন ও ড্রাফট পরিসংখ্যান (Monthly Registration Analytics)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              মাসভিত্তিক সম্পন্নকৃত নিবন্ধন ও পেন্ডিং ড্রাফট রেকর্ডের তুলনামূলক ভিজ্যুয়াল ডাটা অ্যানালিটিক্স
            </p>
          </div>

          {/* Controls: Chart Type & Period */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Chart Type Toggle */}
            <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartType('composed')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                  chartType === 'composed'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="মাসিক বার চার্ট"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">বার চার্ট</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('area')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                  chartType === 'area'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="ট্রেন্ড এরিয়া চার্ট"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ট্রেন্ড এরিয়া</span>
              </button>

              <button
                type="button"
                onClick={() => setChartType('donut')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                  chartType === 'donut'
                    ? 'bg-white text-emerald-800 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="স্ট্যাটাস পাই চার্ট"
              >
                <PieIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">স্ট্যাটাস ডোনাট</span>
              </button>
            </div>

            {/* Time range selector */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden shadow-2xs cursor-pointer"
            >
              <option value="6m">গত ৬ মাস (Last 6 Months)</option>
              <option value="12m">গত ১২ মাস (Last 12 Months)</option>
              <option value="all">সর্বমোট (All Time)</option>
            </select>

            {/* Table view toggle */}
            <button
              type="button"
              onClick={() => setShowTable(!showTable)}
              className={`p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                showTable
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
              }`}
              title="টেবিল ভিউ টগল করুন"
            >
              <TableIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Chart Canvas Area */}
        <div className="p-4 sm:p-6 bg-slate-50/40">
          {chartType === 'composed' && (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => {
                      if (value === 'verified') return <span className="text-slate-700 font-medium font-['Noto_Sans_Bengali']">সম্পন্নকৃত নিবন্ধন (Verified)</span>;
                      if (value === 'pendingTotal') return <span className="text-slate-700 font-medium font-['Noto_Sans_Bengali']">পেন্ডিং ড্রাফট/রিভিউ (Pending Drafts)</span>;
                      if (value === 'total') return <span className="text-slate-700 font-medium font-['Noto_Sans_Bengali']">সর্বমোট আবেদন (Total Registrations)</span>;
                      return value;
                    }}
                  />
                  <Bar 
                    dataKey="verified" 
                    name="verified" 
                    fill="#059669" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={36} 
                  />
                  <Bar 
                    dataKey="pendingTotal" 
                    name="pendingTotal" 
                    fill="#f59e0b" 
                    radius={[4, 4, 0, 0]} 
                    maxBarSize={36} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="total" 
                    stroke="#0f172a" 
                    strokeWidth={2.5} 
                    dot={{ r: 4, fill: '#0f172a', strokeWidth: 1, stroke: '#fff' }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartType === 'area' && (
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorVerified" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis 
                    dataKey="monthLabel" 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend 
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(value) => {
                      if (value === 'verified') return <span className="text-slate-700 font-medium font-['Noto_Sans_Bengali']">সম্পন্নকৃত নিবন্ধন (Verified)</span>;
                      if (value === 'pendingTotal') return <span className="text-slate-700 font-medium font-['Noto_Sans_Bengali']">পেন্ডিং ড্রাফট (Drafts)</span>;
                      return value;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="verified" 
                    stroke="#059669" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorVerified)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pendingTotal" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPending)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {chartType === 'donut' && (
            <div className="h-64 sm:h-72 w-full flex flex-col sm:flex-row items-center justify-around gap-4">
              <div className="w-full sm:w-1/2 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(val, name) => [`${val} টি রেকর্ড`, name]}
                      contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', border: '1px solid #334155', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Status Breakdown Legend & Interactive Filter */}
              <div className="w-full sm:w-1/2 space-y-2.5 pr-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  রেকর্ড স্ট্যাটাস ডিস্ট্রিবিউশন
                </h4>
                {statusPieData.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => onFilterStatus && onFilterStatus(item.statusKey)}
                    className="p-2.5 rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs transition flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <span 
                        className="w-3 h-3 rounded-full shrink-0" 
                        style={{ backgroundColor: item.color }}
                      ></span>
                      <span className="text-xs font-medium text-slate-800 font-['Noto_Sans_Bengali']">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-900 font-mono">
                      {item.value} টি
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Optional Collapsible Monthly Breakdown Table */}
        {showTable && (
          <div className="border-t border-slate-200 p-4 bg-white overflow-x-auto">
            <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-2 font-['Noto_Sans_Bengali']">
              <TableIcon className="w-4 h-4 text-emerald-600" />
              <span>মাসভিত্তিক বিস্তারিত হিসাব বিবরণী (Monthly Breakdown Table)</span>
            </h4>
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <th className="py-2.5 px-3">মাস (Month)</th>
                  <th className="py-2.5 px-3 text-emerald-800">সম্পন্নকৃত নিবন্ধন (Verified)</th>
                  <th className="py-2.5 px-3 text-amber-700">খসড়া রেকর্ড (Drafts)</th>
                  <th className="py-2.5 px-3 text-blue-700">রিভিউাধীন (Pending)</th>
                  <th className="py-2.5 px-3 text-slate-900">সর্বমোট (Total)</th>
                  <th className="py-2.5 px-3 text-right">নিষ্পত্তি হার (Clearance %)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {monthlyData.map((row) => (
                  <tr key={row.monthKey} className="hover:bg-slate-50/70">
                    <td className="py-2.5 px-3 font-semibold text-slate-800 font-['Noto_Sans_Bengali']">
                      {row.monthLabelBn} <span className="text-slate-400 font-mono text-[11px]">({row.monthLabel})</span>
                    </td>
                    <td className="py-2.5 px-3 text-emerald-700 font-bold">{row.verified}</td>
                    <td className="py-2.5 px-3 text-slate-600">{row.drafts}</td>
                    <td className="py-2.5 px-3 text-amber-600">{row.pending}</td>
                    <td className="py-2.5 px-3 text-slate-900 font-black">{row.total}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-700">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
