import { AlertCircle, Calendar, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setBlackoutDates,
  setError
} from "../features/doctorSlice";
import apiRequest from "../utils/apiRequest";

const BlackoutModal = ({ isOpen, onClose, currentDates }) => {
  const dispatch = useDispatch();
  const { error, loading } = useSelector((state) => state.doctor);

  const [tempBlackoutDates, setTempBlackoutDates] = useState([]);
  const [newBlackoutDate, setNewBlackoutDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setTempBlackoutDates([...new Set(currentDates || [])]);
      setLocalError(null);
      dispatch(setError(null));
    }
  }, [isOpen, currentDates, dispatch]);

  const handleAddBlackoutDate = () => {
    if (!newBlackoutDate) return;
    if (tempBlackoutDates.includes(newBlackoutDate)) {
      setLocalError("This date is already added to the list.");
      return;
    }
    setLocalError(null);
    setTempBlackoutDates([...tempBlackoutDates, newBlackoutDate].sort());
    setNewBlackoutDate("");
  };

  const handleRemoveBlackoutDate = (dateToRemove) => {
    setLocalError(null);
    setTempBlackoutDates(
      tempBlackoutDates.filter((date) => date !== dateToRemove),
    );
  };

  const handleUpdateBlackouts = async () => {
    setIsSubmitting(true);
    setLocalError(null);
    try {
      await apiRequest.post("/doctor/blackout-dates", {
        blackoutDates: tempBlackoutDates,
      });
      dispatch(setBlackoutDates(tempBlackoutDates));
      onClose();
    } catch (err) {
      setLocalError(
        err.response?.data?.message || "Failed to update blackout dates",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        <div className="px-8 py-6 bg-indigo-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Manage Blackouts</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {localError && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs font-bold">{localError}</p>
            </div>
          )}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Add New Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={newBlackoutDate}
                onChange={(e) => setNewBlackoutDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                onClick={handleAddBlackoutDate}
                disabled={!newBlackoutDate}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-100"
              >
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">
              Scheduled Blackouts
            </label>
            <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {tempBlackoutDates.length > 0 ? (
                tempBlackoutDates.map((date, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group hover:border-slate-200 transition-all"
                  >
                    <span className="text-sm font-semibold text-slate-700">
                      {new Date(date).toLocaleDateString("en-US", {
                        weekday: "short",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    <button
                      onClick={() => handleRemoveBlackoutDate(date)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-slate-400 italic">
                    No dates selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdateBlackouts}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlackoutModal;
