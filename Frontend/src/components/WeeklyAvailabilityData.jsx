import { Ban, Calendar, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import WeeklyAvailabilityModel from "./WeeklyAvailabilityModel";

const WeeklyAvailabilityData = ({ profile }) => {
  const [isWeeklyAvailabilityOpen, setWeeklyAvailabilityModalOpen] =
    useState(false);
  return (
    <div>
      <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              Weekly Availability
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[11px] font-bold rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
              Currently Active
            </div>
            <button
              onClick={() => setWeeklyAvailabilityModalOpen(true)}
              className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group transition-colors"
            >
              Edit Schedule
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto pb-4 -mx-2 px-2 scrollbar-hide">
          <div className="flex lg:grid lg:grid-cols-7 gap-4 min-w-max lg:min-w-0">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
              (day, index) => {
                const windows = profile.weeklyAvailability?.[day] || [];
                const slotDuration = profile.slotDurationMin || 30;

                // Calculate individual slots from windows
                const calculateSlots = (windows, duration) => {
                  const allSlots = [];
                  windows.forEach((window) => {
                    let [startH, startM] = window.start.split(":").map(Number);
                    let [endH, endM] = window.end.split(":").map(Number);
                    let currentM = startH * 60 + startM;
                    const endMTotal = endH * 60 + endM;
                    while (currentM + duration <= endMTotal) {
                      const h = Math.floor(currentM / 60)
                        .toString()
                        .padStart(2, "0");
                      const m = (currentM % 60).toString().padStart(2, "0");

                      const nextM = currentM + duration;
                      const nextH = Math.floor(nextM / 60)
                        .toString()
                        .padStart(2, "0");
                      const nextM_ = (nextM % 60)
                        .toString()
                        .padStart(2, "0");

                      allSlots.push({
                        start: `${h}:${m}`,
                        end: `${nextH}:${nextM_}`,
                      });
                      currentM += duration;
                    }
                  });
                  return allSlots;
                };

                const daySlots = calculateSlots(windows, slotDuration);
                const isActive = daySlots.length > 0;

                const d = new Date();
                const currentDay = d.getDay();
                const diff =
                  d.getDate() -
                  currentDay +
                  (currentDay === 0 ? -6 : 1) +
                  index;
                const dateObj = new Date(new Date().setDate(diff));
                const dateStr = dateObj.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });

                return (
                  <div
                    key={day}
                    className="flex flex-col items-center gap-4 w-32 lg:w-full"
                  >
                    <div className="text-center space-y-1">
                      <p className="text-sm font-extrabold text-slate-800">
                        {day.toUpperCase()}
                      </p>
                      <p className="text-xs font-medium text-slate-500">
                        {dateStr}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                      {isActive ? (
                        daySlots.map((slot, i) => (
                          <div
                            key={i}
                            className={`py-2 px-1 rounded-xl text-[10px] font-bold text-center transition-all cursor-default
                                      ${
                                        day ===
                                          ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
                                            new Date().getDay()
                                          ] &&
                                        i === 0
                                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                                          : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                      }`}
                          >
                            {slot.start} - {slot.end}
                          </div>
                        ))
                      ) : (
                        <div className="h-32 border-2 border-dashed border-slate-100 rounded-2xl flex flex-col items-center justify-center gap-2 group/closed">
                          <div className="p-2 bg-slate-50 rounded-full group-hover/closed:scale-110 transition-transform">
                            <Ban className="w-4 h-4 text-slate-300" />
                          </div>
                          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                            Closed
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </section>

      <WeeklyAvailabilityModel
        onClose={() => setWeeklyAvailabilityModalOpen(false)}
        isOpen={isWeeklyAvailabilityOpen}
        currentWeeklyAvailability={profile?.weeklyAvailability}
      />
    </div>
  );
};

export default WeeklyAvailabilityData;
