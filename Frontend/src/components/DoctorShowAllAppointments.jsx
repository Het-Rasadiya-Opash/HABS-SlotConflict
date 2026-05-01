import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  clearError,
  setBookingResult,
  setError,
  setLoading,
} from "../features/appointmentSlice";
import apiRequest from "../utils/apiRequest";
import { formatDateIST, formatSlotRangeIST } from "../utils/dateUtils";
import {
  CalendarDays,
  Clock,
  User,
  Hash,
  Loader2,
  AlertCircle,
  ClipboardList,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Clock3,
  RefreshCw,
} from "lucide-react";

const STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock3,
    badge: "bg-amber-50 text-amber-600 border border-amber-200",
    dot: "bg-amber-400",
    select: "text-amber-600 bg-amber-50 border-amber-200 focus:ring-amber-300",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle2,
    badge: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    dot: "bg-emerald-400",
    select:
      "text-emerald-600 bg-emerald-50 border-emerald-200 focus:ring-emerald-300",
  },
  COMPLETED: {
    label: "Completed",
    icon: CheckCircle2,
    badge: "bg-indigo-50 text-indigo-600 border border-indigo-200",
    dot: "bg-indigo-400",
    select:
      "text-indigo-600 bg-indigo-50 border-indigo-200 focus:ring-indigo-300",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    badge: "bg-red-50 text-red-500 border border-red-200",
    dot: "bg-red-400",
    select: "text-red-500 bg-red-50 border-red-200 focus:ring-red-300",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.badge}`}
    >
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

const DoctorShowAllAppointments = () => {
  const dispatch = useDispatch();
  const { loading, error, bookingResult } = useSelector(
    (state) => state.appointment,
  );

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [localAppointments, setLocalAppointments] = useState([]);
  const [updateError, setUpdateError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      dispatch(setLoading(true));
      dispatch(clearError());
      try {
        const params = filterStatus !== "ALL" ? { status: filterStatus } : {};
        const res = await apiRequest.get("/appointment/", { params });
        dispatch(setBookingResult(res.data.data));
        setLocalAppointments(res.data.data?.appointments ?? []);
      } catch (err) {
        dispatch(
          setError(
            err?.response?.data?.message || "Failed to fetch appointments",
          ),
        );
      } finally {
        dispatch(setLoading(false));
      }
    };
    fetchAll();
  }, [filterStatus]);

  useEffect(() => {
    if (bookingResult?.appointments) {
      setLocalAppointments(bookingResult.appointments);
    }
  }, [bookingResult]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdateError(null);
    try {
      await apiRequest.post(`/appointment/${appointmentId}/status-update`, {
        status: newStatus,
      });
      setLocalAppointments((prev) =>
        prev.map((a) =>
          a._id === appointmentId ? { ...a, status: newStatus } : a,
        ),
      );
    } catch (err) {
      setUpdateError(
        err?.response?.data?.message || "Status update failed. Try again.",
      );
    }
  };

  const total = localAppointments.length;

  return (
    <div className="mt-2 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-indigo-600" />
            All Appointments
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {loading
              ? "Loading…"
              : `${total} appointment${total !== 1 ? "s" : ""} found`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {["ALL", ...STATUSES].map((s) => {
            const isActive = filterStatus === s;
            const cfg = s !== "ALL" ? STATUS_CONFIG[s] : null;
            return (
              <button
                key={s}
                id={`filter-btn-${s}`}
                onClick={() => setFilterStatus(s)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  isActive
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-white border-slate-200 text-slate-500 hover:border-indigo-300 hover:text-indigo-600"
                }`}
              >
                {cfg && <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />}
                {s === "ALL" ? "All" : cfg.label}
              </button>
            );
          })}
          <button
            id="refresh-btn"
            onClick={() => setFilterStatus((f) => f)} // re-trigger useEffect
            className="ml-1 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {updateError && (
        <div className="flex items-center justify-between gap-3 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {updateError}
          </div>
          <button
            className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
            onClick={() => setUpdateError(null)}
          >
            ×
          </button>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Loading appointments…</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {!loading && !error && total === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
          <ClipboardList className="w-12 h-12 text-slate-300" />
          <p className="text-base font-semibold text-slate-500">
            No appointments found
          </p>
          <p className="text-sm">
            {filterStatus !== "ALL"
              ? `No ${STATUS_CONFIG[filterStatus]?.label.toLowerCase()} appointments.`
              : "You have no appointments yet."}
          </p>
        </div>
      )}

      {!loading && !error && total > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  {[
                    { label: "#", icon: null },
                    { label: "Booking ID", icon: Hash },
                    { label: "Patient", icon: User },
                    { label: "Date", icon: CalendarDays },
                    { label: "Slot", icon: Clock },
                    { label: "Reason", icon: ClipboardList },
                    { label: "Booked At", icon: CalendarDays },
                    { label: "Status", icon: null },
                  ].map(({ label, icon: Icon }) => (
                    <th
                      key={label}
                      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      <span className="flex items-center gap-1.5">
                        {Icon && <Icon className="w-3.5 h-3.5" />}
                        {label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {localAppointments.map((appt, idx) => {
                  const isFinal =
                    appt.status === "CANCELLED" || appt.status === "COMPLETED";

                  return (
                    <tr
                      key={appt._id}
                      className="hover:bg-slate-50/70 transition-colors duration-100"
                    >
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 text-xs font-bold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                          {appt.bookingId ?? "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs shrink-0">
                            {appt.patient?.username?.charAt(0)?.toUpperCase() ??
                              "?"}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800 text-sm leading-tight">
                              {appt.patient?.username ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400 leading-tight mt-0.5">
                              {appt.patient?.email ?? ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-600 text-xs font-medium">
                          {appt.slot?.startUTC
                            ? formatDateIST(appt.slot.startUTC)
                            : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-semibold border border-indigo-100">
                          <Clock className="w-3 h-3" />
                          {appt.slot?.startUTC && appt.slot?.endUTC
                            ? formatSlotRangeIST(
                                appt.slot.startUTC,
                                appt.slot.endUTC,
                              )
                            : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 max-w-[160px]">
                        <p
                          className="text-slate-500 text-xs truncate"
                          title={appt.reason}
                        >
                          {appt.reason ?? "—"}
                        </p>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-slate-400 text-xs">
                          {appt.bookedAt ? formatDateIST(appt.bookedAt) : "—"}
                        </span>
                      </td>

                      <td className="px-4 py-3.5">
                        {isFinal ? (
                          <StatusBadge status={appt.status} />
                        ) : (
                          <select
                            id={`status-${appt._id}`}
                            value={appt.status}
                            onChange={(e) =>
                              handleStatusUpdate(appt._id, e.target.value)
                            }
                            className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold outline-none cursor-pointer transition-all ${STATUS_CONFIG[appt.status]?.select}`}
                          >
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {STATUS_CONFIG[s].label}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-semibold text-slate-600">{total}</span>{" "}
              {total === 1 ? "record" : "records"}
              {filterStatus !== "ALL" && (
                <>
                  {" "}
                  · filtered by{" "}
                  <span className="font-semibold text-indigo-600">
                    {STATUS_CONFIG[filterStatus]?.label}
                  </span>
                </>
              )}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorShowAllAppointments;
