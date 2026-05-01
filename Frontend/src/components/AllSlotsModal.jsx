import { useEffect, useState } from "react";
import apiRequest from "../utils/apiRequest";
import { formatDateKeyIST, formatTimeIST, groupSlotsByISTDate } from "../utils/dateUtils";
import { ArrowRight, CalendarDays, Loader2, X } from "lucide-react";

const AllSlotsModal = ({ doctor, onClose, onSelectSlot, selectedSlotKey }) => {
  const [allSlots, setAllSlots] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllSlots = async () => {
      try {
        const params = { n: 100 };
        if (doctor.specialty) params.specialty = doctor.specialty;
        const res = await apiRequest.get("/doctor/search", { params });
        const found = res.data.data.find((d) => d._id === doctor._id);
        setAllSlots(found?.nextSlots || []);
      } catch {
        setAllSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllSlots();
  }, [doctor._id]);

  const grouped = groupSlotsByISTDate(allSlots);

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdrop}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              All Available Slots
            </h2>
            <p className="text-sm text-indigo-600 font-medium mt-0.5">
              Dr. {doctor.userId?.username} · {doctor.specialty}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-8 py-6 space-y-8">
          {loading ? (
            <div className="flex flex-col items-center py-16 gap-4">
              <Loader2 className="h-10 w-10 text-indigo-500 animate-spin" />
              <p className="text-slate-400 font-medium">Fetching all slots…</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div className="text-center py-16">
              <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">No slots available</p>
            </div>
          ) : (
            Object.entries(grouped).map(([dateKey, daySlots]) => (
              <div key={dateKey}>
                <p className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-indigo-400" />
                  {formatDateKeyIST(dateKey)}
                </p>
                <div className="flex flex-wrap gap-3">
                  {daySlots.map((slot, idx) => {
                    const key = `${doctor._id}-modal-${dateKey}-${idx}`;
                    const isSelected = selectedSlotKey === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onSelectSlot(doctor, slot, key)}
                        className={`text-sm px-5 py-2.5 rounded-xl font-semibold border transition-all ${
                          isSelected
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                            : "bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100"
                        }`}
                      >
                        {formatTimeIST(slot.slotStartUTC)} –{" "}
                        {formatTimeIST(slot.slotEndUTC)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="px-8 py-5 border-t border-slate-100 flex items-center justify-between gap-4 bg-slate-50">
          <p className="text-sm text-slate-500">
            {selectedSlotKey
              ? "Slot selected — click Book to confirm"
              : "Select a slot above"}
          </p>
          <button
            onClick={onClose}
            disabled={!selectedSlotKey}
            className="bg-black hover:bg-slate-900 text-white font-bold px-8 py-3 rounded-xl transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirm & Book
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllSlotsModal;
