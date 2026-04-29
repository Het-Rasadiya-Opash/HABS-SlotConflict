import React, { useEffect } from "react";
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Stethoscope,
  CreditCard,
  FileText,
  StickyNote,
  BadgeCheck,
  AlertCircle,
  XCircle,
  Loader2,
  Hash,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import apiRequest from "../utils/apiRequest";
import {
  setBookingResult,
  setError,
  setLoading,
  clearError,
} from "../features/appointmentSlice";

const formatDateTime = (isoString) => {
  if (!isoString) return { date: "—", time: "—" };
  const d = new Date(isoString);
  const date = d.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const time = d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return { date, time };
};

const STATUS_MAP = {
  PENDING: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-600",
    border: "border-amber-200",
    dot: "bg-amber-400",
    Icon: Clock,
  },
  CONFIRMED: {
    label: "Confirmed",
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
    dot: "bg-green-400",
    Icon: BadgeCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    bg: "bg-red-50",
    text: "text-red-500",
    border: "border-red-200",
    dot: "bg-red-400",
    Icon: XCircle,
  },
  COMPLETED: {
    label: "Completed",
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    border: "border-indigo-200",
    dot: "bg-indigo-400",
    Icon: BadgeCheck,
  },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_MAP[status] || STATUS_MAP.PENDING;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${s.bg} ${s.text} ${s.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const Chip = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3">
    <span className="text-indigo-500 mt-0.5 shrink-0">{icon}</span>
    <div className="min-w-0">
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800 truncate">
        {value || "—"}
      </p>
    </div>
  </div>
);

const AppointmentCard = ({ appt }) => {
  const start = formatDateTime(appt.slot?.startUTC);
  const end = formatDateTime(appt.slot?.endUTC);
  const booked = formatDateTime(appt.bookedAt);
  const doctor = appt.doctor || {};
  const patient = appt.patient || {};
  const initial = (doctor.name || "D").charAt(0).toUpperCase();

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500  flex items-center justify-center text-white font-extrabold text-lg shrink-0 shadow-md">
            {initial}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base leading-tight">
              Dr. {doctor.name || "Unknown"}
            </h3>
            <p className="text-indigo-600 font-semibold text-sm">
              {doctor.specialty || "—"}
            </p>
          </div>
        </div>
        <StatusBadge status={appt.status} />
      </div>

      <div className="px-6 mb-4">
        <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 w-fit">
          <Hash className="h-3.5 w-3.5 text-slate-400" />
          <span className="font-mono text-xs text-slate-500 font-semibold tracking-wide">
            {appt.bookingId}
          </span>
        </div>
      </div>

      <div className="px-6 grid grid-cols-2 gap-3 mb-4">
        <Chip
          icon={<Calendar className="h-4 w-4" />}
          label="Date"
          value={start.date}
        />
        <Chip
          icon={<Clock className="h-4 w-4" />}
          label="Time"
          value={`${start.time} – ${end.time}`}
        />
        <Chip
          icon={<MapPin className="h-4 w-4" />}
          label="Location"
          value={doctor.location}
        />
        <Chip
          icon={<CreditCard className="h-4 w-4" />}
          label="Fee"
          value={doctor.consultationFee ? `₹${doctor.consultationFee}` : "—"}
        />
        <Chip
          icon={<User className="h-4 w-4" />}
          label="Patient"
          value={patient.username}
        />
        <Chip
          icon={<Stethoscope className="h-4 w-4" />}
          label="Slot Duration"
          value={doctor.slotDurationMin ? `${doctor.slotDurationMin} min` : "—"}
        />
      </div>

      {(appt.reason || appt.notes) && (
        <div className="px-6 mb-4 space-y-2">
          {appt.reason && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <FileText className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
              <p>
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest block">
                  Reason
                </span>
                {appt.reason}
              </p>
            </div>
          )}
          {appt.notes && (
            <div className="flex items-start gap-2 text-sm text-slate-600">
              <StickyNote className="h-4 w-4 mt-0.5 shrink-0 text-slate-400" />
              <p>
                <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest block">
                  Notes
                </span>
                {appt.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {appt.status === "CANCELLED" && appt.cancellationReason && (
        <div className="mx-6 mb-4 flex items-start gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
          <p>
            <span className="font-bold block text-[10px] uppercase tracking-widest text-red-400">
              Cancellation Reason
            </span>
            {appt.cancellationReason}
          </p>
        </div>
      )}

      <div className="mt-auto border-t border-slate-100 px-6 py-3 flex items-center justify-between">
        <p className="text-[11px] text-slate-400 font-medium">
          Booked on {booked.date}
        </p>
        <p className="text-[11px] text-slate-400 font-medium">{booked.time}</p>
      </div>
    </div>
  );
};

const EmptyState = () => (
  <div className="col-span-full bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center py-24 px-8">
    <div className="w-20 h-20 bg-indigo-50 text-indigo-400 rounded-3xl flex items-center justify-center mb-6">
      <Calendar className="w-10 h-10" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-2">
      No Appointments Yet
    </h3>
    <p className="text-slate-400 max-w-xs">
      You haven't booked any appointments. Search for a doctor to get started.
    </p>
  </div>
);

const Appointments = () => {
  const dispatch = useDispatch();
  const { bookingResult, loading, error } = useSelector(
    (state) => state.appointment,
  );

  useEffect(() => {
    const fetchPatientAppointments = async () => {
      dispatch(setLoading(true));
      dispatch(clearError());
      try {
        const res = await apiRequest.get("/appointment/patient");
        dispatch(setBookingResult(res.data.data));
      } catch (err) {
        dispatch(
          setError(
            err.response?.data?.message || "Failed to load appointments.",
          ),
        );
      }
    };
    fetchPatientAppointments();
  }, [dispatch]);

  const appointments = Array.isArray(bookingResult)
    ? bookingResult
    : bookingResult
      ? [bookingResult]
      : [];

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My Appointments
            </h1>
            {!loading && appointments.length > 0 && (
              <p className="text-slate-400 mt-1 text-sm">
                {appointments.length} appointment
                {appointments.length > 1 ? "s" : ""} found
              </p>
            )}
          </div>
        </header>

        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
          </div>
        )}

        {error && !loading && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {appointments.length === 0 ? (
              <EmptyState />
            ) : (
              appointments.map((appt) => (
                <AppointmentCard key={appt._id} appt={appt} />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
