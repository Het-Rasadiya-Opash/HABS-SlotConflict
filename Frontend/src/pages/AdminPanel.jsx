import React, { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  Building2,
  CalendarRange,
  ChevronDown,
  Filter,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  Stethoscope,
  Users,
} from "lucide-react";
import apiRequest from "../utils/apiRequest";
import { formatDateIST } from "../utils/dateUtils";

const STATUSES = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "NO_SHOW",
  "COMPLETED",
];

const STATUS_COLORS = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-400" },
  CONFIRMED: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-400" },
  NO_SHOW: { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" },
  COMPLETED: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    dot: "bg-indigo-500",
  },
};

const badge = (status, count) => {
  const c = STATUS_COLORS[status] ?? {
    bg: "bg-slate-100",
    text: "text-slate-600",
    dot: "bg-slate-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {count}
    </span>
  );
};

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
    <div className="flex items-center gap-4">
      <div
        className={`p-3 ${color} text-white rounded-2xl group-hover:scale-105 transition-transform`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-900">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  </div>
);

const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="h-16 bg-slate-100 rounded-2xl" />
    ))}
  </div>
);

const AdminPanel = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [status, setStatus] = useState("ALL");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (status !== "ALL") params.status = status;
      if (from) params.from = from;
      if (to) params.to = to;

      const res = await apiRequest.get("/clinic-admin", { params });
      setData(res.data.data);
    } catch (err) {
      setError(err?.response?.data?.message ?? "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, [status, from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const summary = data?.clinicSummary ?? {};
  const doctors = data?.doctors ?? [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              Admin Control Panel
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={BarChart3}
            label="Total Appointments"
            value={loading ? "—" : (summary.total ?? 0)}
            color="bg-indigo-500"
            sub="Across all doctors"
          />
          <StatCard
            icon={Users}
            label="Doctors Listed"
            value={loading ? "—" : (data?.doctorCount ?? 0)}
            color="bg-emerald-500"
          />
          <StatCard
            icon={Building2}
            label="Confirmed"
            value={loading ? "—" : (summary.confirmed ?? 0)}
            color="bg-sky-500"
          />
          <StatCard
            icon={Settings}
            label="Pending Appointment"
            value={loading ? "—" : (summary.pending ?? 0)}
            color="bg-amber-500"
          />
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <div className="flex flex-wrap items-end gap-4">
            <div className="flex items-center gap-2 text-slate-500 self-center">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-semibold">Filters</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Status
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CalendarRange className="w-3 h-3" /> From
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <CalendarRange className="w-3 h-3" /> To
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
            </div>

            {(from || to || status !== "ALL") && (
              <button
                onClick={() => {
                  setStatus("ALL");
                  setFrom("");
                  setTo("");
                }}
                className="px-4 py-2 text-sm font-semibold text-slate-500 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all self-end"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-indigo-500" />
              <h2 className="text-base font-bold text-slate-900">
                Appointments per Doctor
              </h2>
            </div>
            {data && (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                {doctors.length} doctor{doctors.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="p-6">
            {loading && <Skeleton />}

            {!loading && error && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="font-bold text-slate-900">Something went wrong</p>
                <p className="text-sm text-slate-500 max-w-xs">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-2 px-5 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-xl hover:bg-indigo-700 transition-all"
                >
                  Try again
                </button>
              </div>
            )}

            {!loading && !error && doctors.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <BarChart3 className="w-7 h-7 text-slate-400" />
                </div>
                <p className="font-bold text-slate-900">
                  No appointments found
                </p>
              </div>
            )}

            {!loading && !error && doctors.length > 0 && (
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Specialty
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Total
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Pending
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Confirmed
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Cancelled
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        No Show
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Completed
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">
                        Latest Slot
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {doctors.map((row, idx) => {
                      const appt = row.appointments;
                      const total = appt.total;
                      const pct = (n) =>
                        total > 0 ? Math.round((n / total) * 100) : 0;
                      return (
                        <tr
                          key={row.doctorId}
                          className="hover:bg-slate-50/60 transition-colors group"
                        >
                          <td className="px-6 py-4 text-slate-400 font-bold text-xs">
                            {idx + 1}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-sm shrink-0">
                                {row.doctor.name?.charAt(0)?.toUpperCase() ??
                                  "?"}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight">
                                  {row.doctor.name ?? "—"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {row.doctor.location ?? "—"}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full">
                              {row.doctor.specialty ?? "—"}
                            </span>
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              <span className="text-base font-black text-slate-900">
                                {total}
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center">
                            {badge("PENDING", appt.pending)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {badge("CONFIRMED", appt.confirmed)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {badge("CANCELLED", appt.cancelled)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {badge("NO_SHOW", appt.noShow)}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {badge("COMPLETED", appt.completed)}
                          </td>

                          <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                            {row.latestSlot
                              ? formatDateIST(row.latestSlot)
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {!loading && !error && doctors.length > 0 && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex flex-wrap gap-4 items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Clinic Total
              </span>
              <div className="flex flex-wrap gap-3">
                {[
                  { label: "Total", val: summary.total, status: null },
                  { label: "Pending", val: summary.pending, status: "PENDING" },
                  {
                    label: "Confirmed",
                    val: summary.confirmed,
                    status: "CONFIRMED",
                  },
                  {
                    label: "Cancelled",
                    val: summary.cancelled,
                    status: "CANCELLED",
                  },
                  { label: "No Show", val: summary.noShow, status: "NO_SHOW" },
                  {
                    label: "Completed",
                    val: summary.completed,
                    status: "COMPLETED",
                  },
                ].map(({ label, val, status: s }) => {
                  const c = s
                    ? STATUS_COLORS[s]
                    : {
                        bg: "bg-indigo-50",
                        text: "text-indigo-700",
                        dot: "bg-indigo-500",
                      };
                  return (
                    <span
                      key={label}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${c.bg} ${c.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                      {label}: {val ?? 0}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
