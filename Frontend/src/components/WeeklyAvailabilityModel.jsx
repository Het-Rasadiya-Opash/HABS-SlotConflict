import { AlertCircle, Clock, Plus, Trash2, X, ChevronDown } from "lucide-react";
import React, { useEffect, useState, useMemo } from "react";
import { useDispatch } from "react-redux";
import { DateTime } from "luxon";
import { setWeeklyAvailability } from "../features/doctorSlice";
import apiRequest from "../utils/apiRequest";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const WeeklyAvailabilityModel = ({
  isOpen,
  onClose,
  currentWeeklyAvailability,
}) => {
  const dispatch = useDispatch();
  const [availability, setAvailability] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const timeOptions = useMemo(() => {
    const options = [];
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hh = h.toString().padStart(2, "0");
        const mm = m.toString().padStart(2, "0");
        const value = `${hh}:${mm}`;
        const label = DateTime.fromObject({ hour: h, minute: m }).toFormat(
          "hh:mm a",
        );
        options.push({ value, label });
      }
    }
    return options;
  }, []);

  useEffect(() => {
    if (isOpen) {
      const initial = {};
      DAYS.forEach((day) => {
        initial[day] =
          currentWeeklyAvailability?.[day]?.map((slot) => ({ ...slot })) || [];
      });
      setAvailability(initial);
      setError(null);
    }
  }, [isOpen, currentWeeklyAvailability]);

  const handleAddSlot = (day) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: [...prev[day], { start: "09:00", end: "17:00" }],
    }));
  };

  const handleRemoveSlot = (day, index) => {
    setAvailability((prev) => ({
      ...prev,
      [day]: prev[day].filter((_, i) => i !== index),
    }));
  };

  const handleTimeChange = (day, index, field, value) => {
    setAvailability((prev) => {
      const updatedDay = [...prev[day]];
      updatedDay[index] = { ...updatedDay[index], [field]: value };
      return { ...prev, [day]: updatedDay };
    });
  };

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    for (const day of DAYS) {
      for (const slot of availability[day]) {
        if (!slot.start || !slot.end) {
          setError(`Please fill all time slots for ${day}.`);
          setIsSubmitting(false);
          return;
        }
        if (slot.start >= slot.end) {
          setError(
            `Invalid time slot for ${day}: End time must be after start time.`,
          );
          setIsSubmitting(false);
          return;
        }
      }
    }

    try {
      await apiRequest.post("/doctor/weekly-availability", {
        weeklyAvailability: availability,
      });
      dispatch(setWeeklyAvailability(availability));
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update availability");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh] border border-slate-100">
        <div className="px-8 py-6 bg-indigo-600 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Define Weekly Availability</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {error && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-slate-50/50 rounded-3xl p-5 border border-slate-100 hover:border-indigo-100 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-slate-900 font-bold text-sm shadow-sm border border-slate-100 group-hover:bg-indigo-500 group-hover:text-white transition-colors uppercase tracking-widest">
                      {day}
                    </span>
                    <h4 className="font-bold text-slate-700">
                      {day === "Mon"
                        ? "Monday"
                        : day === "Tue"
                          ? "Tuesday"
                          : day === "Wed"
                            ? "Wednesday"
                            : day === "Thu"
                              ? "Thursday"
                              : day === "Fri"
                                ? "Friday"
                                : day === "Sat"
                                  ? "Saturday"
                                  : "Sunday"}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleAddSlot(day)}
                    className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold transition-all border border-slate-100 shadow-sm active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Slot
                  </button>
                </div>

                <div className="space-y-3">
                  {availability[day]?.length > 0 ? (
                    availability[day].map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm animate-in slide-in-from-left-2 duration-200"
                      >
                        <div className="flex-1 grid grid-cols-2 gap-3">
                          <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
                              Start
                            </label>
                            <div className="relative">
                              <select
                                value={slot.start}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day,
                                    idx,
                                    "start",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                              >
                                {timeOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                          <div className="relative">
                            <label className="absolute -top-2 left-3 px-1 bg-white text-[10px] font-bold text-slate-400 uppercase tracking-widest z-10">
                              End
                            </label>
                            <div className="relative">
                              <select
                                value={slot.end}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day,
                                    idx,
                                    "end",
                                    e.target.value,
                                  )
                                }
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                              >
                                {timeOptions.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveSlot(day, idx)}
                          className="p-2.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2 bg-white/50 rounded-xl border border-dashed border-slate-200">
                      Closed for the day
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 bg-slate-50 border-t border-slate-100 flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 text-sm font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
          >
            Discard Changes
          </button>
          <button
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex-[2] py-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-2xl shadow-xl shadow-indigo-100 hover:shadow-indigo-200 transition-all flex items-center justify-center gap-3"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Updating...
              </>
            ) : (
              "Save Schedule"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyAvailabilityModel;
