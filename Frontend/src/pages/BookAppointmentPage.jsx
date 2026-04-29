import React, { useState } from "react";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  setBookingResult,
  setError,
  clearError,
  resetAppointment,
} from "../features/appointmentSlice";
import apiRequest from "../utils/apiRequest";
import {
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Loader2,
  FileText,
  StickyNote,
} from "lucide-react";

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { selectedDoctor, selectedSlot, bookingResult, loading, error } =
    useSelector((state) => state.appointment);
  const currentUser = useSelector((state) => state.users.currentUser);

  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  if (!selectedDoctor || !selectedSlot) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
          <p className="text-slate-600 font-medium">
            No appointment context found.
          </p>
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Go back to search
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    dispatch(clearError());
    dispatch(setLoading(true));

    try {
      const payload = {
        doctorId: selectedDoctor._id,
        slotStartUTC: selectedSlot.slotStartUTC,
        slotEndUTC: selectedSlot.slotEndUTC,
        reason: reason.trim(),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };

      const response = await apiRequest.post("/appointment/book", payload);
      dispatch(setBookingResult(response.data.data));
    } catch (err) {
      dispatch(
        setError(
          err.response?.data?.message ||
            "Failed to book appointment. Please try again.",
        ),
      );
    }
  };

  const handleGoHome = () => {
    dispatch(resetAppointment());
    navigate("/");
  };

  if (bookingResult) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 max-w-md w-full p-10 text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
            Appointment Booked!
          </h2>
          <p className="text-slate-500 mb-8">
            Your appointment has been successfully scheduled.
          </p>

          <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 mb-8">
            <InfoRow label="Booking ID" value={bookingResult.bookingId} mono />
            <InfoRow label="Status" value={bookingResult.status} />
            <InfoRow
              label="Doctor"
              value={`Dr. ${selectedDoctor.userId?.username}`}
            />
            <InfoRow
              label="Specialty"
              value={bookingResult.doctor?.specialty}
            />
            <InfoRow
              label="Date & Time"
              value={`${bookingResult.slot?.localStart} – ${bookingResult.slot?.localEnd}`}
            />
            <InfoRow label="Reason" value={bookingResult.reason} />
            {bookingResult.notes && (
              <InfoRow label="Notes" value={bookingResult.notes} />
            )}
          </div>

          <button
            onClick={handleGoHome}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const doctor = selectedDoctor;
  const slot = selectedSlot;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 font-medium mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Search
        </button>

        <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
          Book Appointment
        </h1>
        <p className="text-slate-500 mb-8">
          Confirm your slot and provide a reason for your visit.
        </p>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
              {doctor.userId?.username?.charAt(0).toUpperCase() || "D"}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">
                Dr. {doctor.userId?.username || "Unknown"}
              </h2>
              <p className="text-indigo-600 font-medium text-sm">
                {doctor.specialty}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SummaryChip
              icon={<Calendar className="h-4 w-4" />}
              label="Date"
              value={slot.date}
            />
            <SummaryChip
              icon={<Clock className="h-4 w-4" />}
              label="Time"
              value={`${slot.time} – ${slot.endTime}`}
            />
            <SummaryChip
              icon={<MapPin className="h-4 w-4" />}
              label="Location"
              value={doctor.location}
            />
            <SummaryChip
              icon={<Stethoscope className="h-4 w-4" />}
              label="Fee"
              value={`₹${doctor.consultationFee}`}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-start gap-3 mb-6">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-slate-100 shadow-md p-6 space-y-6"
        >
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
              Patient
            </label>
            <div className="bg-slate-50 rounded-xl px-4 py-3 text-slate-700 font-medium">
              {currentUser?.username || "—"}{" "}
              <span className="text-slate-400 text-sm">
                ({currentUser?.email || "—"})
              </span>
            </div>
          </div>

          <div>
            <label
              htmlFor="reason"
              className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Reason for Visit <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <FileText className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <textarea
                id="reason"
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Follow-up for blood pressure check…"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              Additional Notes{" "}
              <span className="text-slate-300 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <StickyNote className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
              <textarea
                id="notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any additional information for the doctor…"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none text-slate-800 placeholder-slate-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Booking…
              </>
            ) : (
              "Confirm Appointment"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const SummaryChip = ({ icon, label, value }) => (
  <div className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3">
    <span className="text-indigo-500">{icon}</span>
    <div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
        {label}
      </p>
      <p className="text-sm font-semibold text-slate-800">{value || "—"}</p>
    </div>
  </div>
);

const InfoRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
      {label}
    </span>
    <span
      className={`text-sm text-slate-800 text-right ${mono ? "font-mono" : "font-medium"}`}
    >
      {value || "—"}
    </span>
  </div>
);

export default BookAppointmentPage;
