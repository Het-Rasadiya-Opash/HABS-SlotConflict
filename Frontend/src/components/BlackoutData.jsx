import { TrendingUp } from "lucide-react";
import React, { useState } from "react";
import BlackoutModal from "./BlackoutModal";

const BlackoutData = ({ profile }) => {
  const [isBlackoutModalOpen, setIsBlackoutModalOpen] = useState(false);

  return (
    <div>
      <div className="space-y-6">
        <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900">Blackout Dates</h4>
          </div>
          {profile.blackoutDates?.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.blackoutDates.map((date, i) => (
                <span
                  key={i}
                  className="px-3 py-1 bg-red-50 text-red-600 text-[11px] font-bold rounded-lg border border-red-100"
                >
                  {date}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400 italic">
              No upcoming blackout dates.
            </p>
          )}
          <button
            onClick={() => setIsBlackoutModalOpen(true)}
            className="w-full mt-6 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-dashed border-slate-300 rounded-xl transition-all hover:border-slate-400"
          >
            Manage Blackouts
          </button>
        </section>
      </div>
      <BlackoutModal
        isOpen={isBlackoutModalOpen}
        onClose={() => setIsBlackoutModalOpen(false)}
        currentDates={profile?.blackoutDates}
      />
    </div>
  );
};

export default BlackoutData;
