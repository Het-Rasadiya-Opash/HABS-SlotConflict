import React from "react";
import { Calendar, Clock, User, MapPin } from "lucide-react";

const Appointments = () => {
  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
              My Appointments
            </h1>
          </div>
          <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-95 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Book New Appointment
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center text-center col-span-full py-20">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-500 rounded-3xl flex items-center justify-center mb-6">
              <Calendar className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">
              No Appointments Yet
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
